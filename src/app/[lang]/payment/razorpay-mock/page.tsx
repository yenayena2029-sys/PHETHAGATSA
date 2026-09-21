"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams, useParams } from "next/navigation";
import { Loader2, ShieldCheck, ArrowLeft, Smartphone, CreditCard } from "lucide-react";

export default function RazorpayMockPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const params = useParams();
  const orderId = searchParams.get("order_id") || searchParams.get("orderId");
  const lang = params.lang as string || "en";

  const [order, setOrder] = useState<any>(null);
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [method, setMethod] = useState<"upi" | "card">("upi");
  const [upiId, setUpiId] = useState("success@razorpay");
  const [card, setCard] = useState({
    number: "4321 4321 4321 4321",
    expiry: "12/28",
    cvc: "123",
  });
  const [paying, setPaying] = useState(false);
  const [paymentDone, setPaymentDone] = useState(false);
  const [error, setError] = useState("");

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
        router.push(`${localePrefix}/orders/${orderId}?payment_success=true&gateway=Razorpay`);
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
        <Loader2 size={40} className="animate-spin" style={{ color: "#3392fd", animation: "spin 1s linear infinite" }} />
        <p style={{ marginTop: 16, color: "#475569", fontWeight: "500" }}>Connecting to Razorpay...</p>
      </div>
    );
  }

  const currency = settings?.currency || "₹";
  const storeName = settings?.storeName || "SnapShop";

  return (
    <div style={styles.body}>
      <div style={styles.container}>
        {/* Header Header */}
        <div style={styles.header}>
          <div style={{ textAlign: "left" }}>
            <h2 style={styles.storeName}>{storeName}</h2>
            <p style={styles.storeContact}>{order?.customer?.email || "customer@example.com"} | {order?.customer?.phone || ""}</p>
          </div>
          <div style={styles.amountSection}>
            <span style={styles.currencyBadge}>{currency} {order?.total?.toFixed(2)}</span>
          </div>
        </div>

        {paymentDone ? (
          <div style={styles.successContainer}>
            <div style={styles.checkmarkIcon}>✓</div>
            <h2 style={{ fontSize: "20px", fontWeight: "700", color: "#000", marginBottom: 6 }}>Payment Completed</h2>
            <p style={{ color: "#64748b", fontSize: "14px" }}>Verifying status and returning to store...</p>
          </div>
        ) : (
          <form onSubmit={handlePay} style={styles.form}>
            <div style={styles.testBadge}>TEST MODE - SIMULATOR</div>
            
            {/* Method Tabs */}
            <div style={styles.tabContainer}>
              <button 
                type="button" 
                onClick={() => setMethod("upi")}
                style={{ 
                  ...styles.tabBtn, 
                  color: method === "upi" ? "#3392fd" : "#64748b",
                  borderBottomColor: method === "upi" ? "#3392fd" : "transparent"
                }}
              >
                <Smartphone size={16} style={{ marginRight: 6 }} />
                UPI / QR
              </button>
              <button 
                type="button" 
                onClick={() => setMethod("card")}
                style={{ 
                  ...styles.tabBtn, 
                  color: method === "card" ? "#3392fd" : "#64748b",
                  borderBottomColor: method === "card" ? "#3392fd" : "transparent"
                }}
              >
                <CreditCard size={16} style={{ marginRight: 6 }} />
                Card
              </button>
            </div>

            {method === "upi" ? (
              /* UPI Form */
              <div style={styles.inputsSection}>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Enter UPI ID (VPA)</label>
                  <input 
                    type="text" 
                    value={upiId} 
                    onChange={(e) => setUpiId(e.target.value)} 
                    placeholder="success@razorpay" 
                    style={styles.input} 
                    required 
                  />
                  <span style={styles.helpText}>Enter a valid UPI ID (e.g. success@razorpay for instant success).</span>
                </div>
              </div>
            ) : (
              /* Card Form */
              <div style={styles.inputsSection}>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Card Number</label>
                  <input 
                    type="text" 
                    value={card.number} 
                    onChange={(e) => setCard({ ...card, number: e.target.value })} 
                    placeholder="4321 4321 4321 4321" 
                    style={styles.input} 
                    required 
                  />
                </div>
                <div style={styles.flexRow}>
                  <div style={{ ...styles.inputGroup, flex: 1 }}>
                    <label style={styles.label}>Expiry</label>
                    <input 
                      type="text" 
                      value={card.expiry} 
                      onChange={(e) => setCard({ ...card, expiry: e.target.value })} 
                      placeholder="MM/YY" 
                      style={styles.input} 
                      required 
                    />
                  </div>
                  <div style={{ ...styles.inputGroup, flex: 1 }}>
                    <label style={styles.label}>CVV</label>
                    <input 
                      type="password" 
                      value={card.cvc} 
                      onChange={(e) => setCard({ ...card, cvc: e.target.value })} 
                      placeholder="•••" 
                      style={styles.input} 
                      required 
                    />
                  </div>
                </div>
              </div>
            )}

            <button type="submit" disabled={paying} style={styles.payBtn}>
              {paying ? (
                <Loader2 size={18} className="animate-spin" style={{ animation: "spin 1s linear infinite" }} />
              ) : (
                `Pay ${currency}${order?.total?.toFixed(2)}`
              )}
            </button>

            <button type="button" onClick={handleCancel} style={styles.cancelBtn}>
              Cancel payment
            </button>
          </form>
        )}

        <div style={styles.footer}>
          <ShieldCheck size={14} color="#64748b" style={{ marginRight: 6 }} />
          <span>Razorpay Secure checkout</span>
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  body: {
    minHeight: "100vh",
    backgroundColor: "#161824",
    color: "#2c2e2f",
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
  container: {
    maxWidth: "400px",
    width: "100%",
    backgroundColor: "white",
    borderRadius: "8px",
    boxShadow: "0 10px 25px rgba(0,0,0,0.3)",
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
  },
  header: {
    backgroundColor: "#0d1424",
    color: "white",
    padding: "24px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  storeName: {
    fontSize: "16px",
    fontWeight: "700",
    margin: 0,
  },
  storeContact: {
    fontSize: "12px",
    color: "#94a3b8",
    margin: "4px 0 0 0",
  },
  amountSection: {},
  currencyBadge: {
    backgroundColor: "rgba(255,255,255,0.1)",
    padding: "6px 12px",
    borderRadius: "4px",
    fontWeight: "700",
    fontSize: "15px",
  },
  successContainer: {
    textAlign: "center",
    padding: "50px 24px",
  },
  checkmarkIcon: {
    width: "50px",
    height: "50px",
    borderRadius: "50%",
    backgroundColor: "#10b981",
    color: "white",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "24px",
    margin: "0 auto 20px auto",
  },
  form: {
    padding: "24px",
    display: "flex",
    flexDirection: "column",
    gap: "18px",
    textAlign: "left",
  },
  testBadge: {
    backgroundColor: "#fffbeb",
    border: "1px solid #fde68a",
    color: "#b45309",
    fontSize: "11px",
    fontWeight: "700",
    padding: "6px",
    textAlign: "center",
    borderRadius: "4px",
  },
  tabContainer: {
    display: "flex",
    borderBottom: "1px solid #e2e8f0",
  },
  tabBtn: {
    flex: 1,
    padding: "10px",
    background: "none",
    border: "none",
    borderBottom: "2px solid transparent",
    fontWeight: "600",
    fontSize: "13px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  inputsSection: {
    display: "flex",
    flexDirection: "column",
    gap: "14px",
  },
  inputGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },
  label: {
    fontSize: "12px",
    fontWeight: "600",
    color: "#64748b",
  },
  input: {
    padding: "10px 12px",
    border: "1px solid #cbd5e1",
    borderRadius: "4px",
    fontSize: "14px",
    outline: "none",
    color: "#0f172a",
  },
  flexRow: {
    display: "flex",
    gap: "12px",
  },
  helpText: {
    fontSize: "11px",
    color: "#94a3b8",
    marginTop: "2px",
  },
  payBtn: {
    backgroundColor: "#3392fd",
    color: "white",
    padding: "12px",
    borderRadius: "4px",
    border: "none",
    fontWeight: "700",
    fontSize: "15px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "background-color 0.2s",
  },
  cancelBtn: {
    background: "none",
    border: "none",
    color: "#ef4444",
    fontSize: "12px",
    fontWeight: "600",
    cursor: "pointer",
    textAlign: "center",
  },
  footer: {
    padding: "16px 24px",
    backgroundColor: "#f8fafc",
    borderTop: "1px solid #e2e8f0",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#64748b",
    fontSize: "11px",
  },
};
