import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Order from "@/models/Order";
import Product from "@/models/Product";
import { isAdmin } from "@/lib/auth";

export async function PUT(req: Request) {
  try {
    const isUserAdmin = await isAdmin();
    if (!isUserAdmin) {
      return NextResponse.json({ error: "Unauthorized. Admin access required." }, { status: 403 });
    }

    await dbConnect();
    const { orderIds, field, value } = await req.json();

    if (!orderIds || !Array.isArray(orderIds) || !field || !value) {
      return NextResponse.json({ error: "Invalid parameters" }, { status: 400 });
    }

    if (field !== "orderStatus" && field !== "paymentStatus") {
      return NextResponse.json({ error: "Invalid field to update" }, { status: 400 });
    }

    const updatedOrders = [];

    for (const id of orderIds) {
      const orderBefore = await Order.findById(id);
      if (!orderBefore) continue;

      if (field === "orderStatus") {
        const wasRestockedAlready = orderBefore.orderStatus === "returned" || orderBefore.orderStatus === "cancelled";
        const willBeRestocked = value === "returned" || value === "cancelled";

        if (willBeRestocked && !wasRestockedAlready) {
          for (const item of orderBefore.items) {
            if (item.productId) {
              await Product.findByIdAndUpdate(item.productId, { $inc: { stock: item.quantity } });
            }
          }
        } else if (!willBeRestocked && wasRestockedAlready) {
          for (const item of orderBefore.items) {
            if (item.productId) {
              await Product.findByIdAndUpdate(item.productId, { $inc: { stock: -item.quantity } });
            }
          }
        }
      }

      const updated = await Order.findByIdAndUpdate(
        id,
        { [field]: value },
        { new: true }
      );
      if (updated) {
        updatedOrders.push(updated);
      }
    }

    return NextResponse.json({ success: true, count: updatedOrders.length, orders: updatedOrders }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to process batch update" }, { status: 500 });
  }
}
