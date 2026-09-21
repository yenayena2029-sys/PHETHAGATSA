"use client";

import React, { useState, useEffect } from "react";
import { Package, Save, Check, RefreshCw, AlertTriangle, ArrowDown, ArrowUp, ToggleLeft, ToggleRight } from "lucide-react";
import Link from "next/link";

interface ProductItem {
  _id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  isAvailable: boolean;
  images: string[];
}

export default function InventoryDashboard() {
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [editedStock, setEditedStock] = useState<Record<string, number>>({});
  const [editedAvailable, setEditedAvailable] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState("");

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/products");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to fetch products");
      setProducts(data);
    } catch (err: any) {
      setError(err.message || "Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleStockChange = (id: string, val: number) => {
    const newVal = Math.max(0, val);
    setEditedStock(prev => ({ ...prev, [id]: newVal }));
  };

  const handleToggleAvailable = (id: string, currentVal: boolean) => {
    const nextVal = editedAvailable[id] !== undefined ? !editedAvailable[id] : !currentVal;
    setEditedAvailable(prev => ({ ...prev, [id]: nextVal }));
  };

  const handleSaveChanges = async (id: string) => {
    setSaving(id);
    setError("");
    setSuccess(null);

    const product = products.find(p => p._id === id);
    if (!product) return;

    const updatedStock = editedStock[id] !== undefined ? editedStock[id] : product.stock;
    const updatedAvailable = editedAvailable[id] !== undefined ? editedAvailable[id] : product.isAvailable;

    try {
      const res = await fetch(`/api/products/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stock: updatedStock, isAvailable: updatedAvailable }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save stock update");

      // Update local product list
      setProducts(prev => prev.map(p => p._id === id ? { ...p, stock: updatedStock, isAvailable: updatedAvailable } : p));
      
      // Clear edits
      setEditedStock(prev => {
        const copy = { ...prev };
        delete copy[id];
        return copy;
      });
      setEditedAvailable(prev => {
        const copy = { ...prev };
        delete copy[id];
        return copy;
      });

      setSuccess(id);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.message || "Error saving inventory updates");
    } finally {
      setSaving(null);
    }
  };

  const getStockStatus = (stock: number) => {
    if (stock === 0) return { label: "Out of Stock", color: "#ef4444", bg: "#fef2f2" };
    if (stock <= 5) return { label: "Low Stock", color: "#f59e0b", bg: "#fffbeb" };
    return { label: "In Stock", color: "#10b981", bg: "#ecfdf5" };
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h2 style={styles.title}>Inventory Management</h2>
          <p style={styles.subtitle}>Monitor stock levels, toggle product availability, and update quantities inline.</p>
        </div>
        <button onClick={fetchProducts} style={styles.refreshBtn} title="Refresh Products">
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      {error && (
        <div style={styles.errorAlert}>
          <AlertTriangle size={16} style={{ marginRight: 8 }} />
          {error}
        </div>
      )}

      <div style={styles.tableCard}>
        {loading ? (
          <div style={styles.loaderContainer}>
            <div style={styles.spinner}></div>
            <p style={{ marginTop: "12px", color: "#64748b" }}>Loading inventory data...</p>
          </div>
        ) : products.length === 0 ? (
          <div style={styles.emptyState}>
            <Package size={48} style={{ marginBottom: "12px", color: "#cbd5e1" }} />
            <p>No products found in the database.</p>
            <Link href="/admin/products" style={styles.linkButton}>Go to products</Link>
          </div>
        ) : (
          <div style={styles.tableWrapper}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Product Details</th>
                  <th style={styles.th}>Category</th>
                  <th style={styles.th}>Status</th>
                  <th style={styles.th}>Current Stock</th>
                  <th style={styles.th}>Toggle Available</th>
                  <th style={{ ...styles.th, textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((prod) => {
                  const hasEdits = editedStock[prod._id] !== undefined || editedAvailable[prod._id] !== undefined;
                  const currentStock = editedStock[prod._id] !== undefined ? editedStock[prod._id] : prod.stock;
                  const isAvailable = editedAvailable[prod._id] !== undefined ? editedAvailable[prod._id] : prod.isAvailable;
                  const status = getStockStatus(currentStock);

                  return (
                    <tr key={prod._id} style={styles.tr}>
                      <td style={styles.td}>
                        <div style={styles.productCell}>
                          <img src={prod.images?.[0] || "/placeholder.png"} alt={prod.name} style={styles.productImg} />
                          <div>
                            <p style={styles.productName}>{prod.name}</p>
                            <p style={styles.productId}>ID: #{prod._id.substring(prod._id.length - 8)}</p>
                          </div>
                        </div>
                      </td>
                      <td style={styles.td}>
                        <span style={styles.categoryBadge}>{prod.category}</span>
                      </td>
                      <td style={styles.td}>
                        <span style={{ ...styles.statusBadge, color: status.color, backgroundColor: status.bg }}>
                          {status.label}
                        </span>
                      </td>
                      <td style={styles.td}>
                        <div style={styles.stockControl}>
                          <button 
                            onClick={() => handleStockChange(prod._id, currentStock - 1)} 
                            style={styles.stockStepBtn}
                          >
                            <ArrowDown size={14} />
                          </button>
                          <input 
                            type="number" 
                            value={currentStock} 
                            onChange={(e) => handleStockChange(prod._id, parseInt(e.target.value) || 0)} 
                            style={styles.stockInput} 
                          />
                          <button 
                            onClick={() => handleStockChange(prod._id, currentStock + 1)} 
                            style={styles.stockStepBtn}
                          >
                            <ArrowUp size={14} />
                          </button>
                        </div>
                      </td>
                      <td style={styles.td}>
                        <button 
                          onClick={() => handleToggleAvailable(prod._id, prod.isAvailable)} 
                          style={{
                            ...styles.toggleBtn,
                            color: isAvailable ? "#10b981" : "#94a3b8"
                          }}
                        >
                          {isAvailable ? <ToggleRight size={32} /> : <ToggleLeft size={32} />}
                        </button>
                      </td>
                      <td style={{ ...styles.td, textAlign: "right" }}>
                        <div style={{ display: "inline-flex", gap: "8px", alignItems: "center" }}>
                          {success === prod._id && (
                            <span style={styles.saveSuccessMsg}>
                              <Check size={14} style={{ marginRight: 4 }} />
                              Saved
                            </span>
                          )}
                          <button 
                            disabled={!hasEdits || saving === prod._id} 
                            onClick={() => handleSaveChanges(prod._id)} 
                            style={{
                              ...styles.saveBtn,
                              opacity: hasEdits ? 1 : 0.4,
                              cursor: hasEdits ? "pointer" : "not-allowed"
                            }}
                          >
                            {saving === prod._id ? "Saving..." : "Save"}
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
    transition: "background-color 0.15s",
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
  tableCard: {
    backgroundColor: "#ffffff",
    border: "1px solid #e2e8f0",
    borderRadius: "16px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
    overflow: "hidden",
  },
  loaderContainer: {
    padding: "60px",
    textAlign: "center",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  spinner: {
    width: "36px",
    height: "36px",
    border: "3px solid #f1f5f9",
    borderTop: "3px solid #0f172a",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
  },
  emptyState: {
    padding: "60px",
    textAlign: "center",
    color: "#64748b",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  linkButton: {
    marginTop: "16px",
    display: "inline-flex",
    backgroundColor: "#0f172a",
    color: "white",
    padding: "8px 16px",
    borderRadius: "6px",
    fontSize: "13px",
    fontWeight: "600",
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
    borderBottom: "1px solid #e2e8f0",
    padding: "16px 20px",
    fontSize: "12px",
    fontWeight: "700",
    color: "#64748b",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    backgroundColor: "#f8fafc",
  },
  tr: {
    borderBottom: "1px solid #f1f5f9",
    transition: "background-color 0.15s",
  },
  td: {
    padding: "16px 20px",
    fontSize: "14px",
    verticalAlign: "middle",
  },
  productCell: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  productImg: {
    width: "44px",
    height: "44px",
    objectFit: "cover",
    borderRadius: "6px",
    border: "1px solid #e2e8f0",
  },
  productName: {
    fontWeight: "600",
    color: "#0f172a",
  },
  productId: {
    fontSize: "11px",
    color: "#94a3b8",
    fontFamily: "monospace",
  },
  categoryBadge: {
    fontSize: "12px",
    fontWeight: "500",
    color: "#475569",
    backgroundColor: "#f1f5f9",
    padding: "2px 8px",
    borderRadius: "6px",
  },
  statusBadge: {
    fontSize: "11px",
    fontWeight: "700",
    padding: "3px 8px",
    borderRadius: "12px",
    textTransform: "uppercase",
  },
  stockControl: {
    display: "flex",
    alignItems: "center",
    border: "1px solid #cbd5e1",
    borderRadius: "6px",
    width: "fit-content",
    overflow: "hidden",
  },
  stockStepBtn: {
    backgroundColor: "#f8fafc",
    border: "none",
    padding: "6px 8px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    color: "#64748b",
  },
  stockInput: {
    width: "50px",
    border: "none",
    borderLeft: "1px solid #cbd5e1",
    borderRight: "1px solid #cbd5e1",
    textAlign: "center",
    fontSize: "13px",
    fontWeight: "600",
    outline: "none",
    padding: "4px 0",
  },
  toggleBtn: {
    background: "none",
    border: "none",
    padding: 0,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
  },
  saveBtn: {
    backgroundColor: "#0f172a",
    color: "white",
    border: "none",
    padding: "6px 14px",
    borderRadius: "6px",
    fontSize: "12px",
    fontWeight: "700",
    cursor: "pointer",
    boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
  },
  saveSuccessMsg: {
    fontSize: "12px",
    color: "#10b981",
    fontWeight: "600",
    display: "flex",
    alignItems: "center",
  },
};
