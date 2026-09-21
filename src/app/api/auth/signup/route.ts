import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import { signToken } from "@/lib/auth";
import { sendMail, getWelcomeEmailHtml } from "@/lib/mailer";
import { getSettings } from "@/lib/settings";

export async function POST(req: Request) {
  try {
    await dbConnect();
    const { username, email, password } = await req.json();

    if (!username || !email || !password) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email: email.toLowerCase() }, { username: username.toLowerCase() }]
    });

    if (existingUser) {
      return NextResponse.json({ error: "Username or Email already exists" }, { status: 400 });
    }

    // Count users to see if this is the first user
    const userCount = await User.countDocuments();
    const role = userCount === 0 ? "admin" : "customer";

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      username: username.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      passwordSet: true,
      provider: "credentials",
      role,
    });

    // Send Welcome Email asynchronously
    getSettings().then(settings => {
      const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
      const host = req.headers.get("host") || "localhost:3000";
      const storeUrl = settings.websiteLink || `${protocol}://${host}`;
      const storeName = settings.storeName || "SnapShop";
      const html = getWelcomeEmailHtml(user.username, storeName, storeUrl, settings.welcomeEmailTemplate);
      sendMail(user.email, `Welcome to ${storeName}!`, html).catch(err => console.error("Welcome email error:", err));
    }).catch(err => console.error("Error fetching settings for welcome email:", err));

    // Create JWT token
    const token = signToken({
      id: user._id.toString(),
      email: user.email,
      role: user.role,
      username: user.username,
    });

    const response = NextResponse.json(
      {
        message: "Registration successful",
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
      { status: 201 }
    );

    // Set cookie
    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: "/",
    });
    response.cookies.set("auth_provider", "credentials", {
      secure: process.env.NODE_ENV === "production",
      maxAge: 7 * 24 * 60 * 60,
      path: "/",
    });

    return response;
  } catch (error: any) {
    console.error("Signup error:", error);
    return NextResponse.json({ error: error.message || "Something went wrong" }, { status: 500 });
  }
}
