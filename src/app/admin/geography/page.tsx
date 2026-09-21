"use client";

import React, { useState, useEffect } from "react";
import { Globe, DollarSign, Percent, Save, Check, RefreshCw, AlertTriangle, MapPin } from "lucide-react";
import { ALL_COUNTRIES } from "@/lib/countriesList";
import { ALL_CURRENCIES } from "@/lib/currenciesList";

export default function GeographyDashboard() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // State maps directly to the Settings schemas
  const [currency, setCurrency] = useState("$");
  const [currencyPos, setCurrencyPos] = useState("before");
  const [vatRate, setVatRate] = useState(20);
  
  // Custom metadata fields that can be saved in general configuration
  const [storeCountry, setStoreCountry] = useState("Morocco");
  const [activeZones, setActiveZones] = useState<string[]>(["Worldwide"]);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await fetch("/api/settings");
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || "Failed to load store geography settings");
      
      if (data) {
        if (data.currency) setCurrency(data.currency);
        if (data.currencyPos) setCurrencyPos(data.currencyPos);
        if (data.vatRate !== undefined) setVatRate(data.vatRate);
        if (data.storeCountry) setStoreCountry(data.storeCountry);
        if (data.activeZones) {
          setActiveZones(Array.isArray(data.activeZones) ? data.activeZones : [data.activeZones]);
        }
      }
    } catch (err: any) {
      setError(err.message || "Failed to load current geography settings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const payload: any = {
        currency,
        currencyPos,
        vatRate: Number(vatRate),
        storeCountry,
      };

      // Ensure activeZones is an array, not a single string with brackets
      if (Array.isArray(activeZones)) {
        payload.activeZones = activeZones;
      } else if (typeof activeZones === 'string') {
        payload.activeZones = [activeZones];
      } else {
        payload.activeZones = ["Worldwide"];
      }

      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save settings");

      setSuccess("Geography & Tax settings updated successfully!");
      setTimeout(() => setSuccess(""), 4000);
    } catch (err: any) {
      setError(err.message || "Error saving geography changes");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h2 style={styles.title}>Geography & Tax</h2>
          <p style={styles.subtitle}>Configure global checkout currencies, vat taxation rates, and shipping base origin details.</p>
        </div>
        <button onClick={fetchSettings} style={styles.refreshBtn}>
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      {/* Message alerts */}
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

      {loading ? (
        <div style={styles.loaderContainer}>
          <div style={styles.spinner}></div>
          <p style={{ marginTop: "12px", color: "#64748b" }}>Fetching configurations...</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.grid}>
            {/* Card 1: Currency & Symbols */}
            <div style={styles.card}>
              <div style={styles.cardHeader}>
                <div style={{ ...styles.iconBg, backgroundColor: "#eff6ff" }}>
                  <DollarSign size={20} color="#3b82f6" />
                </div>
                <div>
                  <h3 style={styles.cardTitle}>Currency & Positional Display</h3>
                  <p style={styles.cardSubtitle}>Configure active currency symbols and layout settings.</p>
                </div>
              </div>

              <div style={styles.cardBody}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Active Symbol</label>
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    style={styles.select}
                    required
                  >
                    {ALL_CURRENCIES.map((cur) => (
                      <option key={cur.code} value={cur.symbol}>
                        {cur.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Symbol Alignment Positon</label>
                  <select
                    value={currencyPos}
                    onChange={(e) => setCurrencyPos(e.target.value)}
                    style={styles.select}
                  >
                    <option value="before">Before Amount (e.g. $100.00)</option>
                    <option value="after">After Amount (e.g. 100.00 MAD)</option>
                  </select>
                </div>

                <div style={styles.previewContainer}>
                  <span style={styles.previewLabel}>Checkout Price Preview:</span>
                  <span style={styles.previewValue}>
                    {currencyPos === "before" ? `${currency}99.99` : `99.99 ${currency}`}
                  </span>
                </div>
              </div>
            </div>

            {/* Card 2: Taxes & VAT */}
            <div style={styles.card}>
              <div style={styles.cardHeader}>
                <div style={{ ...styles.iconBg, backgroundColor: "#ecfdf5" }}>
                  <Percent size={20} color="#10b981" />
                </div>
                <div>
                  <h3 style={styles.cardTitle}>Taxation & Value Added Tax (VAT)</h3>
                  <p style={styles.cardSubtitle}>Set the checkout taxation rules for calculated invoices.</p>
                </div>
              </div>

              <div style={styles.cardBody}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Global Store VAT Rate (%)</label>
                  <div style={styles.inputGroup}>
                    <input
                      type="number"
                      value={vatRate}
                      onChange={(e) => setVatRate(Number(e.target.value))}
                      style={styles.input}
                      min="0"
                      max="100"
                      required
                    />
                    <span style={styles.inputSuffix}>%</span>
                  </div>
                </div>

                <div style={styles.previewContainer}>
                  <span style={styles.previewLabel}>Calculated Tax on {currency}100.00:</span>
                  <span style={{ ...styles.previewValue, color: "#10b981" }}>
                    {currency}{(100 * (vatRate / 100)).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {/* Card 3: Localization Regions */}
            <div style={styles.card}>
              <div style={styles.cardHeader}>
                <div style={{ ...styles.iconBg, backgroundColor: "#f5f3ff" }}>
                  <Globe size={20} color="#8b5cf6" />
                </div>
                <div>
                  <h3 style={styles.cardTitle}>Store Base Location & Zones</h3>
                  <p style={styles.cardSubtitle}>Select origin warehouse and delivery scope details.</p>
                </div>
              </div>

              <div style={styles.cardBody}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Warehouse Country Origin</label>
                  <select
                    value={storeCountry}
                    onChange={(e) => setStoreCountry(e.target.value)}
                    style={styles.select}
                    required
                  >
                    {ALL_COUNTRIES.map((country) => (
                      <option key={country} value={country}>
                        {country}
                      </option>
                    ))}
                  </select>
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Active Delivery Scope</label>
                  <select
                    multiple
                    value={activeZones}
                    onChange={(e) => {
                      const values = Array.from(e.target.selectedOptions, option => option.value);
                      if (values.includes("Worldwide")) {
                        // If Worldwide is selected, clear everything else or just keep Worldwide
                        if (!activeZones.includes("Worldwide")) {
                          setActiveZones(["Worldwide"]);
                        } else if (values.length > 1) {
                          // If they tried to select something else while Worldwide was already selected
                          setActiveZones(values.filter(v => v !== "Worldwide"));
                        } else {
                          setActiveZones(["Worldwide"]);
                        }
                      } else {
                        setActiveZones(values);
                      }
                    }}
                    style={{ ...styles.select, height: "auto", minHeight: "150px" }}
                  >
                    <option value="Worldwide">Worldwide Delivery</option>
                    {ALL_COUNTRIES.map((country) => (
                      <option key={`del-${country}`} value={country}>
                        {country} Only
                      </option>
                    ))}
                  </select>
                  <p style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "8px" }}>
                    Hold Ctrl (Windows) or Cmd (Mac) to select multiple countries.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div style={styles.footer}>
            <button type="submit" disabled={saving} style={styles.submitBtn}>
              <Save size={16} style={{ marginRight: 8 }} />
              {saving ? "Saving configs..." : "Save Settings"}
            </button>
          </div>
        </form>
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
  refreshBtn: {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    backgroundColor: "#ffffff",
    border: "1px solid #cbd5e1",
    color: "#334155",
    padding: "8px 16px",
    borderRadius: "8px",
    fontSize: "13px",
    fontWeight: "600",
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
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "24px",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
    gap: "24px",
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: "16px",
    border: "1px solid #e2e8f0",
    boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
  },
  cardHeader: {
    padding: "20px",
    borderBottom: "1px solid #f1f5f9",
    display: "flex",
    gap: "12px",
    alignItems: "center",
    backgroundColor: "#f8fafc",
  },
  iconBg: {
    width: "40px",
    height: "40px",
    borderRadius: "8px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  cardTitle: {
    fontSize: "15px",
    fontWeight: "700",
    color: "#0f172a",
  },
  cardSubtitle: {
    fontSize: "12px",
    color: "#64748b",
  },
  cardBody: {
    padding: "20px",
    display: "flex",
    flexDirection: "column",
    gap: "16px",
    flexGrow: 1,
  },
  formGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },
  label: {
    fontSize: "12px",
    fontWeight: "600",
    color: "#475569",
  },
  input: {
    padding: "10px 12px",
    borderRadius: "8px",
    border: "1px solid #cbd5e1",
    fontSize: "14px",
    outline: "none",
    width: "100%",
  },
  select: {
    padding: "10px 12px",
    borderRadius: "8px",
    border: "1px solid #cbd5e1",
    fontSize: "14px",
    backgroundColor: "white",
    outline: "none",
    width: "100%",
  },
  inputGroup: {
    display: "flex",
    alignItems: "center",
    position: "relative",
  },
  inputSuffix: {
    position: "absolute",
    right: "12px",
    color: "#64748b",
    fontSize: "14px",
    fontWeight: "500",
  },
  helpText: {
    fontSize: "11px",
    color: "#94a3b8",
  },
  previewContainer: {
    marginTop: "auto",
    padding: "12px 16px",
    borderRadius: "8px",
    backgroundColor: "#f8fafc",
    border: "1px solid #e2e8f0",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  previewLabel: {
    fontSize: "13px",
    fontWeight: "500",
    color: "#64748b",
  },
  previewValue: {
    fontSize: "15px",
    fontWeight: "700",
    color: "#0f172a",
  },
  footer: {
    display: "flex",
    justifyContent: "flex-end",
    padding: "20px 0",
  },
  submitBtn: {
    backgroundColor: "#0f172a",
    color: "white",
    border: "none",
    padding: "12px 24px",
    borderRadius: "8px",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
    boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
  },
};
