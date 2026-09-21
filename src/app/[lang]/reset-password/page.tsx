"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Lock, ArrowRight, CheckCircle2, AlertTriangle } from "lucide-react";
import { useApp } from "@/context/AppContext";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const { settings } = useApp();
  const searchParams = useSearchParams();
  const token = searchParams?.get("token");

  const primaryColor = settings?.primaryColor || "#d31e28";

  useEffect(() => {
    if (!token) {
      setError("Invalid or missing password reset token.");
    }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    
    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token, password }),
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
            <h1 style={styles.title}>Password Reset</h1>
            <p style={styles.subtitle}>
              Your password has been successfully reset. You can now login with your new password.
            </p>
            <Link href="/login" style={{ ...styles.submitBtn, backgroundColor: primaryColor, textDecoration: "none" }}>
              Go to Login
            </Link>
          </div>
        ) : (
          <>
            <h1 style={styles.title}>Create New Password</h1>
            <p style={styles.subtitle}>Enter your new password below.</p>

            {error && (
              <div style={styles.errorAlert}>
                <AlertTriangle size={16} style={{ flexShrink: 0, marginTop: "2px" }} />
                <span>{error}</span>
              </div>
            )}

            {token ? (
              <form onSubmit={handleSubmit} style={styles.form}>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>New Password</label>
                  <div style={styles.inputWrapper}>
                    <Lock size={18} style={styles.inputIcon} />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      style={styles.input}
                      placeholder="••••••••"
                      minLength={6}
                    />
                  </div>
                </div>

                <div style={styles.inputGroup}>
                  <label style={styles.label}>Confirm New Password</label>
                  <div style={styles.inputWrapper}>
                    <Lock size={18} style={styles.inputIcon} />
                    <input
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      style={styles.input}
                      placeholder="••••••••"
                      minLength={6}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  style={{ ...styles.submitBtn, backgroundColor: primaryColor, opacity: loading ? 0.7 : 1 }}
                >
                  {loading ? "Resetting..." : "Reset Password"}
                  {!loading && <ArrowRight size={18} style={{ marginLeft: "8px" }} />}
                </button>
              </form>
            ) : (
               <div style={styles.footer}>
                 <Link href="/forgot-password" style={{ color: primaryColor, fontWeight: "600", textDecoration: "none" }}>
                   Request a new reset link
                 </Link>
               </div>
            )}
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
    display: "flex",
    alignItems: "flex-start",
    gap: "8px"
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
  }
};
