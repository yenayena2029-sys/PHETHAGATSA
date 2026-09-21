"use client";

import React, { useState, useRef, useEffect } from "react";
import { PHONE_COUNTRIES, PhoneCountry } from "@/lib/phoneCodes";

interface PhoneInputProps {
  value: string;
  onChange: (fullNumber: string) => void;
  disabled?: boolean;
  placeholder?: string;
  defaultCountryIso?: string; // e.g. "ma" for Morocco
}

export default function PhoneInput({
  value,
  onChange,
  disabled = false,
  placeholder,
  defaultCountryIso = "ma",
}: PhoneInputProps) {
  const defaultCountry =
    PHONE_COUNTRIES.find((c) => c.iso2 === defaultCountryIso) ||
    PHONE_COUNTRIES.find((c) => c.iso2 === "us") ||
    PHONE_COUNTRIES[0];

  const [selectedCountry, setSelectedCountry] = useState<PhoneCountry>(defaultCountry);
  const [localNumber, setLocalNumber] = useState("");
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Detect user's country via IP on first mount
  useEffect(() => {
    fetch("https://ipapi.co/json/")
      .then((r) => r.json())
      .then((data) => {
        if (data && data.country_code) {
          const iso = data.country_code.toLowerCase();
          const match = PHONE_COUNTRIES.find((c) => c.iso2 === iso);
          if (match) {
            setSelectedCountry(match);
            onChange(match.dialCode + localNumber);
          }
        }
      })
      .catch(() => {
        // Keep default country if IP lookup fails
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    function handleOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
        setSearch("");
      }
    }
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const num = e.target.value.replace(/[^0-9]/g, "");
    setLocalNumber(num);
    onChange(selectedCountry.dialCode + num);
  };

  const handleCountrySelect = (country: PhoneCountry) => {
    setSelectedCountry(country);
    onChange(country.dialCode + localNumber);
    setOpen(false);
    setSearch("");
  };

  const filtered = PHONE_COUNTRIES.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.dialCode.includes(search)
  );

  return (
    <div style={styles.container} ref={dropdownRef}>
      {/* Country Code Button */}
      <button
        type="button"
        onClick={() => !disabled && setOpen(!open)}
        disabled={disabled}
        style={{
          ...styles.countryBtn,
          opacity: disabled ? 0.6 : 1,
          cursor: disabled ? "default" : "pointer",
        }}
      >
        <img
          src={`/images/flags/${selectedCountry.iso2}.svg`}
          alt={selectedCountry.name}
          style={styles.flag}
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = "none";
          }}
        />
        <span style={styles.dialCode}>{selectedCountry.dialCode}</span>
        <svg
          width="10"
          height="6"
          viewBox="0 0 10 6"
          fill="none"
          style={{ marginLeft: 2, transition: "transform 0.2s", transform: open ? "rotate(180deg)" : "rotate(0deg)" }}
        >
          <path d="M1 1l4 4 4-4" stroke="#64748b" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {/* Dropdown */}
      {open && (
        <div style={styles.dropdown}>
          {/* Search */}
          <div style={styles.searchRow}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" style={{ flexShrink: 0 }}>
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search country..."
              style={styles.searchInput}
              autoFocus
            />
          </div>
          {/* List */}
          <div style={styles.list}>
            {filtered.length === 0 ? (
              <div style={styles.noResult}>No country found</div>
            ) : (
              filtered.map((c) => (
                <button
                  key={c.iso2}
                  type="button"
                  onClick={() => handleCountrySelect(c)}
                  style={{
                    ...styles.listItem,
                    backgroundColor: selectedCountry.iso2 === c.iso2 ? "rgba(99,102,241,0.08)" : "transparent",
                  }}
                >
                  <img
                    src={`/images/flags/${c.iso2}.svg`}
                    alt={c.name}
                    style={styles.flag}
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                  <span style={styles.countryName}>{c.name}</span>
                  <span style={styles.countryCode}>{c.dialCode}</span>
                </button>
              ))
            )}
          </div>
        </div>
      )}

      {/* Phone Number Input */}
      <input
        type="tel"
        value={localNumber}
        onChange={handleNumberChange}
        placeholder={placeholder || "612 345 678"}
        disabled={disabled}
        style={styles.input}
        inputMode="numeric"
      />
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    position: "relative",
    display: "flex",
    alignItems: "center",
    border: "1px solid #cbd5e1",
    borderRadius: "10px",
    backgroundColor: "white",
    overflow: "visible",
    width: "100%",
  },
  countryBtn: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    padding: "0 12px",
    height: "48px",
    background: "#f8fafc",
    border: "none",
    borderRight: "1px solid #e2e8f0",
    borderRadius: "10px 0 0 10px",
    flexShrink: 0,
    outline: "none",
    minWidth: "88px",
  },
  flag: {
    width: "22px",
    height: "15px",
    objectFit: "cover",
    borderRadius: "2px",
    border: "1px solid #e2e8f0",
  },
  dialCode: {
    fontSize: "13px",
    fontWeight: "600",
    color: "#334155",
  },
  input: {
    flex: 1,
    height: "48px",
    border: "none",
    outline: "none",
    padding: "0 14px",
    fontSize: "14px",
    color: "#0f172a",
    backgroundColor: "transparent",
    borderRadius: "0 10px 10px 0",
  },
  dropdown: {
    position: "absolute",
    top: "calc(100% + 6px)",
    left: 0,
    width: "300px",
    backgroundColor: "white",
    border: "1px solid #e2e8f0",
    borderRadius: "12px",
    boxShadow: "0 10px 40px rgba(0,0,0,0.12)",
    zIndex: 9999,
    overflow: "hidden",
  },
  searchRow: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "10px 12px",
    borderBottom: "1px solid #f1f5f9",
  },
  searchInput: {
    flex: 1,
    border: "none",
    outline: "none",
    fontSize: "13px",
    color: "#0f172a",
    backgroundColor: "transparent",
  },
  list: {
    maxHeight: "230px",
    overflowY: "auto",
    padding: "4px 0",
  },
  listItem: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    width: "100%",
    padding: "8px 14px",
    border: "none",
    cursor: "pointer",
    textAlign: "left",
    transition: "background 0.1s",
  },
  countryName: {
    flex: 1,
    fontSize: "13px",
    color: "#334155",
    fontWeight: "500",
  },
  countryCode: {
    fontSize: "12px",
    color: "#94a3b8",
    fontFamily: "monospace",
    fontWeight: "600",
  },
  noResult: {
    padding: "20px",
    textAlign: "center",
    color: "#94a3b8",
    fontSize: "13px",
  },
};
