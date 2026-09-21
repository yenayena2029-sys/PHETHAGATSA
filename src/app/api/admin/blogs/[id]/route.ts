import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import BlogPost from "@/models/BlogPost";
import { isAdmin } from "@/lib/auth";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const isUserAdmin = await isAdmin();
    if (!isUserAdmin) {
      return NextResponse.json({ error: "Unauthorized. Admin access required." }, { status: 403 });
    }

    const { id } = await params;
    await dbConnect();
    const data = await req.json();

    if (data.title && !data.slug) {
      data.slug = data.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "");
    } else if (data.slug) {
      data.slug = data.slug.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");
    }

    if (data.slug) {
      // Check duplicate slug on another post
      const duplicate = await BlogPost.findOne({ slug: data.slug, _id: { $ne: id } });
      if (duplicate) {
        return NextResponse.json({ error: "Another blog post already uses this title/slug." }, { status: 400 });
      }
    }

    const post = await BlogPost.findByIdAndUpdate(id, data, { new: true });
    if (!post) {
      return NextResponse.json({ error: "Blog post not found" }, { status: 404 });
    }

    return NextResponse.json(post, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to update blog post" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const isUserAdmin = await isAdmin();
    if (!isUserAdmin) {
      return NextResponse.json({ error: "Unauthorized. Admin access required." }, { status: 403 });
    }

    const { id } = await params;
    await dbConnect();

    const post = await BlogPost.findByIdAndDelete(id);
    if (!post) {
      return NextResponse.json({ error: "Blog post not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Blog post deleted successfully" }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to delete blog post" }, { status: 500 });
  }
}

