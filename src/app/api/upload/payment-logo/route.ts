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
    const name = formData.get("name") as string;
    const file = formData.get("file") as File;

    if (!name || !["stripe", "paypal", "razorpay", "cod"].includes(name)) {
      return NextResponse.json({ error: "Invalid payment gateway name" }, { status: 400 });
    }

    if (!file || !file.name) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    // Validate image type
    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "File is not a valid image" }, { status: 400 });
    }

    const uploadDir = path.join(process.cwd(), "public", "images", "payment");
    
    // Ensure the directory exists
    await fs.mkdir(uploadDir, { recursive: true });

    // Clean up old files for this gateway name (e.g. stripe.*)
    try {
      const existingFiles = await fs.readdir(uploadDir);
      for (const existingFile of existingFiles) {
        if (existingFile.startsWith(`${name}.`)) {
          await fs.unlink(path.join(uploadDir, existingFile));
        }
      }
    } catch (e) {
      // Ignore if directory doesn't exist yet or other readdir errors
    }

    // Save the new file
    const ext = path.extname(file.name) || ".png";
    const filename = `${name}${ext}`;
    const filepath = path.join(uploadDir, filename);

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await fs.writeFile(filepath, buffer);

    const relativeUrl = `/images/payment/${filename}`;

    return NextResponse.json({ url: relativeUrl }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to upload payment logo" }, { status: 500 });
  }
}
