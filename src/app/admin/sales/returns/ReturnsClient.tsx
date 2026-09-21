"use client";

import React, { useState } from "react";
import { RotateCcw, Package, HelpCircle, Search, AlertCircle, CheckCircle2, Loader2, ArrowLeftRight } from "lucide-react";

interface Customer {
  name: string;
  email: string;
}

interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

interface Order {
  _id: string;
  customer: Customer;
  items: OrderItem[];
  total: number;
  orderStatus: string;
  paymentStatus: string;
  createdAt: string;
}

interface ReturnsClientProps {
  initialOrders: Order[];
  currency: string;
}

export default function ReturnsClient({ initialOrders, currency }: ReturnsClientProps) {
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [searchQuery, setSearchQuery] = useState("");
  const [loadingId, setLoadingId] = useState<string | null>(null);

  // Stats
  const activeDeliveredCount = orders.filter(o => o.orderStatus === "delivered").length;
  const returnedCount = orders.filter(o => o.orderStatus === "returned").length;
  const totalRestockedItems = orders
    .filter(o => o.orderStatus === "returned")
    .reduce((sum, o) => sum + o.items.reduce((itemSum, i) => itemSum + i.quantity, 0), 0);

  const handleApproveReturn = async (id: string) => {
    if (!window.confirm("Approve return for this order? This will restock all item quantities back to the product database.")) {
      return;
    }

    setLoadingId(id);
    try {
      const res = await fetch(`/api/orders/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderStatus: "returned" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update return status");

      setOrders(orders.map(o => o._id === id ? data : o));
    } catch (err: any) {
      alert(err.message || "Failed to process return");
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
          <h2 style={styles.title}>Returns & Restocking</h2>
          <p style={styles.subtitle}>Audit customer return requests, approve item restocks, and monitor reverse inventory logistics.</p>
        </div>
        <div style={styles.badge}>
          <ArrowLeftRight size={14} style={{ marginRight: 6 }} />
          Returns Desk
        </div>
      </div>

      {/* Stats Cards */}
      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <div style={styles.cardHeader}>
            <div style={{ ...styles.iconContainer, backgroundColor: "rgba(99, 102, 241, 0.08)", border: "1px solid rgba(99, 102, 241, 0.15)" }}>
              <Package size={20} color="#6366f1" />
            </div>
            <span style={styles.activeBadge}>Delivered</span>
          </div>
          <p style={styles.statLabel}>ELIGIBLE ORDERS</p>
          <h3 style={styles.statValue}>{activeDeliveredCount} Orders</h3>
          <p style={styles.statSubText}>Delivered products awaiting audit</p>
        </div>

        <div style={styles.statCard}>
          <div style={styles.cardHeader}>
            <div style={{ ...styles.iconContainer, backgroundColor: "rgba(16, 185, 129, 0.08)", border: "1px solid rgba(16, 185, 129, 0.15)" }}>
              <RotateCcw size={20} color="#10b981" />
            </div>
            <span style={styles.successBadge}>Returned</span>
          </div>
          <p style={styles.statLabel}>RESTOCKED ORDERS</p>
          <h3 style={styles.statValue}>{returnedCount} Returned</h3>
          <p style={styles.statSubText}>{totalRestockedItems} catalog items restocked</p>
        </div>
      </div>

      {/* Main Table Section */}
      <div style={styles.tableCard}>
        <div style={styles.tableHeaderRow}>
          <h3 style={styles.tableTitle}>Returns Registry</h3>
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
            <p style={{ color: "#64748b", margin: 0 }}>No matching returns records.</p>
          </div>
        ) : (
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Order ID</th>
                <th style={styles.th}>Customer</th>
                <th style={styles.th}>Returned Items</th>
                <th style={styles.th}>Refund Total</th>
                <th style={styles.th}>Fulfillment Status</th>
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
                  <td style={styles.td}>
                    <div style={styles.itemsColumn}>
                      {order.items.map((item, idx) => (
                        <div key={idx} style={styles.itemRow}>
                          <img src={item.image || "/images/placeholder.png"} alt={item.name} style={styles.itemImg} />
                          <div>
                            <p style={styles.itemName}>{item.name}</p>
                            <p style={styles.itemMeta}>Qty: {item.quantity} • {currency}{item.price}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </td>
                  <td style={styles.td}>{currency}{order.total.toFixed(2)}</td>
                  <td style={styles.td}>
                    <span style={{
                      ...styles.statusBadge,
                      backgroundColor: order.orderStatus === "returned" ? "#ecfdf5" : order.orderStatus === "cancelled" ? "#fef2f2" : "#f0fdf4",
                      color: order.orderStatus === "returned" ? "#047857" : order.orderStatus === "cancelled" ? "#991b1b" : "#15803d"
                    }}>
                      {order.orderStatus.toUpperCase()}
                    </span>
                  </td>
                  <td style={styles.td}>{new Date(order.createdAt).toLocaleDateString()}</td>
                  <td style={styles.td}>
                    {order.orderStatus === "returned" ? (
                      <div style={styles.completedState}>
                        <CheckCircle2 size={14} color="#10b981" style={{ marginRight: 4 }} />
                        Restocked
                      </div>
                    ) : order.orderStatus === "cancelled" ? (
                      <div style={styles.cancelledState}>Cancelled</div>
                    ) : (
                      <button
                        onClick={() => handleApproveReturn(order._id)}
                        disabled={loadingId === order._id}
                        style={styles.approveBtn}
                      >
                        {loadingId === order._id ? (
                          <Loader2 size={14} className="animate-spin" style={{ marginRight: 6 }} />
                        ) : (
                          <RotateCcw size={14} style={{ marginRight: 6 }} />
                        )}
                        Approve Return
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
  activeBadge: { fontSize: "11px", backgroundColor: "#f5f3ff", color: "#8b5cf6", padding: "2px 8px", borderRadius: "10px", fontWeight: "700" },
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
  itemsColumn: { display: "flex", flexDirection: "column", gap: "8px" },
  itemRow: { display: "flex", alignItems: "center", gap: "8px" },
  itemImg: { width: "32px", height: "40px", objectFit: "cover", borderRadius: "4px", backgroundColor: "#f1f5f9" },
  itemName: { fontSize: "13px", fontWeight: "600", color: "#1e293b", margin: 0 },
  itemMeta: { fontSize: "11px", color: "#64748b", margin: 0 },
  statusBadge: { display: "inline-block", fontSize: "11px", padding: "3px 8px", borderRadius: "6px", fontWeight: "700" },
  completedState: { display: "flex", alignItems: "center", fontSize: "13px", color: "#10b981", fontWeight: "600" },
  cancelledState: { fontSize: "13px", color: "#94a3b8", fontWeight: "600" },
  approveBtn: { display: "inline-flex", alignItems: "center", backgroundColor: "#0f172a", color: "white", padding: "8px 12px", borderRadius: "8px", border: "none", fontSize: "12px", fontWeight: "600", cursor: "pointer", transition: "background-color 0.2s" },
};
