import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import { isAdmin } from "@/lib/auth";
import Translation from "@/models/Translation";
import { getSettings } from "@/lib/settings";
import { ensureDefaultStorefrontTranslations } from "@/lib/translationSeed";

type TranslationResponseItem = {
  key?: unknown;
  translations?: unknown;
  toObject?: (options?: { flattenMaps?: boolean }) => Record<string, unknown>;
};

function normalizeTranslations(source: unknown) {
  if (source instanceof Map) {
    return Object.fromEntries(source.entries());
  }

  if (source && typeof source === "object") {
    return Object.fromEntries(
      Object.entries(source).map(([lang, value]) => [lang, String(value ?? "")])
    );
  }

  return {};
}

function serializeTranslation(item: TranslationResponseItem) {
  const raw = item.toObject ? item.toObject({ flattenMaps: true }) : item;

  return {
    ...raw,
    translations: normalizeTranslations(raw.translations),
  };
}

async function getSerializedTranslations() {
  const items = await Translation.find({}).sort({ key: 1 });
  return items.map((item) => serializeTranslation(item as TranslationResponseItem));
}

async function readProviderError(res: Response, provider: string) {
  const body = await res.text();

  if (!body) {
    return `${provider} API returned ${res.status} ${res.statusText}.`;
  }

  try {
    const parsed = JSON.parse(body) as { error?: { message?: string } | string };
    if (typeof parsed.error === "string") {
      return `${provider} API error: ${parsed.error}`;
    }
    if (parsed.error?.message) {
      return `${provider} API error: ${parsed.error.message}`;
    }
  } catch {
    // Fall back to the raw provider response below.
  }

  return `${provider} API returned ${res.status} ${res.statusText}: ${body.slice(0, 240)}`;
}

export async function GET() {
  try {
    const isUserAdmin = await isAdmin();
    if (!isUserAdmin) {
      return NextResponse.json({ error: "Unauthorized. Admin access required." }, { status: 403 });
    }

    await dbConnect();
    await ensureDefaultStorefrontTranslations();
    const items = await getSerializedTranslations();
    return NextResponse.json(items, { status: 200 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch translations";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const isUserAdmin = await isAdmin();
    if (!isUserAdmin) {
      return NextResponse.json({ error: "Unauthorized. Admin access required." }, { status: 403 });
    }

    await dbConnect();
    const { action, locale, localeName, updates } = await req.json();

    // 1. Manual updates inside the view table list
    if (action === "update-manual" && updates && Array.isArray(updates)) {
      for (const upd of updates) {
        const item = await Translation.findOne({ key: upd.key });
        if (item) {
          Object.entries(upd.translations).forEach(([lang, val]) => {
            item.translations.set(lang, val);
          });
          await item.save();
        }
      }
      const all = await getSerializedTranslations();
      return NextResponse.json({ success: true, translations: all }, { status: 200 });
    }

    // 2. AI Autotranslation trigger
    if (action === "ai-translate" && locale) {
      await ensureDefaultStorefrontTranslations();
      const settings = await getSettings();
      const provider = settings.activeProvider || "gemini";
      
      const apiKey = provider === "openai" 
        ? settings.openaiKey 
        : provider === "groq" 
        ? settings.groqKey 
        : settings.geminiKey;

      if (!apiKey) {
        return NextResponse.json({ error: `API Key for ${provider} is not configured in AI Settings tab.` }, { status: 400 });
      }

      const items = await Translation.find({});
      if (items.length === 0) {
        return NextResponse.json({ error: "Could not initialize storefront translation keys." }, { status: 500 });
      }

      const updatedKeys: string[] = [];
      const targetLocale = typeof localeName === "string" && localeName.trim()
        ? `${localeName.trim()} (${locale})`
        : locale;

      // --- Batch translation to avoid rate limits ---
      const BATCH_SIZE = 20;
      const BATCH_DELAY_MS = 2500; // 2.5s between batches to respect RPM limits

      // Build batches of { key, englishText }
      const entries = items.map((item) => ({
        item,
        key: item.key as string,
        en: (item.translations.get("en") || item.key) as string,
      }));

      const batches: typeof entries[] = [];
      for (let i = 0; i < entries.length; i += BATCH_SIZE) {
        batches.push(entries.slice(i, i + BATCH_SIZE));
      }

      for (let bIdx = 0; bIdx < batches.length; bIdx++) {
        const batch = batches[bIdx];

        // Build a single prompt for the whole batch
        const keyMap: Record<string, string> = {};
        for (const e of batch) keyMap[e.key] = e.en;

        const prompt = [
          `Translate the following e-commerce storefront UI labels from English to ${targetLocale}.`,
          `Return ONLY a valid JSON object mapping each key to its translated value. No markdown, no code fences, no explanation.`,
          `Input:`,
          JSON.stringify(keyMap),
        ].join("\n");

        try {
          let rawResponse = "";

          if (provider === "openai" || provider === "groq") {
            const url = provider === "openai"
              ? "https://api.openai.com/v1/chat/completions"
              : "https://api.groq.com/openai/v1/chat/completions";

            const model = provider === "openai" ? "gpt-4o-mini" : "llama-3.3-70b-versatile";

            const res = await fetch(url, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${apiKey}`,
              },
              body: JSON.stringify({
                model,
                messages: [{ role: "user", content: prompt }],
                temperature: 0.1,
              }),
            });

            if (!res.ok) {
              const providerError = await readProviderError(res, provider);
              return NextResponse.json({ error: providerError }, { status: 502 });
            }

            const data = await res.json();
            rawResponse = data.choices?.[0]?.message?.content?.trim() || "";
          } else if (provider === "gemini") {
            const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${apiKey}`;

            const res = await fetch(url, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
              }),
            });

            if (!res.ok) {
              const providerError = await readProviderError(res, provider);
              return NextResponse.json({ error: providerError }, { status: 502 });
            }

            const data = await res.json();
            rawResponse = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "";
          }

          // Strip markdown code fences if AI wraps response in ```json ... ```
          rawResponse = rawResponse.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "");

          // Parse the JSON map
          let translatedMap: Record<string, string> = {};
          try {
            translatedMap = JSON.parse(rawResponse);
          } catch {
            console.error(`AI batch ${bIdx + 1}: failed to parse JSON response:`, rawResponse.slice(0, 300));
            // Continue to next batch rather than aborting entirely
            continue;
          }

          // Save each translated value
          for (const entry of batch) {
            let val = translatedMap[entry.key];
            if (!val || typeof val !== "string") continue;

            // Clean outer quotes
            if (val.startsWith('"') && val.endsWith('"')) {
              val = val.slice(1, -1);
            }

            entry.item.translations.set(locale, val);
            await entry.item.save();
            updatedKeys.push(entry.key);
          }
        } catch (err) {
          console.error(`AI Translation batch ${bIdx + 1} error:`, err);
        }

        // Delay between batches to respect rate limits (skip delay after last batch)
        if (bIdx < batches.length - 1) {
          await new Promise((resolve) => setTimeout(resolve, BATCH_DELAY_MS));
        }
      }

      if (updatedKeys.length === 0) {
        return NextResponse.json(
          { error: "AI provider finished, but no translation text was returned. Test the active AI key, model, and quota, then try again." },
          { status: 502 }
        );
      }

      const all = await getSerializedTranslations();
      return NextResponse.json({ success: true, count: updatedKeys.length, translations: all }, { status: 200 });
    }

    return NextResponse.json({ error: "Invalid action parameter" }, { status: 400 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to save translations";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
