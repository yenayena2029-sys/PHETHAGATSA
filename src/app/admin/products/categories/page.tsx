"use client";

import React, { useState, useEffect } from "react";
import { Plus, Trash2, Search, Loader2, FolderHeart, Sparkles, CheckCircle2 } from "lucide-react";

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const fetchCategories = async () => {
    try {
      const res = await fetch("/api/categories");
      if (res.ok) {
        const data = await res.json();
        setCategories(data);
      }
    } catch (e) {
      console.error("Failed to load categories:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;

    setSubmitting(true);
    setError("");
    setSuccessMsg("");

    try {
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newCategoryName.trim() }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to create category");
      }

      setSuccessMsg(`Category "${data.name}" added successfully!`);
      setNewCategoryName("");
      fetchCategories();

      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err: any) {
      setError(err.message || "Failed to add category");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteCategory = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete category "${name}"?`)) return;

    try {
      const res = await fetch(`/api/categories/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setSuccessMsg(`Category "${name}" deleted successfully.`);
        fetchCategories();
        setTimeout(() => setSuccessMsg(""), 3000);
      } else {
        const data = await res.json();
        setError(data.error || "Failed to delete category");
      }
    } catch (err: any) {
      setError("Failed to delete category");
    }
  };

  const filteredCategories = categories.filter((cat) =>
    cat.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div style={styles.container}>
      {/* Title block */}
      <div style={styles.titleRow}>
        <div>
          <h2 style={styles.title}>Categories Management</h2>
          <p style={styles.subtitle}>Organize and catalog your products under main department categories.</p>
        </div>
        <div style={styles.badge}>
          <Sparkles size={14} style={{ marginRight: 6 }} />
          {categories.length} Total Departments
        </div>
      </div>

      <div style={styles.grid}>
        {/* Left Column: Add Category Form */}
        <div style={styles.card}>
          <h3 style={styles.cardTitle}>Create Category</h3>
          <p style={styles.cardSub}>Generate a new product department in your storefront directory.</p>

          <form onSubmit={handleAddCategory} style={styles.form}>
            {error && <div style={styles.errorAlert}>{error}</div>}
            {successMsg && (
              <div style={styles.successAlert}>
                <CheckCircle2 size={16} style={{ marginRight: 8, flexShrink: 0 }} />
                {successMsg}
              </div>
            )}

            <div style={styles.inputGroup}>
              <label style={styles.inputLabel}>Category Name</label>
              <input
                type="text"
                placeholder="e.g. Shoes, Accessories, Outerwear"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                required
                style={styles.textInput}
              />
            </div>

            <button type="submit" disabled={submitting} style={styles.btn}>
              {submitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" style={{ marginRight: 8, animation: "spin 1s linear infinite" }} />
                  Saving...
                </>
              ) : (
                <>
                  <Plus size={16} style={{ marginRight: 8 }} />
                  Add Category
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right Column: Categories List */}
        <div style={styles.card}>
          <div style={styles.listHeader}>
            <h3 style={styles.cardTitle}>Store Categories</h3>
            <div style={styles.searchWrapper}>
              <Search size={16} style={styles.searchIcon} />
              <input
                type="text"
                placeholder="Filter categories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={styles.searchInput}
              />
            </div>
          </div>

          {loading ? (
            <div style={styles.loaderContainer}>
              <Loader2 size={24} className="animate-spin" style={{ animation: "spin 1s linear infinite", color: "#6366f1" }} />
              <span style={{ marginLeft: 12, color: "#64748b" }}>Loading department list...</span>
            </div>
          ) : filteredCategories.length === 0 ? (
            <div style={styles.emptyState}>
              <FolderHeart size={36} color="#94a3b8" style={{ marginBottom: 12 }} />
              <p style={{ color: "#64748b", margin: 0 }}>No categories found matching your query.</p>
            </div>
          ) : (
            <div style={styles.list}>
              {filteredCategories.map((cat) => (
                <div key={cat._id} style={styles.row}>
                  <div style={styles.rowInfo}>
                    <div style={styles.folderIcon}>📁</div>
                    <div>
                      <div style={styles.catName}>{cat.name}</div>
                      <div style={styles.catSlug}>slug: /{cat.slug}</div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteCategory(cat._id, cat.name)}
                    style={styles.deleteBtn}
                    title="Delete Category"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

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
    padding: "24px",
    display: "flex",
    flexDirection: "column",
    gap: "24px",
    fontFamily: "'Outfit', sans-serif",
  },
  titleRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: {
    fontSize: "24px",
    fontWeight: "700",
    color: "#0f172a",
    margin: 0,
  },
  subtitle: {
    fontSize: "14px",
    color: "#64748b",
    margin: "4px 0 0 0",
  },
  badge: {
    display: "flex",
    alignItems: "center",
    backgroundColor: "rgba(99, 102, 241, 0.08)",
    color: "#6366f1",
    padding: "8px 16px",
    borderRadius: "20px",
    fontSize: "13px",
    fontWeight: "600",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "1fr 1.5fr",
    gap: "24px",
    alignItems: "start",
  },
  card: {
    backgroundColor: "white",
    borderRadius: "16px",
    padding: "24px",
    border: "1px solid #e2e8f0",
    boxShadow: "0 1px 3px rgba(0,0,0,0.02)",
  },
  cardTitle: {
    fontSize: "18px",
    fontWeight: "700",
    color: "#0f172a",
    margin: 0,
  },
  cardSub: {
    fontSize: "13px",
    color: "#64748b",
    margin: "4px 0 20px 0",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  errorAlert: {
    backgroundColor: "#fef2f2",
    color: "#ef4444",
    border: "1px solid #fee2e2",
    borderRadius: "8px",
    padding: "10px 14px",
    fontSize: "13px",
    fontWeight: "500",
  },
  successAlert: {
    display: "flex",
    alignItems: "center",
    backgroundColor: "#ecfdf5",
    color: "#10b981",
    border: "1px solid #a7f3d0",
    borderRadius: "8px",
    padding: "10px 14px",
    fontSize: "13px",
    fontWeight: "500",
  },
  inputGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },
  inputLabel: {
    fontSize: "13px",
    fontWeight: "600",
    color: "#475569",
  },
  textInput: {
    padding: "10px 12px",
    borderRadius: "8px",
    border: "1px solid #cbd5e1",
    fontSize: "14px",
    color: "#0f172a",
    outline: "none",
  },
  btn: {
    backgroundColor: "#0f172a",
    color: "white",
    padding: "10px 14px",
    borderRadius: "8px",
    border: "none",
    fontWeight: "600",
    fontSize: "14px",
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "background-color 0.2s",
  },
  listHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
    flexWrap: "wrap",
    gap: "12px",
  },
  searchWrapper: {
    position: "relative",
    width: "200px",
  },
  searchIcon: {
    position: "absolute",
    left: "10px",
    top: "50%",
    transform: "translateY(-50%)",
    color: "#64748b",
  },
  searchInput: {
    width: "100%",
    backgroundColor: "#f8fafc",
    border: "1px solid #e2e8f0",
    borderRadius: "8px",
    padding: "8px 10px 8px 32px",
    fontSize: "13px",
    color: "#0f172a",
    outline: "none",
  },
  loaderContainer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "40px",
  },
  emptyState: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "40px 20px",
    textAlign: "center",
    border: "2px dashed #e2e8f0",
    borderRadius: "12px",
  },
  list: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    maxHeight: "360px",
    overflowY: "auto",
    paddingRight: "4px",
  },
  row: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "12px 16px",
    backgroundColor: "#f8fafc",
    border: "1px solid #f1f5f9",
    borderRadius: "10px",
    transition: "all 0.15s ease",
  },
  rowInfo: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  folderIcon: {
    fontSize: "18px",
  },
  catName: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#0f172a",
  },
  catSlug: {
    fontSize: "11px",
    color: "#94a3b8",
    fontFamily: "monospace",
  },
  deleteBtn: {
    background: "none",
    border: "none",
    color: "#cbd5e1",
    cursor: "pointer",
    padding: "6px",
    borderRadius: "6px",
    transition: "all 0.2s",
  },
};
