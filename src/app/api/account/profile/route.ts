import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import { getAuthUser, signToken } from "@/lib/auth";

export async function PATCH(req: Request) {
  try {
    await dbConnect();
    const authUser = await getAuthUser();
    if (!authUser?._id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { username, phone, bio } = await req.json();

    const updates: Record<string, any> = {};

    if (typeof username === "string") {
      const cleanUsername = username.trim();
      if (!cleanUsername) {
        return NextResponse.json({ error: "Username is required" }, { status: 400 });
      }
      updates.username = cleanUsername;
    }

    if (typeof phone === "string") {
      updates.phone = phone.trim();
    }

    if (typeof bio === "string") {
      updates.bio = bio.trim();
    }

    if (updates.username) {
      const existing = await User.findOne({ username: updates.username, _id: { $ne: authUser._id } });
      if (existing) {
        return NextResponse.json({ error: "Username already exists" }, { status: 400 });
      }
    }

    const updatedUser = await User.findByIdAndUpdate(authUser._id, updates, { new: true }).select("-password");
    if (!updatedUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const token = signToken({
      id: updatedUser._id.toString(),
      email: updatedUser.email,
      role: updatedUser.role,
      username: updatedUser.username,
    });

    const response = NextResponse.json({ user: updatedUser }, { status: 200 });
    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 7 * 24 * 60 * 60,
      path: "/",
    });
    return response;
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to update profile" }, { status: 500 });
  }
}

