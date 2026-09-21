import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const isUserAdmin = await isAdmin();
    if (!isUserAdmin) {
      return NextResponse.json({ error: "Unauthorized. Admin access required." }, { status: 403 });
    }

    const { provider, apiKey } = await req.json();

    if (!provider || !apiKey) {
      return NextResponse.json({ error: "Provider and API Key are required." }, { status: 400 });
    }

    let url = "";
    let headers: Record<string, string> = { "Content-Type": "application/json" };

    if (provider === "openai") {
      url = "https://api.openai.com/v1/models";
      headers["Authorization"] = `Bearer ${apiKey}`;
    } else if (provider === "groq") {
      url = "https://api.groq.com/openai/v1/models";
      headers["Authorization"] = `Bearer ${apiKey}`;
    } else if (provider === "gemini") {
      url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
    } else {
      return NextResponse.json({ error: "Invalid AI Provider specified." }, { status: 400 });
    }

    const testRes = await fetch(url, { method: "GET", headers });

    if (testRes.ok) {
      return NextResponse.json({ success: true, message: `Successfully verified ${provider} API Key connection!` }, { status: 200 });
    } else {
      const errText = await testRes.text();
      let parsedErr = "API returned an error state.";
      try {
        const js = JSON.parse(errText);
        parsedErr = js.error?.message || js.error || errText;
      } catch (e) {}
      return NextResponse.json({ success: false, error: `Verification failed: ${parsedErr}` }, { status: 400 });
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to verify key" }, { status: 500 });
  }
}
