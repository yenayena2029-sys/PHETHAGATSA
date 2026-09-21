"use client";

import React, { useState, useEffect, useRef } from "react";
import { Bell, Package, Check, ExternalLink, RefreshCw } from "lucide-react";
import Link from "next/link";

interface Order {
  _id: string;
  customer: {
    name: string;
    email: string;
  };
  total: number;
  createdAt: string;
}

export default function HeaderNotifications() {
  const [unseenOrders, setUnseenOrders] = useState<Order[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/notifications");
      if (res.ok) {
        const data = await res.json();
        setUnseenOrders(data);
      }
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();

    // Poll every 30 seconds for new orders
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleMarkAsSeen = async (id?: string) => {
    try {
      const res = await fetch("/api/admin/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(id ? { orderIds: [id] } : {}),
      });

      if (res.ok) {
        if (id) {
          setUnseenOrders(prev => prev.filter(order => order._id !== id));
        } else {
          setUnseenOrders([]);
        }
      }
    } catch (error) {
      console.error("Failed to mark notifications as seen:", error);
    }
  };

  return (
    <div ref={dropdownRef} style={styles.container}>
      {/* Bell Icon Trigger */}
      <button onClick={() => setIsOpen(!isOpen)} style={styles.bellButton}>
        <Bell size={20} />
        {unseenOrders.length > 0 && (
          <span style={styles.badge}>{unseenOrders.length}</span>
        )}
      </button>

      {/* Floating Dropdown Card */}
      {isOpen && (
        <div style={styles.dropdown}>
          <div style={styles.header}>
            <h4 style={styles.headerTitle}>New Orders</h4>
            <div style={styles.headerActions}>
              <button 
                onClick={fetchNotifications} 
                disabled={loading} 
                style={styles.iconBtn} 
                title="Refresh"
              >
                <RefreshCw size={12} className={loading ? "animate-spin" : ""} style={{ animation: loading ? "spin 1s linear infinite" : "none" }} />
              </button>
              {unseenOrders.length > 0 && (
                <button onClick={() => handleMarkAsSeen()} style={styles.markAllBtn}>
                  Mark all as read
                </button>
              )}
            </div>
          </div>

          <div style={styles.list}>
            {unseenOrders.length === 0 ? (
              <div style={styles.emptyState}>
                <Package size={28} color="#94a3b8" style={{ marginBottom: 8 }} />
                <p style={styles.emptyText}>No new unseen orders.</p>
              </div>
            ) : (
              unseenOrders.map((order) => (
                <div key={order._id} style={styles.item}>
                  <div style={styles.itemContent}>
                    <div style={styles.itemTitleRow}>
                      <span style={styles.orderRef}>
                        #{order._id.substring(order._id.length - 6).toUpperCase()}
                      </span>
                      <span style={styles.orderTotal}>
                        ${order.total.toFixed(2)}
                      </span>
                    </div>
                    <div style={styles.itemMeta}>
                      <span style={styles.customerName}>{order.customer.name}</span>
                      <span style={styles.dot}>•</span>
                      <span style={styles.timeText}>
                        {new Date(order.createdAt).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                  <div style={styles.itemActions}>
                    <Link 
                      href="/admin/orders" 
                      onClick={() => {
                        handleMarkAsSeen(order._id);
                        setIsOpen(false);
                      }} 
                      style={styles.actionBtn}
                      title="View Orders"
                    >
                      <ExternalLink size={14} />
                    </Link>
                    <button 
                      onClick={() => handleMarkAsSeen(order._id)} 
                      style={{ ...styles.actionBtn, color: "#10b981" }}
                      title="Mark as read"
                    >
                      <Check size={14} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          <div style={styles.footer}>
            <Link 
              href="/admin/orders" 
              onClick={() => setIsOpen(false)} 
              style={styles.viewAllLink}
            >
              Go to Orders Log
            </Link>
          </div>
        </div>
      )}

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
  container: {
    position: "relative",
    display: "inline-block",
  },
  bellButton: {
    backgroundColor: "transparent",
    border: "none",
    color: "#64748b",
    position: "relative",
    padding: "8px",
    borderRadius: "50%",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "background-color 0.2s",
    outline: "none",
  },
  badge: {
    position: "absolute",
    top: "2px",
    right: "2px",
    backgroundColor: "#ef4444",
    color: "white",
    fontSize: "9px",
    fontWeight: "700",
    borderRadius: "10px",
    padding: "2px 5px",
    minWidth: "16px",
    textAlign: "center",
    boxShadow: "0 0 0 2px white",
  },
  dropdown: {
    position: "absolute",
    right: 0,
    marginTop: "12px",
    width: "320px",
    backgroundColor: "#ffffff",
    borderRadius: "12px",
    border: "1px solid #e2e8f0",
    boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.05)",
    zIndex: 1000,
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
    fontFamily: "'Outfit', 'Inter', sans-serif",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "12px 16px",
    borderBottom: "1px solid #f1f5f9",
    backgroundColor: "#f8fafc",
  },
  headerTitle: {
    margin: 0,
    fontSize: "14px",
    fontWeight: "700",
    color: "#0f172a",
  },
  headerActions: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  markAllBtn: {
    background: "none",
    border: "none",
    color: "#6366f1",
    fontSize: "11px",
    fontWeight: "600",
    cursor: "pointer",
    padding: 0,
    outline: "none",
  },
  iconBtn: {
    background: "none",
    border: "none",
    color: "#94a3b8",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "2px",
  },
  list: {
    maxHeight: "260px",
    overflowY: "auto",
    display: "flex",
    flexDirection: "column",
  },
  emptyState: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "32px 16px",
    textAlign: "center",
  },
  emptyText: {
    margin: 0,
    fontSize: "12px",
    color: "#64748b",
  },
  item: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "12px 16px",
    borderBottom: "1px solid #f1f5f9",
    transition: "background-color 0.15s ease",
    gap: "12px",
  },
  itemContent: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    gap: "4px",
    textAlign: "left",
  },
  itemTitleRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  orderRef: {
    fontSize: "13px",
    fontWeight: "700",
    color: "#1e293b",
    fontFamily: "monospace",
  },
  orderTotal: {
    fontSize: "13px",
    fontWeight: "700",
    color: "#0f172a",
  },
  itemMeta: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    fontSize: "11px",
    color: "#64748b",
  },
  customerName: {
    fontWeight: "500",
  },
  dot: {
    color: "#cbd5e1",
  },
  timeText: {
    color: "#94a3b8",
  },
  itemActions: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  actionBtn: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "26px",
    height: "26px",
    borderRadius: "6px",
    border: "1px solid #e2e8f0",
    backgroundColor: "#ffffff",
    color: "#475569",
    cursor: "pointer",
    transition: "all 0.15s ease",
  },
  footer: {
    padding: "10px 16px",
    borderTop: "1px solid #f1f5f9",
    backgroundColor: "#f8fafc",
    textAlign: "center",
  },
  viewAllLink: {
    fontSize: "12px",
    fontWeight: "600",
    color: "#475569",
    textDecoration: "none",
  },
};
