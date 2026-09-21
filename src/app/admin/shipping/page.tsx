"use client";

import React, { useState, useEffect } from "react";
import { PlusCircle, Trash2, Check, RefreshCw, AlertTriangle, Truck, DollarSign, Clock, ToggleLeft, ToggleRight, Settings } from "lucide-react";

interface ShippingMethod {
  _id: string;
  name: string;
  cost: number;
  deliveryTime: string;
  isActive: boolean;
  createdAt: string;
}

export default function ShippingDashboard() {
  const [methods, setMethods] = useState<ShippingMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [currency, setCurrency] = useState("$");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Form State
  const [name, setName] = useState("");
  const [cost, setCost] = useState("");
  const [deliveryTime, setDeliveryTime] = useState("3-5 business days");
  const [isActive, setIsActive] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const fetchMethods = async () => {
    try {
      setLoading(true);
      setError("");

      const settingsRes = await fetch("/api/settings");
      const settingsData = await settingsRes.json();
      if (settingsRes.ok && settingsData?.currency) {
        setCurrency(settingsData.currency);
      }

      const res = await fetch("/api/admin/shipping");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load shipping methods");
      setMethods(data);
    } catch (err: any) {
      setError(err.message || "Failed to fetch shipping methods");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMethods();
  }, []);

  const handleCreateMethod = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || cost === "") {
      setError("Please fill out all required fields.");
      return;
    }

    setSubmitting(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch("/api/admin/shipping", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          cost: Number(cost),
          deliveryTime: deliveryTime.trim(),
          isActive,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create shipping method");

      setMethods(prev => [...prev, data].sort((a, b) => a.cost - b.cost));
      setSuccess("Shipping method successfully created!");
      setName("");
      setCost("");
      setDeliveryTime("3-5 business days");
      setIsActive(true);
      
      setTimeout(() => setSuccess(""), 4000);
    } catch (err: any) {
      setError(err.message || "Error creating shipping method");
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleActive = async (id: string, currentVal: boolean) => {
    try {
      const res = await fetch(`/api/admin/shipping/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !currentVal }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to toggle shipping status");

      setMethods(prev => prev.map(m => m._id === id ? { ...m, isActive: !currentVal } : m));
    } catch (err: any) {
      setError(err.message || "Error updating shipping state");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this shipping method?")) return;

    try {
      const res = await fetch(`/api/admin/shipping/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete shipping method");

      setMethods(prev => prev.filter(m => m._id !== id));
      setSuccess("Shipping carrier profile deleted successfully");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err: any) {
      setError(err.message || "Error deleting shipping method");
    }
  };

  return (
    <div style={styles.container}>
      {/* Header Row */}
      <div style={styles.header}>
        <div>
          <h2 style={styles.title}>Shipping & Carriers</h2>
          <p style={styles.subtitle}>Manage global shipping rates, carriers, and delivery timing windows for storefront checkouts.</p>
        </div>
        <button onClick={fetchMethods} style={styles.refreshBtn}>
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      {/* Message banners */}
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

      {/* Quick stats grid */}
      <div style={styles.statsGrid}>
        <div style={{ ...styles.statCard, borderLeft: "4px solid #3b82f6" }}>
          <span style={styles.statLabel}>Configured Methods</span>
          <h3 style={styles.statValue}>{methods.length}</h3>
          <p style={styles.statSub}>Total options recorded</p>
        </div>
        <div style={{ ...styles.statCard, borderLeft: "4px solid #10b981" }}>
          <span style={styles.statLabel}>Active Carriers</span>
          <h3 style={styles.statValue}>{methods.filter(m => m.isActive).length}</h3>
          <p style={styles.statSub}>Enabled for storefront checkouts</p>
        </div>
        <div style={{ ...styles.statCard, borderLeft: "4px solid #8b5cf6" }}>
          <span style={styles.statLabel}>Flat-Rate Minimum</span>
          <h3 style={styles.statValue}>
            {methods.length > 0 ? `${currency}${Math.min(...methods.map(m => m.cost))}` : "N/A"}
          </h3>
          <p style={styles.statSub}>Cheapest available shipping cost</p>
        </div>
      </div>

      {/* Main Workspace split panel */}
      <div style={styles.workspace}>
        {/* Left Column: Carriers List Table */}
        <div style={styles.leftCol}>
          <div style={styles.cardHeaderTitle}>
            <Truck size={18} style={{ marginRight: 8, color: "#64748b" }} />
            <span>Shipping Channels & Rates</span>
          </div>

          {loading ? (
            <div style={styles.loaderContainer}>
              <div style={styles.spinner}></div>
              <p style={{ marginTop: "12px", color: "#64748b" }}>Fetching rates...</p>
            </div>
          ) : methods.length === 0 ? (
            <div style={styles.emptyState}>
              <Truck size={48} style={{ marginBottom: "12px", color: "#cbd5e1" }} />
              <p>No custom shipping channels defined yet.</p>
            </div>
          ) : (
            <div style={styles.tableWrapper}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Carrier Name</th>
                    <th style={styles.th}>Shipping Cost</th>
                    <th style={styles.th}>Estimated Transit</th>
                    <th style={styles.th}>Checkout Active</th>
                    <th style={{ ...styles.th, textAlign: "right" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {methods.map((method) => (
                    <tr key={method._id} style={styles.tr}>
                      <td style={styles.td}>
                        <span style={styles.methodNameText}>{method.name}</span>
                      </td>
                      <td style={styles.td}>
                        <span style={styles.costValueText}>
                          {method.cost === 0 ? "Free Shipping" : `${currency}${method.cost.toFixed(2)}`}
                        </span>
                      </td>
                      <td style={styles.td}>
                        <div style={styles.transitCell}>
                          <Clock size={13} style={{ marginRight: 4, color: "#64748b" }} />
                          <span>{method.deliveryTime || "Not Specified"}</span>
                        </div>
                      </td>
                      <td style={styles.td}>
                        {method.isActive ? (
                          <span style={{ ...styles.statusBadge, color: "#10b981", backgroundColor: "#ecfdf5" }}>Active</span>
                        ) : (
                          <span style={{ ...styles.statusBadge, color: "#64748b", backgroundColor: "#f1f5f9" }}>Inactive</span>
                        )}
                      </td>
                      <td style={{ ...styles.td, textAlign: "right" }}>
                        <div style={{ display: "inline-flex", gap: "10px", alignItems: "center" }}>
                          <button
                            onClick={() => handleToggleActive(method._id, method.isActive)}
                            style={styles.toggleBtn}
                            title={method.isActive ? "Deactivate option" : "Activate option"}
                          >
                            {method.isActive ? <ToggleRight size={26} color="#10b981" /> : <ToggleLeft size={26} color="#94a3b8" />}
                          </button>
                          <button
                            onClick={() => handleDelete(method._id)}
                            style={styles.deleteBtn}
                            title="Remove carrier"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Right Column: Create Carrier Form */}
        <div style={styles.rightCol}>
          <div style={styles.cardHeaderTitle}>
            <PlusCircle size={18} style={{ marginRight: 8, color: "#64748b" }} />
            <span>Create Carrier Profile</span>
          </div>

          <form onSubmit={handleCreateMethod} style={styles.form}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Carrier Name (Required)</label>
              <input
                type="text"
                placeholder="E.g. DHL Express, Standard Delivery"
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={styles.input}
                required
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Delivery Rate Flat Cost (Required)</label>
              <div style={styles.inputGroup}>
                <span style={styles.inputPrefix}>{currency}</span>
                <input
                  type="number"
                  placeholder="9.99"
                  step="0.01"
                  value={cost}
                  onChange={(e) => setCost(e.target.value)}
                  style={{ ...styles.input, paddingLeft: "26px" }}
                  min="0"
                  required
                />
              </div>
              <span style={styles.helpText}>Enter 0 for Free Shipping options.</span>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Estimated Transit Speed</label>
              <input
                type="text"
                placeholder="E.g. 1-2 business days, 3-5 days"
                value={deliveryTime}
                onChange={(e) => setDeliveryTime(e.target.value)}
                style={styles.input}
              />
            </div>

            <div style={{ ...styles.formGroup, marginTop: "8px" }}>
              <label style={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  style={styles.checkbox}
                />
                <span style={{ fontSize: "14px", fontWeight: "600", color: "#334155" }}>Enable at Checkout</span>
              </label>
              <span style={{ ...styles.helpText, marginLeft: "24px" }}>
                Disabled shipping models are hidden from customers.
              </span>
            </div>

            <button type="submit" disabled={submitting} style={styles.submitBtn}>
              {submitting ? "Saving carrier..." : "Add Shipping Channel"}
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
    verticalAlign: "middle",
  },
  methodNameText: {
    fontWeight: "600",
    color: "#0f172a",
  },
  costValueText: {
    fontWeight: "700",
    color: "#10b981",
  },
  transitCell: {
    display: "flex",
    alignItems: "center",
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
  helpText: {
    fontSize: "11px",
    color: "#94a3b8",
  },
  checkboxLabel: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    cursor: "pointer",
  },
  checkbox: {
    width: "16px",
    height: "16px",
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
