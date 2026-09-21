import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import CustomPage from "@/models/CustomPage";
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
      // Check duplicate slug on another page
      const duplicate = await CustomPage.findOne({ slug: data.slug, _id: { $ne: id } });
      if (duplicate) {
        return NextResponse.json({ error: "Another page already uses this title/slug." }, { status: 400 });
      }
    }

    const page = await CustomPage.findByIdAndUpdate(id, data, { new: true });
    if (!page) {
      return NextResponse.json({ error: "Custom page not found" }, { status: 404 });
    }

    return NextResponse.json(page, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to update custom page" }, { status: 500 });
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

    const page = await CustomPage.findByIdAndDelete(id);
    if (!page) {
      return NextResponse.json({ error: "Custom page not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Custom page deleted successfully" }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to delete custom page" }, { status: 500 });
  }
}

