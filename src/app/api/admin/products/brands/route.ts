import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import { isAdmin } from "@/lib/auth";
import Brand from "@/models/Brand";

export async function GET() {
  try {
    const isUserAdmin = await isAdmin();
    if (!isUserAdmin) {
      return NextResponse.json({ error: "Unauthorized. Admin access required." }, { status: 403 });
    }

    await dbConnect();
    const brands = await Brand.find({}).sort({ name: 1 });
    return NextResponse.json(brands, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to fetch brands" }, { status: 500 });
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

    if (!data.name || !data.slug) {
      return NextResponse.json({ error: "Name and slug are required" }, { status: 400 });
    }

    const brand = await Brand.create({
      name: data.name,
      slug: data.slug,
      active: data.active !== undefined ? data.active : true,
    });

    return NextResponse.json(brand, { status: 201 });
  } catch (error: any) {
    // Handle duplicate slug
    if (error.code === 11000) {
      return NextResponse.json({ error: "A brand with this slug already exists" }, { status: 400 });
    }
    return NextResponse.json({ error: error.message || "Failed to create brand" }, { status: 500 });
  }
}
