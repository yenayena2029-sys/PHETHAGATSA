"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useApp } from "@/context/AppContext";
import { useEffect, useState } from "react";

export default function Footer() {
  const pathname = usePathname();
  const { t } = useApp();
  const [storeName, setStoreName] = useState("PHETHAGATSA SOLUTIONS");
  const [storeEmail, setStoreEmail] = useState("hello@ubuntuwellness.co.za");

  useEffect(() => {
    fetch("/api/settings", { cache: "no-store" })
      .then((response) => response.ok ? response.json() : null)
      .then((settings) => {
        if (settings?.storeName) setStoreName(settings.storeName);
        if (settings?.storeEmail) setStoreEmail(settings.storeEmail);
      })
      .catch((error) => console.error("Failed to load footer settings:", error));
  }, []);

  if (pathname?.startsWith("/admin")) {
    return null;
  }

  return (
    <footer id="contact" style={styles.footer}>
      <div className="container" style={styles.footerGrid}>
        <div>
          <h3 style={styles.logo}>{storeName}</h3>
          <p style={styles.text}>
            {t("Discover considered skincare and self-care made with the botanicals, rituals and warmth of Mzansi.")}
          </p>
        </div>
        <div>
          <h4 style={styles.heading}>{t("Shop")}</h4>
          <ul style={styles.list}>
            <li><Link href="/shop?category=skincare" style={styles.link}>{t("Skincare")}</Link></li>
            <li><Link href="/shop?category=body-care" style={styles.link}>{t("Body Care")}</Link></li>
            <li><Link href="/shop?category=wellness" style={styles.link}>{t("Wellness")}</Link></li>
            <li><Link href="/shop?category=new-arrivals" style={styles.link}>{t("New Arrivals")}</Link></li>
          </ul>
        </div>
        <div>
          <h4 style={styles.heading}>{t("Company")}</h4>
          <ul style={styles.list}>
            <li><Link href="/#about" style={styles.link}>{t("About Us")}</Link></li>
            <li><Link href="/#careers" style={styles.link}>{t("Careers")}</Link></li>
            <li><Link href="/contact" style={styles.link}>{t("Contact")}</Link></li>
            <li><Link href="/#faq" style={styles.link}>{t("FAQ")}</Link></li>
          </ul>
        </div>
        <div>
          <h4 style={styles.heading}>{t("Contact")}</h4>
          <p style={styles.text}>{t("Email")}: {storeEmail}</p>
          <p style={styles.text}>{t("Phone")}: +27 (0) 21 555 0148</p>
          <p style={styles.text}>{t("Address")}: Cape Town, South Africa</p>
        </div>
      </div>
      <div style={styles.bottom}>
        <p>&copy; {new Date().getFullYear()} {storeName}. All rights reserved.</p>
      </div>
    </footer>
  );
}

const styles: Record<string, React.CSSProperties> = {
  footer: {
    backgroundColor: "#080a09",
    color: "#ffffff",
    padding: "60px 0 30px",
    marginTop: "0",
    borderTop: "1px solid rgba(198, 174, 112, 0.2)",
  },
  footerGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
    gap: "clamp(24px, 4vw, 40px)",
  },
  logo: {
    fontFamily: "var(--font-serif)",
    fontSize: "24px",
    fontWeight: "800",
    color: "#f2e7c8",
    marginBottom: "16px",
  },
  text: {
    color: "#9ca995",
    fontSize: "14px",
    lineHeight: "1.6",
    marginBottom: "8px",
  },
  heading: {
    fontSize: "16px",
    fontWeight: "600",
    textTransform: "uppercase",
    marginBottom: "20px",
    letterSpacing: "0.5px",
    color: "#c6ad6e",
  },
  list: {
    listStyle: "none",
    padding: 0,
    margin: 0,
  },
  link: {
    color: "#9ca995",
    fontSize: "14px",
    display: "inline-block",
    marginBottom: "12px",
    transition: "color 0.2s ease",
  },
  bottom: {
    borderTop: "1px solid rgba(198, 174, 112, 0.18)",
    marginTop: "40px",
    paddingTop: "20px",
    textAlign: "center",
    fontSize: "13px",
    color: "#6f7b6c",
  },
};
