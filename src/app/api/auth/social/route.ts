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
    const { email, username, avatar, provider, uid, phoneNumber } = await req.json();

    // Determine email
    let userEmail = email ? email.toLowerCase().trim() : "";
    if (!userEmail && phoneNumber) {
      const cleanPhone = phoneNumber.replace(/[^0-9+]/g, "");
      userEmail = `phone_${cleanPhone.replace("+", "")}@snapshop.com`;
    }

    if (!userEmail) {
      return NextResponse.json({ error: "Email or phone number is required" }, { status: 400 });
    }

    // Determine username
    let userUsername = username ? username.trim() : "";
    if (!userUsername) {
      userUsername = userEmail.split("@")[0] || `user_${Date.now()}`;
    }

    // Ensure username is unique in database (append random string if already exists)
    let existingUserByUsername = await User.findOne({ username: userUsername });
    if (existingUserByUsername) {
      userUsername = `${userUsername}_${Math.floor(100 + Math.random() * 900)}`;
    }

    // Find user by email
    let user = await User.findOne({ email: userEmail });

    if (!user) {
      // Create new user with a random secure password (since password is required in schema)
      const randomPassword = Math.random().toString(36) + Date.now().toString();
      const hashedPassword = await bcrypt.hash(randomPassword, 10);

      user = await User.create({
        username: userUsername,
        email: userEmail,
        password: hashedPassword,
        passwordSet: false,
        provider: provider || "social",
        avatar: avatar || "",
        role: "customer",
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
    } else if (avatar && !user.avatar) {
      // Update avatar if not present
      user.avatar = avatar;
      await user.save();
    }
    
    if (provider && user.provider !== provider) {
      user.provider = provider;
      await user.save();
    }
    
    if (provider && user.passwordSet === undefined) {
      user.passwordSet = false;
      await user.save();
    }

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
        } 
      },
      { status: 200 }
    );

    // Set token cookie
    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: "/",
    });
    response.cookies.set("auth_provider", user.provider || provider || "social", {
      secure: process.env.NODE_ENV === "production",
      maxAge: 7 * 24 * 60 * 60,
      path: "/",
    });

    return response;
  } catch (error: any) {
    console.error("Social login error:", error);
    return NextResponse.json({ error: error.message || "Failed to process social authentication" }, { status: 500 });
  }
}
