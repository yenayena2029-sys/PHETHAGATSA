"use client";

import React, { useState, useEffect } from "react";
import { PlusCircle, Trash2, Check, RefreshCw, AlertTriangle, Percent, DollarSign, Tag, ToggleLeft, ToggleRight, Calendar } from "lucide-react";

interface Coupon {
  _id: string;
  code: string;
  discountType: "percentage" | "fixed";
  discountValue: number;
  expiryDate?: string;
  isActive: boolean;
  createdAt: string;
}

export default function MarketingDashboard() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [currency, setCurrency] = useState("$");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Form State
  const [code, setCode] = useState("");
  const [discountType, setDiscountType] = useState<"percentage" | "fixed">("percentage");
  const [discountValue, setDiscountValue] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      setError("");

      const settingsRes = await fetch("/api/settings");
      const settingsData = await settingsRes.json();
      if (settingsRes.ok && settingsData?.currency) {
        setCurrency(settingsData.currency);
      }

      const res = await fetch("/api/admin/coupons");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load coupons");
      setCoupons(data);
    } catch (err: any) {
      setError(err.message || "Failed to fetch coupons data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code || !discountValue) {
      setError("Please fill out all required fields.");
      return;
    }

    setSubmitting(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch("/api/admin/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: code.trim(),
          discountType,
          discountValue: Number(discountValue),
          expiryDate: expiryDate ? new Date(expiryDate).toISOString() : undefined,
          isActive: true,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create coupon");

      setCoupons(prev => [data, ...prev]);
      setSuccess("Coupon code successfully created!");
      setCode("");
      setDiscountValue("");
      setExpiryDate("");
      
      // Auto clear success message
      setTimeout(() => setSuccess(""), 4000);
    } catch (err: any) {
      setError(err.message || "Error creating coupon");
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleActive = async (id: string, currentVal: boolean) => {
    try {
      const res = await fetch(`/api/admin/coupons/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !currentVal }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to toggle status");

      setCoupons(prev => prev.map(c => c._id === id ? { ...c, isActive: !currentVal } : c));
    } catch (err: any) {
      setError(err.message || "Error updating coupon status");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this coupon?")) return;

    try {
      const res = await fetch(`/api/admin/coupons/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete coupon");

      setCoupons(prev => prev.filter(c => c._id !== id));
      setSuccess("Coupon code deleted successfully");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err: any) {
      setError(err.message || "Error deleting coupon");
    }
  };

  const isExpired = (expiryStr?: string) => {
    if (!expiryStr) return false;
    return new Date(expiryStr).getTime() < new Date().getTime();
  };

  const activeCoupons = coupons.filter(c => c.isActive && !isExpired(c.expiryDate));

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h2 style={styles.title}>Marketing & Coupons</h2>
          <p style={styles.subtitle}>Configure discounts, promo codes, and special sales incentives for your users.</p>
        </div>
        <button onClick={fetchCoupons} style={styles.refreshBtn}>
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      {/* Messages */}
      {error && (
        <div style={styles.errorAlert}>
          <AlertTriangle size={16} style={{ marginRight: 8 }} />
          {error}
        </div>
      )}
      {success && (
        <div style={styles.successAlert}>
          <Check size={16} style={{ marginRight: 8 }} />
          {success}
        </div>
      )}

      {/* Grid statistics */}
      <div style={styles.statsGrid}>
        <div style={{ ...styles.statCard, borderLeft: "4px solid #10b981" }}>
          <span style={styles.statLabel}>Active Promo Codes</span>
          <h3 style={styles.statValue}>{activeCoupons.length}</h3>
          <p style={styles.statSub}>Ready for customer checkouts</p>
        </div>
        <div style={{ ...styles.statCard, borderLeft: "4px solid #3b82f6" }}>
          <span style={styles.statLabel}>Percentage Discounts</span>
          <h3 style={styles.statValue}>{coupons.filter(c => c.discountType === "percentage").length}</h3>
          <p style={styles.statSub}>E.g. 10% or 20% off items</p>
        </div>
        <div style={{ ...styles.statCard, borderLeft: "4px solid #8b5cf6" }}>
          <span style={styles.statLabel}>Fixed Value Off</span>
          <h3 style={styles.statValue}>{coupons.filter(c => c.discountType === "fixed").length}</h3>
          <p style={styles.statSub}>E.g. $10 or $25 flat reduction</p>
        </div>
      </div>

      {/* Two Column Workspace */}
      <div style={styles.workspace}>
        {/* Left Column: Coupon List */}
        <div style={styles.leftCol}>
          <div style={styles.cardHeaderTitle}>
            <Tag size={18} style={{ marginRight: 8, color: "#64748b" }} />
            <span>Active Promotion List</span>
          </div>

          {loading ? (
            <div style={styles.loaderContainer}>
              <div style={styles.spinner}></div>
              <p style={{ marginTop: "12px", color: "#64748b" }}>Loading coupons...</p>
            </div>
          ) : coupons.length === 0 ? (
            <div style={styles.emptyState}>
              <Tag size={48} style={{ marginBottom: "12px", color: "#cbd5e1" }} />
              <p>No coupon codes configured yet.</p>
            </div>
          ) : (
            <div style={styles.tableWrapper}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Code</th>
                    <th style={styles.th}>Discount</th>
                    <th style={styles.th}>Expiry</th>
                    <th style={styles.th}>Status</th>
                    <th style={{ ...styles.th, textAlign: "right" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {coupons.map((c) => {
                    const expired = isExpired(c.expiryDate);
                    return (
                      <tr key={c._id} style={styles.tr}>
                        <td style={styles.td}>
                          <span style={styles.couponCodeBadge}>{c.code}</span>
                        </td>
                        <td style={styles.td}>
                          <span style={styles.discountText}>
                            {c.discountType === "percentage" ? `${c.discountValue}% Off` : `${currency}${c.discountValue} Off`}
                          </span>
                        </td>
                        <td style={styles.td}>
                          <div style={styles.dateCell}>
                            <Calendar size={13} style={{ marginRight: 4, color: "#64748b" }} />
                            <span>{c.expiryDate ? new Date(c.expiryDate).toLocaleDateString() : "Never"}</span>
                          </div>
                        </td>
                        <td style={styles.td}>
                          {expired ? (
                            <span style={{ ...styles.statusBadge, color: "#ef4444", backgroundColor: "#fef2f2" }}>Expired</span>
                          ) : c.isActive ? (
                            <span style={{ ...styles.statusBadge, color: "#10b981", backgroundColor: "#ecfdf5" }}>Active</span>
                          ) : (
                            <span style={{ ...styles.statusBadge, color: "#64748b", backgroundColor: "#f1f5f9" }}>Inactive</span>
                          )}
                        </td>
                        <td style={{ ...styles.td, textAlign: "right" }}>
                          <div style={{ display: "inline-flex", gap: "10px", alignItems: "center" }}>
                            <button
                              onClick={() => handleToggleActive(c._id, c.isActive)}
                              style={styles.toggleBtn}
                              title={c.isActive ? "Deactivate" : "Activate"}
                            >
                              {c.isActive ? <ToggleRight size={26} color="#10b981" /> : <ToggleLeft size={26} color="#94a3b8" />}
                            </button>
                            <button
                              onClick={() => handleDelete(c._id)}
                              style={styles.deleteBtn}
                              title="Delete Code"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Right Column: Create Coupon Form */}
        <div style={styles.rightCol}>
          <div style={styles.cardHeaderTitle}>
            <PlusCircle size={18} style={{ marginRight: 8, color: "#64748b" }} />
            <span>Create New Coupon</span>
          </div>

          <form onSubmit={handleCreateCoupon} style={styles.form}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Coupon Code (Required)</label>
              <input
                type="text"
                placeholder="E.g. SUMMER50"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                style={styles.input}
                required
              />
              <span style={styles.inputHelp}>Uppercase letters, numbers, and dashes only.</span>
            </div>

            <div style={styles.formRow}>
              <div style={{ ...styles.formGroup, flex: 1 }}>
                <label style={styles.label}>Discount Type</label>
                <select
                  value={discountType}
                  onChange={(e) => setDiscountType(e.target.value as any)}
                  style={styles.select}
                >
                  <option value="percentage">Percentage (%)</option>
                  <option value="fixed">Fixed Value ({currency})</option>
                </select>
              </div>

              <div style={{ ...styles.formGroup, flex: 1 }}>
                <label style={styles.label}>Value (Required)</label>
                <div style={styles.inputGroup}>
                  {discountType === "fixed" && <span style={styles.inputPrefix}>{currency}</span>}
                  <input
                    type="number"
                    placeholder={discountType === "percentage" ? "15" : "20"}
                    value={discountValue}
                    onChange={(e) => setDiscountValue(e.target.value)}
                    style={styles.input}
                    min="1"
                    max={discountType === "percentage" ? "100" : undefined}
                    required
                  />
                  {discountType === "percentage" && <span style={styles.inputSuffix}>%</span>}
                </div>
              </div>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Expiry Date (Optional)</label>
              <input
                type="date"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                style={styles.input}
              />
            </div>

            <button type="submit" disabled={submitting} style={styles.submitBtn}>
              {submitting ? "Saving Code..." : "Generate Coupon"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: "flex",
    flexDirection: "column",
    gap: "24px",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: {
    fontSize: "24px",
    fontWeight: "700",
    color: "#0f172a",
  },
  subtitle: {
    fontSize: "14px",
    color: "#64748b",
  },
  refreshBtn: {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    backgroundColor: "#ffffff",
    border: "1px solid #cbd5e1",
    color: "#334155",
    padding: "8px 16px",
    borderRadius: "8px",
    fontSize: "13px",
    fontWeight: "600",
    cursor: "pointer",
  },
  errorAlert: {
    display: "flex",
    alignItems: "center",
    backgroundColor: "#fef2f2",
    color: "#ef4444",
    border: "1px solid #fca5a5",
    padding: "12px 16px",
    borderRadius: "8px",
    fontSize: "14px",
  },
  successAlert: {
    display: "flex",
    alignItems: "center",
    backgroundColor: "#ecfdf5",
    color: "#10b981",
    border: "1px solid #a7f3d0",
    padding: "12px 16px",
    borderRadius: "8px",
    fontSize: "14px",
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
    gap: "20px",
  },
  statCard: {
    backgroundColor: "#ffffff",
    border: "1px solid #e2e8f0",
    borderRadius: "16px",
    padding: "20px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
  },
  statLabel: {
    fontSize: "12px",
    fontWeight: "600",
    color: "#64748b",
    textTransform: "uppercase",
  },
  statValue: {
    fontSize: "28px",
    fontWeight: "700",
    color: "#0f172a",
    margin: "8px 0 4px 0",
  },
  statSub: {
    fontSize: "12px",
    color: "#94a3b8",
  },
  workspace: {
    display: "grid",
    gridTemplateColumns: "2fr 1fr",
    gap: "24px",
  },
  leftCol: {
    backgroundColor: "#ffffff",
    border: "1px solid #e2e8f0",
    borderRadius: "16px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
    overflow: "hidden",
  },
  rightCol: {
    backgroundColor: "#ffffff",
    border: "1px solid #e2e8f0",
    borderRadius: "16px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
    padding: "20px",
    height: "fit-content",
  },
  cardHeaderTitle: {
    padding: "16px 20px",
    borderBottom: "1px solid #e2e8f0",
    backgroundColor: "#f8fafc",
    fontWeight: "700",
    fontSize: "14px",
    color: "#334155",
    display: "flex",
    alignItems: "center",
  },
  loaderContainer: {
    padding: "40px",
    textAlign: "center",
  },
  spinner: {
    width: "30px",
    height: "30px",
    border: "3px solid #f1f5f9",
    borderTop: "3px solid #0f172a",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
    margin: "0 auto",
  },
  emptyState: {
    padding: "40px",
    textAlign: "center",
    color: "#64748b",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  tableWrapper: {
    overflowX: "auto",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    textAlign: "left",
  },
  th: {
    padding: "14px 20px",
    fontSize: "12px",
    fontWeight: "700",
    color: "#64748b",
    textTransform: "uppercase",
    borderBottom: "1px solid #e2e8f0",
  },
  tr: {
    borderBottom: "1px solid #f1f5f9",
  },
  td: {
    padding: "14px 20px",
    fontSize: "14px",
  },
  couponCodeBadge: {
    fontFamily: "monospace",
    fontWeight: "700",
    fontSize: "13px",
    backgroundColor: "#f1f5f9",
    padding: "3px 8px",
    borderRadius: "6px",
    color: "#0f172a",
  },
  discountText: {
    fontWeight: "600",
    color: "#10b981",
  },
  dateCell: {
    display: "flex",
    alignItems: "center",
    fontSize: "13px",
    color: "#475569",
  },
  statusBadge: {
    fontSize: "11px",
    fontWeight: "700",
    padding: "2px 8px",
    borderRadius: "12px",
    textTransform: "uppercase",
  },
  toggleBtn: {
    background: "none",
    border: "none",
    padding: 0,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
  },
  deleteBtn: {
    backgroundColor: "#fef2f2",
    border: "1px solid #fecaca",
    color: "#ef4444",
    padding: "5px",
    borderRadius: "6px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    transition: "background-color 0.15s",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
    marginTop: "16px",
  },
  formGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },
  formRow: {
    display: "flex",
    gap: "12px",
  },
  label: {
    fontSize: "12px",
    fontWeight: "600",
    color: "#475569",
  },
  input: {
    padding: "10px 12px",
    borderRadius: "8px",
    border: "1px solid #cbd5e1",
    fontSize: "14px",
    outline: "none",
  },
  select: {
    padding: "10px 12px",
    borderRadius: "8px",
    border: "1px solid #cbd5e1",
    fontSize: "14px",
    backgroundColor: "white",
    outline: "none",
  },
  inputGroup: {
    display: "flex",
    alignItems: "center",
    position: "relative",
  },
  inputPrefix: {
    position: "absolute",
    left: "12px",
    color: "#64748b",
    fontSize: "14px",
    fontWeight: "500",
  },
  inputSuffix: {
    position: "absolute",
    right: "12px",
    color: "#64748b",
    fontSize: "14px",
    fontWeight: "500",
  },
  inputHelp: {
    fontSize: "11px",
    color: "#94a3b8",
  },
  submitBtn: {
    backgroundColor: "#0f172a",
    color: "white",
    border: "none",
    padding: "12px",
    borderRadius: "8px",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
    boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
    marginTop: "8px",
  },
};
