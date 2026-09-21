import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Order from "@/models/Order";
import { isAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const isUserAdmin = await isAdmin();
    if (!isUserAdmin) {
      return NextResponse.json({ error: "Unauthorized. Admin access required." }, { status: 403 });
    }

    await dbConnect();
    // Fetch orders that haven't been seen by admin yet
    const unseenOrders = await Order.find({ isAdminSeen: { $ne: true } }).sort({ createdAt: -1 });

    return NextResponse.json(unseenOrders, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to fetch notifications" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const isUserAdmin = await isAdmin();
    if (!isUserAdmin) {
      return NextResponse.json({ error: "Unauthorized. Admin access required." }, { status: 403 });
    }

    await dbConnect();
    const { orderIds } = await req.json();

    if (orderIds && Array.isArray(orderIds)) {
      // Mark specific orders as seen
      await Order.updateMany(
        { _id: { $in: orderIds } },
        { $set: { isAdminSeen: true } }
      );
    } else {
      // Mark all orders as seen
      await Order.updateMany(
        { isAdminSeen: { $ne: true } },
        { $set: { isAdminSeen: true } }
      );
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to update notifications" }, { status: 500 });
  }
}
