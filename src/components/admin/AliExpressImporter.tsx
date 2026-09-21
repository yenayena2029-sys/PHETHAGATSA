"use client";

import React, { useState, useEffect } from "react";
import { Search, Download, Loader2, ShoppingCart, X } from "lucide-react";

interface AliExpressImporterProps {
  onImport: (productData: any) => void;
}

export default function AliExpressImporter({ onImport }: AliExpressImporterProps) {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [error, setError] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [importingId, setImportingId] = useState<string | null>(null);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (query.trim().length >= 3) {
        if (!query.includes("aliexpress.com") && !/^\d+$/.test(query)) {
            performSearch(query);
        }
      } else if (query.trim().length === 0) {
        setShowDropdown(false);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  const performSearch = async (searchQuery: string) => {
    setLoading(true);
    setError("");
    setShowDropdown(true);

    try {
      const res = await fetch(`/api/admin/aliexpress/search?q=${encodeURIComponent(searchQuery)}`);
      
      let data;
      const text = await res.text();
      try {
          data = JSON.parse(text);
      } catch(e) {
          throw new Error("Server error: Failed to parse search results.");
      }

      if (!res.ok) {
        throw new Error(data?.error || "Failed to search");
      }

      setResults(data?.results || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    if (query.includes("aliexpress.com") || /^\d+$/.test(query)) {
      handleImportDirectly(query);
      return;
    }
    
    performSearch(query);
  };

  const handleImportDirectly = async (input: string) => {
    setLoading(false); // Disable search loading
    setImportingId("direct");
    
    try {
      let productId = "";
      let url = "";
      
      if (/^\d+$/.test(input)) {
        productId = input;
      } else {
        url = input;
      }

      const res = await fetch(`/api/admin/aliexpress/import`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, url })
      });
      
      let data;
      const text = await res.text();
      try {
          data = JSON.parse(text);
      } catch(e) {
          throw new Error("Server error: Failed to parse import results.");
      }
      
      if (!res.ok) {
        throw new Error(data.error || "Failed to import");
      }

      onImport(data.product);
      setShowDropdown(false);
      setQuery("");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setImportingId(null);
    }
  };

  const handleImport = async (item: any) => {
    setImportingId(item.id);
    setError("");
    
    try {
      const res = await fetch(`/api/admin/aliexpress/import`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: item.productId || item.id, url: item.url })
      });
      
      let data;
      const text = await res.text();
      try {
          data = JSON.parse(text);
      } catch(e) {
          throw new Error("Server error: Failed to parse import results.");
      }
      
      if (!res.ok) {
        throw new Error(data.error || "Failed to import");
      }

      onImport(data.product);
      setShowDropdown(false);
      setQuery("");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setImportingId(null);
    }
  };

  return (
    <div style={{ position: "relative", zIndex: 50 }}>
      <form onSubmit={handleSearch} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <div style={{ position: "relative" }}>
          <div style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", color: "#64748b" }}>
            <Search size={16} />
          </div>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="AliExpress Keyword or URL..."
            style={{
              padding: "10px 10px 10px 34px",
              borderRadius: "8px",
              border: "1px solid #cbd5e1",
              fontSize: "14px",
              width: "250px",
              outline: "none"
            }}
          />
        </div>
        <button
          type="submit"
          disabled={loading || importingId === "direct"}
          style={{
            backgroundColor: "#f97316",
            color: "white",
            border: "none",
            borderRadius: "8px",
            padding: "10px 16px",
            fontSize: "14px",
            fontWeight: "500",
            cursor: loading ? "not-allowed" : "pointer",
            display: "flex",
            alignItems: "center",
            gap: "6px"
          }}
        >
          {(loading || importingId === "direct") ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
          Auto Import
        </button>
      </form>

      {showDropdown && (
        <div style={{
          position: "absolute",
          top: "100%",
          right: 0,
          marginTop: "8px",
          width: "400px",
          backgroundColor: "white",
          borderRadius: "12px",
          boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
          border: "1px solid #e2e8f0",
          maxHeight: "400px",
          overflowY: "auto",
          padding: "12px"
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px", borderBottom: "1px solid #e2e8f0", paddingBottom: "8px" }}>
            <h4 style={{ margin: 0, fontSize: "14px", fontWeight: "600", color: "#334155" }}>AliExpress Results</h4>
            <button onClick={() => setShowDropdown(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "#64748b" }}>
              <X size={16} />
            </button>
          </div>

          {loading && (
            <div style={{ display: "flex", justifyContent: "center", padding: "20px", color: "#f97316" }}>
              <Loader2 size={24} className="animate-spin" />
            </div>
          )}

          {error && (
            <div style={{ backgroundColor: "#fee2e2", color: "#b91c1c", padding: "10px", borderRadius: "6px", fontSize: "13px", marginBottom: "10px" }}>
              {error}
            </div>
          )}

          {!loading && !error && results.length === 0 && query && (
            <div style={{ textAlign: "center", padding: "20px", color: "#64748b", fontSize: "14px" }}>
              No results found. Try pasting a direct AliExpress product URL instead.
            </div>
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {results.map((item, idx) => (
              <div key={item.id || idx} style={{ display: "flex", gap: "12px", padding: "8px", borderRadius: "8px", backgroundColor: "#f8fafc", alignItems: "center" }}>
                {item.image ? (
                  <img src={item.image} alt="" style={{ width: "60px", height: "60px", objectFit: "cover", borderRadius: "6px" }} />
                ) : (
                  <div style={{ width: "60px", height: "60px", backgroundColor: "#e2e8f0", borderRadius: "6px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <ShoppingCart size={20} color="#94a3b8" />
                  </div>
                )}
                
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ margin: 0, fontSize: "13px", fontWeight: "500", color: "#1e293b", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {item.title}
                  </p>
                  <p style={{ margin: "4px 0 0", fontSize: "13px", color: "#f97316", fontWeight: "600" }}>
                    {item.price || "Check Price"}
                  </p>
                </div>
                
                <button
                  onClick={() => handleImport(item)}
                  disabled={importingId === item.id}
                  style={{
                    backgroundColor: "#10b981",
                    color: "white",
                    border: "none",
                    borderRadius: "6px",
                    padding: "6px 12px",
                    fontSize: "12px",
                    fontWeight: "600",
                    cursor: importingId === item.id ? "not-allowed" : "pointer",
                    display: "flex",
                    alignItems: "center"
                  }}
                >
                  {importingId === item.id ? <Loader2 size={14} className="animate-spin" /> : "Import"}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
