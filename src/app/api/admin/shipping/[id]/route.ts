import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import ShippingMethod from "@/models/ShippingMethod";
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

    const method = await ShippingMethod.findByIdAndUpdate(id, data, { new: true });
    if (!method) {
      return NextResponse.json({ error: "Shipping method not found" }, { status: 404 });
    }

    return NextResponse.json(method, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to update shipping method" }, { status: 500 });
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

    const method = await ShippingMethod.findByIdAndDelete(id);
    if (!method) {
      return NextResponse.json({ error: "Shipping method not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Shipping method deleted successfully" }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to delete shipping method" }, { status: 500 });
  }
}

