"use client";

import React, { useState } from "react";
import { CheckSquare, Square, Search, AlertCircle, Loader2, Play, CheckCircle2, ShieldAlert } from "lucide-react";

interface Customer {
  name: string;
  email: string;
}

interface Order {
  _id: string;
  customer: Customer;
  total: number;
  orderStatus: string;
  paymentStatus: string;
  paymentMethod: string;
  createdAt: string;
}

interface BatchProcessingClientProps {
  initialOrders: Order[];
  currency: string;
}

export default function BatchProcessingClient({ initialOrders, currency }: BatchProcessingClientProps) {
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");

  const toggleSelect = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = (visibleOrders: Order[]) => {
    const visibleIds = visibleOrders.map(o => o._id);
    const allSelected = visibleIds.every(id => selectedIds.includes(id));

    if (allSelected) {
      setSelectedIds(prev => prev.filter(id => !visibleIds.includes(id)));
    } else {
      setSelectedIds(prev => Array.from(new Set([...prev, ...visibleIds])));
    }
  };

  const handleBatchUpdate = async (field: "orderStatus" | "paymentStatus", value: string) => {
    if (selectedIds.length === 0) return;

    if (!window.confirm(`Are you sure you want to update ${selectedIds.length} orders?`)) {
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/orders/batch", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderIds: selectedIds,
          field,
          value
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to process batch update");

      // Update state
      const updatedMap = new Map<string, Order>(data.orders.map((o: Order) => [o._id, o]));
      setOrders(orders.map(o => updatedMap.has(o._id) ? updatedMap.get(o._id)! : o));
      setSelectedIds([]);
      alert(`Successfully updated ${data.count} orders!`);
    } catch (err: any) {
      alert(err.message || "Failed to update orders");
    } finally {
      setLoading(false);
    }
  };

  // Filter orders by search and status
  const visibleOrders = orders.filter(o => {
    const matchesSearch =
      o._id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.customer.email.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === "all" ||
      o.orderStatus === statusFilter ||
      o.paymentStatus === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const allVisibleSelected = visibleOrders.length > 0 && visibleOrders.every(o => selectedIds.includes(o._id));

  return (
    <div style={styles.container}>
      {/* Title */}
      <div style={styles.titleRow}>
        <div>
          <h2 style={styles.title}>Batch Processing</h2>
          <p style={styles.subtitle}>Modify fulfillment status, trigger bulk cancellations, or settle multiple payment receipts in one action.</p>
        </div>
        <div style={styles.badge}>
          <CheckSquare size={14} style={{ marginRight: 6 }} />
          Bulk Operations
        </div>
      </div>

      {/* Action Bar */}
      <div style={styles.actionBar}>
        <div style={styles.actionSection}>
          <span style={styles.actionLabel}>Bulk Actions ({selectedIds.length} Selected):</span>
          
          {/* Order Status Bulk Actions */}
          <div style={styles.btnGroup}>
            <button
              onClick={() => handleBatchUpdate("orderStatus", "processing")}
              disabled={selectedIds.length === 0 || loading}
              style={styles.actionBtn}
            >
              Mark Processing
            </button>
            <button
              onClick={() => handleBatchUpdate("orderStatus", "shipped")}
              disabled={selectedIds.length === 0 || loading}
              style={styles.actionBtn}
            >
              Mark Shipped
            </button>
            <button
              onClick={() => handleBatchUpdate("orderStatus", "delivered")}
              disabled={selectedIds.length === 0 || loading}
              style={styles.actionBtn}
            >
              Mark Delivered
            </button>
            <button
              onClick={() => handleBatchUpdate("orderStatus", "returned")}
              disabled={selectedIds.length === 0 || loading}
              style={styles.actionBtn}
            >
              Mark Returned
            </button>
            <button
              onClick={() => handleBatchUpdate("orderStatus", "cancelled")}
              disabled={selectedIds.length === 0 || loading}
              style={{ ...styles.actionBtn, backgroundColor: "#fef2f2", color: "#b91c1c", border: "1px solid #fee2e2" }}
            >
              Cancel Selected
            </button>
          </div>

          <div style={styles.separator} />

          {/* Payment Status Bulk Actions */}
          <div style={styles.btnGroup}>
            <button
              onClick={() => handleBatchUpdate("paymentStatus", "paid")}
              disabled={selectedIds.length === 0 || loading}
              style={{ ...styles.actionBtn, borderColor: "#cbd5e1" }}
            >
              Mark Paid
            </button>
            <button
              onClick={() => handleBatchUpdate("paymentStatus", "unpaid")}
              disabled={selectedIds.length === 0 || loading}
              style={{ ...styles.actionBtn, borderColor: "#cbd5e1" }}
            >
              Mark Unpaid
            </button>
            <button
              onClick={() => handleBatchUpdate("paymentStatus", "refunded")}
              disabled={selectedIds.length === 0 || loading}
              style={{ ...styles.actionBtn, borderColor: "#cbd5e1" }}
            >
              Mark Refunded
            </button>
          </div>
        </div>

        {loading && (
          <div style={styles.loaderWrapper}>
            <Loader2 size={16} className="animate-spin" color="#6366f1" style={{ marginRight: 8 }} />
            Processing updates...
          </div>
        )}
      </div>

      {/* Main Table Card */}
      <div style={styles.tableCard}>
        <div style={styles.tableHeaderRow}>
          <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
            <h3 style={styles.tableTitle}>Order Registry</h3>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={styles.filterSelect}
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="returned">Returned</option>
              <option value="cancelled">Cancelled</option>
              <option value="paid">Paid Only</option>
              <option value="unpaid">Unpaid Only</option>
              <option value="refunded">Refunded Only</option>
            </select>
          </div>
          
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

        {visibleOrders.length === 0 ? (
          <div style={styles.emptyState}>
            <AlertCircle size={32} color="#94a3b8" style={{ marginBottom: 12 }} />
            <p style={{ color: "#64748b", margin: 0 }}>No orders match filter criteria.</p>
          </div>
        ) : (
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={{ ...styles.th, width: "40px", paddingRight: 0 }}>
                  <button
                    onClick={() => toggleSelectAll(visibleOrders)}
                    style={styles.checkAllBtn}
                  >
                    {allVisibleSelected ? <CheckSquare size={18} color="#6366f1" /> : <Square size={18} color="#94a3b8" />}
                  </button>
                </th>
                <th style={styles.th}>Order ID</th>
                <th style={styles.th}>Customer</th>
                <th style={styles.th}>Method</th>
                <th style={styles.th}>Total</th>
                <th style={styles.th}>Payment Status</th>
                <th style={styles.th}>Fulfillment Status</th>
                <th style={styles.th}>Date</th>
              </tr>
            </thead>
            <tbody>
              {visibleOrders.map(order => {
                const isSelected = selectedIds.includes(order._id);
                return (
                  <tr
                    key={order._id}
                    style={{
                      ...styles.tr,
                      backgroundColor: isSelected ? "rgba(99, 102, 241, 0.02)" : "transparent"
                    }}
                  >
                    <td style={{ ...styles.td, paddingRight: 0 }}>
                      <button
                        onClick={() => toggleSelect(order._id)}
                        style={styles.checkAllBtn}
                      >
                        {isSelected ? <CheckSquare size={18} color="#6366f1" /> : <Square size={18} color="#cbd5e1" />}
                      </button>
                    </td>
                    <td style={styles.td}>#{order._id.substring(order._id.length - 8)}</td>
                    <td style={styles.td}>
                      <p style={styles.customerName}>{order.customer.name}</p>
                      <p style={styles.customerEmail}>{order.customer.email}</p>
                    </td>
                    <td style={styles.td}>{order.paymentMethod.toUpperCase()}</td>
                    <td style={styles.td}>{currency}{order.total.toFixed(2)}</td>
                    <td style={styles.td}>
                      <span style={{
                        ...styles.statusBadge,
                        backgroundColor: order.paymentStatus === "paid" ? "#ecfdf5" : order.paymentStatus === "refunded" ? "#fff7ed" : "#fef2f2",
                        color: order.paymentStatus === "paid" ? "#047857" : order.paymentStatus === "refunded" ? "#c2410c" : "#b91c1c"
                      }}>
                        {order.paymentStatus.toUpperCase()}
                      </span>
                    </td>
                    <td style={styles.td}>
                      <span style={{
                        ...styles.statusBadge,
                        backgroundColor:
                          order.orderStatus === "delivered" ? "#ecfdf5" :
                          order.orderStatus === "returned" ? "#f5f3ff" :
                          order.orderStatus === "cancelled" ? "#fef2f2" : "#eff6ff",
                        color:
                          order.orderStatus === "delivered" ? "#047857" :
                          order.orderStatus === "returned" ? "#6d28d9" :
                          order.orderStatus === "cancelled" ? "#b91c1c" : "#1d4ed8"
                      }}>
                        {order.orderStatus.toUpperCase()}
                      </span>
                    </td>
                    <td style={styles.td}>{new Date(order.createdAt).toLocaleDateString()}</td>
                  </tr>
                );
              })}
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
  actionBar: { display: "flex", justifyContent: "space-between", alignItems: "center", backgroundColor: "white", padding: "16px 24px", borderRadius: "16px", border: "1px solid #e2e8f0", boxShadow: "0 1px 3px rgba(0,0,0,0.02)", flexWrap: "wrap", gap: "16px" },
  actionSection: { display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap" },
  actionLabel: { fontSize: "13px", fontWeight: "700", color: "#475569" },
  btnGroup: { display: "flex", gap: "8px", flexWrap: "wrap" },
  actionBtn: { backgroundColor: "white", border: "1px solid #cbd5e1", borderRadius: "8px", padding: "8px 12px", fontSize: "12px", fontWeight: "600", color: "#334155", cursor: "pointer", transition: "all 0.2s" },
  separator: { width: "1px", height: "24px", backgroundColor: "#e2e8f0" },
  loaderWrapper: { display: "flex", alignItems: "center", fontSize: "13px", color: "#64748b", fontWeight: "600" },
  tableCard: { backgroundColor: "white", borderRadius: "20px", padding: "28px", border: "1px solid #e2e8f0", boxShadow: "0 1px 3px rgba(0,0,0,0.02)" },
  tableHeaderRow: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "wrap", gap: "12px" },
  tableTitle: { fontSize: "18px", fontWeight: "700", color: "#0f172a", margin: 0 },
  filterSelect: { border: "1px solid #cbd5e1", borderRadius: "8px", padding: "8px 12px", fontSize: "13px", color: "#334155", outline: "none", backgroundColor: "#f8fafc", cursor: "pointer" },
  searchWrapper: { position: "relative", width: "240px" },
  searchIcon: { position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#64748b" },
  searchInput: { width: "100%", backgroundColor: "#f8fafc", border: "1px solid #cbd5e1", borderRadius: "8px", padding: "10px 12px 10px 36px", fontSize: "13px", color: "#0f172a", outline: "none" },
  emptyState: { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 20px" },
  table: { width: "100%", borderCollapse: "collapse" },
  th: { textAlign: "left", padding: "12px 16px", fontSize: "13px", fontWeight: "600", color: "#475569", borderBottom: "1px solid #e2e8f0" },
  tr: { borderBottom: "1px solid #f1f5f9", transition: "background-color 0.2s" },
  td: { padding: "16px", fontSize: "14px", color: "#0f172a" },
  checkAllBtn: { background: "none", border: "none", cursor: "pointer", padding: 0, display: "flex", alignItems: "center" },
  customerName: { fontWeight: "600", color: "#1e293b", margin: 0 },
  customerEmail: { fontSize: "12px", color: "#64748b", margin: 0 },
  statusBadge: { display: "inline-block", fontSize: "11px", padding: "3px 8px", borderRadius: "6px", fontWeight: "700" },
};
