import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Category from "@/models/Category";
import { isAdmin } from "@/lib/auth";

export async function GET() {
  try {
    await dbConnect();
    const categories = await Category.find().sort({ name: 1 });
    return NextResponse.json(categories, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to fetch categories" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const isUserAdmin = await isAdmin();
    if (!isUserAdmin) {
      return NextResponse.json({ error: "Unauthorized. Admin access required." }, { status: 403 });
    }

    await dbConnect();
    const { name } = await req.json();

    if (!name) {
      return NextResponse.json({ error: "Category name is required" }, { status: 400 });
    }

    const slug = name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    const existingCategory = await Category.findOne({ slug });
    if (existingCategory) {
      return NextResponse.json({ error: "Category already exists" }, { status: 400 });
    }

    const category = await Category.create({ name, slug });
    return NextResponse.json(category, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to create category" }, { status: 500 });
  }
}
