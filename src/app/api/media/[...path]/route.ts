import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

export const dynamic = 'force-dynamic';

export async function GET(req: Request, { params }: { params: Promise<{ path: string[] }> }) {
  try {
    const { path: pathArray } = await params;
    // Security check to prevent directory traversal
    if (pathArray.some(segment => segment.includes(".."))) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    const filePath = path.join(process.cwd(), "public", "images", ...pathArray);
    
    const fileBuffer = await fs.readFile(filePath);
    
    // basic mime type detection
    const ext = path.extname(filePath).toLowerCase();
    let contentType = "application/octet-stream";
    if (ext === ".png") contentType = "image/png";
    else if (ext === ".jpg" || ext === ".jpeg") contentType = "image/jpeg";
    else if (ext === ".svg") contentType = "image/svg+xml";
    else if (ext === ".gif") contentType = "image/gif";
    else if (ext === ".webp") contentType = "image/webp";
    else if (ext === ".ico") contentType = "image/x-icon";

    return new NextResponse(fileBuffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error) {
    return new NextResponse("File not found", { status: 404 });
  }
}
