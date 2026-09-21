import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import { isAdmin } from "@/lib/auth";
import Size from "@/models/Size";

export async function GET() {
  try {
    const isUserAdmin = await isAdmin();
    if (!isUserAdmin) {
      return NextResponse.json({ error: "Unauthorized. Admin access required." }, { status: 403 });
    }

    await dbConnect();
    const sizes = await Size.find({}).sort({ category: 1, label: 1 });
    return NextResponse.json(sizes, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to fetch sizes" }, { status: 500 });
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

    if (!data.label || !data.name || !data.category) {
      return NextResponse.json({ error: "Label, name, and category are required" }, { status: 400 });
    }

    const size = await Size.create({
      label: data.label.trim().toUpperCase(),
      name: data.name.trim(),
      category: data.category.trim(),
    });

    return NextResponse.json(size, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to create size" }, { status: 500 });
  }
}
