"use client";

import React, { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, ArrowLeft, Save, Check, RefreshCw, AlertTriangle, FileCode, Globe, Eye, EyeOff, LayoutGrid } from "lucide-react";

interface CustomPage {
  _id: string;
  title: string;
  slug: string;
  content: string;
  published: boolean;
  createdAt: string;
}

export default function PageManagementDashboard() {
  const [pages, setPages] = useState<CustomPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Form Panel states
  const [isEditing, setIsEditing] = useState(false);
  const [currentPageId, setCurrentPageId] = useState<string | null>(null);

  // Form State
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [content, setContent] = useState("");
  const [published, setPublished] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchPages = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await fetch("/api/admin/pages");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load pages");
      setPages(data);
    } catch (err: any) {
      setError(err.message || "Failed to load custom pages");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPages();
  }, []);

  const openCreateForm = () => {
    setCurrentPageId(null);
    setTitle("");
    setSlug("");
    setContent("");
    setPublished(true);
    setError("");
    setIsEditing(true);
  };

  const openEditForm = (page: CustomPage) => {
    setCurrentPageId(page._id);
    setTitle(page.title);
    setSlug(page.slug);
    setContent(page.content);
    setPublished(page.published);
    setError("");
    setIsEditing(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content) {
      setError("Title and content are required.");
      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");

    const payload = {
      title,
      slug: slug.trim() || undefined,
      content,
      published,
    };

    try {
      let res;
      if (currentPageId) {
        // Edit Mode
        res = await fetch(`/api/admin/pages/${currentPageId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        // Create Mode
        res = await fetch("/api/admin/pages", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save custom page");

      if (currentPageId) {
        setPages(prev => prev.map(p => p._id === currentPageId ? data : p));
        setSuccess("Page layout saved successfully!");
      } else {
        setPages(prev => [data, ...prev]);
        setSuccess("New page created successfully!");
      }

      setIsEditing(false);
      setTimeout(() => setSuccess(""), 4000);
    } catch (err: any) {
      setError(err.message || "Error saving custom page");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this custom page?")) return;

    try {
      const res = await fetch(`/api/admin/pages/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete page");

      setPages(prev => prev.filter(p => p._id !== id));
      setSuccess("Page deleted successfully");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err: any) {
      setError(err.message || "Error deleting custom page");
    }
  };

  const handleTogglePublished = async (page: CustomPage) => {
    try {
      const res = await fetch(`/api/admin/pages/${page._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ published: !page.published }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update state");

      setPages(prev => prev.map(p => p._id === page._id ? { ...p, published: !page.published } : p));
    } catch (err: any) {
      setError(err.message || "Error toggling visibility");
    }
  };

  const filteredPages = pages.filter(
    (p) =>
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.slug.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={styles.container}>
      {/* Header Row */}
      <div style={styles.header}>
        <div>
          <h2 style={styles.title}>Page Management</h2>
          <p style={styles.subtitle}>Configure static layout pages such as About, FAQ, Privacy Policy, and Terms.</p>
        </div>
        {!isEditing && (
          <button onClick={openCreateForm} style={styles.createBtn}>
            <Plus size={16} style={{ marginRight: 6 }} />
            Create Custom Page
          </button>
        )}
      </div>

      {/* Global Message Alerts */}
      {error && (
        <div style={styles.errorAlert}>
          <AlertTriangle size={16} style={{ marginRight: 8 }} />
          {error}
        </div>
      )}
      {success && (
        <div style={styles.successAlert}>
          <Check size={16} style={{ marginRight: 8 }} />
          {success}
        </div>
      )}

      {isEditing ? (
        /* EDIT OR CREATE FORM WINDOW */
        <div style={styles.editorCard}>
          <div style={styles.editorHeader}>
            <button onClick={() => setIsEditing(false)} style={styles.backBtn}>
              <ArrowLeft size={16} style={{ marginRight: 6 }} />
              Back to Pages
            </button>
            <span style={styles.editorModeTitle}>
              {currentPageId ? "Edit Custom Page" : "Add Custom Page"}
            </span>
          </div>

          <form onSubmit={handleSubmit} style={styles.form}>
            <div style={styles.editorGrid}>
              <div style={styles.editorMainCol}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Page Title (Required)</label>
                  <input
                    type="text"
                    placeholder="E.g. Privacy Policy, FAQ..."
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    style={styles.input}
                    required
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Custom URL Path Slug (Optional)</label>
                  <input
                    type="text"
                    placeholder="E.g. privacy-policy, about-us"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    style={styles.input}
                  />
                  <span style={styles.helpText}>Leave blank to auto-generate from the title. URL will be `/page/slug`.</span>
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Page Layout Content (HTML or Markdown formatting)</label>
                  <textarea
                    placeholder="Enter the body content for this page..."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    style={styles.textarea}
                    required
                  />
                </div>
              </div>

              <div style={styles.editorSidebarCol}>
                <div style={styles.sidebarSection}>
                  <h4 style={styles.sidebarSectionTitle}>Visibility Settings</h4>
                  
                  <div style={{ ...styles.formGroup, marginTop: "12px" }}>
                    <label style={styles.checkboxLabel}>
                      <input
                        type="checkbox"
                        checked={published}
                        onChange={(e) => setPublished(e.target.checked)}
                        style={styles.checkbox}
                      />
                      <span style={{ fontSize: "14px", fontWeight: "600", color: "#334155" }}>Publish Page</span>
                    </label>
                    <span style={{ ...styles.helpText, marginLeft: "24px" }}>
                      Published pages are accessible via their storefront URLs.
                    </span>
                  </div>
                </div>

                <button type="submit" disabled={saving} style={styles.savePostBtn}>
                  <Save size={16} style={{ marginRight: 8 }} />
                  {saving ? "Saving Changes..." : "Save Custom Page"}
                </button>
              </div>
            </div>
          </form>
        </div>
      ) : (
        /* CUSTOM PAGES LIST TABLE */
        <div style={styles.mainCard}>
          {/* Search bar toolbar */}
          <div style={styles.toolbar}>
            <div style={styles.searchContainer}>
              <input
                type="text"
                placeholder="Search custom pages..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={styles.searchInput}
              />
            </div>
          </div>

          {loading ? (
            <div style={styles.loaderContainer}>
              <div style={styles.spinner}></div>
              <p style={{ marginTop: "12px", color: "#64748b" }}>Loading pages...</p>
            </div>
          ) : filteredPages.length === 0 ? (
            <div style={styles.emptyState}>
              <FileCode size={48} style={{ marginBottom: "12px", color: "#cbd5e1" }} />
              <p>No custom pages found.</p>
              <button onClick={openCreateForm} style={styles.emptyStateBtn}>Add your first static page</button>
            </div>
          ) : (
            <div style={styles.tableWrapper}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Page Title</th>
                    <th style={styles.th}>Storefront Path</th>
                    <th style={styles.th}>Visibility</th>
                    <th style={styles.th}>Last Updated</th>
                    <th style={{ ...styles.th, textAlign: "right" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPages.map((page) => (
                    <tr key={page._id} style={styles.tr}>
                      <td style={styles.td}>
                        <div style={styles.pageTitleCell}>
                          <div style={styles.pageIconBg}>
                            <LayoutGrid size={16} color="#3b82f6" />
                          </div>
                          <span style={styles.pageTitleText}>{page.title}</span>
                        </div>
                      </td>
                      <td style={styles.td}>
                        <span style={styles.pagePathText}>/page/{page.slug}</span>
                      </td>
                      <td style={styles.td}>
                        {page.published ? (
                          <span style={{ ...styles.statusBadge, color: "#10b981", backgroundColor: "#ecfdf5" }}>
                            <Globe size={11} style={{ marginRight: 4 }} />
                            Published
                          </span>
                        ) : (
                          <span style={{ ...styles.statusBadge, color: "#64748b", backgroundColor: "#f1f5f9" }}>
                            Hidden
                          </span>
                        )}
                      </td>
                      <td style={styles.td}>
                        <span style={{ color: "#64748b", fontSize: "13px" }}>
                          {new Date(page.createdAt).toLocaleDateString()}
                        </span>
                      </td>
                      <td style={{ ...styles.td, textAlign: "right" }}>
                        <div style={{ display: "inline-flex", gap: "10px", alignItems: "center" }}>
                          <button
                            onClick={() => handleTogglePublished(page)}
                            style={styles.actionIconBtn}
                            title={page.published ? "Hide Page" : "Publish Page"}
                          >
                            {page.published ? <EyeOff size={15} color="#475569" /> : <Eye size={15} color="#10b981" />}
                          </button>
                          <button
                            onClick={() => openEditForm(page)}
                            style={styles.actionIconBtn}
                            title="Edit Page"
                          >
                            <Edit2 size={15} color="#3b82f6" />
                          </button>
                          <button
                            onClick={() => handleDelete(page._id)}
                            style={styles.deleteIconBtn}
                            title="Delete Page"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
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
  createBtn: {
    display: "inline-flex",
    alignItems: "center",
    backgroundColor: "#0f172a",
    color: "white",
    padding: "10px 18px",
    borderRadius: "8px",
    fontSize: "13px",
    fontWeight: "600",
    border: "none",
    cursor: "pointer",
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
  successAlert: {
    display: "flex",
    alignItems: "center",
    backgroundColor: "#ecfdf5",
    color: "#10b981",
    border: "1px solid #a7f3d0",
    padding: "12px 16px",
    borderRadius: "8px",
    fontSize: "14px",
  },
  mainCard: {
    backgroundColor: "#ffffff",
    borderRadius: "16px",
    border: "1px solid #e2e8f0",
    boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
    overflow: "hidden",
  },
  toolbar: {
    padding: "20px",
    borderBottom: "1px solid #e2e8f0",
    backgroundColor: "#f8fafc",
  },
  searchContainer: {
    maxWidth: "360px",
  },
  searchInput: {
    width: "100%",
    padding: "10px 14px",
    borderRadius: "8px",
    border: "1px solid #cbd5e1",
    fontSize: "14px",
    outline: "none",
  },
  loaderContainer: {
    padding: "60px",
    textAlign: "center",
  },
  spinner: {
    width: "36px",
    height: "36px",
    border: "3px solid #f1f5f9",
    borderTop: "3px solid #0f172a",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
    margin: "0 auto",
  },
  emptyState: {
    padding: "60px",
    textAlign: "center",
    color: "#64748b",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  emptyStateBtn: {
    marginTop: "16px",
    backgroundColor: "#0f172a",
    color: "white",
    border: "none",
    padding: "8px 16px",
    borderRadius: "6px",
    fontSize: "13px",
    fontWeight: "600",
    cursor: "pointer",
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
    padding: "16px 20px",
    fontSize: "12px",
    fontWeight: "700",
    color: "#64748b",
    textTransform: "uppercase",
    borderBottom: "1px solid #e2e8f0",
    backgroundColor: "#f8fafc",
  },
  tr: {
    borderBottom: "1px solid #f1f5f9",
  },
  td: {
    padding: "16px 20px",
    verticalAlign: "middle",
  },
  pageTitleCell: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  pageIconBg: {
    width: "32px",
    height: "32px",
    borderRadius: "6px",
    backgroundColor: "#eff6ff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  pageTitleText: {
    fontWeight: "600",
    color: "#0f172a",
    fontSize: "14px",
  },
  pagePathText: {
    fontSize: "13px",
    color: "#475569",
    fontFamily: "monospace",
    backgroundColor: "#f8fafc",
    padding: "2px 6px",
    borderRadius: "4px",
    border: "1px solid #e2e8f0",
  },
  statusBadge: {
    display: "inline-flex",
    alignItems: "center",
    fontSize: "11px",
    fontWeight: "700",
    padding: "3px 8px",
    borderRadius: "12px",
    textTransform: "uppercase",
  },
  actionIconBtn: {
    backgroundColor: "#f8fafc",
    border: "1px solid #cbd5e1",
    color: "#64748b",
    padding: "6px",
    borderRadius: "6px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
  },
  deleteIconBtn: {
    backgroundColor: "#fef2f2",
    border: "1px solid #fecaca",
    color: "#ef4444",
    padding: "6px",
    borderRadius: "6px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
  },
  editorCard: {
    backgroundColor: "#ffffff",
    border: "1px solid #e2e8f0",
    borderRadius: "16px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
    overflow: "hidden",
    padding: "24px",
  },
  editorHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottom: "1px solid #f1f5f9",
    paddingBottom: "16px",
    marginBottom: "24px",
  },
  backBtn: {
    display: "inline-flex",
    alignItems: "center",
    background: "none",
    border: "none",
    color: "#64748b",
    fontWeight: "600",
    fontSize: "14px",
    cursor: "pointer",
  },
  editorModeTitle: {
    fontWeight: "700",
    fontSize: "16px",
    color: "#0f172a",
  },
  form: {
    width: "100%",
  },
  editorGrid: {
    display: "grid",
    gridTemplateColumns: "2.5fr 1fr",
    gap: "24px",
  },
  editorMainCol: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },
  editorSidebarCol: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },
  formGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },
  label: {
    fontSize: "13px",
    fontWeight: "600",
    color: "#475569",
  },
  input: {
    padding: "10px 12px",
    borderRadius: "8px",
    border: "1px solid #cbd5e1",
    fontSize: "14px",
    outline: "none",
  },
  textarea: {
    padding: "12px",
    borderRadius: "8px",
    border: "1px solid #cbd5e1",
    fontSize: "14px",
    minHeight: "300px",
    resize: "vertical",
    outline: "none",
    fontFamily: "inherit",
  },
  helpText: {
    fontSize: "11px",
    color: "#94a3b8",
  },
  sidebarSection: {
    border: "1px solid #e2e8f0",
    borderRadius: "12px",
    padding: "16px",
    backgroundColor: "#f8fafc",
  },
  sidebarSectionTitle: {
    fontWeight: "700",
    fontSize: "13px",
    color: "#334155",
    borderBottom: "1px solid #e2e8f0",
    paddingBottom: "8px",
  },
  checkboxLabel: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    cursor: "pointer",
  },
  checkbox: {
    width: "16px",
    height: "16px",
  },
  savePostBtn: {
    backgroundColor: "#0f172a",
    color: "white",
    border: "none",
    padding: "14px",
    borderRadius: "8px",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
  },
};
