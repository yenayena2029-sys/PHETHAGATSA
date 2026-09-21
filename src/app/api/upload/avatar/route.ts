import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { promises as fs } from "fs";
import path from "path";
import dbConnect from "@/lib/db";
import User from "@/models/User";

const USERS_DIR = path.join(process.cwd(), "public", "images", "users");

export async function POST(req: Request) {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("avatar") as File | null;

    if (!file || !file.name) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "File must be an image" }, { status: 400 });
    }

    // Ensure upload dir exists
    await fs.mkdir(USERS_DIR, { recursive: true });

    // Connect DB and load the user record to find old avatar
    await dbConnect();
    const dbUser = await User.findById(user.id);

    // Delete old avatar file if it exists and is a local user image
    if (dbUser?.avatar && dbUser.avatar.startsWith("/images/users/")) {
      const oldPath = path.join(process.cwd(), "public", dbUser.avatar);
      try {
        await fs.unlink(oldPath);
      } catch {
        // File may not exist on disk — ignore
      }
    }

    // Save new file: user-{userId}-{timestamp}.ext
    const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const filename = `user-${user.id}-${Date.now()}.${ext}`;
    const filepath = path.join(USERS_DIR, filename);
    const bytes = await file.arrayBuffer();
    await fs.writeFile(filepath, Buffer.from(bytes));

    const avatarUrl = `/images/users/${filename}`;

    // Persist new avatar URL to DB
    if (dbUser) {
      dbUser.avatar = avatarUrl;
      await dbUser.save();
    }

    return NextResponse.json({ url: avatarUrl }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Upload failed" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const dbUser = await User.findById(user.id);

    if (dbUser?.avatar && dbUser.avatar.startsWith("/images/users/")) {
      const oldPath = path.join(process.cwd(), "public", dbUser.avatar);
      try {
        await fs.unlink(oldPath);
      } catch {
        // Ignore missing file
      }
      dbUser.avatar = "";
      await dbUser.save();
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Delete failed" }, { status: 500 });
  }
}
