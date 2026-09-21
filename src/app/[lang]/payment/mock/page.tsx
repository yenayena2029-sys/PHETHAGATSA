"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams, useParams } from "next/navigation";
import { CreditCard, ShieldCheck, ArrowLeft, Loader2, Sparkles, CheckCircle2 } from "lucide-react";

export default function MockPaymentPage() {
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
    number: "",
    expiry: "",
    cvc: "",
    name: "",
  });

  useEffect(() => {
    if (!orderId) {
      setError("No Order ID provided.");
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        // Fetch order details
        const orderRes = await fetch(`/api/orders/${orderId}`);
        if (!orderRes.ok) throw new Error("Order not found");
        const orderData = await orderRes.json();
        setOrder(orderData);

        // Fetch settings
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

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    const matches = val.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || "";
    const parts = [];

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }

    setCardData({
      ...cardData,
      number: parts.length > 0 ? parts.join(" ") : val,
    });
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/[^0-9]/g, "");
    if (val.length > 2) {
      val = `${val.substring(0, 2)}/${val.substring(2, 4)}`;
    }
    setCardData({ ...cardData, expiry: val });
  };

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cardData.number || cardData.number.replace(/\s/g, "").length < 16) {
      setError("Please enter a valid 16-digit card number");
      return;
    }
    if (!cardData.expiry || cardData.expiry.length < 5) {
      setError("Please enter card expiry date (MM/YY)");
      return;
    }
    if (!cardData.cvc || cardData.cvc.length < 3) {
      setError("Please enter a valid CVC");
      return;
    }
    if (!cardData.name.trim()) {
      setError("Please enter cardholder name");
      return;
    }

    setPaying(true);
    setError("");

    try {
      // Call mock callback API
      const res = await fetch("/api/checkout/mock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId }),
      });

      if (!res.ok) {
        throw new Error("Failed to process payment simulation");
      }

      setPaymentDone(true);
      
      // Delay redirect to show success checkmark
      setTimeout(() => {
        const localePrefix = lang && lang !== "en" ? `/${lang}` : "";
        router.push(`${localePrefix}/orders/${orderId}?payment_success=true&simulator_success=true`);
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
        <p style={{ marginTop: 16, color: "#475569", fontWeight: "500" }}>
          Initializing secure checkout simulation...
        </p>
      </div>
    );
  }

  if (error && !order) {
    return (
      <div style={styles.errorContainer}>
        <div style={styles.errorCard}>
          <h2 style={{ color: "#ef4444", marginBottom: 12 }}>Initialization Error</h2>
          <p style={{ color: "#64748b", marginBottom: 20 }}>{error}</p>
          <button onClick={() => router.push("/")} style={styles.backBtn}>
            Return to Store
          </button>
        </div>
      </div>
    );
  }

  const currency = settings?.currency || "$";
  const storeName = settings?.storeName || "SnapShop";

  return (
    <div style={styles.body}>
      {/* Background patterns */}
      <div style={styles.bgBlob1}></div>
      <div style={styles.bgBlob2}></div>

      <div style={styles.container}>
        {/* Header bar */}
        <div style={styles.header}>
          <button onClick={handleCancel} style={styles.cancelLink}>
            <ArrowLeft size={16} style={{ marginRight: 6 }} />
            Cancel and return to {storeName}
          </button>
          <div style={styles.testBadge}>
            <Sparkles size={14} style={{ marginRight: 6 }} />
            TEST MODE - Simulator
          </div>
        </div>

        {paymentDone ? (
          <div style={styles.successWrapper}>
            <CheckCircle2 size={72} color="#10b981" style={{ animation: "scaleUp 0.4s ease-out" }} />
            <h1 style={styles.successHeading}>Payment Successful!</h1>
            <p style={styles.successSubheading}>Verifying with bank and returning to store...</p>
          </div>
        ) : (
          <div style={styles.checkoutGrid}>
            {/* Left Column: Order Summary */}
            <div style={styles.summaryColumn}>
              <div style={styles.storeBranding}>
                {settings?.logo ? (
                  <img src={settings.logo} alt={storeName} style={styles.logoImg} />
                ) : (
                  <span style={styles.storeText}>{storeName}</span>
                )}
              </div>
              <div style={styles.amountSection}>
                <span style={styles.amountLabel}>Pay {storeName}</span>
                <h1 style={styles.amountValue}>
                  {currency}
                  {order?.total?.toFixed(2)}
                </h1>
                <div style={styles.orderRef}>Order Ref: #{orderId?.toString().substring(0, 8)}</div>
              </div>

              {/* Items List */}
              <div style={styles.itemsWrapper}>
                <h4 style={styles.sectionHeader}>Order Details</h4>
                <div style={styles.itemsList}>
                  {order?.items?.map((item: any, idx: number) => (
                    <div key={idx} style={styles.itemRow}>
                      <div style={styles.itemImgWrapper}>
                        <img src={item.image} alt={item.name} style={styles.itemImg} />
                        <span style={styles.itemQtyBadge}>{item.quantity}</span>
                      </div>
                      <div style={styles.itemInfo}>
                        <div style={styles.itemName}>{item.name}</div>
                        <div style={styles.itemSize}>Size: {item.size}</div>
                      </div>
                      <div style={styles.itemPrice}>
                        {currency}
                        {(item.price * item.quantity).toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Pricing Math */}
              <div style={styles.priceBreakdown}>
                <div style={styles.priceRow}>
                  <span>Subtotal</span>
                  <span>{currency}{order?.subtotal?.toFixed(2)}</span>
                </div>
                <div style={styles.priceRow}>
                  <span>Shipping</span>
                  <span>{order?.shippingCost === 0 ? "Free" : `${currency}${order?.shippingCost?.toFixed(2)}`}</span>
                </div>
                <div style={{ ...styles.priceRow, fontWeight: "700", borderTop: "1px solid #e2e8f0", paddingTop: 12, marginTop: 12 }}>
                  <span>Total Amount</span>
                  <span>{currency}{order?.total?.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Right Column: Checkout Form */}
            <div style={styles.formColumn}>
              <form onSubmit={handlePay} style={styles.cardForm}>
                <h3 style={styles.formTitle}>Pay with Credit Card</h3>
                <p style={styles.formSub}>Enter your card information to complete this simulated transaction.</p>

                {error && <div style={styles.errorAlert}>{error}</div>}

                {/* Card Visual Representation */}
                <div style={styles.cardVisual}>
                  <div style={styles.cardVisualHeader}>
                    <CreditCard size={24} color="white" />
                    <span style={styles.cardVisualTitle}>SIMULATOR</span>
                  </div>
                  <div style={styles.cardVisualNumber}>
                    {cardData.number || "•••• •••• •••• ••••"}
                  </div>
                  <div style={styles.cardVisualFooter}>
                    <div>
                      <div style={styles.cardVisualLabel}>CARDHOLDER</div>
                      <div style={styles.cardVisualValue}>{cardData.name.toUpperCase() || "YOUR NAME"}</div>
                    </div>
                    <div>
                      <div style={styles.cardVisualLabel}>EXPIRES</div>
                      <div style={styles.cardVisualValue}>{cardData.expiry || "MM/YY"}</div>
                    </div>
                  </div>
                </div>

                <div style={styles.inputGroup}>
                  <label style={styles.inputLabel}>Email Address</label>
                  <input
                    type="email"
                    value={order?.customer?.email || ""}
                    disabled
                    style={styles.disabledInput}
                  />
                </div>

                <div style={styles.inputGroup}>
                  <label style={styles.inputLabel}>Card Number</label>
                  <div style={styles.inputWrapper}>
                    <input
                      type="text"
                      maxLength={19}
                      placeholder="4242 4242 4242 4242"
                      value={cardData.number}
                      onChange={handleCardNumberChange}
                      required
                      style={styles.formInput}
                    />
                    <CreditCard size={20} style={styles.inputIcon} />
                  </div>
                </div>

                <div style={styles.flexRow}>
                  <div style={{ ...styles.inputGroup, flex: 1 }}>
                    <label style={styles.inputLabel}>Expiration Date</label>
                    <input
                      type="text"
                      maxLength={5}
                      placeholder="MM/YY"
                      value={cardData.expiry}
                      onChange={handleExpiryChange}
                      required
                      style={styles.formInput}
                    />
                  </div>
                  <div style={{ ...styles.inputGroup, flex: 1 }}>
                    <label style={styles.inputLabel}>CVC</label>
                    <input
                      type="text"
                      maxLength={4}
                      placeholder="123"
                      value={cardData.cvc}
                      onChange={(e) => setCardData({ ...cardData, cvc: e.target.value.replace(/[^0-9]/g, "") })}
                      required
                      style={styles.formInput}
                    />
                  </div>
                </div>

                <div style={styles.inputGroup}>
                  <label style={styles.inputLabel}>Cardholder Name</label>
                  <input
                    type="text"
                    placeholder="Jane Doe"
                    value={cardData.name}
                    onChange={(e) => setCardData({ ...cardData, name: e.target.value })}
                    required
                    style={styles.formInput}
                  />
                </div>

                <button type="submit" disabled={paying} style={styles.payBtn}>
                  {paying ? (
                    <>
                      <Loader2 size={18} className="animate-spin" style={{ marginRight: 8, animation: "spin 1s linear infinite" }} />
                      Processing Secure Payment...
                    </>
                  ) : (
                    `Pay ${currency}${order?.total?.toFixed(2)}`
                  )}
                </button>

                <div style={styles.securitySeal}>
                  <ShieldCheck size={16} color="#10b981" style={{ marginRight: 6 }} />
                  Secure, encrypted test transaction via Stripe Simulator.
                </div>
              </form>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes scaleUp {
          0% { transform: scale(0.8); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  body: {
    minHeight: "100vh",
    backgroundColor: "#f8fafc",
    color: "#0f172a",
    fontFamily: "'Outfit', 'Inter', sans-serif",
    position: "relative",
    overflowX: "hidden",
    padding: "20px 10px",
  },
  bgBlob1: {
    position: "absolute",
    top: "-10%",
    left: "-10%",
    width: "40%",
    height: "40%",
    background: "radial-gradient(circle, rgba(99,91,255,0.08) 0%, rgba(255,255,255,0) 70%)",
    zIndex: 0,
    pointerEvents: "none",
  },
  bgBlob2: {
    position: "absolute",
    bottom: "-10%",
    right: "-10%",
    width: "40%",
    height: "40%",
    background: "radial-gradient(circle, rgba(16,185,129,0.05) 0%, rgba(255,255,255,0) 70%)",
    zIndex: 0,
    pointerEvents: "none",
  },
  loadingContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "100vh",
    backgroundColor: "#f8fafc",
    fontFamily: "'Outfit', sans-serif",
  },
  errorContainer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "100vh",
    backgroundColor: "#f8fafc",
    padding: "24px",
  },
  errorCard: {
    backgroundColor: "white",
    borderRadius: "16px",
    padding: "32px",
    maxWidth: "480px",
    width: "100%",
    boxShadow: "0 10px 25px -5px rgba(0,0,0,0.05), 0 8px 10px -6px rgba(0,0,0,0.05)",
    textAlign: "center",
  },
  backBtn: {
    padding: "12px 24px",
    backgroundColor: "#0f172a",
    color: "white",
    border: "none",
    borderRadius: "8px",
    fontWeight: "600",
    cursor: "pointer",
  },
  container: {
    maxWidth: "1000px",
    margin: "0 auto",
    position: "relative",
    zIndex: 1,
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "24px",
    padding: "0 8px",
  },
  cancelLink: {
    display: "flex",
    alignItems: "center",
    background: "none",
    border: "none",
    color: "#64748b",
    fontSize: "14px",
    fontWeight: "500",
    cursor: "pointer",
    padding: "6px 12px",
    borderRadius: "8px",
    transition: "all 0.2s",
  },
  testBadge: {
    display: "flex",
    alignItems: "center",
    backgroundColor: "rgba(99,91,255,0.1)",
    color: "#635bff",
    padding: "6px 12px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "600",
  },
  successWrapper: {
    backgroundColor: "white",
    borderRadius: "24px",
    padding: "60px 24px",
    textAlign: "center",
    boxShadow: "0 20px 25px -5px rgba(0,0,0,0.05), 0 10px 10px -5px rgba(0,0,0,0.04)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "400px",
  },
  successHeading: {
    fontSize: "28px",
    fontWeight: "800",
    color: "#0f172a",
    marginTop: "20px",
    marginBottom: "8px",
  },
  successSubheading: {
    fontSize: "16px",
    color: "#64748b",
  },
  checkoutGrid: {
    display: "grid",
    gridTemplateColumns: "1.1fr 1fr",
    gap: "32px",
    alignItems: "start",
  },
  summaryColumn: {
    backgroundColor: "white",
    borderRadius: "24px",
    padding: "32px",
    boxShadow: "0 4px 6px -1px rgba(0,0,0,0.02), 0 2px 4px -1px rgba(0,0,0,0.02)",
    border: "1px solid #f1f5f9",
  },
  storeBranding: {
    marginBottom: "20px",
  },
  logoImg: {
    height: "28px",
    objectFit: "contain",
  },
  storeText: {
    fontSize: "20px",
    fontWeight: "800",
    letterSpacing: "-0.5px",
    color: "#0f172a",
  },
  amountSection: {
    marginBottom: "32px",
  },
  amountLabel: {
    fontSize: "14px",
    color: "#64748b",
    fontWeight: "500",
  },
  amountValue: {
    fontSize: "36px",
    fontWeight: "800",
    color: "#0f172a",
    margin: "4px 0",
    letterSpacing: "-1px",
  },
  orderRef: {
    fontSize: "12px",
    color: "#94a3b8",
    fontFamily: "monospace",
  },
  sectionHeader: {
    fontSize: "14px",
    textTransform: "uppercase",
    letterSpacing: "1px",
    color: "#64748b",
    marginBottom: "16px",
    fontWeight: "600",
  },
  itemsWrapper: {
    marginBottom: "32px",
  },
  itemsList: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
    maxHeight: "260px",
    overflowY: "auto",
    paddingRight: "6px",
  },
  itemRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  itemImgWrapper: {
    position: "relative",
    width: "48px",
    height: "48px",
    borderRadius: "8px",
    overflow: "hidden",
    border: "1px solid #e2e8f0",
    flexShrink: 0,
  },
  itemImg: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
  itemQtyBadge: {
    position: "absolute",
    top: "-4px",
    right: "-4px",
    backgroundColor: "#64748b",
    color: "white",
    fontSize: "10px",
    fontWeight: "700",
    width: "18px",
    height: "18px",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    border: "2px solid white",
  },
  itemInfo: {
    flex: 1,
    marginLeft: "16px",
    marginRight: "16px",
    textAlign: "left",
  },
  itemName: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#1e293b",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    maxWidth: "180px",
  },
  itemSize: {
    fontSize: "12px",
    color: "#94a3b8",
  },
  itemPrice: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#1e293b",
  },
  priceBreakdown: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    fontSize: "14px",
    color: "#475569",
  },
  priceRow: {
    display: "flex",
    justifyContent: "space-between",
  },
  formColumn: {
    backgroundColor: "white",
    borderRadius: "24px",
    padding: "32px",
    boxShadow: "0 20px 25px -5px rgba(0,0,0,0.03), 0 10px 10px -5px rgba(0,0,0,0.02)",
    border: "1px solid #f1f5f9",
  },
  cardForm: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },
  formTitle: {
    fontSize: "18px",
    fontWeight: "700",
    color: "#0f172a",
    marginBottom: "4px",
  },
  formSub: {
    fontSize: "14px",
    color: "#64748b",
    marginTop: "-16px",
    marginBottom: "8px",
  },
  errorAlert: {
    backgroundColor: "#fef2f2",
    color: "#ef4444",
    padding: "12px 16px",
    borderRadius: "8px",
    fontSize: "14px",
    fontWeight: "500",
    border: "1px solid #fee2e2",
  },
  cardVisual: {
    background: "linear-gradient(135deg, #635bff 0%, #473bff 100%)",
    borderRadius: "16px",
    padding: "24px",
    color: "white",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    minHeight: "170px",
    boxShadow: "0 15px 30px -5px rgba(99,91,255,0.3)",
    marginBottom: "8px",
  },
  cardVisualHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cardVisualTitle: {
    fontSize: "12px",
    fontWeight: "700",
    letterSpacing: "2px",
    opacity: 0.8,
  },
  cardVisualNumber: {
    fontSize: "22px",
    fontWeight: "600",
    letterSpacing: "2px",
    margin: "24px 0",
    fontFamily: "monospace",
  },
  cardVisualFooter: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-end",
    textAlign: "left",
  },
  cardVisualLabel: {
    fontSize: "9px",
    fontWeight: "600",
    letterSpacing: "1px",
    opacity: 0.6,
    marginBottom: "4px",
  },
  cardVisualValue: {
    fontSize: "13px",
    fontWeight: "700",
    letterSpacing: "0.5px",
  },
  inputGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
    textAlign: "left",
  },
  inputLabel: {
    fontSize: "13px",
    fontWeight: "600",
    color: "#475569",
  },
  formInput: {
    padding: "12px 14px",
    border: "1px solid #cbd5e1",
    borderRadius: "8px",
    fontSize: "15px",
    color: "#0f172a",
    transition: "border-color 0.2s",
    width: "100%",
  },
  disabledInput: {
    padding: "12px 14px",
    border: "1px solid #e2e8f0",
    backgroundColor: "#f8fafc",
    borderRadius: "8px",
    fontSize: "15px",
    color: "#94a3b8",
    cursor: "not-allowed",
    width: "100%",
  },
  inputWrapper: {
    position: "relative",
    display: "flex",
    alignItems: "center",
  },
  inputIcon: {
    position: "absolute",
    right: "14px",
    color: "#94a3b8",
  },
  flexRow: {
    display: "flex",
    gap: "16px",
  },
  payBtn: {
    backgroundColor: "#635bff",
    color: "white",
    padding: "14px",
    borderRadius: "8px",
    fontSize: "16px",
    fontWeight: "600",
    border: "none",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 4px 6px -1px rgba(99,91,255,0.1), 0 2px 4px -1px rgba(99,91,255,0.06)",
    transition: "all 0.2s",
    marginTop: "8px",
  },
  securitySeal: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "12px",
    color: "#64748b",
    marginTop: "4px",
  },
};
