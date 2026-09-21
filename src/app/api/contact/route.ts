import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import ContactMessage from "@/models/ContactMessage";

export async function POST(req: Request) {
  try {
    await dbConnect();
    const data = await req.json();

    if (!data.name || !data.email || !data.message) {
      return NextResponse.json({ error: "Name, email, and message are required" }, { status: 400 });
    }

    const message = await ContactMessage.create({
      name: data.name.trim(),
      email: data.email.trim(),
      subject: data.subject?.trim() || "",
      message: data.message.trim(),
    });

    return NextResponse.json({ success: true, message: "Your message has been sent successfully!", data: message }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to submit message" }, { status: 500 });
  }
}
