"use client";

import React, { useState, useEffect } from "react";
import { Plus, Search, Sparkles, Trash2, Ruler } from "lucide-react";

export default function AdminSizesPage() {
  const [sizes, setSizes] = useState<any[]>([]);
  const [sizeLabel, setSizeLabel] = useState("");
  const [sizeName, setSizeName] = useState("");
  const [sizeCategory, setSizeCategory] = useState("Apparel");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchSizes = async () => {
    try {
      const res = await fetch("/api/admin/products/sizes");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to fetch sizes");
      setSizes(data);
    } catch (err: any) {
      setError(err.message || "Failed to load sizes");
    }
  };

  useEffect(() => {
    fetchSizes();
  }, []);

  const handleAddSize = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sizeLabel.trim() || !sizeName.trim()) return;
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/admin/products/sizes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          label: sizeLabel.trim().toUpperCase(),
          name: sizeName.trim(),
          category: sizeCategory,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save size");

      setSizes(prev => [...prev, data]);
      setSizeLabel("");
      setSizeName("");
    } catch (err: any) {
      setError(err.message || "Failed to add size");
    } finally {
      setLoading(false);
    }
  };

  const deleteSize = async (id: string) => {
    if (!confirm("Are you sure you want to delete this size definition?")) return;
    setError("");
    try {
      const res = await fetch(`/api/admin/products/sizes/${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete size");

      setSizes(sizes.filter(s => s._id !== id));
    } catch (err: any) {
      setError(err.message || "Failed to delete size");
    }
  };

  const filteredSizes = sizes.filter(s => 
    s.label.toLowerCase().includes(searchQuery.toLowerCase()) || 
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    s.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div style={styles.container}>
      <div style={styles.titleRow}>
        <div>
          <h2 style={styles.title}>Sizes & Metrics</h2>
          <p style={styles.subtitle}>Manage product size classifications across apparel, footwear, and accessories.</p>
        </div>
        <div style={styles.badge}>
          <Sparkles size={14} style={{ marginRight: 6 }} />
          {sizes.length} Size Definitions
        </div>
      </div>

      {error && (
        <div style={styles.errorAlert}>
          {error}
        </div>
      )}

      <div style={styles.grid}>
        <div style={styles.card}>
          <h3 style={styles.cardTitle}>Define Size</h3>
          <p style={styles.cardSub}>Create a new size label to use across product variations.</p>
          <form onSubmit={handleAddSize} style={styles.form}>
            <div style={styles.inputGroup}>
              <label style={styles.inputLabel}>Size Symbol / Label</label>
              <input
                type="text"
                placeholder="e.g. S, XL, 42, 10.5"
                value={sizeLabel}
                onChange={(e) => setSizeLabel(e.target.value)}
                required
                disabled={loading}
                style={styles.textInput}
              />
            </div>
            <div style={styles.inputGroup}>
              <label style={styles.inputLabel}>Native Description</label>
              <input
                type="text"
                placeholder="e.g. Small, Extra Large, standard fit"
                value={sizeName}
                onChange={(e) => setSizeName(e.target.value)}
                required
                disabled={loading}
                style={styles.textInput}
              />
            </div>
            <div style={styles.inputGroup}>
              <label style={styles.inputLabel}>Department Category</label>
              <select
                value={sizeCategory}
                onChange={(e) => setSizeCategory(e.target.value)}
                disabled={loading}
                style={styles.selectInput}
              >
                <option value="Apparel">Apparel / Clothing</option>
                <option value="Footwear">Footwear / Shoes</option>
                <option value="Accessories">Accessories</option>
                <option value="Electronics">Electronics</option>
              </select>
            </div>
            <button type="submit" style={styles.btn} disabled={loading}>
              <Plus size={16} style={{ marginRight: 8 }} /> {loading ? "Adding..." : "Add Size"}
            </button>
          </form>
        </div>

        <div style={styles.card}>
          <div style={styles.listHeader}>
            <h3 style={styles.cardTitle}>Fulfillment Metrics</h3>
            <div style={styles.searchWrapper}>
              <Search size={16} style={styles.searchIcon} />
              <input
                type="text"
                placeholder="Filter sizes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={styles.searchInput}
              />
            </div>
          </div>

          <div style={styles.list}>
            {filteredSizes.length === 0 ? (
              <div style={{ textAlign: "center", color: "#64748b", padding: "20px 0" }}>No sizes found.</div>
            ) : (
              filteredSizes.map((s) => (
                <div key={s._id} style={styles.row}>
                  <div style={styles.rowInfo}>
                    <div style={styles.avatar}>
                      <Ruler size={16} color="#6366f1" />
                    </div>
                    <div>
                      <div style={styles.catName}>
                        {s.label} <span style={{ fontWeight: "400", color: "#64748b", marginLeft: 4 }}>({s.name})</span>
                      </div>
                      <div style={styles.catSlug}>Department: {s.category}</div>
                    </div>
                  </div>
                  <button onClick={() => deleteSize(s._id)} style={styles.deleteBtn}>
                    <Trash2 size={16} />
                  </button>
                </div>
              ))
            )}
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
  selectInput: { padding: "10px 12px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "14px", color: "#0f172a", outline: "none", backgroundColor: "white" },
  btn: { backgroundColor: "#0f172a", color: "white", padding: "10px 14px", borderRadius: "8px", border: "none", fontWeight: "600", fontSize: "14px", cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center" },
  listHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" },
  searchWrapper: { position: "relative", width: "180px" },
  searchIcon: { position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", color: "#64748b" },
  searchInput: { width: "100%", backgroundColor: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "8px", padding: "8px 10px 8px 32px", fontSize: "13px", color: "#0f172a", outline: "none" },
  list: { display: "flex", flexDirection: "column", gap: "10px" },
  row: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", backgroundColor: "#f8fafc", border: "1px solid #f1f5f9", borderRadius: "10px" },
  rowInfo: { display: "flex", alignItems: "center", gap: "12px" },
  avatar: { width: "32px", height: "32px", borderRadius: "8px", backgroundColor: "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center" },
  catName: { fontSize: "14px", fontWeight: "600", color: "#0f172a" },
  catSlug: { fontSize: "12px", color: "#94a3b8" },
  deleteBtn: { background: "none", border: "none", color: "#cbd5e1", cursor: "pointer", padding: "6px", borderRadius: "6px" },
  errorAlert: { padding: "12px 16px", backgroundColor: "#fef2f2", border: "1px solid #fee2e2", color: "#991b1b", borderRadius: "8px", fontSize: "14px", fontWeight: "500" }
};
