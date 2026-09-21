"use client";

import { useEffect } from "react";
import { AlertTriangle, Home, RefreshCcw } from "lucide-react";
import Link from "next/link";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global Error Caught:", error);
  }, [error]);

  return (
    <div style={{ 
      minHeight: "100vh", 
      display: "flex", 
      alignItems: "center", 
      justifyContent: "center", 
      backgroundColor: "#0f172a",
      padding: "20px"
    }}>
      <div style={{ 
        maxWidth: "800px", 
        width: "100%", 
        backgroundColor: "#1e293b", 
        borderRadius: "16px", 
        boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
        border: "1px solid #334155",
        overflow: "hidden"
      }}>
        <div style={{ backgroundColor: "#7f1d1d", padding: "32px", textAlign: "center", borderBottom: "1px solid #991b1b" }}>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: "16px" }}>
            <div style={{ backgroundColor: "rgba(254, 226, 226, 0.1)", padding: "16px", borderRadius: "50%", color: "#fecaca" }}>
              <AlertTriangle size={48} />
            </div>
          </div>
          <h2 style={{ color: "white", fontSize: "28px", fontWeight: "bold", margin: 0 }}>Critical Application Error</h2>
          <p style={{ color: "#fca5a5", marginTop: "8px", fontSize: "16px" }}>The application encountered an unexpected server error.</p>
        </div>
        
        <div style={{ padding: "32px" }}>
          <div style={{ marginBottom: "24px" }}>
            <h3 style={{ fontSize: "16px", fontWeight: "600", color: "#e2e8f0", marginBottom: "8px" }}>Error Message:</h3>
            <div style={{ backgroundColor: "#020617", padding: "16px", borderRadius: "8px", color: "#f87171", fontFamily: "monospace", fontSize: "15px", border: "1px solid #1e293b" }}>
              {error.message || "Unknown error occurred"}
            </div>
          </div>

          {error.stack && (
            <div style={{ marginBottom: "32px" }}>
              <h3 style={{ fontSize: "16px", fontWeight: "600", color: "#e2e8f0", marginBottom: "8px" }}>Developer Stack Trace:</h3>
              <div style={{ backgroundColor: "#020617", padding: "16px", borderRadius: "8px", overflowX: "auto", border: "1px solid #1e293b" }}>
                <pre style={{ color: "#94a3b8", fontFamily: "monospace", fontSize: "13px", margin: 0, whiteSpace: "pre-wrap" }}>
                  {error.stack}
                </pre>
              </div>
            </div>
          )}

          <div style={{ display: "flex", justifyContent: "center", gap: "16px", flexWrap: "wrap" }}>
            <button
              onClick={() => reset()}
              style={{ 
                backgroundColor: "#3b82f6", 
                color: "white", 
                border: "none", 
                padding: "12px 24px", 
                borderRadius: "8px", 
                fontWeight: "600", 
                fontSize: "16px", 
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                transition: "background-color 0.2s"
              }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = "#2563eb"}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = "#3b82f6"}
            >
              <RefreshCcw size={18} />
              Reload Page
            </button>
            <Link 
              href="/"
              style={{ 
                backgroundColor: "#334155", 
                color: "white", 
                border: "1px solid #475569", 
                padding: "12px 24px", 
                borderRadius: "8px", 
                fontWeight: "600", 
                fontSize: "16px", 
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                textDecoration: "none",
                transition: "background-color 0.2s"
              }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = "#475569"}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = "#334155"}
            >
              <Home size={18} />
              Return to Store
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
