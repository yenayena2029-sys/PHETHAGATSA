"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Search, User, ShoppingBag, LogOut, LayoutDashboard, LogIn, UserPlus, Menu, X, Package, Heart } from "lucide-react";
import { useApp } from "@/context/AppContext";

export default function Navbar() {
  const { cartCount, user, logout, t } = useApp();
  const [showDropdown, setShowDropdown] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const [showSearch, setShowSearch] = useState(false);
  const [searchVal, setSearchVal] = useState("");

  const [activeLangs, setActiveLangs] = useState<any[]>([]);
  const [currentLang, setCurrentLang] = useState<any>(null);
  const [showLangDropdown, setShowLangDropdown] = useState(false);
  const [logoUrl, setLogoUrl] = useState("/logo.png");
  const [storeName, setStoreName] = useState("PHETHAGATSA SOLUTIONS");

  const getPathLocale = () => {
    if (typeof window === "undefined") return null;
    const parts = window.location.pathname.split("/");
    const firstPart = parts[1];
    const locales = [
      "en", "ar", "fr", "es", "de", "it", "pt", "ru", "zh", "ja", "ko", "tr", "nl",
      "hi", "bn", "pa", "vi", "pl", "uk", "ro", "el", "cs", "hu", "sv", "id", "ms",
      "th", "fa", "he", "no", "da", "fi", "sk", "bg", "hr", "sr", "lt", "lv", "et",
      "sl", "ga", "mt", "is", "al", "ge", "am", "az", "kk", "uz", "tl", "ur"
    ];
    if (locales.includes(firstPart)) {
      return firstPart;
    }
    return null;
  };

  useEffect(() => {
    fetch("/api/settings", { cache: "no-store" })
      .then((res) => {
        const contentType = res.headers.get("content-type");
        if (res.ok && contentType && contentType.includes("application/json")) {
          return res.json();
        }
        throw new Error("Invalid response format or status");
      })
      .then((data) => {
        if (data) {
          if (data.logoUrl) {
            setLogoUrl(data.logoUrl);
          }
          if (data.storeName) {
            setStoreName(data.storeName);
          }
          if (data.languages) {
            const active = data.languages.filter((l: any) => l.isActive);
            setActiveLangs(active);
            
            const defaultLangCode = data.defaultLanguage || "en";
            
            const pathLocale = getPathLocale();
            const cookieLocale = typeof document !== "undefined"
              ? document.cookie.split("; ").find(row => row.startsWith("selected_lang="))?.split("=")[1]
              : null;
            const storedLocale = localStorage.getItem("selected_lang");
            
            const targetLangCode = pathLocale || cookieLocale || storedLocale || defaultLangCode;
            const targetLang = active.find((l: any) => l.code === targetLangCode) || active.find((l: any) => l.isDefault) || active[0];
            
            if (targetLang) {
              setCurrentLang(targetLang);
            }
          }
        }
      })
      .catch((err) => console.error(err));
  }, []);

  const handleLanguageChange = (lang: any) => {
    setCurrentLang(lang);
    localStorage.setItem("selected_lang", lang.code);
    document.cookie = `selected_lang=${lang.code}; path=/; max-age=31536000`;
    setShowLangDropdown(false);
    
    const defaultLangCode = activeLangs.find(l => l.isDefault)?.code || "en";
    const isTargetDefault = lang.code === defaultLangCode;
    
    let cleanPath = window.location.pathname;
    const locales = [
      "en", "ar", "fr", "es", "de", "it", "pt", "ru", "zh", "ja", "ko", "tr", "nl",
      "hi", "bn", "pa", "vi", "pl", "uk", "ro", "el", "cs", "hu", "sv", "id", "ms",
      "th", "fa", "he", "no", "da", "fi", "sk", "bg", "hr", "sr", "lt", "lv", "et",
      "sl", "ga", "mt", "is", "al", "ge", "am", "az", "kk", "uz", "tl", "ur"
    ];
    const parts = cleanPath.split("/");
    if (locales.includes(parts[1])) {
      parts.splice(1, 1);
      cleanPath = parts.join("/") || "/";
    }
    
    let targetPath = cleanPath;
    if (!isTargetDefault) {
      targetPath = `/${lang.code}${cleanPath === "/" ? "" : cleanPath}`;
    }
    
    window.location.href = targetPath + window.location.search;
  };

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setShowDropdown(false);
  }, [pathname]);

  // Prevent body scroll when drawer is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [mobileMenuOpen]);

  // Hide Navbar on Admin pages
  if (pathname?.startsWith("/admin")) {
    return null;
  }

  const navLinks = [
    { href: "/", label: t("Home") },
    { href: "/shop", label: t("Shop") },
    { href: "/contact", label: t("Contact") },
  ];

  return (
    <>
      <header style={styles.header}>
        <div className="container" style={styles.navContainer}>
          {/* Mobile hamburger */}
          <button
            className="mobile-toggle"
            onClick={() => setMobileMenuOpen(true)}
            aria-label="Open menu"
            style={styles.mobileToggle}
          >
            <Menu size={24} />
          </button>

          {/* Logo */}
          <Link href="/" style={styles.logo}>
            <img src={logoUrl} alt="PHETHAGATSA SOLUTIONS Logo" style={{ height: "28px", width: "28px", marginRight: "8px", objectFit: "contain" }} />
            <span className="hide-mobile">{storeName}</span>
            <span className="hide-desktop" style={{ fontSize: "20px" }}>{storeName}</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="nav-desktop" style={styles.nav}>
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                style={{
                  ...styles.navLink,
                  ...(pathname === link.href ? styles.activeLink : {}),
                }}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right Actions */}
          <div style={styles.actions}>
            {/* Dynamic Language Selector - hide on small mobile */}
            {currentLang && activeLangs.length > 0 && (
              <div style={{ position: "relative" }}>
                <button
                  className="lang-selector-hide-mobile"
                  onClick={() => setShowLangDropdown(!showLangDropdown)}
                  style={{
                    ...styles.langSelector,
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px"
                  }}
                >
                  <img src={currentLang.flag} alt="" style={{ width: "18px", height: "12px", objectFit: "cover", borderRadius: "1px" }} />
                  <span style={styles.langText}>{currentLang.name}</span>
                  <span style={styles.arrow}>∨</span>
                </button>

                {showLangDropdown && (
                  <div style={styles.langDropdown}>
                    {activeLangs.map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => handleLanguageChange(lang)}
                        style={{
                          ...styles.dropdownItem,
                          fontWeight: currentLang.code === lang.code ? "600" : "400",
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                          width: "100%",
                          textAlign: "left",
                          padding: "8px 12px",
                          border: "none",
                          background: "none",
                          cursor: "pointer"
                        }}
                      >
                        <img src={lang.flag} alt="" style={{ width: "16px", height: "11px", objectFit: "cover", borderRadius: "1px" }} />
                        <span>{lang.name}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Search Input and Icon */}
            <div style={styles.searchContainer}>
              {showSearch && (
                <input
                  type="text"
                  placeholder={t("Search products...") || "Search products..."}
                  value={searchVal}
                  onChange={(e) => setSearchVal(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && searchVal.trim()) {
                      router.push(`/shop?search=${encodeURIComponent(searchVal.trim())}`);
                      setShowSearch(false);
                      setSearchVal("");
                    }
                  }}
                  style={styles.searchBarInput}
                  autoFocus
                />
              )}
              <button 
                style={styles.actionBtn} 
                onClick={() => {
                  if (showSearch && searchVal.trim()) {
                    router.push(`/shop?search=${encodeURIComponent(searchVal.trim())}`);
                    setShowSearch(false);
                    setSearchVal("");
                  } else {
                    setShowSearch(!showSearch);
                  }
                }}
                aria-label="Search"
              >
                <Search size={20} />
              </button>
            </div>

            {/* User Profile / Auth */}
            <div style={styles.profileWrapper}>
              <button
                style={styles.actionBtn}
                onClick={() => setShowDropdown(!showDropdown)}
                aria-label="User Profile"
              >
                <User size={20} />
                {user && <span style={styles.userDot}></span>}
              </button>

              {showDropdown && (
                <div style={styles.dropdown}>
                  {user ? (
                    <>
                      <div style={styles.dropdownHeader}>
                        <p style={styles.username}>@{user.username}</p>
                        <p style={styles.email}>{user.email}</p>
                      </div>
                      <Link
                        href="/account/profile"
                        style={styles.dropdownItem}
                        onClick={() => setShowDropdown(false)}
                      >
                        <User size={16} style={{ marginRight: 8 }} />
                        Profile
                      </Link>
                      <Link
                        href="/account/orders"
                        style={styles.dropdownItem}
                        onClick={() => setShowDropdown(false)}
                      >
                        <Package size={16} style={{ marginRight: 8 }} />
                        My Orders
                      </Link>
                      <Link
                        href="/account/wishlist"
                        style={styles.dropdownItem}
                        onClick={() => setShowDropdown(false)}
                      >
                        <Heart size={16} style={{ marginRight: 8 }} />
                        Wishlist
                      </Link>
                      {user.role === "admin" && (
                        <Link
                          href="/admin"
                          style={styles.dropdownItem}
                          onClick={() => setShowDropdown(false)}
                        >
                          <LayoutDashboard size={16} style={{ marginRight: 8 }} />
                          Admin Panel
                        </Link>
                      )}
                      <div style={{ borderTop: "1px solid var(--border-color)" }} />
                      <button
                        onClick={() => {
                          setShowDropdown(false);
                          logout();
                        }}
                        style={{ ...styles.dropdownItem, color: "#ef4444" }}
                      >
                        <LogOut size={16} style={{ marginRight: 8 }} />
                        {t("Logout")}
                      </button>
                    </>
                  ) : (
                    <>
                      <Link
                        href="/login"
                        style={styles.dropdownItem}
                        onClick={() => setShowDropdown(false)}
                      >
                        <LogIn size={16} style={{ marginRight: 8 }} />
                        {t("Login")}
                      </Link>
                      <Link
                        href="/signup"
                        style={styles.dropdownItem}
                        onClick={() => setShowDropdown(false)}
                      >
                        <UserPlus size={16} style={{ marginRight: 8 }} />
                        {t("Sign Up")}
                      </Link>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Cart Icon */}
            <Link href="/cart" style={styles.cartBtn} aria-label="Shopping Cart">
              <ShoppingBag size={20} />
              {cartCount > 0 && (
                <span style={styles.cartBadge}>{cartCount}</span>
              )}
            </Link>
          </div>
        </div>
      </header>

      {/* Mobile Drawer Overlay */}
      <div
        className={`nav-mobile-overlay ${mobileMenuOpen ? "open" : ""}`}
        onClick={() => setMobileMenuOpen(false)}
      />

      {/* Mobile Drawer */}
      <div className={`nav-mobile-drawer ${mobileMenuOpen ? "open" : ""}`}>
        {/* Drawer Header */}
        <div className="nav-mobile-header">
          <Link href="/" style={styles.logo} onClick={() => setMobileMenuOpen(false)}>
            <img src="/logo.png" alt="SnapShop" style={{ height: "26px", width: "26px", marginRight: "8px", objectFit: "contain" }} />
            {storeName}
          </Link>
          <button
            onClick={() => setMobileMenuOpen(false)}
            style={{ color: "var(--secondary)", padding: "4px" }}
            aria-label="Close menu"
          >
            <X size={24} />
          </button>
        </div>

        {/* Drawer Nav Links */}
        {navLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`nav-mobile-link ${pathname === link.href ? "active" : ""}`}
            onClick={() => setMobileMenuOpen(false)}
          >
            {link.label}
          </Link>
        ))}

        {/* Drawer Auth */}
        <div style={{ borderTop: "1px solid var(--border-color)", marginTop: "8px", paddingTop: "8px" }}>
          {user ? (
            <>
              <div style={{ padding: "16px 24px", backgroundColor: "var(--bg-light)" }}>
                <p style={{ fontWeight: "600", fontSize: "14px" }}>@{user.username}</p>
                <p style={{ fontSize: "12px", color: "var(--text-muted)" }}>{user.email}</p>
              </div>
              <Link href="/account/profile" className="nav-mobile-link" onClick={() => setMobileMenuOpen(false)}>
                <User size={16} style={{ marginRight: 10 }} />
                Profile
              </Link>
              <Link href="/account/orders" className="nav-mobile-link" onClick={() => setMobileMenuOpen(false)}>
                <Package size={16} style={{ marginRight: 10 }} />
                My Orders
              </Link>
              <Link href="/account/wishlist" className="nav-mobile-link" onClick={() => setMobileMenuOpen(false)}>
                <Heart size={16} style={{ marginRight: 10 }} />
                Wishlist
              </Link>
              {user.role === "admin" && (
                <Link href="/admin" className="nav-mobile-link" onClick={() => setMobileMenuOpen(false)}>
                  <LayoutDashboard size={16} style={{ marginRight: 10 }} />
                  Admin Panel
                </Link>
              )}
              <button
                onClick={() => { setMobileMenuOpen(false); logout(); }}
                className="nav-mobile-link"
                style={{ width: "100%", textAlign: "left", color: "#ef4444" }}
              >
                <LogOut size={16} style={{ marginRight: 10 }} />
                {t("Logout")}
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="nav-mobile-link" onClick={() => setMobileMenuOpen(false)}>
                <LogIn size={16} style={{ marginRight: 10 }} />
                {t("Login")}
              </Link>
              <Link href="/signup" className="nav-mobile-link" onClick={() => setMobileMenuOpen(false)}>
                <UserPlus size={16} style={{ marginRight: 10 }} />
                {t("Sign Up")}
              </Link>
            </>
          )}
        </div>

        {/* Dynamic Language in drawer */}
        {currentLang && activeLangs.length > 0 && (
          <div style={{ padding: "16px 24px", marginTop: "auto", borderTop: "1px solid var(--border-color)" }}>
            <label style={{ fontSize: "12px", color: "var(--text-muted)", display: "block", marginBottom: "8px", fontWeight: "600" }}>
              {t("Select Language")}
            </label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
              {activeLangs.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => handleLanguageChange(lang)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    padding: "6px 12px",
                    borderRadius: "20px",
                    border: currentLang.code === lang.code ? "1.5px solid var(--secondary)" : "1px solid var(--border-color)",
                    backgroundColor: currentLang.code === lang.code ? "var(--bg-light)" : "white",
                    fontSize: "13px",
                    fontWeight: currentLang.code === lang.code ? "600" : "400",
                    cursor: "pointer"
                  }}
                >
                  <img src={lang.flag} alt="" style={{ width: "14px", height: "10px", objectFit: "cover", borderRadius: "1px" }} />
                  <span>{lang.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}

const styles: Record<string, React.CSSProperties> = {
  header: {
    backgroundColor: "rgba(11, 13, 12, 0.94)",
    borderBottom: "1px solid var(--border-color)",
    position: "sticky",
    top: 0,
    zIndex: 100,
    height: "78px",
    display: "flex",
    alignItems: "center",
  },
  navContainer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    gap: "16px",
  },
  logo: {
    fontFamily: "var(--font-serif)",
    fontSize: "20px",
    fontWeight: "600",
    letterSpacing: "1px",
    color: "#f2e7c8",
    display: "flex",
    alignItems: "center",
    flexShrink: 0,
  },
  nav: {
    display: "flex",
    gap: "28px",
    alignItems: "center",
    flex: 1,
    marginLeft: "32px",
  },
  navLink: {
    fontSize: "12px",
    fontWeight: "600",
    color: "var(--text-muted)",
    letterSpacing: "1.4px",
    textTransform: "uppercase",
    transition: "color 0.2s ease",
    whiteSpace: "nowrap",
  },
  activeLink: {
    color: "#c6ad6e",
    fontWeight: "600",
  },
  actions: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    flexShrink: 0,
  },
  langSelector: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    padding: "6px 10px",
    border: "1px solid var(--border-color)",
    borderRadius: "20px",
    fontSize: "13px",
    cursor: "pointer",
    backgroundColor: "#171d19",
  },
  flag: {
    fontSize: "14px",
  },
  langText: {
    fontWeight: "500",
  },
  arrow: {
    fontSize: "10px",
    color: "var(--text-muted)",
  },
  actionBtn: {
    color: "var(--secondary)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "8px",
    borderRadius: "50%",
    transition: "background-color 0.2s ease",
    position: "relative",
  },
  profileWrapper: {
    position: "relative",
  },
  userDot: {
    position: "absolute",
    top: "6px",
    right: "6px",
    width: "8px",
    height: "8px",
    backgroundColor: "var(--primary)",
    borderRadius: "50%",
    border: "2px solid #ffffff",
  },
  dropdown: {
    position: "absolute",
    top: "45px",
    right: 0,
    backgroundColor: "#171d19",
    borderRadius: "var(--radius-md)",
    boxShadow: "var(--shadow-lg)",
    border: "1px solid var(--border-color)",
    width: "220px",
    overflow: "hidden",
    animation: "fadeIn 0.2s ease",
    zIndex: 300,
  },
  dropdownHeader: {
    padding: "16px",
    borderBottom: "1px solid var(--border-color)",
    backgroundColor: "#101512",
  },
  username: {
    fontWeight: "600",
    fontSize: "14px",
    color: "var(--secondary)",
  },
  email: {
    fontSize: "12px",
    color: "var(--text-muted)",
  },
  dropdownItem: {
    display: "flex",
    alignItems: "center",
    width: "100%",
    padding: "12px 16px",
    fontSize: "14px",
    color: "var(--text-main)",
    textAlign: "left",
    transition: "background-color 0.2s ease",
  },
  cartBtn: {
    position: "relative",
    color: "var(--secondary)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "8px",
    borderRadius: "50%",
  },
  cartBadge: {
    position: "absolute",
    top: "-2px",
    right: "-2px",
    backgroundColor: "var(--primary)",
    color: "white",
    fontSize: "10px",
    fontWeight: "700",
    width: "18px",
    height: "18px",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  mobileToggle: {
    color: "var(--secondary)",
    display: "none",
    alignItems: "center",
    justifyContent: "center",
    padding: "8px",
    borderRadius: "50%",
  },
  searchContainer: {
    display: "flex",
    alignItems: "center",
    position: "relative",
    gap: "8px",
  },
  searchBarInput: {
    padding: "8px 12px",
    borderRadius: "20px",
    border: "1px solid var(--border-color)",
    fontSize: "13px",
    outline: "none",
    width: "160px",
    backgroundColor: "var(--bg-light)",
    color: "var(--text-main)",
    transition: "all 0.2s ease",
  },
  langDropdown: {
    position: "absolute",
    top: "calc(100% + 8px)",
    right: 0,
    backgroundColor: "#171d19",
    borderRadius: "8px",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08), 0 1px 3px rgba(0, 0, 0, 0.02)",
    border: "1px solid var(--border-color)",
    padding: "6px",
    display: "flex",
    flexDirection: "column",
    gap: "2px",
    minWidth: "140px",
    zIndex: 1000,
  },
};
