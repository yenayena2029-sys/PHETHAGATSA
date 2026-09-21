import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import { isAdmin } from "@/lib/auth";
import ContactMessage from "@/models/ContactMessage";

export async function GET() {
  try {
    const isUserAdmin = await isAdmin();
    if (!isUserAdmin) {
      return NextResponse.json({ error: "Unauthorized. Admin access required." }, { status: 403 });
    }

    await dbConnect();
    const messages = await ContactMessage.find({}).sort({ createdAt: -1 });
    return NextResponse.json(messages, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to fetch mailbox messages" }, { status: 500 });
  }
}
