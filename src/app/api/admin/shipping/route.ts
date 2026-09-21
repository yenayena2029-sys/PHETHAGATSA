import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import ShippingMethod from "@/models/ShippingMethod";
import { isAdmin } from "@/lib/auth";

export async function GET() {
  try {
    const isUserAdmin = await isAdmin();
    if (!isUserAdmin) {
      return NextResponse.json({ error: "Unauthorized. Admin access required." }, { status: 403 });
    }

    await dbConnect();
    const methods = await ShippingMethod.find().sort({ cost: 1 });
    return NextResponse.json(methods, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to fetch shipping methods" }, { status: 500 });
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

    if (!data.name || data.cost === undefined) {
      return NextResponse.json({ error: "Name and cost are required fields." }, { status: 400 });
    }

    const method = await ShippingMethod.create(data);
    return NextResponse.json(method, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to create shipping method" }, { status: 500 });
  }
}
