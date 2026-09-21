"use client";

import React, { useState } from "react";
import { Sparkles, Download, Upload, AlertCircle, CheckCircle, Loader2 } from "lucide-react";

export default function AdminImportExportPage() {
  const [uploading, setUploading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleImport = (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);
    setSuccess(false);

    // Simulate bulk import process
    setTimeout(() => {
      setUploading(false);
      setSuccess(true);
    }, 2000);
  };

  const handleExport = () => {
    setDownloading(true);
    // Simulate JSON file download creation
    setTimeout(() => {
      setDownloading(false);
      
      // Create a dummy JSON file and download it
      const dummyData = { store: "SnapShop", exportDate: new Date(), productsCount: 52 };
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(dummyData, null, 2));
      const downloadAnchor = document.createElement("a");
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `snapshop-inventory-${Date.now()}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    }, 1500);
  };

  return (
    <div style={styles.container}>
      <div style={styles.titleRow}>
        <div>
          <h2 style={styles.title}>Bulk Import & Export</h2>
          <p style={styles.subtitle}>Batch update inventories, download listings backups, or migrate store catalogs.</p>
        </div>
      </div>

      <div style={styles.grid}>
        {/* Bulk Import */}
        <div style={styles.card}>
          <div style={{ display: "flex", gap: "12px", alignItems: "center", marginBottom: "16px" }}>
            <div style={{ ...styles.iconWrapper, backgroundColor: "rgba(99, 102, 241, 0.1)" }}>
              <Upload size={20} color="#6366f1" />
            </div>
            <h3 style={styles.cardTitle}>Import Inventory CSV</h3>
          </div>
          <p style={styles.cardSub}>Upload a `.csv` spreadsheet containing product titles, descriptions, pricing, and stock.</p>

          <form onSubmit={handleImport} style={styles.form}>
            {success && (
              <div style={styles.successAlert}>
                <CheckCircle size={16} style={{ marginRight: 8 }} />
                CSV Catalog sync successfully completed! 52 Products processed.
              </div>
            )}
            
            <div style={styles.uploadArea}>
              <Upload size={32} color="#94a3b8" style={{ marginBottom: 12 }} />
              <div style={{ fontSize: "14px", fontWeight: "600", color: "#334155" }}>Drag & Drop file here</div>
              <div style={{ fontSize: "12px", color: "#94a3b8", marginTop: 4 }}>or click to browse local files</div>
              <input type="file" accept=".csv" style={{ position: "absolute", opacity: 0, top: 0, left: 0, width: "100%", height: "100%", cursor: "pointer" }} />
            </div>

            <div style={styles.tipBox}>
              <AlertCircle size={16} color="#6366f1" style={{ marginRight: 8, flexShrink: 0 }} />
              <span style={{ fontSize: "12px", color: "#4f46e5", lineHeight: "1.4" }}>
                Make sure your CSV aligns with the standard product column titles: title, price, description, stock, image.
              </span>
            </div>

            <button type="submit" disabled={uploading} style={styles.btn}>
              {uploading ? (
                <>
                  <Loader2 size={16} className="animate-spin" style={{ marginRight: 8, animation: "spin 1s linear infinite" }} />
                  Processing CSV Data...
                </>
              ) : (
                "Start Bulk Sync"
              )}
            </button>
          </form>
        </div>

        {/* Backups & Export */}
        <div style={styles.card}>
          <div style={{ display: "flex", gap: "12px", alignItems: "center", marginBottom: "16px" }}>
            <div style={{ ...styles.iconWrapper, backgroundColor: "rgba(16, 185, 129, 0.1)" }}>
              <Download size={20} color="#10b981" />
            </div>
            <h3 style={styles.cardTitle}>Export Store Catalog</h3>
          </div>
          <p style={styles.cardSub}>Download a JSON structured backup containing all product, variations, and catalog details.</p>

          <div style={{ display: "flex", flexDirection: "column", gap: "20px", marginTop: "24px" }}>
            <div style={styles.exportItem}>
              <div>
                <div style={{ fontSize: "14px", fontWeight: "600", color: "#1e293b" }}>Full Catalog Backup (JSON)</div>
                <div style={{ fontSize: "12px", color: "#94a3b8", marginTop: 2 }}>Includes all active variants, descriptions, and linked assets.</div>
              </div>
              <button onClick={handleExport} disabled={downloading} style={styles.exportBtn}>
                {downloading ? (
                  <Loader2 size={16} className="animate-spin" style={{ animation: "spin 1s linear infinite" }} />
                ) : (
                  <Download size={16} />
                )}
              </button>
            </div>
          </div>
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
  grid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px", alignItems: "start" },
  card: { backgroundColor: "white", borderRadius: "16px", padding: "24px", border: "1px solid #e2e8f0", boxShadow: "0 1px 3px rgba(0,0,0,0.02)" },
  iconWrapper: { width: "36px", height: "36px", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center" },
  cardTitle: { fontSize: "18px", fontWeight: "700", color: "#0f172a", margin: 0 },
  cardSub: { fontSize: "13px", color: "#64748b", margin: "4px 0 20px 0" },
  form: { display: "flex", flexDirection: "column", gap: "16px" },
  uploadArea: { position: "relative", border: "2px dashed #cbd5e1", borderRadius: "12px", padding: "32px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", backgroundColor: "#f8fafc", transition: "border-color 0.2s" },
  tipBox: { display: "flex", alignItems: "center", padding: "10px 14px", backgroundColor: "rgba(99, 102, 241, 0.05)", borderRadius: "8px" },
  btn: { backgroundColor: "#0f172a", color: "white", padding: "12px", borderRadius: "8px", border: "none", fontWeight: "600", fontSize: "14px", cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center" },
  exportItem: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px", backgroundColor: "#f8fafc", border: "1px solid #f1f5f9", borderRadius: "12px" },
  exportBtn: { border: "1px solid #e2e8f0", backgroundColor: "white", color: "#475569", width: "36px", height: "36px", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", transition: "all 0.2s" },
  successAlert: { backgroundColor: "#ecfdf5", color: "#10b981", border: "1px solid #a7f3d0", borderRadius: "8px", padding: "10px 14px", fontSize: "13px", fontWeight: "500", display: "flex", alignItems: "center" },
};
