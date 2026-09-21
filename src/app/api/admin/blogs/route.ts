import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import BlogPost from "@/models/BlogPost";
import { isAdmin } from "@/lib/auth";

export async function GET() {
  try {
    const isUserAdmin = await isAdmin();
    if (!isUserAdmin) {
      return NextResponse.json({ error: "Unauthorized. Admin access required." }, { status: 403 });
    }

    await dbConnect();
    const posts = await BlogPost.find().sort({ createdAt: -1 });
    return NextResponse.json(posts, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to fetch blog posts" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const isUserAdmin = await isAdmin();
    if (!isUserAdmin) {
      return NextResponse.json({ error: "Unauthorized. Admin access required." }, { status: 403 });
    }

    await dbConnect();
    const data = await req.json();

    if (!data.title || !data.content) {
      return NextResponse.json({ error: "Title and content are required." }, { status: 400 });
    }

    // Auto-generate slug if not provided
    if (!data.slug) {
      data.slug = data.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "");
    } else {
      data.slug = data.slug.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");
    }

    // Check unique slug
    const existing = await BlogPost.findOne({ slug: data.slug });
    if (existing) {
      return NextResponse.json({ error: "A blog post with this slug or title already exists." }, { status: 400 });
    }

    const post = await BlogPost.create(data);
    return NextResponse.json(post, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to create blog post" }, { status: 500 });
  }
}
