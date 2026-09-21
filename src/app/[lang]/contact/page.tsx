"use client";

import React, { useState, useEffect } from "react";
import { useApp } from "@/context/AppContext";
import { Mail, Phone, MapPin, Clock, Send, CheckCircle2, AlertCircle } from "lucide-react";

export default function ContactPage() {
  const { user, t } = useApp();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Autofill name and email if user is logged in
  useEffect(() => {
    if (user) {
      setName(user.username || "");
      setEmail(user.email || "");
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) {
      setStatus({ type: "error", text: "Please fill out all required fields." });
      return;
    }

    setIsSubmitting(true);
    setStatus(null);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          subject: subject.trim(),
          message: message.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to submit message");

      setStatus({ type: "success", text: "Thank you! Your message has been sent successfully. We will get back to you shortly." });
      setSubject("");
      setMessage("");
    } catch (err: any) {
      setStatus({ type: "error", text: err.message || "An error occurred. Please try again later." });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={styles.outerContainer}>
      <div style={styles.innerContainer}>
        {/* Header Section */}
        <div style={styles.header}>
          <h1 style={styles.mainTitle}>{t("Contact Us")}</h1>
          <p style={styles.subtitle}>Have a question, feedback, or need support? Drop us a line and our team will get back to you within 24 hours.</p>
        </div>

        {/* Content Grid */}
        <div style={styles.grid}>
          {/* Contact Details Card */}
          <div style={styles.infoColumn}>
            <div style={styles.infoCard}>
              <h2 style={styles.cardTitle}>Get in Touch</h2>
              <p style={styles.cardSub}>Feel free to reach out directly via email, phone, or visit our headquarters.</p>
              
              <div style={styles.detailsList}>
                <div style={styles.detailItem}>
                  <div style={styles.iconWrapper}>
                    <Mail size={18} color="#6366f1" />
                  </div>
                  <div>
                    <h4 style={styles.detailLabel}>Email Support</h4>
                    <a href="mailto:support@snapshop.com" style={styles.detailValue}>support@snapshop.com</a>
                  </div>
                </div>

                <div style={styles.detailItem}>
                  <div style={styles.iconWrapper}>
                    <Phone size={18} color="#6366f1" />
                  </div>
                  <div>
                    <h4 style={styles.detailLabel}>Phone Helpline</h4>
                    <a href="tel:+18005550199" style={styles.detailValue}>+1 (800) 555-0199</a>
                  </div>
                </div>

                <div style={styles.detailItem}>
                  <div style={styles.iconWrapper}>
                    <MapPin size={18} color="#6366f1" />
                  </div>
                  <div>
                    <h4 style={styles.detailLabel}>Headquarters</h4>
                    <p style={styles.detailValueText}>100 Fashion Blvd, Suite 400<br />New York, NY 10001</p>
                  </div>
                </div>

                <div style={styles.detailItem}>
                  <div style={styles.iconWrapper}>
                    <Clock size={18} color="#6366f1" />
                  </div>
                  <div>
                    <h4 style={styles.detailLabel}>Business Hours</h4>
                    <p style={styles.detailValueText}>Monday – Friday: 9:00 AM – 6:00 PM EST<br />Saturday: 10:00 AM – 4:00 PM EST</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form Card */}
          <div style={styles.formColumn}>
            <div style={styles.formCard}>
              <h2 style={styles.cardTitle}>Send Message</h2>
              <p style={styles.cardSub}>Use the form below to message our customer support representatives.</p>

              {status && (
                <div style={{
                  ...styles.statusMessage,
                  backgroundColor: status.type === "success" ? "#f0fdf4" : "#fef2f2",
                  borderColor: status.type === "success" ? "#bbf7d0" : "#fee2e2",
                  color: status.type === "success" ? "#166534" : "#991b1b",
                }}>
                  {status.type === "success" ? <CheckCircle2 size={16} style={{ marginRight: 8, flexShrink: 0 }} /> : <AlertCircle size={16} style={{ marginRight: 8, flexShrink: 0 }} />}
                  <span style={{ fontSize: "14px", fontWeight: "500" }}>{status.text}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} style={styles.form}>
                <div style={styles.formRow}>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Your Name *</label>
                    <input
                      type="text"
                      placeholder="Enter name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      disabled={isSubmitting}
                      style={styles.input}
                    />
                  </div>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Email Address *</label>
                    <input
                      type="email"
                      placeholder="e.g. name@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      disabled={isSubmitting}
                      style={styles.input}
                    />
                  </div>
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Subject</label>
                  <input
                    type="text"
                    placeholder="What is this regarding?"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    disabled={isSubmitting}
                    style={styles.input}
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Message *</label>
                  <textarea
                    rows={5}
                    placeholder="Write your message here..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    required
                    disabled={isSubmitting}
                    style={styles.textarea}
                  />
                </div>

                <button type="submit" style={styles.submitBtn} disabled={isSubmitting}>
                  <Send size={16} style={{ marginRight: 8 }} />
                  {isSubmitting ? "Sending..." : "Submit Message"}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  outerContainer: {
    backgroundColor: "#f8fafc",
    minHeight: "100vh",
    padding: "60px 20px",
    fontFamily: "'Outfit', sans-serif",
  },
  innerContainer: {
    maxWidth: "1100px",
    margin: "0 auto",
    display: "flex",
    flexDirection: "column",
    gap: "40px",
  },
  header: {
    textAlign: "center",
    maxWidth: "600px",
    margin: "0 auto",
  },
  mainTitle: {
    fontSize: "36px",
    fontWeight: "800",
    color: "#0f172a",
    letterSpacing: "-0.02em",
    margin: "0 0 12px 0",
  },
  subtitle: {
    fontSize: "15px",
    color: "#64748b",
    lineHeight: "1.6",
    margin: 0,
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "1fr 1.5fr",
    gap: "32px",
    alignItems: "start",
  },
  infoColumn: {
    display: "flex",
    flexDirection: "column",
  },
  infoCard: {
    backgroundColor: "white",
    border: "1px solid #e2e8f0",
    borderRadius: "20px",
    padding: "32px",
    boxShadow: "0 4px 6px -1px rgba(0,0,0,0.02), 0 2px 4px -1px rgba(0,0,0,0.02)",
  },
  formColumn: {
    display: "flex",
    flexDirection: "column",
  },
  formCard: {
    backgroundColor: "white",
    border: "1px solid #e2e8f0",
    borderRadius: "20px",
    padding: "32px",
    boxShadow: "0 4px 6px -1px rgba(0,0,0,0.02), 0 2px 4px -1px rgba(0,0,0,0.02)",
  },
  cardTitle: {
    fontSize: "20px",
    fontWeight: "700",
    color: "#0f172a",
    margin: "0 0 4px 0",
  },
  cardSub: {
    fontSize: "13px",
    color: "#64748b",
    margin: "0 0 24px 0",
  },
  detailsList: {
    display: "flex",
    flexDirection: "column",
    gap: "24px",
  },
  detailItem: {
    display: "flex",
    gap: "16px",
    alignItems: "flex-start",
  },
  iconWrapper: {
    width: "36px",
    height: "36px",
    borderRadius: "10px",
    backgroundColor: "rgba(99, 102, 241, 0.08)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  detailLabel: {
    fontSize: "12px",
    fontWeight: "600",
    color: "#94a3b8",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    margin: "0 0 2px 0",
  },
  detailValue: {
    fontSize: "14px",
    fontWeight: "500",
    color: "#0f172a",
    textDecoration: "none",
    transition: "color 0.2s",
  },
  detailValueText: {
    fontSize: "14px",
    fontWeight: "500",
    color: "#475569",
    margin: 0,
    lineHeight: "1.5",
  },
  statusMessage: {
    display: "flex",
    alignItems: "center",
    borderWidth: "1px",
    borderStyle: "solid",
    borderRadius: "12px",
    padding: "12px 16px",
    marginBottom: "20px",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },
  formRow: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "16px",
  },
  formGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },
  label: {
    fontSize: "13px",
    fontWeight: "600",
    color: "#334155",
  },
  input: {
    padding: "10px 14px",
    fontSize: "14px",
    borderRadius: "10px",
    border: "1px solid #cbd5e1",
    outline: "none",
    transition: "border-color 0.2s, box-shadow 0.2s",
    width: "100%",
  },
  textarea: {
    padding: "10px 14px",
    fontSize: "14px",
    borderRadius: "10px",
    border: "1px solid #cbd5e1",
    outline: "none",
    transition: "border-color 0.2s, box-shadow 0.2s",
    width: "100%",
    resize: "vertical",
    fontFamily: "inherit",
  },
  submitBtn: {
    alignSelf: "flex-start",
    display: "inline-flex",
    alignItems: "center",
    backgroundColor: "#0f172a",
    color: "white",
    border: "none",
    borderRadius: "10px",
    padding: "12px 20px",
    fontWeight: "600",
    fontSize: "14px",
    cursor: "pointer",
    transition: "background-color 0.2s, opacity 0.2s",
  },
};
