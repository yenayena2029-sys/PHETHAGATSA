import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Coupon from "@/models/Coupon";
import { isAdmin } from "@/lib/auth";

export async function GET() {
  try {
    const isUserAdmin = await isAdmin();
    if (!isUserAdmin) {
      return NextResponse.json({ error: "Unauthorized. Admin access required." }, { status: 403 });
    }

    await dbConnect();
    const coupons = await Coupon.find().sort({ createdAt: -1 });
    return NextResponse.json(coupons, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to fetch coupons" }, { status: 500 });
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

    if (!data.code || !data.discountValue) {
      return NextResponse.json({ error: "Code and discount value are required." }, { status: 400 });
    }

    // Force uppercase code
    data.code = data.code.toUpperCase().trim();

    // Check unique code
    const existing = await Coupon.findOne({ code: data.code });
    if (existing) {
      return NextResponse.json({ error: "A coupon with this code already exists." }, { status: 400 });
    }

    const coupon = await Coupon.create(data);
    return NextResponse.json(coupon, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to create coupon" }, { status: 500 });
  }
}
