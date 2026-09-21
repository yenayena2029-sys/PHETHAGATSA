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
    const files = formData.getAll("files") as File[];

    if (!files || files.length === 0) {
      return NextResponse.json({ error: "No files uploaded" }, { status: 400 });
    }

    const uploadDir = path.join(process.cwd(), "public", "images", "Products");
    
    // Ensure the directory exists
    await fs.mkdir(uploadDir, { recursive: true });

    const imageUrls: string[] = [];

    for (const file of files) {
      // Validate that it's a file and has content
      if (!file || !file.name) continue;

      // Validate file type (only allow images)
      if (!file.type.startsWith("image/")) {
        return NextResponse.json({ error: `File '${file.name}' is not a valid image` }, { status: 400 });
      }

      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // Sanitize filename and prepend timestamp
      const sanitizedName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, "_");
      const filename = `${Date.now()}-${sanitizedName}`;
      const filepath = path.join(uploadDir, filename);

      await fs.writeFile(filepath, buffer);
      imageUrls.push(`/images/Products/${filename}`);
    }

    return NextResponse.json({ urls: imageUrls }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to upload files" }, { status: 500 });
  }
}
