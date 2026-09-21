"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams, useParams } from "next/navigation";
import { Loader2, ShieldCheck, ArrowLeft } from "lucide-react";

export default function PaypalMockPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const params = useParams();
  const orderId = searchParams.get("order_id") || searchParams.get("orderId");
  const lang = params.lang as string || "en";

  const [order, setOrder] = useState<any>(null);
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState<"login" | "pay">("login");
  const [paying, setPaying] = useState(false);
  const [paymentDone, setPaymentDone] = useState(false);
  const [error, setError] = useState("");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("••••••••");

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
        setEmail(orderData.customer?.email || "");

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

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setPaying(true);
    setTimeout(() => {
      setPaying(false);
      setStep("pay");
    }, 1000);
  };

  const handlePay = async () => {
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
        router.push(`${localePrefix}/orders/${orderId}?payment_success=true&gateway=PayPal`);
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
        <Loader2 size={40} className="animate-spin" style={{ color: "#0070ba", animation: "spin 1s linear infinite" }} />
        <p style={{ marginTop: 16, color: "#475569", fontWeight: "500" }}>Connecting to PayPal...</p>
      </div>
    );
  }

  const currency = settings?.currency || "$";
  const storeName = settings?.storeName || "SnapShop";

  return (
    <div style={styles.body}>
      <div style={styles.container}>
        {/* Top Header */}
        <div style={styles.header}>
          <div style={styles.paypalLogo}>
            <span style={{ color: "#003087", fontWeight: "900", fontStyle: "italic", fontSize: "24px" }}>Pay</span>
            <span style={{ color: "#0079c1", fontWeight: "900", fontStyle: "italic", fontSize: "24px" }}>Pal</span>
          </div>
          <div style={styles.amountBadge}>
            <span style={{ color: "#475569", fontSize: "14px", marginRight: 8 }}>Total:</span>
            <span style={{ fontWeight: "700", fontSize: "18px", color: "#0f172a" }}>{currency}{order?.total?.toFixed(2)}</span>
          </div>
        </div>

        {paymentDone ? (
          <div style={styles.successContainer}>
            <div style={styles.checkmarkIcon}>✓</div>
            <h2 style={{ fontSize: "22px", fontWeight: "700", color: "#0f172a", marginBottom: 6 }}>Payment Authorized</h2>
            <p style={{ color: "#64748b", fontSize: "14px" }}>Redirecting you back to {storeName}...</p>
          </div>
        ) : step === "login" ? (
          /* Login Step */
          <form onSubmit={handleLogin} style={styles.form}>
            <h3 style={styles.title}>Log in to your PayPal account</h3>
            
            {error && <div style={styles.errorAlert}>{error}</div>}

            <div style={styles.inputGroup}>
              <input 
                type="email" 
                placeholder="Email address" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                style={styles.input} 
                required 
              />
            </div>

            <div style={styles.inputGroup}>
              <input 
                type="password" 
                placeholder="Password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                style={styles.input} 
                required 
              />
            </div>

            <button type="submit" disabled={paying} style={styles.loginBtn}>
              {paying ? (
                <Loader2 size={18} className="animate-spin" style={{ animation: "spin 1s linear infinite" }} />
              ) : (
                "Log In"
              )}
            </button>

            <div style={styles.dividerRow}>
              <div style={styles.line}></div>
              <span style={{ color: "#64748b", fontSize: "13px", padding: "0 10px" }}>or</span>
              <div style={styles.line}></div>
            </div>

            <button type="button" onClick={handleCancel} style={styles.cancelBtn}>
              Cancel and return to {storeName}
            </button>
          </form>
        ) : (
          /* Pay Step */
          <div style={styles.payContainer}>
            <h3 style={styles.title}>Choose how to pay</h3>
            
            <div style={styles.paymentMethodCard}>
              <div style={styles.methodTitleRow}>
                <span style={{ fontSize: "20px" }}>💳</span>
                <div style={{ textAlign: "left", flex: 1, marginLeft: "12px" }}>
                  <div style={{ fontWeight: "700", fontSize: "14px", color: "#1e293b" }}>PayPal Balance / Linked Card</div>
                  <div style={{ fontSize: "12px", color: "#64748b" }}>Instant transaction</div>
                </div>
                <span style={{ color: "#0070ba", fontWeight: "700" }}>{currency}{order?.total?.toFixed(2)}</span>
              </div>
            </div>

            <div style={styles.shipToCard}>
              <h4 style={{ fontSize: "13px", fontWeight: "700", color: "#475569", marginBottom: 6, textAlign: "left" }}>Shipping address</h4>
              <p style={{ fontSize: "13px", color: "#64748b", lineHeight: "1.4", textAlign: "left" }}>
                {order?.customer?.name}<br />
                {order?.customer?.address}, {order?.customer?.city}<br />
                {order?.customer?.country}
              </p>
            </div>

            <button type="button" onClick={handlePay} disabled={paying} style={styles.completeBtn}>
              {paying ? (
                <Loader2 size={20} className="animate-spin" style={{ animation: "spin 1s linear infinite" }} />
              ) : (
                `Complete Purchase`
              )}
            </button>

            <button type="button" onClick={() => setStep("login")} style={styles.backLink}>
              Change account
            </button>
          </div>
        )}

        <div style={styles.footer}>
          <ShieldCheck size={14} color="#64748b" style={{ marginRight: 6 }} />
          <span>PayPal Mock Sandbox | Secure Payments</span>
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  body: {
    minHeight: "100vh",
    backgroundColor: "#f4f6f9",
    color: "#2c2e2f",
    fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
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
    maxWidth: "460px",
    width: "100%",
    backgroundColor: "white",
    borderRadius: "12px",
    boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
    padding: "36px",
    display: "flex",
    flexDirection: "column",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottom: "1px solid #e2e8f0",
    paddingBottom: "16px",
    marginBottom: "24px",
  },
  paypalLogo: {
    display: "flex",
    alignItems: "center",
  },
  amountBadge: {
    display: "flex",
    alignItems: "center",
  },
  successContainer: {
    textAlign: "center",
    padding: "30px 0",
  },
  checkmarkIcon: {
    width: "60px",
    height: "60px",
    borderRadius: "50%",
    backgroundColor: "#10b981",
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
    gap: "18px",
  },
  title: {
    fontSize: "18px",
    fontWeight: "700",
    color: "#0f172a",
    marginBottom: "8px",
    textAlign: "center",
  },
  errorAlert: {
    backgroundColor: "#fef2f2",
    color: "#ef4444",
    padding: "10px 14px",
    borderRadius: "6px",
    fontSize: "13px",
    border: "1px solid #fee2e2",
  },
  inputGroup: {
    width: "100%",
  },
  input: {
    width: "100%",
    padding: "12px 14px",
    border: "1px solid #cbd5e1",
    borderRadius: "6px",
    fontSize: "15px",
    outline: "none",
    color: "#0f172a",
    boxSizing: "border-box",
  },
  loginBtn: {
    backgroundColor: "#0070ba",
    color: "white",
    padding: "12px",
    borderRadius: "24px",
    border: "none",
    fontWeight: "700",
    fontSize: "15px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "background-color 0.2s",
  },
  dividerRow: {
    display: "flex",
    alignItems: "center",
    margin: "10px 0",
  },
  line: {
    flex: 1,
    height: "1px",
    backgroundColor: "#e2e8f0",
  },
  cancelBtn: {
    backgroundColor: "transparent",
    color: "#0070ba",
    border: "1px solid #0070ba",
    padding: "10px",
    borderRadius: "24px",
    fontWeight: "700",
    fontSize: "14px",
    cursor: "pointer",
  },
  payContainer: {
    display: "flex",
    flexDirection: "column",
    gap: "18px",
  },
  paymentMethodCard: {
    border: "1px solid #e2e8f0",
    borderRadius: "8px",
    padding: "16px",
    backgroundColor: "#f8fafc",
  },
  methodTitleRow: {
    display: "flex",
    alignItems: "center",
  },
  shipToCard: {
    border: "1px solid #e2e8f0",
    borderRadius: "8px",
    padding: "16px",
    backgroundColor: "#ffffff",
  },
  completeBtn: {
    backgroundColor: "#ffc439",
    color: "#111111",
    padding: "14px",
    borderRadius: "24px",
    border: "none",
    fontWeight: "700",
    fontSize: "16px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
  },
  backLink: {
    background: "none",
    border: "none",
    color: "#0070ba",
    fontSize: "13px",
    fontWeight: "700",
    cursor: "pointer",
    textDecoration: "underline",
    marginTop: "8px",
  },
  footer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginTop: "24px",
    borderTop: "1px solid #e2e8f0",
    paddingTop: "16px",
    color: "#64748b",
    fontSize: "12px",
  },
};
