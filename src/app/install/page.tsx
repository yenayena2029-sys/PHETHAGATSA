"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  Database, 
  Settings, 
  UserPlus, 
  CheckCircle, 
  Loader2, 
  ArrowRight,
  Server,
  Globe,
  Lock,
  ShoppingBag
} from "lucide-react";

export default function InstallWizard() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Form State
  const [websiteInfo, setWebsiteInfo] = useState({ storeName: "SnapShop", websiteLink: "" });
  const [adminInfo, setAdminInfo] = useState({ username: "", email: "", password: "" });

  const testDbConnection = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/install/test-db");
      const data = await res.json();
      if (data.success) {
        setStep(2);
      } else {
        setError(data.message || "Failed to connect to the database.");
      }
    } catch (err) {
      setError("Network error. Please check your connection.");
    }
    setLoading(false);
  };

  const setupDatabase = async () => {
    setLoading(true);
    setError("");
    try {
      // Simulate professional delay for 5 seconds to look busy
      await new Promise((resolve) => setTimeout(resolve, 5000));

      const res = await fetch("/api/install/setup-db", { method: "POST" });
      const data = await res.json();
      if (data.success) {
        setStep(3);
      } else {
        setError(data.message || "Failed to initialize tables.");
      }
    } catch (err) {
      setError("Network error during database setup.");
    }
    setLoading(false);
  };

  const finalizeInstallation = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/install/finalize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...websiteInfo, ...adminInfo }),
      });
      const data = await res.json();
      if (data.success) {
        setStep(5);
      } else {
        setError(data.message || "Failed to finalize installation.");
      }
    } catch (err) {
      setError("Network error during finalization.");
    }
    setLoading(false);
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "20px" }}>
      
      {/* Brand Header */}
      <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "40px" }}>
        <div style={{ background: "linear-gradient(135deg, #ef4444, #f97316)", padding: "10px", borderRadius: "12px", color: "white" }}>
          <ShoppingBag size={28} />
        </div>
        <h1 style={{ fontSize: "28px", fontWeight: "700", margin: 0, letterSpacing: "-0.5px" }}>SnapShop Setup</h1>
      </div>

      <div style={{ width: "100%", maxWidth: "600px", backgroundColor: "#1e293b", borderRadius: "16px", padding: "40px", boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.1)", border: "1px solid #334155" }}>
        
        {/* Progress Bar */}
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "40px", position: "relative" }}>
          <div style={{ position: "absolute", top: "50%", left: "0", right: "0", height: "2px", backgroundColor: "#334155", zIndex: 0, transform: "translateY(-50%)" }}></div>
          {[1, 2, 3, 4].map((i) => (
            <div key={i} style={{ position: "relative", zIndex: 1, width: "32px", height: "32px", borderRadius: "50%", backgroundColor: step >= i ? "#ef4444" : "#0f172a", border: `2px solid ${step >= i ? "#ef4444" : "#334155"}`, color: step >= i ? "white" : "#94a3b8", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "600", fontSize: "14px", transition: "all 0.3s" }}>
              {step > i ? <CheckCircle size={16} /> : i}
            </div>
          ))}
        </div>

        {error && (
          <div style={{ backgroundColor: "rgba(239, 68, 68, 0.1)", color: "#ef4444", padding: "12px 16px", borderRadius: "8px", marginBottom: "24px", fontSize: "14px", display: "flex", alignItems: "center", gap: "8px" }}>
            <Server size={18} />
            {error}
          </div>
        )}

        {/* Step 1: Database Test */}
        {step === 1 && (
          <div style={{ textAlign: "center", animation: "fadeIn 0.5s" }}>
            <div style={{ width: "64px", height: "64px", borderRadius: "50%", backgroundColor: "rgba(59, 130, 246, 0.1)", color: "#3b82f6", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px" }}>
              <Database size={32} />
            </div>
            <h2 style={{ fontSize: "24px", marginBottom: "12px" }}>Database Connection</h2>
            <p style={{ color: "#94a3b8", marginBottom: "32px", lineHeight: "1.6" }}>We'll verify your MongoDB connection. Ensure your <code style={{ backgroundColor: "#0f172a", padding: "2px 6px", borderRadius: "4px" }}>MONGODB_URI</code> is set correctly in your environment file before proceeding.</p>
            <button 
              onClick={testDbConnection} 
              disabled={loading}
              style={{ width: "100%", backgroundColor: "#ef4444", color: "white", border: "none", padding: "14px", borderRadius: "8px", fontSize: "16px", fontWeight: "600", cursor: loading ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", transition: "opacity 0.2s", opacity: loading ? 0.7 : 1 }}
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : <CheckCircle size={20} />}
              {loading ? "Testing Connection..." : "Test MongoDB Connection"}
            </button>
          </div>
        )}

        {/* Step 2: Install Tables */}
        {step === 2 && (
          <div style={{ textAlign: "center", animation: "fadeIn 0.5s" }}>
            <div style={{ width: "64px", height: "64px", borderRadius: "50%", backgroundColor: "rgba(245, 158, 11, 0.1)", color: "#f59e0b", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px" }}>
              <Settings size={32} />
            </div>
            <h2 style={{ fontSize: "24px", marginBottom: "12px" }}>Initialize Database</h2>
            <p style={{ color: "#94a3b8", marginBottom: "32px", lineHeight: "1.6" }}>Connection successful! Now we will generate the required collections, configuration schemas, and default English translations.</p>
            <button 
              onClick={setupDatabase} 
              disabled={loading}
              style={{ width: "100%", backgroundColor: "#ef4444", color: "white", border: "none", padding: "14px", borderRadius: "8px", fontSize: "16px", fontWeight: "600", cursor: loading ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", transition: "opacity 0.2s", opacity: loading ? 0.7 : 1 }}
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : <Database size={20} />}
              {loading ? "Installing Tables & Seeds..." : "Install Database Tables"}
            </button>
          </div>
        )}

        {/* Step 3: Website Info */}
        {step === 3 && (
          <div style={{ animation: "fadeIn 0.5s" }}>
            <div style={{ textAlign: "center", marginBottom: "24px" }}>
              <div style={{ width: "64px", height: "64px", borderRadius: "50%", backgroundColor: "rgba(16, 185, 129, 0.1)", color: "#10b981", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
                <Globe size={32} />
              </div>
              <h2 style={{ fontSize: "24px", margin: 0 }}>Website Information</h2>
            </div>
            
            <form onSubmit={(e) => { e.preventDefault(); setStep(4); }}>
              <div style={{ marginBottom: "20px" }}>
                <label style={{ display: "block", marginBottom: "8px", fontSize: "14px", fontWeight: "500", color: "#cbd5e1" }}>Website Name</label>
                <input 
                  type="text" 
                  required
                  value={websiteInfo.storeName}
                  onChange={(e) => setWebsiteInfo({...websiteInfo, storeName: e.target.value})}
                  style={{ width: "100%", backgroundColor: "#0f172a", border: "1px solid #334155", color: "white", padding: "12px 16px", borderRadius: "8px", outline: "none", fontSize: "15px" }}
                />
              </div>
              <div style={{ marginBottom: "32px" }}>
                <label style={{ display: "block", marginBottom: "8px", fontSize: "14px", fontWeight: "500", color: "#cbd5e1" }}>Domain / Link</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. snapshop.com"
                  value={websiteInfo.websiteLink}
                  onChange={(e) => setWebsiteInfo({...websiteInfo, websiteLink: e.target.value})}
                  style={{ width: "100%", backgroundColor: "#0f172a", border: "1px solid #334155", color: "white", padding: "12px 16px", borderRadius: "8px", outline: "none", fontSize: "15px" }}
                />
              </div>
              <button 
                type="submit"
                style={{ width: "100%", backgroundColor: "#ef4444", color: "white", border: "none", padding: "14px", borderRadius: "8px", fontSize: "16px", fontWeight: "600", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}
              >
                Next Step <ArrowRight size={20} />
              </button>
            </form>
          </div>
        )}

        {/* Step 4: Admin Credentials */}
        {step === 4 && (
          <div style={{ animation: "fadeIn 0.5s" }}>
            <div style={{ textAlign: "center", marginBottom: "24px" }}>
              <div style={{ width: "64px", height: "64px", borderRadius: "50%", backgroundColor: "rgba(139, 92, 246, 0.1)", color: "#8b5cf6", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
                <UserPlus size={32} />
              </div>
              <h2 style={{ fontSize: "24px", margin: 0 }}>Create Administrator</h2>
            </div>
            
            <form onSubmit={finalizeInstallation}>
              <div style={{ marginBottom: "16px" }}>
                <label style={{ display: "block", marginBottom: "8px", fontSize: "14px", fontWeight: "500", color: "#cbd5e1" }}>Username</label>
                <input 
                  type="text" 
                  required
                  value={adminInfo.username}
                  onChange={(e) => setAdminInfo({...adminInfo, username: e.target.value})}
                  style={{ width: "100%", backgroundColor: "#0f172a", border: "1px solid #334155", color: "white", padding: "12px 16px", borderRadius: "8px", outline: "none", fontSize: "15px" }}
                />
              </div>
              <div style={{ marginBottom: "16px" }}>
                <label style={{ display: "block", marginBottom: "8px", fontSize: "14px", fontWeight: "500", color: "#cbd5e1" }}>Email Address</label>
                <input 
                  type="email" 
                  required
                  value={adminInfo.email}
                  onChange={(e) => setAdminInfo({...adminInfo, email: e.target.value})}
                  style={{ width: "100%", backgroundColor: "#0f172a", border: "1px solid #334155", color: "white", padding: "12px 16px", borderRadius: "8px", outline: "none", fontSize: "15px" }}
                />
              </div>
              <div style={{ marginBottom: "32px" }}>
                <label style={{ display: "block", marginBottom: "8px", fontSize: "14px", fontWeight: "500", color: "#cbd5e1" }}>Secure Password</label>
                <input 
                  type="password" 
                  required
                  minLength={6}
                  value={adminInfo.password}
                  onChange={(e) => setAdminInfo({...adminInfo, password: e.target.value})}
                  style={{ width: "100%", backgroundColor: "#0f172a", border: "1px solid #334155", color: "white", padding: "12px 16px", borderRadius: "8px", outline: "none", fontSize: "15px" }}
                />
              </div>
              <button 
                type="submit"
                disabled={loading}
                style={{ width: "100%", backgroundColor: "#ef4444", color: "white", border: "none", padding: "14px", borderRadius: "8px", fontSize: "16px", fontWeight: "600", cursor: loading ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", transition: "opacity 0.2s", opacity: loading ? 0.7 : 1 }}
              >
                {loading ? <Loader2 className="animate-spin" size={20} /> : <Lock size={20} />}
                {loading ? "Finalizing Setup..." : "Complete Installation"}
              </button>
            </form>
          </div>
        )}

        {/* Step 5: Success */}
        {step === 5 && (
          <div style={{ textAlign: "center", animation: "fadeIn 0.5s" }}>
            <div style={{ width: "80px", height: "80px", borderRadius: "50%", backgroundColor: "rgba(34, 197, 94, 0.1)", color: "#22c55e", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px" }}>
              <CheckCircle size={40} />
            </div>
            <h2 style={{ fontSize: "28px", marginBottom: "12px", color: "white" }}>Installation Complete!</h2>
            <p style={{ color: "#94a3b8", marginBottom: "40px", lineHeight: "1.6" }}>Congratulations! SnapShop has been successfully installed and configured. Your administrator account is ready.</p>
            
            <div style={{ display: "flex", gap: "16px", flexDirection: "column" }}>
              <button 
                onClick={() => router.push("/admin")}
                style={{ width: "100%", backgroundColor: "#ef4444", color: "white", border: "none", padding: "16px", borderRadius: "8px", fontSize: "16px", fontWeight: "600", cursor: "pointer", transition: "background 0.2s" }}
              >
                Go to Admin Panel
              </button>
              <button 
                onClick={() => router.push("/")}
                style={{ width: "100%", backgroundColor: "transparent", color: "#cbd5e1", border: "1px solid #475569", padding: "16px", borderRadius: "8px", fontSize: "16px", fontWeight: "600", cursor: "pointer", transition: "background 0.2s" }}
              >
                Visit Storefront
              </button>
            </div>
          </div>
        )}

      </div>
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-spin {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}} />
    </div>
  );
}
