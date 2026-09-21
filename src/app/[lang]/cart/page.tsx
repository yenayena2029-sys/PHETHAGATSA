"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Trash2, Plus, Minus, X, ArrowRight, Gift } from "lucide-react";
import { useApp } from "@/context/AppContext";

export default function CartPage() {
  const { 
    cart, 
    updateQuantity, 
    removeFromCart, 
    clearCart, 
    cartSubtotal, 
    settings,
    appliedPromo,
    setAppliedPromo 
  } = useApp();

  const [promoCode, setPromoCode] = useState(appliedPromo?.code || "");
  const [promoError, setPromoError] = useState("");
  const [isApplying, setIsApplying] = useState(false);
  const [giftWrap, setGiftWrap] = useState(false);

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

  const shippingCost = settings ? settings.shippingCost : 0;
  const giftWrapCost = giftWrap ? 15.99 : 0;
  
  const currency = settings ? settings.currency : "$";
  const cartTotal = cartSubtotal - discountAmount + shippingCost + giftWrapCost;

  if (cart.length === 0) {
    return (
      <div className="container" style={styles.emptyContainer}>
        <div style={styles.emptyBox}>
          <h2>Your Cart is Empty</h2>
          <p style={{ color: "var(--text-muted)", margin: "10px 0 24px" }}>
            Add some premium items to your cart to get started.
          </p>
          <Link href="/shop" className="btn btn-dark">
            Shop Collection
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container" style={styles.pageLayout}>
      {/* Left side: Cart items */}
      <div style={styles.cartColumn}>
        <div style={styles.headerRow}>
          <h1 style={styles.title}>Cart Items ({cart.length})</h1>
          <button onClick={clearCart} style={styles.clearBtn}>
            <Trash2 size={16} style={{ marginRight: 6 }} />
            Clear Cart
          </button>
        </div>

        <div style={styles.itemsList}>
          {cart.map((item, index) => (
            <div key={`${item.productId}-${item.size}-${item.color}`} style={styles.itemCard}>
              <div style={styles.itemImageWrapper}>
                <img src={item.image} alt={item.name} style={styles.itemImage} />
              </div>
              
              <div style={styles.itemDetails}>
                <div style={styles.itemHeader}>
                  <h3 style={styles.itemName}>{item.name}</h3>
                  <button 
                    onClick={() => removeFromCart(item.productId, item.size, item.color)}
                    style={styles.removeBtn}
                    aria-label="Remove item"
                  >
                    <X size={16} />
                  </button>
                </div>

                <p style={styles.itemSpec}>
                  Size: {item.color ? `${item.color} - ` : ""}{item.size || "N/A"}
                </p>
                <span style={styles.inStockBadge}>In Stock</span>

                <div style={styles.itemPriceQtyRow}>
                  <div>
                    <span style={styles.priceLabel}>PRICE</span>
                    <p style={styles.itemPrice}>{currency}{item.price.toFixed(2)}</p>
                  </div>

                  <div style={styles.qtyContainer}>
                    <button 
                      onClick={() => updateQuantity(item.productId, item.quantity - 1, item.size, item.color)}
                      style={styles.qtyBtn}
                    >
                      <Minus size={14} />
                    </button>
                    <span style={styles.qtyVal}>{item.quantity}</span>
                    <button 
                      onClick={() => updateQuantity(item.productId, item.quantity + 1, item.size, item.color)}
                      style={styles.qtyBtn}
                    >
                      <Plus size={14} />
                    </button>
                  </div>

                  <div style={{ textAlign: "right" }}>
                    <span style={styles.priceLabel}>TOTAL</span>
                    <p style={styles.itemTotal}>{currency}{(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right side: Summary */}
      <div style={styles.summaryColumn}>
        <div style={styles.summaryCard}>
          <h2 style={styles.summaryTitle}>Order Summary</h2>

          {/* Promo code form */}
          <div style={styles.summarySection}>
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
                Code applied! Saved {appliedPromo.discountType === "Percentage" ? `${appliedPromo.value}%` : `${currency}${appliedPromo.value.toFixed(2)}`}
              </p>
            )}
            {promoError && (
              <p style={styles.promoError}>{promoError}</p>
            )}
          </div>

          {/* Gift Wrap Option */}
          <div style={styles.giftSection}>
            <div style={styles.giftLeft}>
              <div style={styles.giftIcon}>
                <Gift size={18} color="var(--primary)" />
              </div>
              <div>
                <h4 style={styles.giftTitle}>Gift Wrap</h4>
                <p style={styles.giftText}>Add a special touch (+{currency}15.99)</p>
              </div>
            </div>
            <label style={styles.toggleContainer}>
              <input 
                type="checkbox" 
                checked={giftWrap}
                onChange={(e) => setGiftWrap(e.target.checked)}
                style={styles.toggleInput}
              />
              <span style={{ 
                ...styles.toggleSlider, 
                backgroundColor: giftWrap ? "var(--primary)" : "#ccc"
              }}>
                <span style={{ 
                  ...styles.toggleKnob, 
                  transform: giftWrap ? "translateX(18px)" : "translateX(2px)"
                }} />
              </span>
            </label>
          </div>

          {/* Detailed pricing */}
          <div style={styles.billingSection}>
            <div style={styles.billRow}>
              <span>Subtotal</span>
              <span>{currency}{cartSubtotal.toFixed(2)}</span>
            </div>
            {appliedPromo && (
              <div style={{ ...styles.billRow, color: "#10b981", fontWeight: "600" }}>
                <span>Promo Discount</span>
                <span>-{currency}{discountAmount.toFixed(2)}</span>
              </div>
            )}
            {giftWrap && (
              <div style={styles.billRow}>
                <span>Gift Wrapping</span>
                <span>{currency}{giftWrapCost.toFixed(2)}</span>
              </div>
            )}
            <div style={styles.billRow}>
              <span>Shipping Estimate</span>
              <span>
                {shippingCost === 0 ? "Free Shipping" : `${currency}${shippingCost.toFixed(2)}`}
              </span>
            </div>
            
            <hr style={styles.summaryDivider} />

            <div style={styles.totalRow}>
              <span>Total</span>
              <div style={{ textAlign: "right" }}>
                <p style={styles.totalPrice}>{currency}{cartTotal.toFixed(2)}</p>
                <span style={styles.taxLabel}>Tax calculated at checkout</span>
              </div>
            </div>
          </div>

          <Link href="/checkout" style={styles.checkoutBtn}>
            Proceed to Checkout
            <ArrowRight size={18} style={{ marginLeft: 8 }} />
          </Link>
        </div>
      </div>
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
    display: "flex",
    gap: "40px",
    paddingTop: "40px",
    paddingBottom: "80px",
    flexWrap: "wrap",
  },
  cartColumn: {
    flex: "2 1 600px",
  },
  headerRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "24px",
  },
  title: {
    fontSize: "28px",
    fontWeight: "700",
    color: "var(--secondary)",
  },
  clearBtn: {
    display: "inline-flex",
    alignItems: "center",
    fontSize: "14px",
    color: "var(--text-muted)",
    fontWeight: "500",
    transition: "color 0.2s",
  },
  itemsList: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },
  itemCard: {
    backgroundColor: "white",
    borderRadius: "var(--radius-lg)",
    padding: "20px",
    display: "flex",
    gap: "20px",
    boxShadow: "var(--shadow-sm)",
    border: "1px solid var(--border-color)",
  },
  itemImageWrapper: {
    width: "100px",
    height: "120px",
    borderRadius: "var(--radius-md)",
    overflow: "hidden",
    backgroundColor: "var(--bg-light)",
    flexShrink: 0,
  },
  itemImage: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
  itemDetails: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
  },
  itemHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "4px",
  },
  itemName: {
    fontSize: "16px",
    fontWeight: "700",
    color: "var(--secondary)",
  },
  removeBtn: {
    color: "#cccccc",
    padding: "4px",
    transition: "color 0.2s",
  },
  itemSpec: {
    fontSize: "13px",
    color: "var(--text-muted)",
    marginBottom: "8px",
  },
  inStockBadge: {
    alignSelf: "flex-start",
    fontSize: "11px",
    fontWeight: "600",
    color: "#047857",
    backgroundColor: "#ecfdf5",
    padding: "2px 8px",
    borderRadius: "20px",
    marginBottom: "16px",
  },
  itemPriceQtyRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: "auto",
  },
  priceLabel: {
    fontSize: "9px",
    fontWeight: "700",
    color: "var(--text-muted)",
    letterSpacing: "0.5px",
    display: "block",
  },
  itemPrice: {
    fontSize: "15px",
    fontWeight: "600",
    color: "var(--secondary)",
  },
  qtyContainer: {
    display: "flex",
    alignItems: "center",
    border: "1px solid var(--border-color)",
    borderRadius: "20px",
    height: "32px",
    overflow: "hidden",
  },
  qtyBtn: {
    width: "32px",
    height: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "var(--text-muted)",
  },
  qtyVal: {
    width: "24px",
    textAlign: "center",
    fontSize: "13px",
    fontWeight: "600",
  },
  itemTotal: {
    fontSize: "16px",
    fontWeight: "700",
    color: "var(--secondary)",
  },
  summaryColumn: {
    flex: "1 1 320px",
  },
  summaryCard: {
    backgroundColor: "white",
    borderRadius: "var(--radius-lg)",
    padding: "30px",
    boxShadow: "var(--shadow-md)",
    border: "1px solid var(--border-color)",
    position: "sticky",
    top: "100px",
  },
  summaryTitle: {
    fontSize: "22px",
    fontWeight: "700",
    color: "var(--secondary)",
    marginBottom: "24px",
  },
  summarySection: {
    marginBottom: "20px",
  },
  promoForm: {
    display: "flex",
    gap: "8px",
  },
  promoInput: {
    flex: 1,
    padding: "10px 14px",
    border: "1px solid var(--border-color)",
    borderRadius: "var(--radius-md)",
    fontSize: "13px",
  },
  promoBtn: {
    backgroundColor: "var(--secondary)",
    color: "white",
    fontSize: "12px",
    fontWeight: "600",
    padding: "10px 16px",
    borderRadius: "var(--radius-md)",
    textTransform: "uppercase",
  },
  promoSuccess: {
    fontSize: "12px",
    color: "#10b981",
    fontWeight: "600",
    marginTop: "6px",
  },
  promoError: {
    fontSize: "12px",
    color: "var(--primary)",
    fontWeight: "600",
    marginTop: "6px",
  },
  giftSection: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "16px",
    border: "1px solid var(--border-color)",
    borderRadius: "var(--radius-md)",
    marginBottom: "24px",
    backgroundColor: "var(--bg-light)",
  },
  giftLeft: {
    display: "flex",
    gap: "12px",
    alignItems: "center",
  },
  giftIcon: {
    width: "36px",
    height: "36px",
    borderRadius: "8px",
    backgroundColor: "#fef2f2",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  giftTitle: {
    fontSize: "13px",
    fontWeight: "700",
    color: "var(--secondary)",
  },
  giftText: {
    fontSize: "11px",
    color: "var(--text-muted)",
  },
  toggleContainer: {
    display: "inline-flex",
    alignItems: "center",
    cursor: "pointer",
  },
  toggleInput: {
    display: "none",
  },
  toggleSlider: {
    width: "36px",
    height: "20px",
    borderRadius: "10px",
    position: "relative",
    display: "inline-block",
    transition: "background-color 0.2s",
  },
  toggleKnob: {
    width: "16px",
    height: "16px",
    borderRadius: "50%",
    backgroundColor: "white",
    position: "absolute",
    top: "2px",
    left: 0,
    transition: "transform 0.2s",
    boxShadow: "0 1px 3px rgba(0,0,0,0.15)",
  },
  billingSection: {
    marginBottom: "24px",
  },
  billRow: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: "14px",
    color: "var(--text-muted)",
    marginBottom: "12px",
  },
  summaryDivider: {
    border: 0,
    borderTop: "1px solid var(--border-color)",
    margin: "16px 0",
  },
  totalRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    fontSize: "16px",
    fontWeight: "600",
    color: "var(--secondary)",
  },
  totalPrice: {
    fontSize: "24px",
    fontWeight: "800",
    color: "var(--secondary)",
    lineHeight: "1.1",
  },
  taxLabel: {
    fontSize: "11px",
    color: "var(--text-muted)",
    fontWeight: "400",
  },
  checkoutBtn: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    height: "54px",
    backgroundColor: "var(--secondary)",
    color: "white",
    borderRadius: "var(--radius-md)",
    fontSize: "15px",
    fontWeight: "700",
    textTransform: "uppercase",
    transition: "all 0.2s",
  },
};
