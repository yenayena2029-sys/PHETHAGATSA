"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { CreditCard, Truck, ArrowLeft, CheckCircle, ShieldCheck, MapPin, Plus } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { COUNTRIES } from "@/lib/countries";

interface SavedAddress {
  _id: string;
  label: string;
  fullName: string;
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  phone: string;
  isDefault: boolean;
}

interface CheckoutClientProps {
  initialSettings: any;
}

export default function CheckoutClient({ initialSettings }: CheckoutClientProps) {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const { cart, cartSubtotal, cartTotal, settings, clearCart, t, user, loading: appLoading, appliedPromo, setAppliedPromo } = useApp();
  const tr = (key: string, fallback: string) => {
    const value = t(key);
    return value && value !== key ? value : fallback;
  };

  const [promoCode, setPromoCode] = useState(appliedPromo?.code || "");
  const [promoError, setPromoError] = useState("");
  const [isApplying, setIsApplying] = useState(false);

  const handleApplyPromo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!promoCode.trim()) return;

    setIsApplying(true);
    setPromoError("");

    try {
      const res = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: promoCode }),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setAppliedPromo({
          code: promoCode,
          discountType: data.discountType,
          value: data.value,
        });
      } else {
        setPromoError(data.error || "Invalid promo code");
        setAppliedPromo(null);
      }
    } catch (error) {
      setPromoError("Failed to validate promo code");
      setAppliedPromo(null);
    } finally {
      setIsApplying(false);
    }
  };

  const handleRemovePromo = () => {
    setAppliedPromo(null);
    setPromoCode("");
    setPromoError("");
  };

  const discountAmount = appliedPromo
    ? appliedPromo.discountType === "Percentage"
      ? (cartSubtotal * appliedPromo.value) / 100
      : appliedPromo.value
    : 0;

  const activeSettings = settings || initialSettings;
  const paymentCancelled = searchParams.get("payment_cancelled") === "true";

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    postalCode: "",
    country: "",
  });

  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([]);
  const [selectedAddrId, setSelectedAddrId] = useState<string>("");

  const [paymentMethod, setPaymentMethod] = useState("COD");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Real gateway states
  const [useRealPaypal, setUseRealPaypal] = useState(false);

  const [paypalEmail, setPaypalEmail] = useState("");
  const [paypalPaid, setPaypalPaid] = useState(false);
  const [showPaypalPopup, setShowPaypalPopup] = useState(false);
  const [paypalLoading, setPaypalLoading] = useState(false);

  const [showRazorpayModal, setShowRazorpayModal] = useState(false);
  const [razorpayMethod, setRazorpayMethod] = useState("upi"); // upi, card
  const [razorpayUpiId, setRazorpayUpiId] = useState("");
  const [razorpayCard, setRazorpayCard] = useState({ number: "", expiry: "", cvc: "" });
  const [razorpayProcessing, setRazorpayProcessing] = useState(false);

  const hasCod = activeSettings?.enableCod !== false;
  const hasStripe = activeSettings?.enableStripe === true;
  const hasRazorpay = activeSettings?.enableRazorpay === true;
  const hasPaypal = activeSettings?.enablePaypal === true;

  // Set default payment method when settings are loaded
  useEffect(() => {
    if (activeSettings) {
      if (activeSettings.enableCod !== false) {
        setPaymentMethod("COD");
      } else if (activeSettings.enableStripe) {
        setPaymentMethod("Stripe");
      } else if (activeSettings.enablePaypal) {
        setPaymentMethod("PayPal");
      } else if (activeSettings.enableRazorpay) {
        setPaymentMethod("Razorpay");
      }
    }
  }, [activeSettings]);

  useEffect(() => {
    if (user) {
      setFormData(prev => ({ ...prev, email: user.email || prev.email }));
      fetch("/api/account/addresses")
        .then((r) => r.ok ? r.json() : r.text().then(t => { throw new Error(t) }))
        .then((data) => {
          if (Array.isArray(data) && data.length > 0) {
            setSavedAddresses(data);
            const defaultAddr = data.find((a: SavedAddress) => a.isDefault) || data[0];
            setSelectedAddrId(defaultAddr._id);
            setFormData(prev => ({
              ...prev,
              name: defaultAddr.fullName || "",
              phone: defaultAddr.phone || "",
              address: defaultAddr.street || "",
              city: defaultAddr.city || "",
              postalCode: defaultAddr.zip || "",
              country: defaultAddr.country || "",
            }));
          }
        })
        .catch(() => {});
    }
  }, [user]);

  useEffect(() => {
    if (paymentCancelled) {
      setError(tr("payment_cancelled_message", "Payment was cancelled. Please try again."));
    }
  }, [paymentCancelled, t]);

  // Load external scripts dynamically
  useEffect(() => {
    if (activeSettings) {
      // Load Razorpay if enabled
      if (activeSettings.enableRazorpay && activeSettings.razorpayKeyId) {
        const script = document.createElement("script");
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.async = true;
        document.body.appendChild(script);
      }

      // Load PayPal if enabled
      if (activeSettings.enablePaypal && activeSettings.paypalClientId) {
        const script = document.createElement("script");
        script.src = `https://www.paypal.com/sdk/js?client-id=${activeSettings.paypalClientId}&currency=${activeSettings.currency || "USD"}`;
        script.async = true;
        script.onload = () => {
          initializePayPalButtons();
        };
        document.body.appendChild(script);
      }
    }
  }, [activeSettings, cartTotal]);

  const initializePayPalButtons = () => {
    if (!(window as any).paypal) return;
    try {
      const container = document.getElementById("paypal-button-container-real");
      if (container) container.innerHTML = "";

      (window as any).paypal.Buttons({
        createOrder: (data: any, actions: any) => {
          return actions.order.create({
            purchase_units: [{
              amount: {
                value: cartTotal.toFixed(2),
                currency_code: activeSettings?.currency || "USD"
              }
            }]
          });
        },
        onApprove: async (data: any, actions: any) => {
          setLoading(true);
          return actions.order.capture().then(async (details: any) => {
            await submitOrder("PayPal");
          });
        },
        onError: (err: any) => {
          setError("PayPal transaction failed");
          console.error(err);
        }
      }).render("#paypal-button-container-real");
      setUseRealPaypal(true);
    } catch (e) {
      console.warn("PayPal initialization failed, falling back to simulator:", e);
      setUseRealPaypal(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const submitOrder = async (overrideGateway?: string, overridePaymentStatus?: string) => {
    setLoading(true);
    setError("");

    try {
      const finalMethod = overrideGateway || paymentMethod;
      const isPaid = overridePaymentStatus || (finalMethod !== "COD" ? "paid" : "unpaid");

      const orderPayload = {
        customer: formData,
        items: cart,
        subtotal: cartSubtotal,
        shippingCost: activeSettings?.shippingCost || 0,
        promoCode: appliedPromo?.code || null,
        discountAmount,
        total: cartTotal,
        paymentMethod: finalMethod,
        paymentStatus: isPaid,
      };

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderPayload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Order placement failed");
      }

      if (user && selectedAddrId === "new") {
        fetch("/api/account/addresses", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            label: "Home",
            fullName: formData.name,
            street: formData.address,
            city: formData.city,
            state: "",
            zip: formData.postalCode,
            country: formData.country,
            phone: formData.phone,
            isDefault: savedAddresses.length === 0,
          }),
        }).catch(() => {});
      }

      if (finalMethod === "Stripe" || finalMethod === "PayPal" || finalMethod === "Razorpay") {
        return data;
      }

      // Success
      clearCart();
      const localePrefix = params.lang && params.lang !== "en" ? `/${params.lang}` : "";
      router.push(`${localePrefix}/orders/${data._id}`);
      return data;
    } catch (err: any) {
      setError(err.message || "Failed to place order");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;

    // Validation/Flow for Stripe (Hosted Redirect)
    if (paymentMethod === "Stripe") {
      setLoading(true);
      setError("");
      try {
        // Submit order as UNPAID first
        const orderData = await submitOrder("Stripe", "unpaid");
        if (!orderData || !orderData._id) {
          throw new Error("Failed to create order");
        }

        // Call the checkout session API
        const res = await fetch("/api/checkout/stripe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            orderId: orderData._id,
            origin: window.location.origin,
            lang: params.lang,
          }),
        });

        const checkoutData = await res.json();
        if (!res.ok) {
          throw new Error(checkoutData.error || "Failed to initiate payment");
        }

        // Clear cart and redirect to hosted checkout (real or simulated)
        clearCart();
        window.location.href = checkoutData.url;
      } catch (err: any) {
        setError(err.message || "Stripe redirect failed");
        setLoading(false);
      }
      return;
    }

    // Validation/Flow for PayPal
    if (paymentMethod === "PayPal") {
      setLoading(true);
      setError("");
      try {
        const orderData = await submitOrder("PayPal", "unpaid");
        if (!orderData || !orderData._id) {
          throw new Error("Failed to create order");
        }

        const res = await fetch("/api/checkout/paypal", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            orderId: orderData._id,
            origin: window.location.origin,
            lang: params.lang,
          }),
        });

        const checkoutData = await res.json();
        if (!res.ok) {
          throw new Error(checkoutData.error || "Failed to initiate payment");
        }

        clearCart();
        window.location.href = checkoutData.url;
      } catch (err: any) {
        setError(err.message || "PayPal redirect failed");
        setLoading(false);
      }
      return;
    }

    // Validation/Flow for Razorpay
    if (paymentMethod === "Razorpay") {
      setLoading(true);
      setError("");
      try {
        const orderData = await submitOrder("Razorpay", "unpaid");
        if (!orderData || !orderData._id) {
          throw new Error("Failed to create order");
        }

        if ((window as any).Razorpay && activeSettings?.razorpayKeyId) {
          const res = await fetch("/api/checkout/razorpay", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ amount: cartTotal, currency: activeSettings.currency || "INR" }),
          });
          const data = await res.json();
          if (!res.ok) throw new Error(data.error || "Razorpay initiation failed");

          const options = {
            key: data.keyId,
            amount: data.amount,
            currency: data.currency,
            name: activeSettings.storeName || "SnapShop",
            description: "Checkout Purchase",
            order_id: data.orderId,
            handler: async function (response: any) {
              clearCart();
              const localePrefix = params.lang && params.lang !== "en" ? `/${params.lang}` : "";
              router.push(`${localePrefix}/orders/${orderData._id}?payment_success=true&gateway=Razorpay`);
            },
            prefill: {
              name: formData.name,
              email: formData.email,
              contact: formData.phone,
            },
            theme: {
              color: activeSettings.primaryColor || "#0f172a",
            },
            modal: {
              ondismiss: function () {
                setLoading(false);
              }
            }
          };
          const rzp = new (window as any).Razorpay(options);
          rzp.open();
        } else {
          throw new Error("Razorpay API is not configured or failed to load");
        }
      } catch (err: any) {
        setError(err.message || "Razorpay redirect failed");
        setLoading(false);
      }
      return;
    }

    await submitOrder();
  };

  const renderStripeForm = () => {
    return (
      <div style={styles.stripeForm}>
        <div style={styles.redirectNotice}>
          <div style={styles.redirectNoticeHeader}>
            <CreditCard size={20} color="#635bff" style={{ marginRight: 8 }} />
            <span style={{ fontWeight: "700", color: "#635bff", fontSize: "14px" }}>
              {tr("secure_stripe_checkout", "Secure Stripe Checkout")}
            </span>
          </div>
          <p style={styles.redirectNoticeText}>
            {tr("stripe_redirect_notice", "You will be redirected to the secure Stripe payment gateway to complete your transaction. All payments are fully encrypted and secure.")}
          </p>
          <div style={styles.cardLogosRow}>
            <div style={styles.cardLogoBadge}>Visa</div>
            <div style={styles.cardLogoBadge}>MasterCard</div>
            <div style={styles.cardLogoBadge}>Amex</div>
            <div style={styles.cardLogoBadge}>Apple Pay</div>
          </div>
        </div>
      </div>
    );
  };

  const renderPaypalForm = () => {
    return (
      <div style={styles.paypalForm}>
        <div style={styles.redirectNotice}>
          <div style={styles.redirectNoticeHeader}>
            <span style={{ fontSize: "16px", marginRight: 8 }}>⚡</span>
            <span style={{ fontWeight: "700", color: "#003087", fontSize: "14px" }}>
              {tr("secure_paypal_checkout", "PayPal Secure Checkout")}
            </span>
          </div>
          <p style={styles.redirectNoticeText}>
            {tr("paypal_redirect_notice", "Pay using your PayPal wallet balance or linked bank accounts.")}
          </p>
        </div>
      </div>
    );
  };

  const renderRazorpayForm = () => {
    return (
      <div style={styles.razorpayForm}>
        <div style={styles.redirectNotice}>
          <div style={styles.redirectNoticeHeader}>
            <span style={{ fontSize: "16px", marginRight: 8 }}>💳</span>
            <span style={{ fontWeight: "700", color: "#0f172a", fontSize: "14px" }}>
              {tr("secure_razorpay_checkout", "UPI / Netbanking (Razorpay)")}
            </span>
          </div>
          <p style={styles.redirectNoticeText}>
            {tr("razorpay_redirect_notice", "Support instant UPI payments and cards.")}
          </p>
        </div>
      </div>
    );
  };

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const deliveryCountries = useMemo(() => {
    if (!settings?.activeZones) return COUNTRIES;
    const zones = Array.isArray(settings.activeZones) ? settings.activeZones : [settings.activeZones];
    if (zones.includes("Worldwide")) return COUNTRIES;
    return zones;
  }, [settings?.activeZones]);

  if (!mounted || appLoading) {
    return (
      <div className="container" style={styles.emptyContainer}>
        <div style={{ textAlign: "center", color: "var(--text-muted)" }}>
          {tr("loading", "Loading...")}
        </div>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="container" style={styles.emptyContainer}>
        <div style={styles.emptyBox}>
          <h2 style={{ fontSize: "24px", fontWeight: "800", color: "var(--secondary)" }}>{tr("your_cart_is_empty", "Your Cart is Empty")}</h2>
          <p style={{ color: "var(--text-muted)", margin: "10px 0 24px" }}>
            {tr("add_items_before_checkout", "Add some items to your shopping cart before proceeding to checkout.")}
          </p>
          <Link href="/shop" className="btn btn-dark">
            {tr("go_to_shop", "Go to Shop")}
          </Link>
        </div>
      </div>
    );
  }

  const currency = activeSettings?.currency || "$";
  const storeName = activeSettings?.storeName || "SnapShop";

  return (
    <div className="container" style={styles.pageLayout}>
      <Link href="/cart" style={styles.backLink}>
        <ArrowLeft size={16} style={{ marginRight: 6 }} /> {tr("back_to_cart", "Back to Cart")}
      </Link>

      <h1 style={styles.title}>{tr("Checkout", "Checkout")}</h1>

      {error && <div style={styles.errorAlert}>{error}</div>}

      <form onSubmit={handleSubmit} style={styles.grid}>
        {/* Left Side: Shipping & Payment Options */}
        <div style={styles.formColumn}>
          {/* Shipping Form */}
          <div style={styles.card}>
            <h2 style={styles.sectionTitle}>1. {tr("shipping_details", "Shipping Details")}</h2>

            {savedAddresses.length > 0 && (
              <div style={{ marginBottom: "20px" }}>
                <label className="form-label" style={{ marginBottom: "8px" }}>
                  {tr("saved_addresses", "Saved Addresses")}
                </label>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {savedAddresses.map((addr) => (
                    <button
                      type="button"
                      key={addr._id}
                      onClick={() => {
                        setSelectedAddrId(addr._id);
                        setFormData({
                          name: addr.fullName || "",
                          email: formData.email,
                          phone: addr.phone || "",
                          address: addr.street || "",
                          city: addr.city || "",
                          postalCode: addr.zip || "",
                          country: addr.country || "",
                        });
                      }}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                        padding: "12px 16px",
                        border: selectedAddrId === addr._id ? "2px solid var(--secondary)" : "1px solid var(--border-color)",
                        borderRadius: "10px",
                        backgroundColor: selectedAddrId === addr._id ? "#f8f8fa" : "#fff",
                        cursor: "pointer",
                        textAlign: "left",
                        width: "100%",
                        transition: "all 0.15s ease",
                      }}
                    >
                      <MapPin size={18} style={{ flexShrink: 0, color: selectedAddrId === addr._id ? "var(--secondary)" : "var(--text-muted)" }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: "14px", fontWeight: 600, color: "var(--secondary)" }}>
                          {addr.label}{addr.isDefault ? " (Default)" : ""}
                        </div>
                        <div style={{ fontSize: "12px", color: "var(--text-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {addr.fullName}, {addr.street}, {addr.city}
                        </div>
                      </div>
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedAddrId("new");
                      setFormData(prev => ({
                        ...prev,
                        name: "",
                        phone: "",
                        address: "",
                        city: "",
                        postalCode: "",
                        country: "",
                      }));
                    }}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      padding: "12px 16px",
                      border: selectedAddrId === "new" ? "2px solid var(--secondary)" : "1px dashed var(--border-color)",
                      borderRadius: "10px",
                      backgroundColor: selectedAddrId === "new" ? "#f8f8fa" : "transparent",
                      cursor: "pointer",
                      textAlign: "left",
                      width: "100%",
                      transition: "all 0.15s ease",
                      color: "var(--secondary)",
                    }}
                  >
                    <Plus size={18} style={{ flexShrink: 0 }} />
                    <div style={{ fontSize: "14px", fontWeight: 600 }}>{tr("add_new_address", "Add New Address")}</div>
                  </button>
                </div>
              </div>
            )}

            {(!user || savedAddresses.length === 0 || selectedAddrId === "new") && (
              <>
                <div className="form-group">
                  <label className="form-label">{tr("full_name", "Full Name")}</label>
                  <input 
                    type="text" 
                    name="name"
                    value={formData.name}
                    onChange={(e) => { handleChange(e); setSelectedAddrId("new"); }}
                    placeholder="John Doe"
                    className="form-input"
                    required
                  />
                </div>
                
                <div style={styles.inputGroupRow}>
                  {!user && (
                    <div className="form-group" style={{ flex: 1 }}>
                      <label className="form-label">{tr("email_address", "Email Address")}</label>
                      <input 
                        type="email" 
                        name="email"
                        value={formData.email}
                        onChange={(e) => { handleChange(e); setSelectedAddrId("new"); }}
                        placeholder="john@example.com"
                        className="form-input"
                        required
                      />
                    </div>
                  )}
                  <div className="form-group" style={{ flex: 1 }}>
                    <label className="form-label">{tr("phone_number", "Phone Number")}</label>
                    <input 
                      type="tel" 
                      name="phone"
                      value={formData.phone}
                      onChange={(e) => { handleChange(e); setSelectedAddrId("new"); }}
                      placeholder="+1 (555) 000-0000"
                      className="form-input"
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">{tr("street_address", "Street Address")}</label>
                  <input 
                    type="text" 
                    name="address"
                    value={formData.address}
                    onChange={(e) => { handleChange(e); setSelectedAddrId("new"); }}
                    placeholder="123 Main St, Apartment 4B"
                    className="form-input"
                    required
                  />
                </div>

                <div style={styles.inputGroupRow}>
                  <div className="form-group" style={{ flex: 1 }}>
                    <label className="form-label">{tr("city", "City")}</label>
                    <input 
                      type="text" 
                      name="city"
                      value={formData.city}
                      onChange={(e) => { handleChange(e); setSelectedAddrId("new"); }}
                      placeholder="Casablanca"
                      className="form-input"
                      required
                    />
                  </div>
                  <div className="form-group" style={{ flex: 1 }}>
                    <label className="form-label">{tr("postal_code", "Postal Code")}</label>
                    <input 
                      type="text" 
                      name="postalCode"
                      value={formData.postalCode}
                      onChange={(e) => { handleChange(e); setSelectedAddrId("new"); }}
                      placeholder="20000"
                      className="form-input"
                    />
                  </div>
                </div>

                {/* Country Selector */}
                <div className="form-group">
                  <label className="form-label">{tr("country", "Country")}</label>
                  <select
                    name="country"
                    value={formData.country}
                    onChange={(e) => { setFormData(prev => ({ ...prev, country: e.target.value })); setSelectedAddrId("new"); }}
                    className="form-input"
                    required
                  >
                    <option value="">{tr("select_country", "Select Country")}</option>
                    {deliveryCountries.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </>
            )}
          </div>

          {/* Payment Method */}
          <div style={{ ...styles.card, marginTop: "24px" }}>
            <h2 style={styles.sectionTitle}>2. {tr("payment_method", "Payment Method")}</h2>
            
            <div style={styles.paymentOptions}>
              {/* Cash on Delivery (COD) Option */}
              {hasCod && (
                <label 
                  style={{ 
                    ...styles.paymentOption, 
                    borderColor: paymentMethod === "COD" ? "var(--secondary)" : "var(--border-color)",
                    backgroundColor: paymentMethod === "COD" ? "#fcfcfd" : "transparent"
                  }}
                >
                  <input 
                    type="radio" 
                    name="paymentMethod" 
                    value="COD" 
                    checked={paymentMethod === "COD"}
                    onChange={() => setPaymentMethod("COD")}
                    style={styles.radioInput}
                  />
                  {activeSettings?.codLogo ? (
                    <img 
                      src={activeSettings.codLogo} 
                      alt="COD Logo" 
                      style={{ height: "24px", width: "80px", marginRight: 12, objectFit: "contain" }} 
                    />
                  ) : (
                    <Truck size={20} style={{ marginRight: 12, color: "var(--text-muted)", width: "80px" }} />
                  )}
                  <div style={{ flex: 1 }}>
                    <h4 style={styles.paymentName}>{tr("cash_on_delivery", "Cash on Delivery (COD)")}</h4>
                    <p style={styles.paymentDesc}>{tr("cod_description", "Pay cash when order is delivered to your doorstep.")}</p>
                  </div>
                </label>
              )}

              {/* Stripe Option */}
              {hasStripe && (
                <label 
                  style={{ 
                    ...styles.paymentOption, 
                    borderColor: paymentMethod === "Stripe" ? "#635bff" : "var(--border-color)",
                    backgroundColor: paymentMethod === "Stripe" ? "#f8f9ff" : "transparent"
                  }}
                >
                  <input 
                    type="radio" 
                    name="paymentMethod" 
                    value="Stripe" 
                    checked={paymentMethod === "Stripe"}
                    onChange={() => setPaymentMethod("Stripe")}
                    style={styles.radioInput}
                  />
                  {activeSettings?.stripeLogo ? (
                    <img 
                      src={activeSettings.stripeLogo} 
                      alt="Stripe" 
                      style={{ height: "24px", width: "80px", marginRight: 12, objectFit: "contain" }} 
                    />
                  ) : (
                    <span style={{ fontWeight: "700", color: "#635bff", fontSize: "14px", marginRight: 12, width: "80px", display: "inline-block" }}>Stripe</span>
                  )}
                  <div style={{ flex: 1 }}>
                    <h4 style={styles.paymentName}>{tr("stripe_payment_title", "Credit Card / Debit Card (Stripe)")}</h4>
                    <p style={styles.paymentDesc}>{tr("stripe_payment_desc", "Pay securely with Visa, MasterCard, Amex, or Apple Pay.")}</p>
                  </div>
                </label>
              )}

              {/* PayPal Option */}
              {hasPaypal && (
                <label 
                  style={{ 
                    ...styles.paymentOption, 
                    borderColor: paymentMethod === "PayPal" ? "#0070ba" : "var(--border-color)",
                    backgroundColor: paymentMethod === "PayPal" ? "#f3f9fc" : "transparent"
                  }}
                >
                  <input 
                    type="radio" 
                    name="paymentMethod" 
                    value="PayPal" 
                    checked={paymentMethod === "PayPal"}
                    onChange={() => setPaymentMethod("PayPal")}
                    style={styles.radioInput}
                  />
                  {activeSettings?.paypalLogo ? (
                    <img 
                      src={activeSettings.paypalLogo} 
                      alt="PayPal" 
                      style={{ height: "20px", width: "80px", marginRight: 12, objectFit: "contain" }} 
                    />
                  ) : (
                    <span style={{ fontWeight: "800", fontStyle: "italic", color: "#003087", fontSize: "14px", marginRight: 12, width: "80px", display: "inline-block" }}>
                      <span style={{ color: "#003087" }}>Pay</span>
                      <span style={{ color: "#0079c1" }}>Pal</span>
                    </span>
                  )}
                  <div style={{ flex: 1 }}>
                    <h4 style={styles.paymentName}>{tr("paypal_payment_title", "PayPal Secure Checkout")}</h4>
                    <p style={styles.paymentDesc}>{tr("paypal_payment_desc", "Pay using your PayPal wallet balance or linked bank accounts.")}</p>
                  </div>
                </label>
              )}

              {/* Razorpay Option */}
              {hasRazorpay && (
                <label 
                  style={{ 
                    ...styles.paymentOption, 
                    borderColor: paymentMethod === "Razorpay" ? "#005BFF" : "var(--border-color)",
                    backgroundColor: paymentMethod === "Razorpay" ? "#f2f7ff" : "transparent"
                  }}
                >
                  <input 
                    type="radio" 
                    name="paymentMethod" 
                    value="Razorpay" 
                    checked={paymentMethod === "Razorpay"}
                    onChange={() => setPaymentMethod("Razorpay")}
                    style={styles.radioInput}
                  />
                  {activeSettings?.razorpayLogo ? (
                    <img 
                      src={activeSettings.razorpayLogo} 
                      alt="Razorpay" 
                      style={{ height: "18px", width: "80px", marginRight: 12, objectFit: "contain" }} 
                    />
                  ) : (
                    <span style={{ fontWeight: "700", color: "#005BFF", fontSize: "14px", marginRight: 12, width: "80px", display: "inline-block" }}>Razorpay</span>
                  )}
                  <div style={{ flex: 1 }}>
                    <h4 style={styles.paymentName}>{tr("razorpay_payment_title", "UPI / Netbanking (Razorpay)")}</h4>
                    <p style={styles.paymentDesc}>{tr("razorpay_payment_desc", "Support instant UPI payments and cards.")}</p>
                  </div>
                </label>
              )}
            </div>

            {/* Selected Gateway simulator or form */}
            {paymentMethod !== "COD" && (
              <div style={{ ...styles.gatewayPanel, marginTop: "20px" }}>
                {paymentMethod === "Stripe" && renderStripeForm()}
                {paymentMethod === "PayPal" && renderPaypalForm()}
                {paymentMethod === "Razorpay" && renderRazorpayForm()}
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Order Summary */}
        <div style={styles.summaryColumn}>
          <div style={styles.card}>
            <h2 style={{ ...styles.sectionTitle, marginBottom: "18px" }}>{tr("order_review", "Order Review")}</h2>

            {/* Cart Preview */}
            <div style={styles.cartPreviewList}>
              {cart.map((item) => (
                <div key={`${item.productId}-${item.size}-${item.color}`} style={styles.cartPreviewItem}>
                  <img src={item.image} alt={item.name} style={styles.previewImg} />
                  <div style={styles.previewDetails}>
                    <h4 style={styles.previewName}>{item.name}</h4>
                    <p style={styles.previewSpec}>
                      {tr("Size", "Size")}: {item.size || "N/A"} x {item.quantity}
                    </p>
                  </div>
                  <span style={styles.previewPrice}>
                    {currency}{(item.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            <hr style={styles.divider} />

            {/* Promo code form */}
            <div style={styles.promoSection}>
              <div style={styles.promoForm}>
                <input 
                  type="text" 
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                  placeholder="Have a promo code?"
                  style={styles.promoInput}
                  disabled={!!appliedPromo || isApplying}
                />
                {appliedPromo ? (
                  <button 
                    type="button" 
                    onClick={handleRemovePromo}
                    style={{...styles.promoBtn, backgroundColor: "#ef4444"}}
                  >
                    Remove
                  </button>
                ) : (
                  <button 
                    type="button" 
                    onClick={handleApplyPromo}
                    style={styles.promoBtn}
                    disabled={isApplying}
                  >
                    {isApplying ? "..." : "Apply"}
                  </button>
                )}
              </div>
              {appliedPromo && (
                <p style={styles.promoSuccess}>
                  Code applied! Saved {appliedPromo.discountType === "Percentage" ? `${appliedPromo.value}%` : `${activeSettings?.currency || "$"}${appliedPromo.value.toFixed(2)}`}
                </p>
              )}
              {promoError && (
                <p style={styles.promoError}>{promoError}</p>
              )}
            </div>

            {/* Billing Breakdown */}
            <div style={styles.billing}>
              <div style={styles.billRow}>
                <span>Subtotal</span>
                <span>{activeSettings?.currency || "$"}{cartSubtotal.toFixed(2)}</span>
              </div>
              {appliedPromo && (
                <div style={{ ...styles.billRow, color: "#10b981", fontWeight: "600" }}>
                  <span>Promo Discount</span>
                  <span>-{activeSettings?.currency || "$"}{discountAmount.toFixed(2)}</span>
                </div>
              )}
              <div style={styles.billRow}>
                <span>{tr("Shipping", "Shipping")}</span>
                <span>
                  {activeSettings?.shippingCost === 0 ? tr("free", "Free") : `${currency}${(activeSettings?.shippingCost || 0).toFixed(2)}`}
                </span>
              </div>
              
              <hr style={styles.divider} />

              <div style={styles.totalRow}>
                <span>Total Amount</span>
                <span style={styles.totalVal}>{currency}{cartTotal.toFixed(2)}</span>
              </div>
            </div>

            <button 
              type="submit" 
              style={styles.placeOrderBtn}
              disabled={loading}
            >
              {loading 
                ? tr("processing", "Processing...") 
                : paymentMethod === "COD" 
                  ? `${tr("place_order", "Place Order")} • ${currency}${cartTotal.toFixed(2)}`
                  : `${tr("pay_with", "Pay with")} ${paymentMethod} • ${currency}${cartTotal.toFixed(2)}`
              }
            </button>
          </div>
        </div>
      </form>

      {/* Hosted Payment Redirection Active */}

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  emptyContainer: {
    padding: "80px 24px",
    display: "flex",
    justifyContent: "center",
  },
  emptyBox: {
    textAlign: "center",
    backgroundColor: "white",
    borderRadius: "var(--radius-lg)",
    padding: "60px 40px",
    boxShadow: "var(--shadow-md)",
    maxWidth: "500px",
    width: "100%",
  },
  pageLayout: {
    paddingTop: "30px",
    paddingBottom: "80px",
  },
  backLink: {
    display: "inline-flex",
    alignItems: "center",
    fontSize: "14px",
    color: "var(--text-muted)",
    fontWeight: "600",
    marginBottom: "16px",
  },
  title: {
    fontSize: "32px",
    fontWeight: "800",
    color: "var(--secondary)",
    marginBottom: "30px",
  },
  errorAlert: {
    backgroundColor: "#fef2f2",
    color: "var(--primary)",
    border: "1px solid #fca5a5",
    padding: "16px 20px",
    borderRadius: "var(--radius-md)",
    fontSize: "14px",
    fontWeight: "500",
    marginBottom: "24px",
  },
  grid: {
    display: "flex",
    gap: "40px",
    flexWrap: "wrap",
    alignItems: "flex-start",
  },
  formColumn: {
    flex: "2 1 550px",
  },
  card: {
    backgroundColor: "white",
    borderRadius: "var(--radius-lg)",
    padding: "30px",
    boxShadow: "var(--shadow-sm)",
    border: "1px solid var(--border-color)",
  },
  sectionTitle: {
    fontSize: "18px",
    fontWeight: "700",
    color: "var(--secondary)",
    marginBottom: "20px",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  inputGroupRow: {
    display: "flex",
    gap: "16px",
  },
  paymentOptions: {
    display: "flex",
    flexDirection: "column",
    gap: "14px",
  },
  paymentOption: {
    display: "flex",
    alignItems: "center",
    border: "2px solid var(--border-color)",
    padding: "18px 20px",
    borderRadius: "var(--radius-md)",
    cursor: "pointer",
    transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
    boxShadow: "0 1px 2px rgba(0,0,0,0.01)",
  },
  radioInput: {
    marginRight: "16px",
    accentColor: "var(--secondary)",
    width: "16px",
    height: "16px",
  },
  paymentName: {
    fontSize: "15px",
    fontWeight: "700",
    color: "var(--secondary)",
    textAlign: "left",
  },
  paymentDesc: {
    fontSize: "12px",
    color: "var(--text-muted)",
    marginTop: "4px",
    textAlign: "left",
  },
  summaryColumn: {
    flex: "1 1 350px",
    position: "sticky",
    top: "100px",
  },
  cartPreviewList: {
    display: "flex",
    flexDirection: "column",
    gap: "14px",
  },
  cartPreviewItem: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  previewImg: {
    width: "48px",
    height: "56px",
    borderRadius: "4px",
    objectFit: "cover",
    backgroundColor: "var(--bg-light)",
  },
  previewDetails: {
    flex: 1,
  },
  previewName: {
    fontSize: "13px",
    fontWeight: "600",
    color: "var(--secondary)",
    textAlign: "left",
  },
  previewSpec: {
    fontSize: "11px",
    color: "var(--text-muted)",
    textAlign: "left",
  },
  previewPrice: {
    fontSize: "13px",
    fontWeight: "600",
    color: "var(--secondary)",
  },
  divider: {
    border: 0,
    borderTop: "1px solid var(--border-color)",
    margin: "18px 0",
  },
  billing: {
    marginBottom: "24px",
  },
  billRow: {
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
  },
  totalVal: {
    fontSize: "22px",
    fontWeight: "800",
  },
  placeOrderBtn: {
    width: "100%",
    height: "54px",
    backgroundColor: "var(--secondary)",
    color: "white",
    borderRadius: "var(--radius-md)",
    fontSize: "15px",
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    transition: "background-color 0.2s",
    cursor: "pointer",
    border: "none",
  },
  gatewayPanel: {
    backgroundColor: "white",
    borderRadius: "12px",
    padding: "20px",
    border: "1px solid #cbd5e1",
  },
  stripeForm: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    textAlign: "left",
  },
  redirectNotice: {
    backgroundColor: "#f8fafc",
    border: "1px solid #cbd5e1",
    borderRadius: "12px",
    padding: "20px",
  },
  redirectNoticeHeader: {
    display: "flex",
    alignItems: "center",
    marginBottom: "12px",
  },
  redirectNoticeText: {
    fontSize: "14px",
    color: "#475569",
    lineHeight: "1.6",
    marginBottom: "16px",
  },
  cardLogosRow: {
    display: "flex",
    gap: "8px",
    flexWrap: "wrap",
  },
  cardLogoBadge: {
    backgroundColor: "white",
    border: "1px solid #cbd5e1",
    borderRadius: "6px",
    padding: "4px 8px",
    fontSize: "11px",
    fontWeight: "700",
    color: "#64748b",
    boxShadow: "0 1px 2px rgba(0,0,0,0.02)",
  },
  smallLabel: {
    fontSize: "11px",
    color: "#64748b",
    fontWeight: "600",
    marginBottom: "4px",
    textAlign: "left",
    display: "block",
  },
  compactInput: {
    height: "40px",
    fontSize: "13px",
  },
  paypalForm: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "10px 0",
  },
  paypalBtn: {
    backgroundColor: "#ffc439",
    border: "none",
    borderRadius: "24px",
    padding: "12px 32px",
    cursor: "pointer",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "4px",
    minWidth: "200px",
    transition: "background-color 0.2s",
  },
  paypalSuccess: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    backgroundColor: "#ecfdf5",
    border: "1px solid #a7f3d0",
    padding: "12px 16px",
    borderRadius: "8px",
    width: "100%",
    textAlign: "left",
  },
  razorpayForm: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  razorpaySupported: {
    display: "flex",
    justifyContent: "center",
    gap: "10px",
    marginTop: "6px",
  },
  razorpayBadge: {
    fontSize: "10px",
    fontWeight: "700",
    backgroundColor: "#f1f5f9",
    color: "#475569",
    padding: "4px 8px",
    borderRadius: "4px",
  },
  popupOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(15, 23, 42, 0.6)",
    backdropFilter: "blur(4px)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  paypalModalCard: {
    backgroundColor: "white",
    borderRadius: "12px",
    maxWidth: "400px",
    width: "90%",
    boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1)",
    border: "1px solid #e2e8f0",
  },
  paypalModalHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "16px 20px",
    borderBottom: "1px solid #f1f5f9",
  },
  paypalModalBody: {
    padding: "20px",
    textAlign: "left",
  },
  paypalInput: {
    height: "44px",
    fontSize: "14px",
  },
  paypalLoginBtn: {
    backgroundColor: "#0070ba",
    color: "white",
    height: "44px",
    borderRadius: "22px",
    fontWeight: "700",
    border: "none",
    cursor: "pointer",
  },
  paypalPayNowBtn: {
    backgroundColor: "#0079c1",
    color: "white",
    height: "44px",
    borderRadius: "22px",
    fontWeight: "700",
    border: "none",
    cursor: "pointer",
  },
  paypalCancelBtn: {
    backgroundColor: "transparent",
    color: "#64748b",
    height: "40px",
    borderRadius: "20px",
    fontWeight: "600",
    border: "1px solid #cbd5e1",
    cursor: "pointer",
  },
  razorpayModalCard: {
    backgroundColor: "white",
    borderRadius: "12px",
    maxWidth: "440px",
    width: "90%",
    boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1)",
    border: "1px solid #e2e8f0",
  },
  razorpayModalHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "16px 20px",
    borderBottom: "1px solid #f1f5f9",
    backgroundColor: "#f8fafc",
    borderTopLeftRadius: "12px",
    borderTopRightRadius: "12px",
  },
  razorpayIcon: {
    fontSize: "20px",
  },
  razorpayAmtBadge: {
    fontSize: "14px",
    fontWeight: "700",
    color: "#005BFF",
    backgroundColor: "#e0ebff",
    padding: "4px 10px",
    borderRadius: "6px",
  },
  razorpayModalBody: {
    padding: "20px",
    textAlign: "left",
  },
  razorpaySelectorRow: {
    display: "flex",
    gap: "10px",
    marginBottom: "10px",
  },
  razorpayMethodBtn: {
    flex: 1,
    padding: "12px",
    border: "1px solid #e2e8f0",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "12px",
    fontWeight: "600",
    textAlign: "center",
    transition: "all 0.2s",
  },
  razorpaySubmitBtn: {
    height: "46px",
    backgroundColor: "#005BFF",
    color: "white",
    border: "none",
    borderRadius: "8px",
    fontWeight: "700",
    cursor: "pointer",
    fontSize: "14px",
  },
  spinner: {
    width: "40px",
    height: "40px",
    border: "4px solid #f3f3f3",
    borderTop: "4px solid #005BFF",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
    margin: "0 auto",
  },
  promoSection: {
    padding: "0",
  },
  promoForm: {
    display: "flex",
    gap: "10px",
    marginBottom: "12px",
  },
  promoInput: {
    flex: 1,
    height: "44px",
    padding: "0 14px",
    border: "1px solid #e2e8f0",
    borderRadius: "8px",
    fontSize: "14px",
    outline: "none",
    transition: "border-color 0.2s",
  },
  promoBtn: {
    height: "44px",
    padding: "0 20px",
    backgroundColor: "#1e293b",
    color: "white",
    border: "none",
    borderRadius: "8px",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "background-color 0.2s",
  },
  promoSuccess: {
    color: "#10b981",
    fontSize: "13px",
    fontWeight: "500",
    margin: 0,
    marginTop: "8px",
  },
  promoError: {
    color: "#ef4444",
    fontSize: "13px",
    fontWeight: "500",
    margin: 0,
    marginTop: "8px",
  },
};
