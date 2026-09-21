"use client";

import React, { useState, useEffect } from "react";
import { Sparkles, Layers, Plus, Tag, Search, ToggleLeft, ToggleRight, Trash2 } from "lucide-react";

export default function AdminBundlesPage() {
  const [bundles, setBundles] = useState<any[]>([]);
  const [newBundleName, setNewBundleName] = useState("");
  const [discountVal, setDiscountVal] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBundles();
  }, []);

  const fetchBundles = async () => {
    try {
      const res = await fetch("/api/admin/bundles");
      const data = await res.json();
      if (res.ok) {
        setBundles(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleAddBundle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBundleName.trim()) return;

    try {
      const res = await fetch("/api/admin/bundles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newBundleName.trim(),
          discount: Number(discountVal),
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setBundles([data, ...bundles]);
        setNewBundleName("");
      }
    } catch (e) {
      console.error(e);
    }
  };

  const toggleBundle = async (id: string) => {
    const bundle = bundles.find(b => b._id === id);
    if (!bundle) return;

    const newStatus = bundle.status === "Active" ? "Draft" : "Active";
    try {
      const res = await fetch(`/api/admin/bundles/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setBundles(bundles.map(b => b._id === id ? { ...b, status: newStatus } : b));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const deleteBundle = async (id: string) => {
    if (!confirm("Are you sure you want to delete this bundle?")) return;
    try {
      const res = await fetch(`/api/admin/bundles/${id}`, { method: "DELETE" });
      if (res.ok) {
        setBundles(bundles.filter(b => b._id !== id));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const filteredBundles = bundles.filter(b => b.name.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div style={styles.container}>
      <div style={styles.titleRow}>
        <div>
          <h2 style={styles.title}>Product Bundles</h2>
          <p style={styles.subtitle}>Combine multiple products together at discounted packages to boost sales velocity.</p>
        </div>
        <div style={styles.badge}>
          <Sparkles size={14} style={{ marginRight: 6 }} />
          {bundles.length} Bundle Promo Packages
        </div>
      </div>

      <div style={styles.grid}>
        <div style={styles.card}>
          <h3 style={styles.cardTitle}>Add Promo Bundle</h3>
          <p style={styles.cardSub}>Bundle products together with a dedicated percentage discount.</p>
          <form onSubmit={handleAddBundle} style={styles.form}>
            <div style={styles.inputGroup}>
              <label style={styles.inputLabel}>Bundle Name</label>
              <input
                type="text"
                placeholder="e.g. Back to School Pack"
                value={newBundleName}
                onChange={(e) => setNewBundleName(e.target.value)}
                required
                style={styles.textInput}
              />
            </div>
            <div style={styles.inputGroup}>
              <label style={styles.inputLabel}>Discount Percentage (%)</label>
              <input
                type="number"
                min={1}
                max={90}
                value={discountVal}
                onChange={(e) => setDiscountVal(Number(e.target.value))}
                required
                style={styles.textInput}
              />
            </div>
            <button type="submit" style={styles.btn}>
              <Plus size={16} style={{ marginRight: 8 }} /> Create Bundle
            </button>
          </form>
        </div>

        <div style={styles.card}>
          <div style={styles.listHeader}>
            <h3 style={styles.cardTitle}>Active Promotions</h3>
            <div style={styles.searchWrapper}>
              <Search size={16} style={styles.searchIcon} />
              <input
                type="text"
                placeholder="Search packages..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={styles.searchInput}
              />
            </div>
          </div>

          <div style={styles.list}>
            {filteredBundles.map((b) => (
              <div key={b._id} style={{ ...styles.row, opacity: b.status === "Active" ? 1 : 0.7 }}>
                <div style={styles.rowInfo}>
                  <div style={styles.avatar}>
                    <Layers size={16} color="#6366f1" />
                  </div>
                  <div>
                    <div style={styles.catName}>
                      {b.name} <span style={styles.discountBadge}>{b.discount}% OFF</span>
                    </div>
                    <div style={styles.catSlug}>{b.itemsCount} Items included • Price: ${b.price?.toFixed(2) || "0.00"}</div>
                  </div>
                </div>
                <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                  <button onClick={() => toggleBundle(b._id)} style={{ background: "none", border: "none", cursor: "pointer", color: b.status === "Active" ? "#10b981" : "#94a3b8" }}>
                    {b.status === "Active" ? <ToggleRight size={24} /> : <ToggleLeft size={24} />}
                  </button>
                  <button onClick={() => deleteBundle(b._id)} style={styles.deleteBtn}>
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
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
  grid: { display: "grid", gridTemplateColumns: "1fr 1.5fr", gap: "24px", alignItems: "start" },
  card: { backgroundColor: "white", borderRadius: "16px", padding: "24px", border: "1px solid #e2e8f0", boxShadow: "0 1px 3px rgba(0,0,0,0.02)" },
  cardTitle: { fontSize: "18px", fontWeight: "700", color: "#0f172a", margin: 0 },
  cardSub: { fontSize: "13px", color: "#64748b", margin: "4px 0 20px 0" },
  form: { display: "flex", flexDirection: "column", gap: "16px" },
  inputGroup: { display: "flex", flexDirection: "column", gap: "6px" },
  inputLabel: { fontSize: "13px", fontWeight: "600", color: "#475569" },
  textInput: { padding: "10px 12px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "14px", color: "#0f172a", outline: "none" },
  btn: { backgroundColor: "#0f172a", color: "white", padding: "10px 14px", borderRadius: "8px", border: "none", fontWeight: "600", fontSize: "14px", cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center" },
  listHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" },
  searchWrapper: { position: "relative", width: "180px" },
  searchIcon: { position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", color: "#64748b" },
  searchInput: { width: "100%", backgroundColor: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "8px", padding: "8px 10px 8px 32px", fontSize: "13px", color: "#0f172a", outline: "none" },
  list: { display: "flex", flexDirection: "column", gap: "10px" },
  row: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", backgroundColor: "#f8fafc", border: "1px solid #f1f5f9", borderRadius: "10px" },
  rowInfo: { display: "flex", alignItems: "center", gap: "12px" },
  avatar: { width: "32px", height: "32px", borderRadius: "8px", backgroundColor: "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center" },
  catName: { fontSize: "14px", fontWeight: "600", color: "#0f172a", display: "flex", alignItems: "center", gap: "8px" },
  discountBadge: { fontSize: "10px", backgroundColor: "#ef4444", color: "white", padding: "2px 6px", borderRadius: "4px", fontWeight: "700" },
  catSlug: { fontSize: "12px", color: "#94a3b8" },
  deleteBtn: { background: "none", border: "none", color: "#cbd5e1", cursor: "pointer", padding: "6px", borderRadius: "6px" },
};
