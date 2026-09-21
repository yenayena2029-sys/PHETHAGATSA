import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import { getAuthUser } from "@/lib/auth";

export async function PATCH(req: Request) {
  try {
    await dbConnect();
    const authUser = await getAuthUser();
    if (!authUser?._id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { oldPassword, newPassword } = await req.json();
    if (!newPassword || typeof newPassword !== "string" || newPassword.length < 6) {
      return NextResponse.json({ error: "New password must be at least 6 characters" }, { status: 400 });
    }

    const user = await User.findById(authUser._id);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const mustVerifyOld = user.passwordSet !== false;
    if (mustVerifyOld) {
      if (!oldPassword || typeof oldPassword !== "string") {
        return NextResponse.json({ error: "Current password is required" }, { status: 400 });
      }
      const isMatch = await bcrypt.compare(oldPassword, user.password);
      if (!isMatch) {
        return NextResponse.json({ error: "Current password is incorrect" }, { status: 400 });
      }
    }

    user.password = await bcrypt.hash(newPassword, 10);
    user.passwordSet = true;
    if (!user.provider) user.provider = "credentials";
    await user.save();

    return NextResponse.json({ message: "Password updated" }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to update password" }, { status: 500 });
  }
}
