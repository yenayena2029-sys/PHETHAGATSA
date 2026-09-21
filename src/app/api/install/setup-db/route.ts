import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import { ensureDefaultStorefrontTranslations } from "@/lib/translationSeed";

export async function POST() {
  try {
    await dbConnect();
    // Insert default English translations and create collections
    const result = await ensureDefaultStorefrontTranslations();
    
    return NextResponse.json({ 
      success: true, 
      message: "Database tables and translations initialized successfully",
      details: result
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
