import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import { isAdmin } from "@/lib/auth";
import Color from "@/models/Color";

export async function GET() {
  try {
    const isUserAdmin = await isAdmin();
    if (!isUserAdmin) {
      return NextResponse.json({ error: "Unauthorized. Admin access required." }, { status: 403 });
    }

    await dbConnect();
    const colors = await Color.find({}).sort({ name: 1 });
    return NextResponse.json(colors, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to fetch colors" }, { status: 500 });
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

    if (!data.name || !data.hex) {
      return NextResponse.json({ error: "Name and hex are required" }, { status: 400 });
    }

    const color = await Color.create({
      name: data.name.trim(),
      hex: data.hex.trim(),
      active: data.active !== undefined ? data.active : true,
    });

    return NextResponse.json(color, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to create color" }, { status: 500 });
  }
}
