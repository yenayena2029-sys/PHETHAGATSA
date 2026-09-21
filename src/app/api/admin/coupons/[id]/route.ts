import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Coupon from "@/models/Coupon";
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

    if (data.code) {
      data.code = data.code.toUpperCase().trim();
      // Check if duplicate code exists on another coupon
      const duplicate = await Coupon.findOne({ code: data.code, _id: { $ne: id } });
      if (duplicate) {
        return NextResponse.json({ error: "Another coupon already uses this code." }, { status: 400 });
      }
    }

    const coupon = await Coupon.findByIdAndUpdate(id, data, { new: true });
    if (!coupon) {
      return NextResponse.json({ error: "Coupon not found" }, { status: 404 });
    }

    return NextResponse.json(coupon, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to update coupon" }, { status: 500 });
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

    const coupon = await Coupon.findByIdAndDelete(id);
    if (!coupon) {
      return NextResponse.json({ error: "Coupon not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Coupon deleted successfully" }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to delete coupon" }, { status: 500 });
  }
}

