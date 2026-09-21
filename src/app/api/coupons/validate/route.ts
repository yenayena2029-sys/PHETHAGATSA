import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Coupon from "@/models/Coupon";

export async function POST(req: Request) {
  try {
    await dbConnect();
    const { code } = await req.json();

    if (!code) {
      return NextResponse.json({ error: "Promo code is required" }, { status: 400 });
    }

    const coupon = await Coupon.findOne({ 
      code: { $regex: new RegExp(`^${code}$`, 'i') } 
    });

    if (!coupon) {
      return NextResponse.json({ error: "Invalid promo code" }, { status: 404 });
    }

    if (!coupon.isActive) {
      return NextResponse.json({ error: "This promo code is no longer active" }, { status: 400 });
    }

    if (coupon.expiryDate && new Date(coupon.expiryDate) < new Date()) {
      return NextResponse.json({ error: "This promo code has expired" }, { status: 400 });
    }

    return NextResponse.json(
      { 
        success: true, 
        discountType: coupon.discountType === "fixed" ? "Fixed Amount" : "Percentage", 
        value: coupon.discountValue 
      }, 
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to validate coupon" }, { status: 500 });
  }
}
