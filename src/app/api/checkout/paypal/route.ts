import { NextResponse } from "next/server";
import { getSettings } from "@/lib/settings";
import dbConnect from "@/lib/db";
import Order from "@/models/Order";

export async function POST(req: Request) {
  try {
    const settings = await getSettings();

    if (!settings.enablePaypal) {
      return NextResponse.json({ error: "PayPal gateway is disabled" }, { status: 400 });
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

    const clientId = settings.paypalClientId;
    const clientSecret = settings.paypalClientSecret;
    const mode = settings.paypalMode || "sandbox";

    if (!clientId || !clientSecret) {
      return NextResponse.json({ error: "PayPal credentials not configured" }, { status: 400 });
    }

    const localePrefix = lang && lang !== "en" ? `/${lang}` : "";

    // Call PayPal REST API to create checkout order
    const authUrl = mode === "live" 
      ? "https://api-m.paypal.com/v1/oauth2/token" 
      : "https://api-m.sandbox.paypal.com/v1/oauth2/token";
      
    const ordersUrl = mode === "live" 
      ? "https://api-m.paypal.com/v2/checkout/orders" 
      : "https://api-m.sandbox.paypal.com/v2/checkout/orders";

    // 1. Get access token
    const basicAuth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
    const tokenRes = await fetch(authUrl, {
      method: "POST",
      headers: {
        "Authorization": `Basic ${basicAuth}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: "grant_type=client_credentials",
    });

    if (!tokenRes.ok) {
      const tokenError = await tokenRes.json();
      throw new Error(tokenError.error_description || "Failed to authenticate with PayPal");
    }

    const tokenData = await tokenRes.json();
    const accessToken = tokenData.access_token;

    // 2. Create order in PayPal
    const currency = settings.currency || "USD";
    const paypalOrderRes = await fetch(ordersUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        intent: "CAPTURE",
        purchase_units: [
          {
            reference_id: order._id.toString(),
            amount: {
              currency_code: currency,
              value: order.total.toFixed(2),
            },
            description: `Order #${order._id.toString().substring(0, 8)}`,
          },
        ],
        application_context: {
          brand_name: settings.storeName || "SnapShop",
          landing_page: "NO_PREFERENCE",
          user_action: "PAY_NOW",
          return_url: `${origin}${localePrefix}/orders/${order._id}?payment_success=true&gateway=PayPal`,
          cancel_url: `${origin}${localePrefix}/checkout?order_id=${order._id}&payment_cancelled=true`,
        },
      }),
    });

    if (!paypalOrderRes.ok) {
      const orderError = await paypalOrderRes.json();
      throw new Error(orderError.message || "Failed to create PayPal order");
    }

    const paypalOrder = await paypalOrderRes.json();
    
    // Find the approval link
    const approveLink = paypalOrder.links.find((l: any) => l.rel === "approve");
    
    if (!approveLink) {
      throw new Error("PayPal approve link not found");
    }

    return NextResponse.json({
      url: approveLink.href,
      isMock: false,
    }, { status: 200 });

  } catch (error: any) {
    console.error("PayPal Checkout Error:", error);
    return NextResponse.json({ error: error.message || "Failed to create PayPal checkout session" }, { status: 500 });
  }
}
