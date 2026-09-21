"use client";

import React, { useState } from "react";
import { DollarSign, RotateCcw, TrendingUp, Search, AlertCircle, CheckCircle2, Loader2 } from "lucide-react";

interface Customer {
  name: string;
  email: string;
}

interface Order {
  _id: string;
  customer: Customer;
  total: number;
  paymentStatus: string;
  orderStatus: string;
  paymentMethod: string;
  createdAt: string;
}

interface RefundsClientProps {
  initialOrders: Order[];
  currency: string;
}

export default function RefundsClient({ initialOrders, currency }: RefundsClientProps) {
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [searchQuery, setSearchQuery] = useState("");
  const [loadingId, setLoadingId] = useState<string | null>(null);

  // Statistics
  const totalPaid = orders
    .filter(o => o.paymentStatus === "paid")
    .reduce((sum, o) => sum + o.total, 0);

  const totalRefunded = orders
    .filter(o => o.paymentStatus === "refunded")
    .reduce((sum, o) => sum + o.total, 0);

  const refundCount = orders.filter(o => o.paymentStatus === "refunded").length;

  const handleRefund = async (id: string) => {
    if (!window.confirm("Are you sure you want to refund this order? This action will set the payment status to 'refunded' and is irreversible.")) {
      return;
    }

    setLoadingId(id);
    try {
      const res = await fetch(`/api/orders/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentStatus: "refunded" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to issue refund");

      setOrders(orders.map(o => o._id === id ? data : o));
    } catch (err: any) {
      alert(err.message || "Failed to process refund");
    } finally {
      setLoadingId(null);
    }
  };

  const filteredOrders = orders.filter(o =>
    o._id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    o.customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    o.customer.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div style={styles.container}>
      {/* Title */}
      <div style={styles.titleRow}>
        <div>
          <h2 style={styles.title}>Refunds Management</h2>
          <p style={styles.subtitle}>Issue refunds for settled orders, track reverse transactions, and check refund history.</p>
        </div>
        <div style={styles.badge}>
          <RotateCcw size={14} style={{ marginRight: 6 }} />
          Refund Center
        </div>
      </div>

      {/* Stats Cards */}
      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <div style={styles.cardHeader}>
            <div style={{ ...styles.iconContainer, backgroundColor: "rgba(16, 185, 129, 0.08)", border: "1px solid rgba(16, 185, 129, 0.15)" }}>
              <TrendingUp size={20} color="#10b981" />
            </div>
            <span style={styles.successBadge}>Paid</span>
          </div>
          <p style={styles.statLabel}>SETTLED (FULFILLABLE)</p>
          <h3 style={styles.statValue}>{currency}{totalPaid.toLocaleString(undefined, { minimumFractionDigits: 2 })}</h3>
          <p style={styles.statSubText}>Eligible for refund processing</p>
        </div>

        <div style={styles.statCard}>
          <div style={styles.cardHeader}>
            <div style={{ ...styles.iconContainer, backgroundColor: "rgba(239, 68, 68, 0.08)", border: "1px solid rgba(239, 68, 68, 0.15)" }}>
              <RotateCcw size={20} color="#ef4444" />
            </div>
            <span style={styles.dangerBadge}>Refunded</span>
          </div>
          <p style={styles.statLabel}>REFUNDED VOLUME</p>
          <h3 style={styles.statValue}>{currency}{totalRefunded.toLocaleString(undefined, { minimumFractionDigits: 2 })}</h3>
          <p style={styles.statSubText}>{refundCount} total refunded transactions</p>
        </div>
      </div>

      {/* Main Table Section */}
      <div style={styles.tableCard}>
        <div style={styles.tableHeaderRow}>
          <h3 style={styles.tableTitle}>Settled Transactions</h3>
          <div style={styles.searchWrapper}>
            <Search size={16} style={styles.searchIcon} />
            <input
              type="text"
              placeholder="Search by ID or customer..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={styles.searchInput}
            />
          </div>
        </div>

        {filteredOrders.length === 0 ? (
          <div style={styles.emptyState}>
            <AlertCircle size={32} color="#94a3b8" style={{ marginBottom: 12 }} />
            <p style={{ color: "#64748b", margin: 0 }}>No matching transactions found.</p>
          </div>
        ) : (
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Order ID</th>
                <th style={styles.th}>Customer</th>
                <th style={styles.th}>Payment Method</th>
                <th style={styles.th}>Order Status</th>
                <th style={styles.th}>Total Amount</th>
                <th style={styles.th}>Payment Status</th>
                <th style={styles.th}>Date</th>
                <th style={styles.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map(order => (
                <tr key={order._id} style={styles.tr}>
                  <td style={styles.td}>#{order._id.substring(order._id.length - 8)}</td>
                  <td style={styles.td}>
                    <p style={styles.customerName}>{order.customer.name}</p>
                    <p style={styles.customerEmail}>{order.customer.email}</p>
                  </td>
                  <td style={styles.td}>{order.paymentMethod.toUpperCase()}</td>
                  <td style={styles.td}>
                    <span style={{
                      ...styles.statusBadge,
                      backgroundColor: order.orderStatus === "cancelled" ? "#fef2f2" : "#f0fdf4",
                      color: order.orderStatus === "cancelled" ? "#991b1b" : "#166534"
                    }}>
                      {order.orderStatus.toUpperCase()}
                    </span>
                  </td>
                  <td style={styles.td}>{currency}{order.total.toFixed(2)}</td>
                  <td style={styles.td}>
                    <span style={{
                      ...styles.statusBadge,
                      backgroundColor: order.paymentStatus === "refunded" ? "#fff7ed" : "#ecfdf5",
                      color: order.paymentStatus === "refunded" ? "#c2410c" : "#047857"
                    }}>
                      {order.paymentStatus.toUpperCase()}
                    </span>
                  </td>
                  <td style={styles.td}>{new Date(order.createdAt).toLocaleDateString()}</td>
                  <td style={styles.td}>
                    {order.paymentStatus === "refunded" ? (
                      <div style={styles.refundedState}>
                        <CheckCircle2 size={14} color="#10b981" style={{ marginRight: 4 }} />
                        Refunded
                      </div>
                    ) : (
                      <button
                        onClick={() => handleRefund(order._id)}
                        disabled={loadingId === order._id}
                        style={styles.refundBtn}
                      >
                        {loadingId === order._id ? (
                          <Loader2 size={14} className="animate-spin" style={{ marginRight: 6 }} />
                        ) : (
                          <RotateCcw size={14} style={{ marginRight: 6 }} />
                        )}
                        Issue Refund
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: { padding: "24px", display: "flex", flexDirection: "column", gap: "24px", fontFamily: "'Outfit', sans-serif" },
  titleRow: { display: "flex", justifyContent: "space-between", alignItems: "center" },
  title: { fontSize: "24px", fontWeight: "700", color: "#0f172a", margin: 0 },
  subtitle: { fontSize: "14px", color: "#64748b", margin: "4px 0 0 0" },
  badge: { display: "flex", alignItems: "center", backgroundColor: "rgba(99, 102, 241, 0.08)", color: "#6366f1", padding: "8px 16px", borderRadius: "20px", fontSize: "13px", fontWeight: "600" },
  statsGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: "24px" },
  statCard: { backgroundColor: "white", borderRadius: "20px", padding: "24px", border: "1px solid #e2e8f0", boxShadow: "0 1px 3px rgba(0,0,0,0.02)" },
  cardHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" },
  iconContainer: { width: "36px", height: "36px", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center" },
  successBadge: { fontSize: "11px", backgroundColor: "#ecfdf5", color: "#10b981", padding: "2px 8px", borderRadius: "10px", fontWeight: "700" },
  dangerBadge: { fontSize: "11px", backgroundColor: "#fef2f2", color: "#ef4444", padding: "2px 8px", borderRadius: "10px", fontWeight: "700" },
  statLabel: { fontSize: "11px", fontWeight: "700", color: "#94a3b8", letterSpacing: "0.5px", marginBottom: "6px", textAlign: "left" },
  statValue: { fontSize: "24px", fontWeight: "800", color: "#0f172a", margin: 0, textAlign: "left", letterSpacing: "-0.5px" },
  statSubText: { fontSize: "12px", color: "#64748b", marginTop: "8px", textAlign: "left" },
  tableCard: { backgroundColor: "white", borderRadius: "20px", padding: "28px", border: "1px solid #e2e8f0", boxShadow: "0 1px 3px rgba(0,0,0,0.02)" },
  tableHeaderRow: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" },
  tableTitle: { fontSize: "18px", fontWeight: "700", color: "#0f172a", margin: 0 },
  searchWrapper: { position: "relative", width: "240px" },
  searchIcon: { position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#64748b" },
  searchInput: { width: "100%", backgroundColor: "#f8fafc", border: "1px solid #cbd5e1", borderRadius: "8px", padding: "10px 12px 10px 36px", fontSize: "13px", color: "#0f172a", outline: "none" },
  emptyState: { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 20px" },
  table: { width: "100%", borderCollapse: "collapse" },
  th: { textAlign: "left", padding: "12px 16px", fontSize: "13px", fontWeight: "600", color: "#475569", borderBottom: "1px solid #e2e8f0" },
  tr: { borderBottom: "1px solid #f1f5f9", transition: "background-color 0.2s" },
  td: { padding: "16px", fontSize: "14px", color: "#0f172a" },
  customerName: { fontWeight: "600", color: "#1e293b", margin: 0 },
  customerEmail: { fontSize: "12px", color: "#64748b", margin: 0 },
  statusBadge: { display: "inline-block", fontSize: "11px", padding: "3px 8px", borderRadius: "6px", fontWeight: "700" },
  refundedState: { display: "flex", alignItems: "center", fontSize: "13px", color: "#10b981", fontWeight: "600" },
  refundBtn: { display: "inline-flex", alignItems: "center", backgroundColor: "#0f172a", color: "white", padding: "8px 12px", borderRadius: "8px", border: "none", fontSize: "12px", fontWeight: "600", cursor: "pointer", transition: "background-color 0.2s" },
};
