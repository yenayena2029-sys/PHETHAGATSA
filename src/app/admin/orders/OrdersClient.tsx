"use client";

import React, { useState } from "react";
import { Eye, X } from "lucide-react";

interface Customer {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  postalCode?: string;
  country?: string;
}

interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  size?: string;
  color?: string;
  image: string;
}

interface Order {
  _id: string;
  customer: Customer;
  items: OrderItem[];
  subtotal: number;
  shippingCost: number;
  total: number;
  orderStatus: string;
  paymentStatus: string;
  paymentMethod: string;
  createdAt: string;
}

interface OrdersClientProps {
  initialOrders: Order[];
  currency: string;
}

export default function OrdersClient({ initialOrders, currency }: OrdersClientProps) {
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState<string | null>(null);

  const handleStatusChange = async (id: string, field: "orderStatus" | "paymentStatus", value: string) => {
    setLoading(id);
    try {
      const res = await fetch(`/api/orders/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [field]: value }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update order");

      setOrders(orders.map((o) => (o._id === id ? data : o)));
      if (selectedOrder && selectedOrder._id === id) {
        setSelectedOrder(data);
      }
    } catch (err: any) {
      alert(err.message || "Something went wrong");
    } finally {
      setLoading(null);
    }
  };

  const openDetailsModal = (order: Order) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  return (
    <div style={styles.container}>
      <div>
        <h2 style={styles.title}>Orders Management</h2>
        <p style={styles.subtitle}>Review orders, update fulfillment status, and track sales receipts.</p>
      </div>

      {/* Orders Table */}
      <div style={styles.tableCard}>
        {orders.length === 0 ? (
          <div style={styles.emptyState}>
            <p>No orders recorded in the system.</p>
          </div>
        ) : (
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Order ID</th>
                <th style={styles.th}>Customer</th>
                <th style={styles.th}>Method</th>
                <th style={styles.th}>Total</th>
                <th style={styles.th}>Payment Status</th>
                <th style={styles.th}>Shipping Status</th>
                <th style={styles.th}>Date</th>
                <th style={styles.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order._id} style={styles.tr}>
                  <td style={styles.td}>#{order._id.substring(order._id.length - 8)}</td>
                  <td style={styles.td}>
                    <p style={styles.customerName}>{order.customer.name}</p>
                    <p style={styles.customerEmail}>{order.customer.email}</p>
                  </td>
                  <td style={styles.td}>{order.paymentMethod}</td>
                  <td style={styles.td}>{currency}{order.total.toFixed(2)}</td>
                  <td style={styles.td}>
                    <select
                      value={order.paymentStatus}
                      onChange={(e) => handleStatusChange(order._id, "paymentStatus", e.target.value)}
                      disabled={loading === order._id}
                      style={{
                        ...styles.statusSelect,
                        backgroundColor: order.paymentStatus === "paid" ? "#ecfdf5" : "#fef2f2",
                        color: order.paymentStatus === "paid" ? "#047857" : "#b91c1c",
                      }}
                    >
                      <option value="unpaid">Unpaid</option>
                      <option value="paid">Paid</option>
                    </select>
                  </td>
                  <td style={styles.td}>
                    <select
                      value={order.orderStatus}
                      onChange={(e) => handleStatusChange(order._id, "orderStatus", e.target.value)}
                      disabled={loading === order._id}
                      style={styles.statusSelect}
                    >
                      <option value="pending">Pending</option>
                      <option value="processing">Processing</option>
                      <option value="shipped">Shipped</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </td>
                  <td style={styles.td}>{new Date(order.createdAt).toLocaleDateString()}</td>
                  <td style={styles.td}>
                    <button onClick={() => openDetailsModal(order)} style={styles.actionBtn}>
                      <Eye size={16} color="#64748b" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Details Modal */}
      {isModalOpen && selectedOrder && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalCard}>
            <div style={styles.modalHeader}>
              <h3>Order Details: #{selectedOrder._id.substring(selectedOrder._id.length - 8)}</h3>
              <button onClick={() => setIsModalOpen(false)} style={styles.closeBtn}>
                <X size={20} />
              </button>
            </div>

            <div style={styles.modalBody}>
              {/* Shipping Block */}
              <div style={styles.infoGrid}>
                <div style={styles.infoBlock}>
                  <h4 style={styles.blockTitle}>Shipping Address</h4>
                  <p style={styles.blockText}>{selectedOrder.customer.name}</p>
                  <p style={styles.blockText}>{selectedOrder.customer.address}</p>
                  <p style={styles.blockText}>
                    {selectedOrder.customer.city}
                    {selectedOrder.customer.postalCode ? `, ${selectedOrder.customer.postalCode}` : ""}
                  </p>
                  {selectedOrder.customer.country && (
                    <p style={styles.blockText}>{selectedOrder.customer.country}</p>
                  )}
                  <p style={styles.blockText}>Phone: {selectedOrder.customer.phone}</p>
                  <p style={styles.blockText}>Email: {selectedOrder.customer.email}</p>
                </div>

                <div style={styles.infoBlock}>
                  <h4 style={styles.blockTitle}>Order Information</h4>
                  <p style={styles.blockText}><strong>Payment Method:</strong> {selectedOrder.paymentMethod}</p>
                  <p style={styles.blockText}><strong>Payment Status:</strong> {selectedOrder.paymentStatus.toUpperCase()}</p>
                  <p style={styles.blockText}><strong>Fulfillment:</strong> {selectedOrder.orderStatus.toUpperCase()}</p>
                  <p style={styles.blockText}><strong>Date:</strong> {new Date(selectedOrder.createdAt).toLocaleString()}</p>
                </div>
              </div>

              {/* Items List */}
              <h4 style={{ ...styles.blockTitle, margin: "20px 0 10px" }}>Ordered Items</h4>
              <div style={styles.itemsList}>
                {selectedOrder.items.map((item, index) => (
                  <div key={index} style={styles.itemRow}>
                    <img src={item.image} alt={item.name} style={styles.itemImg} />
                    <div style={{ flex: 1 }}>
                      <h5 style={styles.itemName}>{item.name}</h5>
                      <p style={styles.itemSpec}>
                        Size: {item.color ? `${item.color} - ` : ""}{item.size || "N/A"}
                      </p>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <p style={styles.itemQty}>Qty: {item.quantity}</p>
                      <p style={styles.itemName}>{currency}{(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>

              <hr style={styles.divider} />

              {/* Pricing */}
              <div style={styles.billing}>
                <div style={styles.billRow}>
                  <span>Subtotal</span>
                  <span>{currency}{selectedOrder.subtotal.toFixed(2)}</span>
                </div>
                <div style={styles.billRow}>
                  <span>Shipping Cost</span>
                  <span>{selectedOrder.shippingCost === 0 ? "Free" : `${currency}${selectedOrder.shippingCost.toFixed(2)}`}</span>
                </div>
                <div style={styles.totalRow}>
                  <span>Total</span>
                  <span>{currency}{selectedOrder.total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: "flex",
    flexDirection: "column",
    gap: "24px",
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
  tableCard: {
    backgroundColor: "#ffffff",
    borderRadius: "16px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
    border: "1px solid #e2e8f0",
    overflowX: "auto",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    textAlign: "left",
  },
  th: {
    borderBottom: "1px solid #e2e8f0",
    padding: "14px 20px",
    fontSize: "12px",
    fontWeight: "700",
    color: "#64748b",
    textTransform: "uppercase",
  },
  tr: {
    borderBottom: "1px solid #f1f5f9",
    transition: "background-color 0.2s",
  },
  td: {
    padding: "14px 20px",
    fontSize: "14px",
    color: "#475569",
    verticalAlign: "middle",
  },
  customerName: {
    fontWeight: "600",
    color: "#0f172a",
  },
  customerEmail: {
    fontSize: "12px",
    color: "#64748b",
  },
  statusSelect: {
    padding: "6px 12px",
    borderRadius: "20px",
    fontSize: "13px",
    fontWeight: "600",
    border: "1px solid #cbd5e1",
    backgroundColor: "#f8fafc",
    outline: "none",
    cursor: "pointer",
  },
  actionBtn: {
    padding: "6px",
    borderRadius: "4px",
    backgroundColor: "#f8fafc",
    border: "1px solid #e2e8f0",
  },
  emptyState: {
    padding: "60px",
    textAlign: "center",
    color: "#64748b",
  },
  modalOverlay: {
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
    zIndex: 999,
  },
  modalCard: {
    backgroundColor: "white",
    borderRadius: "16px",
    maxWidth: "600px",
    width: "100%",
    boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)",
    maxHeight: "90vh",
    display: "flex",
    flexDirection: "column",
  },
  modalHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "20px 24px",
    borderBottom: "1px solid #e2e8f0",
  },
  closeBtn: {
    color: "#94a3b8",
  },
  modalBody: {
    padding: "24px",
    overflowY: "auto",
  },
  infoGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "20px",
    marginBottom: "20px",
  },
  infoBlock: {
    padding: "16px",
    backgroundColor: "#f8fafc",
    border: "1px solid #e2e8f0",
    borderRadius: "8px",
  },
  blockTitle: {
    fontSize: "13px",
    fontWeight: "700",
    color: "#0f172a",
    textTransform: "uppercase",
    marginBottom: "10px",
  },
  blockText: {
    fontSize: "12px",
    color: "#475569",
    marginBottom: "4px",
    lineHeight: "1.4",
  },
  itemsList: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  itemRow: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "8px 0",
  },
  itemImg: {
    width: "40px",
    height: "48px",
    borderRadius: "4px",
    objectFit: "cover",
    backgroundColor: "#f1f5f9",
  },
  itemName: {
    fontSize: "13px",
    fontWeight: "600",
    color: "#0f172a",
  },
  itemSpec: {
    fontSize: "11px",
    color: "#64748b",
  },
  itemQty: {
    fontSize: "11px",
    color: "#64748b",
  },
  divider: {
    border: 0,
    borderTop: "1px solid #e2e8f0",
    margin: "16px 0",
  },
  billing: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  billRow: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: "13px",
    color: "#64748b",
  },
  totalRow: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: "15px",
    fontWeight: "700",
    color: "#0f172a",
    borderTop: "1px solid #e2e8f0",
    paddingTop: "8px",
    marginTop: "4px",
  },
};
