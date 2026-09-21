import { NextResponse } from "next/server";
import Stripe from "stripe";
import { getSettings } from "@/lib/settings";
import dbConnect from "@/lib/db";
import Order from "@/models/Order";
import { ALL_CURRENCIES } from "@/lib/currenciesList";

export async function POST(req: Request) {
  try {
    const settings = await getSettings();

    if (!settings.enableStripe) {
      return NextResponse.json({ error: "Stripe gateway is disabled" }, { status: 400 });
    }

    const { orderId, origin, lang } = await req.json();

    if (!orderId) {
      return NextResponse.json({ error: "Order ID is required" }, { status: 400 });
    }

    await dbConnect();
    const order = await Order.findById(orderId);
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const stripeSecret = settings.stripeSecretKey || process.env.STRIPE_SECRET_KEY;

    if (!stripeSecret) {
      return NextResponse.json({ error: "Stripe secret key is not configured" }, { status: 400 });
    }

    const localePrefix = lang && lang !== "en" ? `/${lang}` : "";

    // Initialize Stripe
    const stripe = new Stripe(stripeSecret, {
      apiVersion: "2025-01-27.acacia" as any,
    });

    const amountInCents = Math.round(order.total * 100);
    // Extract the valid 3-letter currency code instead of symbol
    const rawCurrency = settings.currency || "USD";
    const matchedCurrency = ALL_CURRENCIES.find(c => c.symbol === rawCurrency || c.code === rawCurrency);
    const currency = (matchedCurrency ? matchedCurrency.code : "USD").toLowerCase();

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      customer_email: order.customer?.email || undefined,
      line_items: [
        {
          price_data: {
            currency: currency,
            product_data: {
              name: `SnapShop Order #${order._id.toString().substring(0, 8)}`,
              description: `Payment for order from ${order.customer.name}`,
            },
            unit_amount: amountInCents,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${origin}${localePrefix}/orders/${order._id}?session_id={CHECKOUT_SESSION_ID}&payment_success=true`,
      cancel_url: `${origin}${localePrefix}/checkout?order_id=${order._id}&payment_cancelled=true`,
      metadata: {
        orderId: order._id.toString(),
      },
    });

    return NextResponse.json({
      url: session.url,
    }, { status: 200 });

  } catch (error: any) {
    console.error("Stripe Checkout Error:", error);
    return NextResponse.json({ error: error.message || "Failed to create checkout session" }, { status: 500 });
  }
}
