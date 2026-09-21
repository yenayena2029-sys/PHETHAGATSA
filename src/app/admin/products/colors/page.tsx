"use client";

import React, { useState, useEffect } from "react";
import { Plus, Search, Sparkles, Trash2, Eye } from "lucide-react";

export default function AdminColorsPage() {
  const [colors, setColors] = useState<any[]>([]);
  const [colorName, setColorName] = useState("");
  const [colorHex, setColorHex] = useState("#6366f1");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchColors = async () => {
    try {
      const res = await fetch("/api/admin/products/colors");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to fetch colors");
      setColors(data);
    } catch (err: any) {
      setError(err.message || "Failed to load colors");
    }
  };

  useEffect(() => {
    fetchColors();
  }, []);

  const handleAddColor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!colorName.trim() || !colorHex.trim()) return;
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/admin/products/colors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: colorName.trim(),
          hex: colorHex.trim(),
          active: true
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save color");

      setColors(prev => [...prev, data]);
      setColorName("");
    } catch (err: any) {
      setError(err.message || "Failed to add color");
    } finally {
      setLoading(false);
    }
  };

  const deleteColor = async (id: string) => {
    if (!confirm("Are you sure you want to delete this color swatch?")) return;
    setError("");
    try {
      const res = await fetch(`/api/admin/products/colors/${id}`, {
        method: "DELETE"
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete color");

      setColors(colors.filter(c => c._id !== id));
    } catch (err: any) {
      setError(err.message || "Failed to delete color");
    }
  };

  const filteredColors = colors.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    c.hex.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    // Also update Hex input if user types / updates colorHex
  }, [colorHex]);

  return (
    <div style={styles.container}>
      <div style={styles.titleRow}>
        <div>
          <h2 style={styles.title}>Color Catalog</h2>
          <p style={styles.subtitle}>Define product variant color tags with exact HEX color codes.</p>
        </div>
        <div style={styles.badge}>
          <Sparkles size={14} style={{ marginRight: 6 }} />
          {colors.length} Color Swatches
        </div>
      </div>

      {error && (
        <div style={styles.errorAlert}>
          {error}
        </div>
      )}

      <div style={styles.grid}>
        <div style={styles.card}>
          <h3 style={styles.cardTitle}>Add Color Swatch</h3>
          <p style={styles.cardSub}>Create a new color variant tag to map product inventories.</p>
          <form onSubmit={handleAddColor} style={styles.form}>
            <div style={styles.inputGroup}>
              <label style={styles.inputLabel}>Color Name</label>
              <input
                type="text"
                placeholder="e.g. Indigo Blue, Midnight Black"
                value={colorName}
                onChange={(e) => setColorName(e.target.value)}
                required
                disabled={loading}
                style={styles.textInput}
              />
            </div>
            <div style={styles.inputGroup}>
              <label style={styles.inputLabel}>Hex Value</label>
              <div style={{ display: "flex", gap: "10px" }}>
                <input
                  type="color"
                  value={colorHex}
                  onChange={(e) => setColorHex(e.target.value)}
                  disabled={loading}
                  style={{ width: "44px", height: "40px", border: "1px solid #cbd5e1", borderRadius: "8px", cursor: "pointer", padding: 0 }}
                />
                <input
                  type="text"
                  maxLength={7}
                  placeholder="#6366f1"
                  value={colorHex}
                  onChange={(e) => setColorHex(e.target.value)}
                  required
                  disabled={loading}
                  style={{ ...styles.textInput, flex: 1 }}
                />
              </div>
            </div>
            <button type="submit" style={styles.btn} disabled={loading}>
              <Plus size={16} style={{ marginRight: 8 }} /> {loading ? "Adding..." : "Add Color"}
            </button>
          </form>
        </div>

        <div style={styles.card}>
          <div style={styles.listHeader}>
            <h3 style={styles.cardTitle}>Active Colors</h3>
            <div style={styles.searchWrapper}>
              <Search size={16} style={styles.searchIcon} />
              <input
                type="text"
                placeholder="Filter colors..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={styles.searchInput}
              />
            </div>
          </div>

          <div style={styles.colorGrid}>
            {filteredColors.length === 0 ? (
              <div style={{ gridColumn: "1 / -1", textAlign: "center", color: "#64748b", padding: "20px 0" }}>No colors found.</div>
            ) : (
              filteredColors.map((c) => (
                <div key={c._id} style={styles.colorCard}>
                  <div style={{ ...styles.colorPreview, backgroundColor: c.hex }}></div>
                  <div style={styles.colorMeta}>
                    <div style={styles.colorNameText}>{c.name}</div>
                    <div style={styles.colorHexText}>{c.hex}</div>
                  </div>
                  <button onClick={() => deleteColor(c._id)} style={styles.deleteCircleBtn}>
                    <Trash2 size={14} />
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
  btn: { backgroundColor: "#0f172a", color: "white", padding: "10px 14px", borderRadius: "8px", border: "none", fontWeight: "600", fontSize: "14px", cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center" },
  listHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" },
  searchWrapper: { position: "relative", width: "180px" },
  searchIcon: { position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", color: "#64748b" },
  searchInput: { width: "100%", backgroundColor: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "8px", padding: "8px 10px 8px 32px", fontSize: "13px", color: "#0f172a", outline: "none" },
  colorGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: "16px" },
  colorCard: { backgroundColor: "#f8fafc", border: "1px solid #f1f5f9", borderRadius: "12px", padding: "12px", display: "flex", flexDirection: "column", gap: "10px", position: "relative" },
  colorPreview: { width: "100%", height: "60px", borderRadius: "8px", border: "1px solid rgba(0,0,0,0.06)" },
  colorMeta: { textAlign: "left" },
  colorNameText: { fontSize: "13px", fontWeight: "600", color: "#1e293b", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" },
  colorHexText: { fontSize: "11px", color: "#94a3b8", fontFamily: "monospace", marginTop: "2px" },
  deleteCircleBtn: { position: "absolute", top: "-6px", right: "-6px", backgroundColor: "#ef4444", color: "white", width: "22px", height: "22px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", border: "2px solid white", cursor: "pointer", boxShadow: "0 2px 4px rgba(0,0,0,0.05)" },
  errorAlert: { padding: "12px 16px", backgroundColor: "#fef2f2", border: "1px solid #fee2e2", color: "#991b1b", borderRadius: "8px", fontSize: "14px", fontWeight: "500", marginBottom: "16px" }
};
