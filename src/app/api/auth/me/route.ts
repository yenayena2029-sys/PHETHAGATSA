import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getAuthUser } from "@/lib/auth";
import User from "@/models/User";

export async function GET() {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ user: null }, { status: 200 });
    }

    const cookieStore = await cookies();
    const authProviderCookie = cookieStore.get("auth_provider")?.value;
    const rawUser = typeof (user as any).toObject === "function" ? (user as any).toObject() : user;

    const resolvedProvider = rawUser.provider || authProviderCookie || "credentials";
    const resolvedPasswordSet =
      typeof rawUser.passwordSet === "boolean" ? rawUser.passwordSet : resolvedProvider === "credentials";

    const updates: Record<string, string | boolean> = {};
    if (!rawUser.provider) {
      updates.provider = resolvedProvider;
    }
    if (typeof rawUser.passwordSet !== "boolean") {
      updates.passwordSet = resolvedPasswordSet;
    }

    if (Object.keys(updates).length > 0) {
      await User.findByIdAndUpdate(rawUser._id, updates);
    }

    return NextResponse.json(
      {
        user: {
          ...rawUser,
          provider: resolvedProvider,
          passwordSet: resolvedPasswordSet,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to fetch user" }, { status: 500 });
  }
}
