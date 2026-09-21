import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import crypto from "crypto";
import { sendMail, getPasswordResetHtml } from "@/lib/mailer";
import { getSettings } from "@/lib/settings";

export async function POST(req: Request) {
  try {
    await dbConnect();
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    
    // We always return success to prevent email enumeration attacks
    if (!user) {
      return NextResponse.json({ success: true, message: "If an account exists, a reset link was sent." }, { status: 200 });
    }

    // Generate token
    const resetToken = crypto.randomBytes(32).toString("hex");
    
    // Hash token before saving to DB
    const resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex");
    
    // Set expiration (1 hour from now)
    const resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000);

    user.resetPasswordToken = resetPasswordToken;
    user.resetPasswordExpires = resetPasswordExpires;
    await user.save();

    // Create reset URL
    const settings = await getSettings();
    const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
    const host = req.headers.get("host") || "localhost:3000";
    const resetUrl = `${protocol}://${host}/reset-password?token=${resetToken}`;

    const html = getPasswordResetHtml(resetUrl, settings.storeName || "SnapShop", settings.websiteLink || `${protocol}://${host}`, settings.passwordResetTemplate);

    await sendMail(
      user.email,
      "Password Reset Request",
      html
    );

    return NextResponse.json({ success: true, message: "If an account exists, a reset link was sent." }, { status: 200 });

  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Something went wrong" }, { status: 500 });
  }
}
