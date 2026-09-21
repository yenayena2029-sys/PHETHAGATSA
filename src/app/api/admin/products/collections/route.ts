import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import { isAdmin } from "@/lib/auth";
import Collection from "@/models/Collection";

export async function GET() {
  try {
    const isUserAdmin = await isAdmin();
    if (!isUserAdmin) {
      return NextResponse.json({ error: "Unauthorized. Admin access required." }, { status: 403 });
    }

    await dbConnect();
    const collections = await Collection.find({}).sort({ name: 1 });
    return NextResponse.json(collections, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to fetch collections" }, { status: 500 });
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

    const collection = await Collection.create({
      name: data.name.trim(),
      slug: data.slug.trim().toLowerCase(),
      active: data.active !== undefined ? data.active : true,
    });

    return NextResponse.json(collection, { status: 201 });
  } catch (error: any) {
    if (error.code === 11000) {
      return NextResponse.json({ error: "A collection with this slug already exists" }, { status: 400 });
    }
    return NextResponse.json({ error: error.message || "Failed to create collection" }, { status: 500 });
  }
}
