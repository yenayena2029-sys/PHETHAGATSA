"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCcw } from "lucide-react";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Admin Panel Error Caught:", error);
  }, [error]);

  return (
    <div style={{ 
      minHeight: "100vh", 
      display: "flex", 
      alignItems: "center", 
      justifyContent: "center", 
      backgroundColor: "#f8fafc",
      padding: "20px"
    }}>
      <div style={{ 
        maxWidth: "800px", 
        width: "100%", 
        backgroundColor: "white", 
        borderRadius: "16px", 
        boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
        overflow: "hidden"
      }}>
        <div style={{ backgroundColor: "#fef2f2", padding: "32px", textAlign: "center", borderBottom: "1px solid #fee2e2" }}>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: "16px" }}>
            <div style={{ backgroundColor: "#fee2e2", padding: "16px", borderRadius: "50%", color: "#ef4444" }}>
              <AlertTriangle size={48} />
            </div>
          </div>
          <h2 style={{ color: "#7f1d1d", fontSize: "24px", fontWeight: "bold", margin: 0 }}>Admin Panel Error</h2>
          <p style={{ color: "#991b1b", marginTop: "8px" }}>An unexpected error occurred while loading this page.</p>
        </div>
        
        <div style={{ padding: "32px" }}>
          <div style={{ marginBottom: "24px" }}>
            <h3 style={{ fontSize: "16px", fontWeight: "600", color: "#334155", marginBottom: "8px" }}>Error Message:</h3>
            <div style={{ backgroundColor: "#f1f5f9", padding: "16px", borderRadius: "8px", color: "#0f172a", fontFamily: "monospace", fontSize: "14px", border: "1px solid #e2e8f0" }}>
              {error.message || "Unknown error"}
            </div>
          </div>

          {error.stack && (
            <div style={{ marginBottom: "32px" }}>
              <h3 style={{ fontSize: "16px", fontWeight: "600", color: "#334155", marginBottom: "8px" }}>Stack Trace (For Developer):</h3>
              <div style={{ backgroundColor: "#0f172a", padding: "16px", borderRadius: "8px", overflowX: "auto" }}>
                <pre style={{ color: "#e2e8f0", fontFamily: "monospace", fontSize: "13px", margin: 0, whiteSpace: "pre-wrap" }}>
                  {error.stack}
                </pre>
              </div>
            </div>
          )}

          <div style={{ display: "flex", justifyContent: "center" }}>
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
              Try Again
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
