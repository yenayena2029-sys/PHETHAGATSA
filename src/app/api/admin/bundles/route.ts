import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Bundle from "@/models/Bundle";
import { isAdmin } from "@/lib/auth";

export async function GET() {
  try {
    const isUserAdmin = await isAdmin();
    if (!isUserAdmin) {
      return NextResponse.json({ error: "Unauthorized. Admin access required." }, { status: 403 });
    }

    await dbConnect();
    const bundles = await Bundle.find().sort({ createdAt: -1 });
    return NextResponse.json(bundles, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to fetch bundles" }, { status: 500 });
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

    if (!data.name || !data.discount) {
      return NextResponse.json({ error: "Name and discount are required." }, { status: 400 });
    }

    const bundle = await Bundle.create(data);
    return NextResponse.json(bundle, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to create bundle" }, { status: 500 });
  }
}
