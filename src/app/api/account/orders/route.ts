import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Order from "@/models/Order";
import { getAuthUser } from "@/lib/auth";

export async function GET() {
  try {
    await dbConnect();
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const query: any = { $or: [] };

    if (user.email) {
      query.$or.push({ "customer.email": user.email });
    }
    if (user.phone) {
      query.$or.push({ "customer.phone": user.phone });
    }

    // If user has neither email nor phone (shouldn't happen with our auth providers), return empty array
    if (query.$or.length === 0) {
      return NextResponse.json([], { status: 200 });
    }

    const orders = await Order.find(query).sort({ createdAt: -1 });
    return NextResponse.json(orders, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to fetch user orders" }, { status: 500 });
  }
}
