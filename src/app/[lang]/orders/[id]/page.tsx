import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import dbConnect from "@/lib/db";
import Order from "@/models/Order";
import { getSettings } from "@/lib/settings";
import { CheckCircle, Package, Calendar, User, MapPin, CheckCircle2 } from "lucide-react";
import Stripe from "stripe";

async function verifyAndGetOrderDetails(id: string, sessionId?: string, paymentSuccess?: string) {
  await dbConnect();
  try {
    const order = await Order.findById(id);
    if (!order) return { order: null, settings: { currency: "$" } };

    const settings = await getSettings();

    // Verify Stripe session server-side
    if (sessionId && order.paymentStatus !== "paid") {
      const stripeSecret = settings.stripeSecretKey || process.env.STRIPE_SECRET_KEY;
      if (stripeSecret && !stripeSecret.includes("mock_keys") && !stripeSecret.startsWith("sk_test_mock")) {
        try {
          const stripe = new Stripe(stripeSecret, {
            apiVersion: "2025-01-27.acacia" as any,
          });
          const session = await stripe.checkout.sessions.retrieve(sessionId);
          if (session.payment_status === "paid") {
            order.paymentStatus = "paid";
            await order.save();
          }
        } catch (stripeErr) {
          console.error("Stripe verification failed:", stripeErr);
        }
      }
    } else if (paymentSuccess === "true" && order.paymentStatus !== "paid") {
      // Mock payment or simulation sandbox successful callback
      order.paymentStatus = "paid";
      await order.save();
    }

    return {
      order: JSON.parse(JSON.stringify(order)),
      settings: JSON.parse(JSON.stringify(settings || { currency: "$" })),
    };
  } catch (e) {
    return { order: null, settings: { currency: "$" } };
  }
}

export default async function OrderConfirmationPage({
  params,
  searchParams,
}: {
  params: Promise<{ lang: string; id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { id, lang } = await params;
  const search = await searchParams;
  const sessionId = search.session_id as string | undefined;
  const paymentSuccess = search.payment_success as string | undefined;

  const { order, settings } = await verifyAndGetOrderDetails(id, sessionId, paymentSuccess);

  if (!order) {
    notFound();
  }

  const currency = settings.currency || "$";
  const isAr = lang === "ar";
  const isPaid = order.paymentStatus === "paid";

  return (
    <div className="container" style={styles.container}>
      <div style={styles.card}>
        <div style={styles.successHeader}>
          <CheckCircle size={56} color="#10b981" />
          <h1 style={styles.successTitle}>
            {isAr ? "تم تأكيد الطلب!" : "Order Confirmed!"}
          </h1>
          <p style={styles.successSub}>
            {isAr ? "نشكركم على تسوقكم من SnapShop. تم تسجيل طلبكم بنجاح." : "Thank you for your purchase at SnapShop."}
          </p>
        </div>

        {isPaid && (
          <div style={styles.paymentSuccessBanner}>
            <div style={styles.bannerIconWrapper}>
              <CheckCircle2 size={20} color="#10b981" />
            </div>
            <div style={{ textAlign: isAr ? "right" : "left", flex: 1 }}>
              <h4 style={styles.bannerTitle}>
                {isAr ? "تم الدفع بنجاح!" : "Payment Successful!"}
              </h4>
              <p style={styles.bannerText}>
                {isAr 
                  ? "نشكركم على ثقتكم. تم تأكيد الدفع بنجاح للطلب الخاص بكم."
                  : "Thank you for your trust. Payment has been successfully verified for your order."}
              </p>
            </div>
          </div>
        )}

        <div style={styles.metaRow}>
          <div style={styles.metaItem}>
            <span style={styles.metaLabel}>{isAr ? "رقم الطلب" : "Order ID"}</span>
            <p style={styles.metaValue}>#{order._id.toString().substring(0, 12)}...</p>
          </div>
          <div style={styles.metaItem}>
            <span style={styles.metaLabel}>{isAr ? "التاريخ" : "Date"}</span>
            <p style={styles.metaValue}>{new Date(order.createdAt).toLocaleDateString()}</p>
          </div>
          <div style={styles.metaItem}>
            <span style={styles.metaLabel}>{isAr ? "الحالة" : "Status"}</span>
            <p style={{ ...styles.metaValue, color: "var(--primary)" }}>
              {order.orderStatus.toUpperCase()}
            </p>
          </div>
        </div>

        <div style={styles.infoGrid}>
          {/* Customer Shipping Info */}
          <div style={styles.infoBlock}>
            <h3 style={styles.blockTitle}>
              <MapPin size={16} style={{ marginRight: isAr ? 0 : 6, marginLeft: isAr ? 6 : 0 }} />
              {isAr ? "عنوان الشحن" : "Shipping Address"}
            </h3>
            <p style={styles.blockText}>{order.customer.name}</p>
            <p style={styles.blockText}>{order.customer.address}</p>
            <p style={styles.blockText}>
              {order.customer.city}{order.customer.postalCode ? `, ${order.customer.postalCode}` : ""}
            </p>
            {order.customer.country && (
              <p style={styles.blockText}>{order.customer.country}</p>
            )}
            <p style={styles.blockText}>{isAr ? "الهاتف: " : "Phone: "}{order.customer.phone}</p>
          </div>

          {/* Payment Info */}
          <div style={styles.infoBlock}>
            <h3 style={styles.blockTitle}>
              <Package size={16} style={{ marginRight: isAr ? 0 : 6, marginLeft: isAr ? 6 : 0 }} />
              {isAr ? "الدفع والشحن" : "Payment & Shipping"}
            </h3>
            <p style={styles.blockText}>
              <strong>{isAr ? "طريقة الدفع: " : "Payment Method: "}</strong> {
                order.paymentMethod === "COD" 
                  ? (isAr ? "الدفع عند الاستلام (COD)" : "Cash on Delivery")
                  : order.paymentMethod === "Stripe" 
                    ? (isAr ? "الدفع الإلكتروني عبر Stripe" : "Stripe Secure Checkout")
                    : order.paymentMethod
              }
            </p>
            <p style={styles.blockText}>
              <strong>{isAr ? "حالة الدفع: " : "Payment Status: "}</strong> {
                order.paymentStatus === "paid" 
                  ? (isAr ? "مدفوع" : "PAID") 
                  : (isAr ? "غير مدفوع" : "UNPAID")
              }
            </p>
            <p style={styles.blockText}>
              <strong>{isAr ? "شركة الشحن: " : "Carrier: "}</strong> SnapShop Standard Delivery
            </p>
          </div>
        </div>

        <h3 style={styles.itemsTitle}>{isAr ? "المنتجات المطلوبة" : "Items Ordered"}</h3>
        <div style={styles.itemsList}>
          {order.items.map((item: any, i: number) => (
            <div key={i} style={styles.itemRow}>
              <img src={item.image} alt={item.name} style={styles.itemImg} />
              <div style={styles.itemDetails}>
                <h4 style={styles.itemName}>{item.name}</h4>
                <p style={styles.itemSpec}>
                  {isAr ? "المقاس: " : "Size: "}{item.color ? `${item.color} - ` : ""}{item.size || "N/A"}
                </p>
              </div>
              <div style={styles.itemQtyPrice}>
                <p style={styles.itemQty}>{isAr ? "الكمية: " : "Qty: "}{item.quantity}</p>
                <p style={styles.itemPrice}>{currency}{(item.price * item.quantity).toFixed(2)}</p>
              </div>
            </div>
          ))}
        </div>

        <hr style={styles.divider} />

        {/* Pricing Summary */}
        <div style={styles.pricing}>
          <div style={styles.priceRow}>
            <span>{isAr ? "المجموع الفرعي" : "Subtotal"}</span>
            <span>{currency}{order.subtotal.toFixed(2)}</span>
          </div>
          <div style={styles.priceRow}>
            <span>{isAr ? "الشحن" : "Shipping"}</span>
            <span>{order.shippingCost === 0 ? (isAr ? "مجاني" : "Free") : `${currency}${order.shippingCost.toFixed(2)}`}</span>
          </div>
          <div style={styles.totalRow}>
            <span>{isAr ? "المجموع الكلي" : "Grand Total"}</span>
            <span>{currency}{order.total.toFixed(2)}</span>
          </div>
        </div>

        <div style={styles.actionRow}>
          <Link href="/" className="btn btn-dark" style={{ width: "100%" }}>
            {isAr ? "مواصلة التسوق" : "Continue Shopping"}
          </Link>
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    padding: "60px 24px",
    display: "flex",
    justifyContent: "center",
  },
  card: {
    backgroundColor: "white",
    borderRadius: "var(--radius-lg)",
    padding: "40px",
    boxShadow: "var(--shadow-md)",
    maxWidth: "680px",
    width: "100%",
    border: "1px solid var(--border-color)",
  },
  successHeader: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    textAlign: "center",
    marginBottom: "30px",
  },
  successTitle: {
    fontSize: "28px",
    fontWeight: "800",
    color: "var(--secondary)",
    marginTop: "16px",
  },
  successSub: {
    fontSize: "15px",
    color: "var(--text-muted)",
    marginTop: "4px",
  },
  paymentSuccessBanner: {
    backgroundColor: "#ecfdf5",
    border: "1px solid #a7f3d0",
    borderRadius: "12px",
    padding: "16px 20px",
    marginBottom: "24px",
    display: "flex",
    alignItems: "center",
    gap: "16px",
  },
  bannerIconWrapper: {
    backgroundColor: "#d1fae5",
    borderRadius: "50%",
    width: "36px",
    height: "36px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  bannerTitle: {
    margin: 0,
    fontSize: "15px",
    fontWeight: "700",
    color: "#065f46",
  },
  bannerText: {
    margin: "4px 0 0 0",
    fontSize: "13px",
    color: "#047857",
  },
  metaRow: {
    display: "flex",
    justifyContent: "space-between",
    backgroundColor: "var(--bg-light)",
    padding: "16px 24px",
    borderRadius: "var(--radius-md)",
    marginBottom: "32px",
    flexWrap: "wrap",
    gap: "16px",
  },
  metaItem: {
    minWidth: "120px",
  },
  metaLabel: {
    fontSize: "11px",
    fontWeight: "700",
    color: "var(--text-muted)",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    display: "block",
  },
  metaValue: {
    fontSize: "14px",
    fontWeight: "600",
    color: "var(--secondary)",
    marginTop: "2px",
  },
  infoGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
    gap: "24px",
    marginBottom: "32px",
  },
  infoBlock: {
    padding: "20px",
    border: "1px solid var(--border-color)",
    borderRadius: "var(--radius-md)",
  },
  blockTitle: {
    display: "flex",
    alignItems: "center",
    fontSize: "14px",
    fontWeight: "700",
    color: "var(--secondary)",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    marginBottom: "12px",
  },
  blockText: {
    fontSize: "13px",
    color: "var(--text-muted)",
    marginBottom: "4px",
    lineHeight: "1.4",
  },
  itemsTitle: {
    fontSize: "16px",
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    color: "var(--secondary)",
    marginBottom: "16px",
  },
  itemsList: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
    marginBottom: "32px",
  },
  itemRow: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
  },
  itemImg: {
    width: "48px",
    height: "56px",
    borderRadius: "4px",
    objectFit: "cover",
    backgroundColor: "var(--bg-light)",
  },
  itemDetails: {
    flex: 1,
  },
  itemName: {
    fontSize: "14px",
    fontWeight: "600",
    color: "var(--secondary)",
  },
  itemSpec: {
    fontSize: "12px",
    color: "var(--text-muted)",
  },
  itemQtyPrice: {
    textAlign: "right",
  },
  itemQty: {
    fontSize: "12px",
    color: "var(--text-muted)",
  },
  itemPrice: {
    fontSize: "14px",
    fontWeight: "600",
    color: "var(--secondary)",
  },
  divider: {
    border: 0,
    borderTop: "1px solid var(--border-color)",
    marginBottom: "20px",
  },
  pricing: {
    marginBottom: "32px",
  },
  priceRow: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: "14px",
    color: "var(--text-muted)",
    marginBottom: "10px",
  },
  totalRow: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: "16px",
    fontWeight: "700",
    color: "var(--secondary)",
    marginTop: "16px",
    paddingTop: "16px",
    borderTop: "1px solid var(--border-color)",
  },
  actionRow: {
    display: "flex",
  },
};
