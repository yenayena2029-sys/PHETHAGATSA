"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams, useParams } from "next/navigation";
import { CreditCard, ShieldCheck, ArrowLeft, Loader2 } from "lucide-react";

export default function StripeMockPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const params = useParams();
  const orderId = searchParams.get("order_id") || searchParams.get("orderId");
  const lang = params.lang as string || "en";

  const [order, setOrder] = useState<any>(null);
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [paymentDone, setPaymentDone] = useState(false);
  const [error, setError] = useState("");

  const [cardData, setCardData] = useState({
    number: "4242 4242 4242 4242",
    expiry: "12/29",
    cvc: "123",
    name: "Jane Doe",
  });

  useEffect(() => {
    if (!orderId) {
      setError("No Order ID provided.");
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        const orderRes = await fetch(`/api/orders/${orderId}`);
        if (!orderRes.ok) throw new Error("Order not found");
        const orderData = await orderRes.json();
        setOrder(orderData);

        const settingsRes = await fetch("/api/settings");
        if (settingsRes.ok) {
          const settingsData = await settingsRes.json();
          setSettings(settingsData);
        }
      } catch (err: any) {
        setError(err.message || "Failed to load payment details");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [orderId]);

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    setPaying(true);
    setError("");

    try {
      const res = await fetch("/api/checkout/mock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId }),
      });

      if (!res.ok) throw new Error("Failed to process payment simulation");

      setPaymentDone(true);
      setTimeout(() => {
        const localePrefix = lang && lang !== "en" ? `/${lang}` : "";
        router.push(`${localePrefix}/orders/${orderId}?payment_success=true&gateway=Stripe`);
      }, 1500);
    } catch (err: any) {
      setError(err.message || "Payment simulation failed");
      setPaying(false);
    }
  };

  const handleCancel = () => {
    const localePrefix = lang && lang !== "en" ? `/${lang}` : "";
    router.push(`${localePrefix}/checkout?order_id=${orderId}&payment_cancelled=true`);
  };

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <Loader2 size={40} className="animate-spin" style={{ color: "#635bff", animation: "spin 1s linear infinite" }} />
        <p style={{ marginTop: 16, color: "#475569", fontWeight: "500" }}>Initializing Stripe Checkout...</p>
      </div>
    );
  }

  if (error && !order) {
    return (
      <div style={styles.errorContainer}>
        <div style={styles.errorCard}>
          <h2 style={{ color: "#ef4444", marginBottom: 12 }}>Stripe Error</h2>
          <p style={{ color: "#64748b", marginBottom: 20 }}>{error}</p>
          <button onClick={() => router.push("/")} style={styles.backBtn}>Return to Store</button>
        </div>
      </div>
    );
  }

  const currency = settings?.currency || "$";
  const storeName = settings?.storeName || "SnapShop";

  return (
    <div style={styles.body}>
      <div style={styles.container}>
        {/* Left Column: Stripe Checkout Summary */}
        <div style={styles.summaryColumn}>
          <button onClick={handleCancel} style={styles.backLink}>
            <ArrowLeft size={14} style={{ marginRight: 6 }} />
            Back to {storeName}
          </button>
          
          <div style={styles.stripeHeader}>
            <span style={styles.stripeBadge}>TEST MODE</span>
          </div>

          <div style={styles.amountSection}>
            <span style={styles.payToLabel}>Pay {storeName}</span>
            <h1 style={styles.amountValue}>{currency}{order?.total?.toFixed(2)}</h1>
            <div style={styles.orderRef}>Order Ref: #{orderId?.toString().substring(0, 8)}</div>
          </div>

          <div style={styles.itemsList}>
            {order?.items?.map((item: any, idx: number) => (
              <div key={idx} style={styles.itemRow}>
                <div style={styles.itemInfo}>
                  <div style={styles.itemName}>{item.name} <span style={{ color: "#64748b" }}>x{item.quantity}</span></div>
                  <div style={styles.itemMeta}>Size: {item.size} | Color: {item.color}</div>
                </div>
                <div style={styles.itemPrice}>{currency}{(item.price * item.quantity).toFixed(2)}</div>
              </div>
            ))}
            <div style={styles.totalsDivider}></div>
            <div style={styles.totalRow}>
              <span>Subtotal</span>
              <span>{currency}{order?.subtotal?.toFixed(2)}</span>
            </div>
            <div style={styles.totalRow}>
              <span>Shipping</span>
              <span>{order?.shippingCost === 0 ? "Free" : `${currency}${order?.shippingCost?.toFixed(2)}`}</span>
            </div>
            <div style={{ ...styles.totalRow, fontWeight: "700", color: "#000", fontSize: "16px", marginTop: 8 }}>
              <span>Total due</span>
              <span>{currency}{order?.total?.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Right Column: Stripe Checkout Form */}
        <div style={styles.formColumn}>
          {paymentDone ? (
            <div style={styles.successContainer}>
              <div style={styles.checkmarkIcon}>✓</div>
              <h2 style={{ fontSize: "22px", fontWeight: "700", color: "#0f172a", marginBottom: 6 }}>Payment Succeeded</h2>
              <p style={{ color: "#64748b", fontSize: "14px" }}>Returning you to {storeName}...</p>
            </div>
          ) : (
            <form onSubmit={handlePay} style={styles.form}>
              <h3 style={styles.formTitle}>Pay with card</h3>
              
              <div style={styles.inputGroup}>
                <label style={styles.label}>Email</label>
                <input type="email" value={order?.customer?.email || ""} disabled style={styles.disabledInput} />
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Card information</label>
                <div style={styles.cardInputWrapper}>
                  <input 
                    type="text" 
                    value={cardData.number} 
                    onChange={(e) => setCardData({ ...cardData, number: e.target.value })} 
                    placeholder="1234 5678 9101 1121"
                    style={styles.cardInputMain} 
                    required 
                  />
                  <div style={styles.cardInputSubRow}>
                    <input 
                      type="text" 
                      value={cardData.expiry} 
                      onChange={(e) => setCardData({ ...cardData, expiry: e.target.value })} 
                      placeholder="MM/YY" 
                      style={styles.cardInputHalf} 
                      required 
                    />
                    <input 
                      type="text" 
                      value={cardData.cvc} 
                      onChange={(e) => setCardData({ ...cardData, cvc: e.target.value })} 
                      placeholder="CVC" 
                      style={styles.cardInputHalfEnd} 
                      required 
                    />
                  </div>
                </div>
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Name on card</label>
                <input 
                  type="text" 
                  value={cardData.name} 
                  onChange={(e) => setCardData({ ...cardData, name: e.target.value })} 
                  style={styles.input} 
                  required 
                />
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Country or region</label>
                <select style={styles.select} disabled>
                  <option>{order?.customer?.country || "Morocco"}</option>
                </select>
              </div>

              <button type="submit" disabled={paying} style={styles.payBtn}>
                {paying ? (
                  <Loader2 size={20} className="animate-spin" style={{ animation: "spin 1s linear infinite" }} />
                ) : (
                  `Pay ${currency}${order?.total?.toFixed(2)}`
                )}
              </button>

              <div style={styles.footerRow}>
                <ShieldCheck size={16} color="#635bff" style={{ marginRight: 6 }} />
                <span style={{ fontSize: "12px", color: "#64748b" }}>Powered by Stripe | Mock Test Mode</span>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  body: {
    minHeight: "100vh",
    backgroundColor: "#ffffff",
    color: "#30313d",
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "20px",
  },
  loadingContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "100vh",
  },
  errorContainer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "100vh",
  },
  errorCard: {
    backgroundColor: "white",
    borderRadius: "8px",
    padding: "32px",
    maxWidth: "400px",
    textAlign: "center",
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
  },
  backBtn: {
    padding: "10px 20px",
    backgroundColor: "#635bff",
    color: "white",
    border: "none",
    borderRadius: "4px",
    fontWeight: "600",
    cursor: "pointer",
  },
  container: {
    maxWidth: "880px",
    width: "100%",
    display: "grid",
    gridTemplateColumns: "1fr 1.1fr",
    boxShadow: "0 0 0 1px rgba(0,0,0,0.06), 0 20px 40px rgba(0,0,0,0.08)",
    borderRadius: "10px",
    overflow: "hidden",
    minHeight: "560px",
  },
  summaryColumn: {
    backgroundColor: "#f8f9fa",
    padding: "40px",
    borderRight: "1px solid #e9ecef",
    display: "flex",
    flexDirection: "column",
    textAlign: "left",
  },
  backLink: {
    display: "inline-flex",
    alignItems: "center",
    background: "none",
    border: "none",
    color: "#64748b",
    fontSize: "13px",
    fontWeight: "500",
    cursor: "pointer",
    padding: 0,
    marginBottom: "32px",
  },
  stripeHeader: {
    marginBottom: "16px",
  },
  stripeBadge: {
    backgroundColor: "#e8f2ff",
    color: "#0066f5",
    fontSize: "11px",
    fontWeight: "700",
    padding: "4px 8px",
    borderRadius: "4px",
    letterSpacing: "0.5px",
  },
  amountSection: {
    marginBottom: "32px",
  },
  payToLabel: {
    fontSize: "14px",
    color: "#64748b",
  },
  amountValue: {
    fontSize: "36px",
    fontWeight: "700",
    color: "#000",
    margin: "4px 0 8px 0",
  },
  orderRef: {
    fontSize: "12px",
    color: "#64748b",
    fontFamily: "monospace",
  },
  itemsList: {
    display: "flex",
    flexDirection: "column",
    gap: "14px",
  },
  itemRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    fontSize: "14px",
  },
  itemInfo: {
    display: "flex",
    flexDirection: "column",
  },
  itemName: {
    fontWeight: "600",
    color: "#1a1b25",
  },
  itemMeta: {
    fontSize: "12px",
    color: "#64748b",
    marginTop: "2px",
  },
  itemPrice: {
    fontWeight: "600",
  },
  totalsDivider: {
    height: "1px",
    backgroundColor: "#dee2e6",
    margin: "12px 0 6px 0",
  },
  totalRow: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: "14px",
    color: "#495057",
  },
  formColumn: {
    backgroundColor: "#ffffff",
    padding: "40px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
  },
  successContainer: {
    textAlign: "center",
    padding: "40px 0",
  },
  checkmarkIcon: {
    width: "60px",
    height: "60px",
    borderRadius: "50%",
    backgroundColor: "#00ca72",
    color: "white",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "30px",
    margin: "0 auto 20px auto",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
    textAlign: "left",
  },
  formTitle: {
    fontSize: "18px",
    fontWeight: "600",
    marginBottom: "8px",
  },
  inputGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },
  label: {
    fontSize: "13px",
    fontWeight: "500",
    color: "#495057",
  },
  input: {
    padding: "10px 12px",
    border: "1px solid #d8dbdf",
    borderRadius: "4px",
    fontSize: "15px",
    color: "#30313d",
    outline: "none",
  },
  disabledInput: {
    padding: "10px 12px",
    border: "1px solid #e9ecef",
    backgroundColor: "#f8f9fa",
    color: "#64748b",
    borderRadius: "4px",
    fontSize: "15px",
    cursor: "not-allowed",
  },
  select: {
    padding: "10px 12px",
    border: "1px solid #d8dbdf",
    borderRadius: "4px",
    fontSize: "15px",
    color: "#30313d",
    backgroundColor: "#f8f9fa",
    cursor: "not-allowed",
  },
  cardInputWrapper: {
    border: "1px solid #d8dbdf",
    borderRadius: "4px",
    display: "flex",
    flexDirection: "column",
  },
  cardInputMain: {
    padding: "12px",
    border: "none",
    borderBottom: "1px solid #d8dbdf",
    fontSize: "15px",
    outline: "none",
    width: "100%",
  },
  cardInputSubRow: {
    display: "flex",
  },
  cardInputHalf: {
    padding: "12px",
    border: "none",
    borderRight: "1px solid #d8dbdf",
    fontSize: "15px",
    width: "50%",
    outline: "none",
  },
  cardInputHalfEnd: {
    padding: "12px",
    border: "none",
    fontSize: "15px",
    width: "50%",
    outline: "none",
  },
  payBtn: {
    backgroundColor: "#635bff",
    color: "white",
    padding: "14px",
    borderRadius: "4px",
    border: "none",
    fontWeight: "600",
    fontSize: "16px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginTop: "8px",
    transition: "background-color 0.15s",
  },
  footerRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginTop: "12px",
  },
};
