"use client";

import React, { useState, useEffect } from "react";
import { Mail, Search, Trash2, Copy, Check, Calendar, User, Clock, ArrowLeft, MessageSquare } from "lucide-react";

export default function AdminMailboxPage() {
  const [messages, setMessages] = useState<any[]>([]);
  const [selectedMessage, setSelectedMessage] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const fetchMessages = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/mailbox");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to fetch messages");
      setMessages(data);
      if (data.length > 0 && !selectedMessage) {
        setSelectedMessage(data[0]);
      }
    } catch (err: any) {
      setError(err.message || "Failed to load mailbox messages");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const handleCopyEmail = (email: string, id: string) => {
    navigator.clipboard.writeText(email);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDeleteMessage = async (id: string) => {
    if (!confirm("Are you sure you want to delete this message?")) return;
    setError("");
    try {
      const res = await fetch(`/api/admin/mailbox/${id}`, {
        method: "DELETE"
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete message");

      setMessages(prev => prev.filter(m => m._id !== id));
      if (selectedMessage?._id === id) {
        const remaining = messages.filter(m => m._id !== id);
        setSelectedMessage(remaining[0] || null);
      }
    } catch (err: any) {
      setError(err.message || "Failed to delete message");
    }
  };

  const filteredMessages = messages.filter(m => 
    m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.subject?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.message.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.titleRow}>
        <div>
          <h2 style={styles.title}>Mailbox</h2>
          <p style={styles.subtitle}>Manage customer inquiries submitted via storefront contact form.</p>
        </div>
        <div style={styles.badge}>
          <Mail size={14} style={{ marginRight: 6 }} />
          {messages.length} Messages Received
        </div>
      </div>

      {error && (
        <div style={styles.errorAlert}>
          {error}
        </div>
      )}

      {/* Mailbox Layout */}
      <div style={styles.grid}>
        {/* Messages List Column */}
        <div style={styles.listCard}>
          <div style={styles.listHeader}>
            <div style={styles.searchWrapper}>
              <Search size={16} style={styles.searchIcon} />
              <input
                type="text"
                placeholder="Search inbox..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={styles.searchInput}
              />
            </div>
          </div>

          <div style={styles.list}>
            {loading && messages.length === 0 ? (
              <div style={styles.centerText}>Loading messages...</div>
            ) : filteredMessages.length === 0 ? (
              <div style={styles.centerText}>No messages found.</div>
            ) : (
              filteredMessages.map((m) => {
                const isSelected = selectedMessage?._id === m._id;
                const formattedDate = new Date(m.createdAt).toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric"
                });

                return (
                  <div
                    key={m._id}
                    onClick={() => setSelectedMessage(m)}
                    style={{
                      ...styles.row,
                      backgroundColor: isSelected ? "rgba(99, 102, 241, 0.06)" : "#f8fafc",
                      borderLeft: isSelected ? "4px solid #6366f1" : "4px solid transparent",
                    }}
                  >
                    <div style={styles.rowTop}>
                      <div style={styles.senderName}>{m.name}</div>
                      <div style={styles.rowDate}>{formattedDate}</div>
                    </div>
                    <div style={styles.rowSubject}>{m.subject || "(No Subject)"}</div>
                    <div style={styles.rowSnippet}>{m.message}</div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Message Preview Column */}
        <div style={styles.previewCard}>
          {selectedMessage ? (
            <div style={styles.previewContainer}>
              {/* Preview Header */}
              <div style={styles.previewHeader}>
                <div>
                  <h3 style={styles.previewSubject}>{selectedMessage.subject || "(No Subject)"}</h3>
                  <div style={styles.previewMeta}>
                    <div style={styles.metaItem}>
                      <User size={14} color="#64748b" />
                      <span style={styles.metaText}>{selectedMessage.name}</span>
                    </div>
                    <div style={styles.metaItem}>
                      <Mail size={14} color="#64748b" />
                      <span style={styles.metaEmail}>{selectedMessage.email}</span>
                    </div>
                    <div style={styles.metaItem}>
                      <Calendar size={14} color="#64748b" />
                      <span style={styles.metaText}>
                        {new Date(selectedMessage.createdAt).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                <div style={styles.actions}>
                  <button
                    onClick={() => handleCopyEmail(selectedMessage.email, selectedMessage._id)}
                    style={styles.actionBtn}
                    title="Copy Sender Email"
                  >
                    {copiedId === selectedMessage._id ? <Check size={14} color="#10b981" /> : <Copy size={14} />}
                    <span style={{ marginLeft: 6 }}>{copiedId === selectedMessage._id ? "Copied" : "Copy Email"}</span>
                  </button>
                  
                  <button
                    onClick={() => handleDeleteMessage(selectedMessage._id)}
                    style={{ ...styles.actionBtn, borderColor: "#fee2e2", color: "#ef4444" }}
                    title="Delete Message"
                  >
                    <Trash2 size={14} />
                    <span style={{ marginLeft: 6 }}>Delete</span>
                  </button>
                </div>
              </div>

              {/* Message Body */}
              <div style={styles.previewBody}>
                {selectedMessage.message.split("\n").map((para: string, idx: number) => (
                  <p key={idx} style={styles.bodyParagraph}>{para}</p>
                ))}
              </div>
            </div>
          ) : (
            <div style={styles.emptyPreview}>
              <MessageSquare size={48} color="#94a3b8" style={{ marginBottom: 12 }} />
              <div style={styles.emptyTitle}>No Message Selected</div>
              <div style={styles.emptyDesc}>Choose an inquiry from the sidebar list to inspect the details.</div>
            </div>
          )}
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
  grid: { display: "grid", gridTemplateColumns: "1fr 1.6fr", gap: "24px", alignItems: "start", height: "calc(100vh - 160px)", minHeight: "500px" },
  listCard: { backgroundColor: "white", borderRadius: "16px", padding: "20px", border: "1px solid #e2e8f0", boxShadow: "0 1px 3px rgba(0,0,0,0.02)", display: "flex", flexDirection: "column", gap: "16px", height: "100%" },
  listHeader: { display: "flex", width: "100%" },
  searchWrapper: { position: "relative", width: "100%" },
  searchIcon: { position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#64748b" },
  searchInput: { width: "100%", backgroundColor: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "10px", padding: "10px 10px 10px 36px", fontSize: "14px", color: "#0f172a", outline: "none", transition: "border-color 0.2s" },
  list: { display: "flex", flexDirection: "column", gap: "10px", overflowY: "auto", flex: 1, paddingRight: "4px" },
  row: { padding: "16px", border: "1px solid #f1f5f9", borderRadius: "12px", cursor: "pointer", transition: "all 0.2s", display: "flex", flexDirection: "column", gap: "6px" },
  rowTop: { display: "flex", justifyContent: "space-between", alignItems: "center" },
  senderName: { fontSize: "14px", fontWeight: "700", color: "#0f172a" },
  rowDate: { fontSize: "12px", color: "#94a3b8" },
  rowSubject: { fontSize: "13px", fontWeight: "600", color: "#475569", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" },
  rowSnippet: { fontSize: "12px", color: "#64748b", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" },
  previewCard: { backgroundColor: "white", borderRadius: "16px", border: "1px solid #e2e8f0", boxShadow: "0 1px 3px rgba(0,0,0,0.02)", height: "100%", overflowY: "auto" },
  previewContainer: { display: "flex", flexDirection: "column", height: "100%" },
  previewHeader: { padding: "24px", borderBottom: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "16px" },
  previewSubject: { fontSize: "20px", fontWeight: "700", color: "#0f172a", margin: "0 0 12px 0", lineHeight: "1.3" },
  previewMeta: { display: "flex", flexDirection: "column", gap: "8px" },
  metaItem: { display: "flex", alignItems: "center", gap: "8px" },
  metaText: { fontSize: "13px", color: "#64748b", fontWeight: "500" },
  metaEmail: { fontSize: "13px", color: "#6366f1", fontWeight: "600" },
  actions: { display: "flex", gap: "10px", flexShrink: 0 },
  actionBtn: { background: "white", border: "1px solid #cbd5e1", borderRadius: "8px", padding: "8px 12px", display: "flex", alignItems: "center", fontSize: "13px", fontWeight: "600", color: "#475569", cursor: "pointer", transition: "all 0.2s" },
  previewBody: { padding: "24px", flex: 1, backgroundColor: "#fafafa" },
  bodyParagraph: { fontSize: "14px", lineHeight: "1.7", color: "#334155", margin: "0 0 16px 0" },
  emptyPreview: { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", padding: "40px", textAlign: "center" },
  emptyTitle: { fontSize: "16px", fontWeight: "700", color: "#475569" },
  emptyDesc: { fontSize: "13px", color: "#94a3b8", marginTop: "4px" },
  centerText: { textAlign: "center", color: "#64748b", padding: "20px 0", fontSize: "14px" },
  errorAlert: { padding: "12px 16px", backgroundColor: "#fef2f2", border: "1px solid #fee2e2", color: "#991b1b", borderRadius: "8px", fontSize: "14px", fontWeight: "500" }
};
