import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import crypto from "crypto";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    await dbConnect();
    const { token, password } = await req.json();

    if (!token || !password) {
      return NextResponse.json({ error: "Token and new password are required" }, { status: 400 });
    }

    // Hash the received token to compare with the one in DB
    const resetPasswordToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return NextResponse.json({ error: "Invalid or expired password reset token" }, { status: 400 });
    }

    // Set the new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    
    // Clear the reset token fields
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    return NextResponse.json({ success: true, message: "Password has been reset successfully" }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Something went wrong" }, { status: 500 });
  }
}
