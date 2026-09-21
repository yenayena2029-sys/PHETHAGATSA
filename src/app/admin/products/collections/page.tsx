"use client";

import React, { useState, useEffect } from "react";
import { Sparkles, Library, Plus, Search, ToggleLeft, ToggleRight, Trash2 } from "lucide-react";

export default function AdminCollectionsPage() {
  const [collections, setCollections] = useState<any[]>([]);
  const [newName, setNewName] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchCollections = async () => {
    try {
      const res = await fetch("/api/admin/products/collections");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to fetch collections");
      setCollections(data);
    } catch (err: any) {
      setError(err.message || "Failed to load collections");
    }
  };

  useEffect(() => {
    fetchCollections();
  }, []);

  const handleAddCollection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    setLoading(true);
    setError("");

    try {
      const slug = newName.toLowerCase().replace(/[^a-z0-9]+/g, "-");
      const res = await fetch("/api/admin/products/collections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newName.trim(),
          slug,
          active: true
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save collection");

      setCollections(prev => [...prev, data]);
      setNewName("");
    } catch (err: any) {
      setError(err.message || "Failed to add collection");
    } finally {
      setLoading(false);
    }
  };

  const toggleCollection = async (id: string, currentStatus: boolean) => {
    setError("");
    try {
      const res = await fetch(`/api/admin/products/collections/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: !currentStatus })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to toggle active state");

      setCollections(collections.map(c => c._id === id ? { ...c, active: data.active } : c));
    } catch (err: any) {
      setError(err.message || "Failed to toggle collection status");
    }
  };

  const deleteCollection = async (id: string) => {
    if (!confirm("Are you sure you want to delete this collection?")) return;
    setError("");
    try {
      const res = await fetch(`/api/admin/products/collections/${id}`, {
        method: "DELETE"
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete collection");

      setCollections(collections.filter(c => c._id !== id));
    } catch (err: any) {
      setError(err.message || "Failed to delete collection");
    }
  };

  const filtered = collections.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div style={styles.container}>
      <div style={styles.titleRow}>
        <div>
          <h2 style={styles.title}>Collections Catalog</h2>
          <p style={styles.subtitle}>Group products into special collections like New Arrivals, Hot Deals, or Seasonal Sales.</p>
        </div>
        <div style={styles.badge}>
          <Sparkles size={14} style={{ marginRight: 6 }} />
          {collections.length} Catalog Collections
        </div>
      </div>

      {error && (
        <div style={styles.errorAlert}>
          {error}
        </div>
      )}

      <div style={styles.grid}>
        <div style={styles.card}>
          <h3 style={styles.cardTitle}>New Collection</h3>
          <p style={styles.cardSub}>Create a new collection to filter and group products.</p>
          <form onSubmit={handleAddCollection} style={styles.form}>
            <div style={styles.inputGroup}>
              <label style={styles.inputLabel}>Collection Title</label>
              <input
                type="text"
                placeholder="e.g. Summer Essentials, Office Wear"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                required
                disabled={loading}
                style={styles.textInput}
              />
            </div>
            <button type="submit" style={styles.btn} disabled={loading}>
              <Plus size={16} style={{ marginRight: 8 }} /> {loading ? "Adding..." : "Add Collection"}
            </button>
          </form>
        </div>

        <div style={styles.card}>
          <div style={styles.listHeader}>
            <h3 style={styles.cardTitle}>Active Collections</h3>
            <div style={styles.searchWrapper}>
              <Search size={16} style={styles.searchIcon} />
              <input
                type="text"
                placeholder="Search collections..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={styles.searchInput}
              />
            </div>
          </div>

          <div style={styles.list}>
            {filtered.length === 0 ? (
              <div style={{ textAlign: "center", color: "#64748b", padding: "20px 0" }}>No collections found.</div>
            ) : (
              filtered.map((c) => (
                <div key={c._id} style={{ ...styles.row, opacity: c.active ? 1 : 0.7 }}>
                  <div style={styles.rowInfo}>
                    <div style={styles.avatar}>
                      <Library size={16} color="#6366f1" />
                    </div>
                    <div>
                      <div style={styles.catName}>{c.name}</div>
                      <div style={styles.catSlug}>slug: /{c.slug}</div>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                    <button onClick={() => toggleCollection(c._id, c.active)} style={{ background: "none", border: "none", cursor: "pointer", color: c.active ? "#10b981" : "#94a3b8" }}>
                      {c.active ? <ToggleRight size={24} /> : <ToggleLeft size={24} />}
                    </button>
                    <button onClick={() => deleteCollection(c._id)} style={styles.deleteBtn}>
                      <Trash2 size={16} />
                    </button>
                  </div>
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
  list: { display: "flex", flexDirection: "column", gap: "10px" },
  row: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", backgroundColor: "#f8fafc", border: "1px solid #f1f5f9", borderRadius: "10px" },
  rowInfo: { display: "flex", alignItems: "center", gap: "12px" },
  avatar: { width: "32px", height: "32px", borderRadius: "8px", backgroundColor: "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center" },
  catName: { fontSize: "14px", fontWeight: "600", color: "#0f172a" },
  catSlug: { fontSize: "12px", color: "#94a3b8" },
  deleteBtn: { background: "none", border: "none", color: "#cbd5e1", cursor: "pointer", padding: "6px", borderRadius: "6px" },
  errorAlert: { padding: "12px 16px", backgroundColor: "#fef2f2", border: "1px solid #fee2e2", color: "#991b1b", borderRadius: "8px", fontSize: "14px", fontWeight: "500", marginBottom: "16px" }
};
