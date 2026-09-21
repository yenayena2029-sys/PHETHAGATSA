import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { promises as fs } from "fs";
import path from "path";

export async function POST(req: Request) {
  try {
    // 1. Check Auth
    const isUserAdmin = await isAdmin();
    if (!isUserAdmin) {
      return NextResponse.json({ error: "Unauthorized. Admin access required." }, { status: 403 });
    }

    // 2. Parse FormData
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const oldUrl = formData.get("oldUrl") as string;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const uploadDir = path.join(process.cwd(), "public", "images", "Settings");
    
    // Ensure the directory exists
    await fs.mkdir(uploadDir, { recursive: true });

    // Validate file type (only allow images)
    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "File is not a valid image" }, { status: 400 });
    }

    // Delete old file if provided and it belongs to /images/Settings/
    if (oldUrl && typeof oldUrl === 'string' && oldUrl.startsWith("/images/Settings/")) {
      try {
        const oldFilename = oldUrl.split("/").pop();
        if (oldFilename) {
          const oldFilepath = path.join(uploadDir, oldFilename);
          await fs.unlink(oldFilepath);
        }
      } catch (err) {
        console.error("Failed to delete old image:", err);
        // Continue even if deletion fails (e.g. file not found)
      }
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Sanitize filename and prepend timestamp
    let filename = "";
    const ext = path.extname(file.name);
    const uploadType = formData.get("uploadType") as string;

    if (uploadType === "logo") {
      filename = `logo${ext}`;
      // Delete old logo
      const oldFiles = await fs.readdir(uploadDir).catch(() => []);
      for (const f of oldFiles) {
        if (f.startsWith("logo.")) {
          await fs.unlink(path.join(uploadDir, f)).catch(() => {});
        }
      }
    } else if (uploadType === "favicon") {
      filename = "favicon.ico"; // Forced to .ico based on request
      // Delete old favicon
      const oldFiles = await fs.readdir(uploadDir).catch(() => []);
      for (const f of oldFiles) {
        if (f.startsWith("favicon.")) {
          await fs.unlink(path.join(uploadDir, f)).catch(() => {});
        }
      }
    } else if (uploadType === "heroBanner") {
      filename = `hero_fashion_girl${ext}`;
      // Delete old hero banner
      const oldFiles = await fs.readdir(uploadDir).catch(() => []);
      for (const f of oldFiles) {
        if (f.startsWith("hero_fashion_girl.")) {
          await fs.unlink(path.join(uploadDir, f)).catch(() => {});
        }
      }
    } else {
      const sanitizedName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, "_");
      filename = `${Date.now()}-${sanitizedName}`;
    }

    const filepath = path.join(uploadDir, filename);

    await fs.writeFile(filepath, buffer);
    const newUrl = `/images/Settings/${filename}?v=${Date.now()}`;

    return NextResponse.json({ url: newUrl }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to upload file" }, { status: 500 });
  }
}
