import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import { isAdmin } from "@/lib/auth";
import ProductTemplate from "@/models/ProductTemplate";

export async function GET() {
  try {
    const isUserAdmin = await isAdmin();
    if (!isUserAdmin) {
      return NextResponse.json({ error: "Unauthorized. Admin access required." }, { status: 403 });
    }

    await dbConnect();
    const templates = await ProductTemplate.find({}).sort({ name: 1 });
    return NextResponse.json(templates, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to fetch templates" }, { status: 500 });
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

    if (!data.name) {
      return NextResponse.json({ error: "Template name is required" }, { status: 400 });
    }

    const template = await ProductTemplate.create({
      name: data.name.trim(),
      attributes: data.attributes || ["Sizes", "Colors", "Custom Fields"],
      usage: data.usage || 0,
    });

    return NextResponse.json(template, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to create template" }, { status: 500 });
  }
}
