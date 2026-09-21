import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Order from "@/models/Order";
import Product from "@/models/Product";
import { isAdmin } from "@/lib/auth";
import { sendMail, getOrderConfirmationHtml } from "@/lib/mailer";
import { getSettings } from "@/lib/settings";

export async function GET() {
  try {
    const isUserAdmin = await isAdmin();
    if (!isUserAdmin) {
      return NextResponse.json({ error: "Unauthorized. Admin access required." }, { status: 403 });
    }

    await dbConnect();
    const orders = await Order.find().sort({ createdAt: -1 });
    return NextResponse.json(orders, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to fetch orders" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await dbConnect();
    const { customer, items, subtotal, shippingCost, promoCode, discountAmount, total, paymentMethod, paymentStatus } = await req.json();

    if (!customer || !items || !items.length || subtotal === undefined || shippingCost === undefined || total === undefined) {
      return NextResponse.json({ error: "Invalid order data" }, { status: 400 });
    }

    // Deduct stock levels for items
    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return NextResponse.json({ error: `Product ${item.name} not found` }, { status: 404 });
      }
      if (product.stock < item.quantity) {
        return NextResponse.json({ error: `Insufficient stock for product: ${item.name}` }, { status: 400 });
      }
      // Update stock
      product.stock -= item.quantity;
      await product.save();
    }

    const order = await Order.create({
      customer,
      items,
      subtotal,
      shippingCost,
      promoCode: promoCode || null,
      discountAmount: discountAmount || 0,
      total,
      paymentMethod,
      paymentStatus: paymentStatus || "unpaid",
    });

    // Send order confirmation email
    if (order.customer?.email) {
      getSettings().then(settings => {
        const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
        const host = req.headers.get("host") || "localhost:3000";
        const storeUrl = settings.websiteLink || `${protocol}://${host}`;
        const storeName = settings.storeName || "SnapShop";
        const currency = settings.currencySymbol || "$";
        const html = getOrderConfirmationHtml(order, storeName, storeUrl, currency, settings.orderConfirmationTemplate);
        sendMail(order.customer.email, `Order Confirmation #${order._id.toString().substring(0, 8)}`, html)
          .catch(err => console.error("Order confirmation email error:", err));
      }).catch(err => console.error("Error fetching settings for order confirmation email:", err));
    }

    return NextResponse.json(order, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to place order" }, { status: 500 });
  }
}
