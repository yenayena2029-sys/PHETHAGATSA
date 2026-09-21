"use client";

import React, { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, ArrowLeft, Image as ImageIcon, Save, Check, RefreshCw, AlertTriangle, FileText, Globe, Eye, EyeOff } from "lucide-react";

interface BlogPost {
  _id: string;
  title: string;
  slug: string;
  content: string;
  thumbnail: string;
  author: string;
  published: boolean;
  createdAt: string;
}

export default function BlogsDashboard() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Editor Panel state
  const [isEditing, setIsEditing] = useState(false);
  const [currentPostId, setCurrentPostId] = useState<string | null>(null);

  // Form State
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [content, setContent] = useState("");
  const [thumbnail, setThumbnail] = useState("");
  const [author, setAuthor] = useState("Admin");
  const [published, setPublished] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await fetch("/api/admin/blogs");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load blogs");
      setPosts(data);
    } catch (err: any) {
      setError(err.message || "Failed to load posts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const openCreateForm = () => {
    setCurrentPostId(null);
    setTitle("");
    setSlug("");
    setContent("");
    setThumbnail("");
    setAuthor("Admin");
    setPublished(false);
    setError("");
    setIsEditing(true);
  };

  const openEditForm = (post: BlogPost) => {
    setCurrentPostId(post._id);
    setTitle(post.title);
    setSlug(post.slug);
    setContent(post.content);
    setThumbnail(post.thumbnail || "");
    setAuthor(post.author || "Admin");
    setPublished(post.published);
    setError("");
    setIsEditing(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    setError("");
    const formData = new FormData();
    formData.append("files", files[0]);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to upload image");
      if (data.urls && data.urls.length > 0) {
        setThumbnail(data.urls[0]);
      }
    } catch (err: any) {
      setError(err.message || "Failed to upload image");
    } finally {
      setUploading(false);
    }
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
      thumbnail,
      author,
      published,
    };

    try {
      let res;
      if (currentPostId) {
        // Edit Mode
        res = await fetch(`/api/admin/blogs/${currentPostId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        // Create Mode
        res = await fetch("/api/admin/blogs", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save blog post");

      if (currentPostId) {
        setPosts(prev => prev.map(p => p._id === currentPostId ? data : p));
        setSuccess("Article updated successfully!");
      } else {
        setPosts(prev => [data, ...prev]);
        setSuccess("New article created successfully!");
      }

      setIsEditing(false);
      setTimeout(() => setSuccess(""), 4000);
    } catch (err: any) {
      setError(err.message || "Error saving blog post");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this blog post?")) return;

    try {
      const res = await fetch(`/api/admin/blogs/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete post");

      setPosts(prev => prev.filter(p => p._id !== id));
      setSuccess("Post deleted successfully");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err: any) {
      setError(err.message || "Error deleting post");
    }
  };

  const handleTogglePublished = async (post: BlogPost) => {
    try {
      const res = await fetch(`/api/admin/blogs/${post._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ published: !post.published }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update state");

      setPosts(prev => prev.map(p => p._id === post._id ? { ...p, published: !post.published } : p));
    } catch (err: any) {
      setError(err.message || "Error toggling published status");
    }
  };

  const filteredPosts = posts.filter(
    (p) =>
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.author.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={styles.container}>
      {/* Header Panel */}
      <div style={styles.header}>
        <div>
          <h2 style={styles.title}>Blog Management</h2>
          <p style={styles.subtitle}>Write articles, share product announcements, and manage store publications.</p>
        </div>
        {!isEditing && (
          <button onClick={openCreateForm} style={styles.createBtn}>
            <Plus size={16} style={{ marginRight: 6 }} />
            Write New Post
          </button>
        )}
      </div>

      {/* Global Alerts */}
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
        /* EDIT / CREATE WORKSPACE */
        <div style={styles.editorCard}>
          <div style={styles.editorHeader}>
            <button onClick={() => setIsEditing(false)} style={styles.backBtn}>
              <ArrowLeft size={16} style={{ marginRight: 6 }} />
              Back to Articles
            </button>
            <span style={styles.editorModeTitle}>
              {currentPostId ? "Editing Article" : "Compose New Article"}
            </span>
          </div>

          <form onSubmit={handleSubmit} style={styles.form}>
            <div style={styles.editorGrid}>
              {/* Left Form Elements */}
              <div style={styles.editorMainCol}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Article Title (Required)</label>
                  <input
                    type="text"
                    placeholder="Enter descriptive title..."
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    style={styles.input}
                    required
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Slug URL path (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. awesome-new-shoes-launch"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    style={styles.input}
                  />
                  <span style={styles.helpText}>Leave blank to auto-generate from the title.</span>
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Article Body Content (Markdown or HTML supported)</label>
                  <textarea
                    placeholder="Write the body of your article here..."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    style={styles.textarea}
                    required
                  />
                </div>
              </div>

              {/* Right Sidebar Form Elements */}
              <div style={styles.editorSidebarCol}>
                <div style={styles.sidebarSection}>
                  <label style={styles.label}>Cover Image Thumbnail</label>
                  <div style={styles.thumbnailWrapper}>
                    {thumbnail ? (
                      <img src={thumbnail} alt="Preview" style={styles.thumbnailPreview} />
                    ) : (
                      <div style={styles.noThumbnailPlaceholder}>
                        <ImageIcon size={32} color="#cbd5e1" />
                        <span style={{ fontSize: "12px", color: "#64748b", marginTop: "4px" }}>No Thumbnail</span>
                      </div>
                    )}
                  </div>

                  <div style={{ marginTop: "12px" }}>
                    <label style={styles.fileUploadBtn}>
                      {uploading ? "Uploading..." : "Upload Image"}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        style={{ display: "none" }}
                        disabled={uploading}
                      />
                    </label>
                  </div>
                  <input
                    type="text"
                    placeholder="Or enter image URL directly"
                    value={thumbnail}
                    onChange={(e) => setThumbnail(e.target.value)}
                    style={{ ...styles.input, marginTop: "10px" }}
                  />
                </div>

                <div style={styles.sidebarSection}>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Author Name</label>
                    <input
                      type="text"
                      value={author}
                      onChange={(e) => setAuthor(e.target.value)}
                      style={styles.input}
                    />
                  </div>

                  <div style={{ ...styles.formGroup, marginTop: "16px" }}>
                    <label style={styles.checkboxLabel}>
                      <input
                        type="checkbox"
                        checked={published}
                        onChange={(e) => setPublished(e.target.checked)}
                        style={styles.checkbox}
                      />
                      <span style={{ fontSize: "14px", fontWeight: "600", color: "#334155" }}>Publish Article Immediately</span>
                    </label>
                    <span style={{ ...styles.helpText, marginLeft: "20px" }}>
                      Draft posts are hidden from the storefront.
                    </span>
                  </div>
                </div>

                <button type="submit" disabled={saving} style={styles.savePostBtn}>
                  <Save size={16} style={{ marginRight: 8 }} />
                  {saving ? "Saving changes..." : "Save Blog Post"}
                </button>
              </div>
            </div>
          </form>
        </div>
      ) : (
        /* ARTICLES LISTING TABLE */
        <div style={styles.mainCard}>
          {/* Search bar toolbar */}
          <div style={styles.toolbar}>
            <div style={styles.searchContainer}>
              <input
                type="text"
                placeholder="Search articles by title or author..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={styles.searchInput}
              />
            </div>
          </div>

          {loading ? (
            <div style={styles.loaderContainer}>
              <div style={styles.spinner}></div>
              <p style={{ marginTop: "12px", color: "#64748b" }}>Loading blog posts...</p>
            </div>
          ) : filteredPosts.length === 0 ? (
            <div style={styles.emptyState}>
              <FileText size={48} style={{ marginBottom: "12px", color: "#cbd5e1" }} />
              <p>No blog posts found.</p>
              <button onClick={openCreateForm} style={styles.emptyStateBtn}>Compose your first post</button>
            </div>
          ) : (
            <div style={styles.tableWrapper}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Cover</th>
                    <th style={styles.th}>Article Details</th>
                    <th style={styles.th}>Author</th>
                    <th style={styles.th}>Status</th>
                    <th style={styles.th}>Date Created</th>
                    <th style={{ ...styles.th, textAlign: "right" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPosts.map((post) => (
                    <tr key={post._id} style={styles.tr}>
                      <td style={styles.td}>
                        <img
                          src={post.thumbnail || "/placeholder.png"}
                          alt={post.title}
                          style={styles.postThumb}
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = "/placeholder.png";
                          }}
                        />
                      </td>
                      <td style={styles.td}>
                        <div>
                          <p style={styles.postTitleText}>{post.title}</p>
                          <p style={styles.postSlugText}>/{post.slug}</p>
                        </div>
                      </td>
                      <td style={styles.td}>
                        <span style={styles.authorBadge}>{post.author}</span>
                      </td>
                      <td style={styles.td}>
                        {post.published ? (
                          <span style={{ ...styles.statusBadge, color: "#10b981", backgroundColor: "#ecfdf5" }}>
                            <Globe size={11} style={{ marginRight: 4 }} />
                            Published
                          </span>
                        ) : (
                          <span style={{ ...styles.statusBadge, color: "#f59e0b", backgroundColor: "#fffbeb" }}>
                            Draft
                          </span>
                        )}
                      </td>
                      <td style={styles.td}>
                        <span style={{ color: "#64748b", fontSize: "13px" }}>
                          {new Date(post.createdAt).toLocaleDateString()}
                        </span>
                      </td>
                      <td style={{ ...styles.td, textAlign: "right" }}>
                        <div style={{ display: "inline-flex", gap: "10px", alignItems: "center" }}>
                          <button
                            onClick={() => handleTogglePublished(post)}
                            style={styles.actionIconBtn}
                            title={post.published ? "Make Draft" : "Publish Article"}
                          >
                            {post.published ? <EyeOff size={15} color="#475569" /> : <Eye size={15} color="#10b981" />}
                          </button>
                          <button
                            onClick={() => openEditForm(post)}
                            style={styles.actionIconBtn}
                            title="Edit Article"
                          >
                            <Edit2 size={15} color="#3b82f6" />
                          </button>
                          <button
                            onClick={() => handleDelete(post._id)}
                            style={styles.deleteIconBtn}
                            title="Delete Post"
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
  postThumb: {
    width: "50px",
    height: "50px",
    objectFit: "cover",
    borderRadius: "8px",
    border: "1px solid #e2e8f0",
  },
  postTitleText: {
    fontWeight: "600",
    color: "#0f172a",
    fontSize: "14px",
  },
  postSlugText: {
    fontSize: "12px",
    color: "#94a3b8",
    fontFamily: "monospace",
  },
  authorBadge: {
    fontSize: "12px",
    fontWeight: "500",
    color: "#475569",
    backgroundColor: "#f1f5f9",
    padding: "3px 8px",
    borderRadius: "6px",
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
    minHeight: "280px",
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
  thumbnailWrapper: {
    width: "100%",
    height: "120px",
    borderRadius: "8px",
    border: "1.5px dashed #cbd5e1",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ffffff",
    overflow: "hidden",
  },
  thumbnailPreview: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
  noThumbnailPlaceholder: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  fileUploadBtn: {
    display: "block",
    textAlign: "center",
    backgroundColor: "#ffffff",
    border: "1px solid #cbd5e1",
    color: "#334155",
    padding: "8px 12px",
    borderRadius: "8px",
    fontSize: "13px",
    fontWeight: "600",
    cursor: "pointer",
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
