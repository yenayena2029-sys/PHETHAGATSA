import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Order from "@/models/Order";
import { isAdmin } from "@/lib/auth";
import { sendMail, getOrderStatusHtml } from "@/lib/mailer";
import { getSettings } from "@/lib/settings";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await dbConnect();
    const { id } = await params;
    const order = await Order.findById(id);
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }
    return NextResponse.json(order, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to fetch order" }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const isUserAdmin = await isAdmin();
    if (!isUserAdmin) {
      return NextResponse.json({ error: "Unauthorized. Admin access required." }, { status: 403 });
    }

    await dbConnect();
    const { id } = await params;
    const { orderStatus, paymentStatus } = await req.json();

    const orderBefore = await Order.findById(id);
    if (!orderBefore) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const wasRestockedAlready = orderBefore.orderStatus === "returned" || orderBefore.orderStatus === "cancelled";
    const willBeRestocked = orderStatus === "returned" || orderStatus === "cancelled";

    const Product = (await import("@/models/Product")).default;

    if (willBeRestocked && !wasRestockedAlready) {
      // Restock items
      for (const item of orderBefore.items) {
        if (item.productId) {
          await Product.findByIdAndUpdate(item.productId, { $inc: { stock: item.quantity } });
        }
      }
    } else if (!willBeRestocked && wasRestockedAlready && orderStatus) {
      // Re-deduct items if moved back from cancelled/returned
      for (const item of orderBefore.items) {
        if (item.productId) {
          await Product.findByIdAndUpdate(item.productId, { $inc: { stock: -item.quantity } });
        }
      }
    }

    const updateFields: any = {};
    if (orderStatus) updateFields.orderStatus = orderStatus;
    if (paymentStatus) updateFields.paymentStatus = paymentStatus;

    const order = await Order.findByIdAndUpdate(id, updateFields, { new: true });

    // Send order status email if status changed
    if (orderStatus && orderBefore.orderStatus !== orderStatus && order.customer?.email) {
      getSettings().then(settings => {
        const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
        const host = req.headers.get("host") || "localhost:3000";
        const storeUrl = settings.websiteLink || `${protocol}://${host}`;
        const storeName = settings.storeName || "SnapShop";
        
        let template = undefined;
        if (orderStatus === "processing") template = settings.orderProcessingTemplate;
        else if (orderStatus === "shipped") template = settings.orderShippedTemplate;
        else if (orderStatus === "delivered") template = settings.orderDeliveredTemplate;
        else if (orderStatus === "cancelled") template = settings.orderCancelledTemplate;

        const html = getOrderStatusHtml(order._id.toString(), orderStatus, storeName, storeUrl, template);
        sendMail(order.customer.email, `Update on your order #${order._id.toString().substring(0, 8)}`, html)
          .catch(err => console.error("Order status email error:", err));
      }).catch(err => console.error("Error fetching settings for order status email:", err));
    }

    return NextResponse.json(order, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to update order" }, { status: 500 });
  }
}
