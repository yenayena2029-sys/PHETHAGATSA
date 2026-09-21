"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, ArrowRight, CheckCircle2 } from "lucide-react";
import { useApp } from "@/context/AppContext";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const { settings } = useApp();

  const primaryColor = settings?.primaryColor || "#d31e28";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess(true);
      } else {
        setError(data.error || "An error occurred. Please try again.");
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        {success ? (
          <div style={styles.successContainer}>
            <CheckCircle2 size={48} color={primaryColor} style={{ marginBottom: "16px" }} />
            <h1 style={styles.title}>Check your email</h1>
            <p style={styles.subtitle}>
              We've sent password reset instructions to <strong>{email}</strong>
            </p>
            <Link href="/login" style={{ ...styles.linkBtn, color: primaryColor }}>
              Back to Login
            </Link>
          </div>
        ) : (
          <>
            <h1 style={styles.title}>Forgot Password</h1>
            <p style={styles.subtitle}>Enter your email address and we'll send you a link to reset your password.</p>

            {error && <div style={styles.errorAlert}>{error}</div>}

            <form onSubmit={handleSubmit} style={styles.form}>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Email Address</label>
                <div style={styles.inputWrapper}>
                  <Mail size={18} style={styles.inputIcon} />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    style={styles.input}
                    placeholder="name@example.com"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{ ...styles.submitBtn, backgroundColor: primaryColor, opacity: loading ? 0.7 : 1 }}
              >
                {loading ? "Sending..." : "Send Reset Link"}
                {!loading && <ArrowRight size={18} style={{ marginLeft: "8px" }} />}
              </button>
            </form>

            <div style={styles.footer}>
              Remember your password?{" "}
              <Link href="/login" style={{ color: primaryColor, fontWeight: "600", textDecoration: "none" }}>
                Back to login
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: "calc(100vh - 80px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "var(--bg-light)",
    padding: "40px 20px",
  },
  card: {
    width: "100%",
    maxWidth: "450px",
    backgroundColor: "#ffffff",
    borderRadius: "16px",
    boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
    padding: "40px",
  },
  title: {
    fontSize: "24px",
    fontWeight: "700",
    color: "#0f172a",
    marginBottom: "8px",
    textAlign: "center",
  },
  subtitle: {
    fontSize: "15px",
    color: "#64748b",
    marginBottom: "30px",
    textAlign: "center",
    lineHeight: "1.5",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },
  inputGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  label: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#334155",
  },
  inputWrapper: {
    position: "relative",
    display: "flex",
    alignItems: "center",
  },
  inputIcon: {
    position: "absolute",
    left: "14px",
    color: "#94a3b8",
  },
  input: {
    width: "100%",
    padding: "12px 14px 12px 42px",
    border: "1px solid #cbd5e1",
    borderRadius: "8px",
    fontSize: "15px",
    outline: "none",
    transition: "border-color 0.2s",
  },
  submitBtn: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "14px",
    color: "#ffffff",
    border: "none",
    borderRadius: "8px",
    fontSize: "16px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "opacity 0.2s",
    marginTop: "10px",
  },
  errorAlert: {
    backgroundColor: "#fef2f2",
    color: "#b91c1c",
    padding: "12px",
    borderRadius: "8px",
    fontSize: "14px",
    marginBottom: "20px",
    border: "1px solid #fecaca",
  },
  footer: {
    marginTop: "30px",
    textAlign: "center",
    fontSize: "14px",
    color: "#64748b",
  },
  successContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    textAlign: "center",
  },
  linkBtn: {
    marginTop: "20px",
    fontWeight: "600",
    textDecoration: "none",
  }
};
