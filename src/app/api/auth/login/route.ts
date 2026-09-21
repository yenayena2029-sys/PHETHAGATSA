import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import { signToken } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    await dbConnect();
    const { emailOrUsername, password } = await req.json();

    if (!emailOrUsername || !password) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }

    // Find user by username or email
    const user = await User.findOne({
      $or: [
        { email: emailOrUsername.toLowerCase().trim() },
        { username: emailOrUsername.trim() }
      ]
    });

    if (!user) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 400 });
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 400 });
    }

    if (!user.provider) {
      user.provider = "credentials";
    }
    if (typeof user.passwordSet !== "boolean") {
      user.passwordSet = true;
    }
    await user.save();

    // Create JWT token
    const token = signToken({
      id: user._id.toString(),
      email: user.email,
      role: user.role,
      username: user.username,
    });

    const response = NextResponse.json(
      {
        message: "Login successful",
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          role: user.role,
          avatar: user.avatar,
          phone: user.phone,
          bio: user.bio,
          provider: user.provider,
          passwordSet: user.passwordSet,
        },
      },
      { status: 200 }
    );

    // Set cookie
    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: "/",
    });
    response.cookies.set("auth_provider", user.provider || "credentials", {
      secure: process.env.NODE_ENV === "production",
      maxAge: 7 * 24 * 60 * 60,
      path: "/",
    });

    return response;
  } catch (error: any) {
    console.error("Login error:", error);
    return NextResponse.json({ error: error.message || "Something went wrong" }, { status: 500 });
  }
}
