"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  LayoutDashboard, 
  ShoppingBag, 
  Package, 
  ShoppingCart, 
  Users, 
  Megaphone, 
  FileText, 
  FileCode, 
  Truck, 
  Globe, 
  Settings as SettingsIcon,
  ChevronDown, 
  ChevronRight,
  LogOut,
  Search,
  Activity,
  Layers,
  Mail
} from "lucide-react";

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  // Active settings tab
  let activeTab = "general";
  if (pathname?.startsWith("/admin/settings/")) {
    activeTab = pathname.split("/").pop() || "general";
  }
  const isSettingsActive = pathname?.startsWith("/admin/settings");

  // Accordion state
  const [expandedMenus, setExpandedMenus] = useState<Record<string, boolean>>({
    products: pathname?.startsWith("/admin/products"),
    sales: pathname?.startsWith("/admin/orders"),
    settings: isSettingsActive,
  });

  const toggleMenu = (menuKey: string) => {
    setExpandedMenus(prev => ({
      ...prev,
      [menuKey]: !prev[menuKey]
    }));
  };

  // Define Menu Groups
  const menuGroups = [
    {
      title: "Core",
      items: [
        { key: "dashboard", label: "Dashboard", href: "/admin", icon: LayoutDashboard },
        { key: "mailbox", label: "Mailbox", href: "/admin/mailbox", icon: Mail }
      ]
    },
    {
      title: "Catalog & Operations",
      items: [
        {
          key: "products",
          label: "Products",
          icon: ShoppingBag,
          subItems: [
            { key: "all", label: "All Products", href: "/admin/products" },
            { key: "bundles", label: "Product Bundles", href: "/admin/products/bundles" },
            { key: "categories", label: "Categories", href: "/admin/products/categories" },
            { key: "collections", label: "Collections", href: "/admin/products/collections" },
            { key: "brands", label: "Brands", href: "/admin/products/brands" },
            { key: "sizes", label: "Sizes", href: "/admin/products/sizes" },
            { key: "colors", label: "Colors", href: "/admin/products/colors" },
            { key: "templates", label: "Product Templates", href: "/admin/products/templates" }
          ]
        },
        { key: "inventory", label: "Inventory", href: "/admin/inventory", icon: Package },
        {
          key: "sales",
          label: "Sales",
          icon: ShoppingCart,
          subItems: [
            { key: "orders", label: "Orders", href: "/admin/orders" },
            { key: "reports", label: "Reports", href: "/admin/sales/reports" },
            { key: "refunds", label: "Refunds", href: "/admin/sales/refunds" },
            { key: "returns", label: "Returns", href: "/admin/sales/returns" },
            { key: "batch", label: "Batch Processing", href: "/admin/sales/batch-processing" }
          ]
        },
        { key: "customers", label: "Customers", href: "/admin/customers", icon: Users }
      ]
    },
    {
      title: "Marketing & Content",
      items: [
        { key: "marketing", label: "Marketing", href: "/admin/marketing", icon: Megaphone },
        { key: "blogs", label: "Blogs", href: "/admin/blogs", icon: FileText },
        { key: "pages", label: "Page Management", href: "/admin/pages", icon: FileCode }
      ]
    },
    {
      title: "Logistics",
      items: [
        { key: "shipping", label: "Shipping", href: "/admin/shipping", icon: Truck },
        { key: "geography", label: "Geography", href: "/admin/geography", icon: Globe }
      ]
    },
    {
      title: "System Settings",
      items: [
        {
          key: "settings",
          label: "Settings",
          icon: SettingsIcon,
          subItems: [
            { key: "general", label: "General Settings", href: "/admin/settings/general" },
            { key: "theme", label: "Theme Customization", href: "/admin/settings/theme" },
            { key: "languages", label: "Languages & Flags", href: "/admin/settings/languages" },
            { key: "gateways", label: "Payment Gateways", href: "/admin/settings/gateways" },
            { key: "storage", label: "Cloud Storage", href: "/admin/settings/storage" },
            { key: "backup", label: "Backup & Restore", href: "/admin/settings/backup" },
            { key: "mobile", label: "Mobile App Config", href: "/admin/settings/mobile" },
            { key: "auth", label: "Authentication Settings", href: "/admin/settings/auth" },
            { key: "email", label: "Email Configuration", href: "/admin/settings/email" },
            { key: "ai", label: "AI API Settings", href: "/admin/settings/ai" }
          ]
        }
      ]
    }
  ];

  // Auto-expand menus when searching matches their subitems
  useEffect(() => {
    if (searchQuery) {
      const newExpanded: Record<string, boolean> = {};
      menuGroups.forEach(group => {
        group.items.forEach(item => {
          if (item.subItems) {
            const hasMatch = item.subItems.some(sub => sub.label.toLowerCase().includes(searchQuery.toLowerCase()));
            if (hasMatch) {
              newExpanded[item.key] = true;
            }
          }
        });
      });
      setExpandedMenus(prev => ({ ...prev, ...newExpanded }));
    }
  }, [searchQuery]);

  // Filter groups and items
  const filteredGroups = menuGroups.map(group => {
    const matchingItems = group.items.filter(item => {
      const parentMatches = item.label.toLowerCase().includes(searchQuery.toLowerCase());
      const subMatches = item.subItems?.some(sub => sub.label.toLowerCase().includes(searchQuery.toLowerCase()));
      return parentMatches || subMatches;
    });

    return {
      ...group,
      items: matchingItems
    };
  }).filter(group => group.items.length > 0);

  return (
    <aside style={styles.sidebar}>
      {/* Brand Header with Glowing Accent */}
      <div style={styles.brandSection}>
        <div style={styles.logoGlowContainer}>
          <div style={styles.logoIconBg}>
            <img 
              src="/images/Settings/logo.png" 
              onError={(e) => { e.currentTarget.src = "/logo.png"; e.currentTarget.onerror = null; }}
              alt="PHETHAGATSA SOLUTIONS Logo" 
              style={styles.logoImg} 
            />
          </div>
          <div style={styles.logoGlowEffect}></div>
        </div>
        <div>
          <h1 style={styles.brandTitle}>PHETHAGATSA SOLUTIONS</h1>
          <p style={styles.brandSubtitle}>Control Panel</p>
        </div>
      </div>

      {/* Menu Search Filter */}
      <div style={styles.searchWrapper}>
        <Search size={16} style={styles.searchIcon} />
        <input
          type="text"
          placeholder="Filter navigation..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={styles.searchInput}
        />
      </div>

      {/* Navigation List */}
      <nav style={styles.navContainer}>
        {filteredGroups.map((group, groupIdx) => (
          <div key={groupIdx} style={styles.groupWrapper}>
            <div style={styles.groupHeader}>{group.title}</div>
            
            <div style={styles.groupItemsContainer}>
              {group.items.map((item: any) => {
                const hasSubItems = !!item.subItems;
                const isExpanded = !!expandedMenus[item.key];
                
                // Determine active states
                const isCurrentRouteActive = pathname === item.href;
                const isChildRouteActive = item.subItems?.some((sub: any) => {
                  if (item.key === "settings") {
                    return pathname?.startsWith("/admin/settings") && activeTab === sub.key;
                  }
                  return pathname === sub.href;
                });
                
                const isParentActive = isChildRouteActive || isCurrentRouteActive;

                if (!hasSubItems) {
                  return (
                    <Link 
                      key={item.key}
                      href={item.href || "#"} 
                      style={{ 
                        ...styles.menuItem, 
                        ...(isCurrentRouteActive ? styles.activeMenuItem : {}) 
                      }}
                    >
                      {/* Active Indicator Bar */}
                      {isCurrentRouteActive && <div style={styles.activeIndicator} />}
                      <item.icon size={18} style={{
                        ...styles.menuIcon,
                        color: isCurrentRouteActive ? "#ffffff" : "#64748b"
                      }} />
                      <span style={styles.menuText}>{item.label}</span>
                    </Link>
                  );
                }

                // Dropdown layout
                return (
                  <div key={item.key} style={styles.dropdownContainer}>
                    <button 
                      onClick={() => toggleMenu(item.key)} 
                      style={{ 
                        ...styles.menuItem, 
                        ...(isParentActive ? styles.activeParentMenuItem : {}) 
                      }}
                    >
                      <item.icon size={18} style={{
                        ...styles.menuIcon,
                        color: isParentActive ? "#818cf8" : "#64748b"
                      }} />
                      <span style={styles.menuText}>{item.label}</span>
                      <ChevronDown 
                        size={14} 
                        style={{
                          transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)",
                          transition: "transform 0.2s ease",
                          color: isParentActive ? "#818cf8" : "#475569"
                        }} 
                      />
                    </button>

                    {isExpanded && (
                      <div style={styles.submenu}>
                        {item.subItems?.map((sub: any) => {
                          const isSubActive = item.key === "settings"
                            ? (pathname?.startsWith("/admin/settings") && activeTab === sub.key)
                            : pathname === sub.href;

                          return (
                            <Link 
                              key={sub.key || sub.label}
                              href={sub.href || "#"} 
                              style={{ 
                                ...styles.submenuItem,
                                ...(isSubActive ? styles.activeSubmenuItem : {})
                              }}
                            >
                              <div style={{
                                ...styles.submenuDot,
                                backgroundColor: isSubActive ? "#818cf8" : "transparent",
                                boxShadow: isSubActive ? "0 0 8px #818cf8" : "none"
                              }} />
                              {sub.label}
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Logout Footer Section */}
      <div style={styles.footer}>
        <button 
          onClick={async () => {
            await fetch("/api/auth/logout", { method: "POST" });
            router.push("/");
          }} 
          style={styles.logoutBtn}
        >
          <LogOut size={16} style={{ marginRight: 10 }} />
          Logout
        </button>
      </div>
    </aside>
  );
}

const styles: Record<string, React.CSSProperties> = {
  sidebar: {
    width: "260px",
    backgroundColor: "#0b0f19", // Sleek midnight black-blue
    borderRight: "1px solid rgba(255, 255, 255, 0.06)",
    display: "flex",
    flexDirection: "column",
    padding: "24px 16px",
    flexShrink: 0,
    height: "100vh",
    position: "sticky",
    top: 0,
    overflowY: "auto",
    fontFamily: "'Outfit', 'Inter', sans-serif",
  },
  brandSection: {
    display: "flex",
    alignItems: "center",
    gap: "14px",
    paddingBottom: "24px",
    borderBottom: "1px solid rgba(255, 255, 255, 0.05)",
    marginBottom: "20px",
  },
  logoGlowContainer: {
    position: "relative",
    width: "40px",
    height: "40px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  logoIconBg: {
    width: "36px",
    height: "36px",
    borderRadius: "10px",
    backgroundColor: "rgba(99, 102, 241, 0.15)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    border: "1px solid rgba(99, 102, 241, 0.25)",
    zIndex: 2,
  },
  logoImg: {
    width: "22px",
    height: "22px",
    objectFit: "contain",
  },
  logoGlowEffect: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#6366f1",
    filter: "blur(8px)",
    opacity: 0.3,
    borderRadius: "50%",
    zIndex: 1,
  },
  brandTitle: {
    fontSize: "18px",
    fontWeight: "800",
    color: "#ffffff",
    lineHeight: "1.2",
    letterSpacing: "-0.5px",
  },
  brandSubtitle: {
    fontSize: "11px",
    color: "#4f46e5", // Vibrant accent color
    fontWeight: "700",
    letterSpacing: "1px",
    textTransform: "uppercase",
  },
  searchWrapper: {
    position: "relative",
    marginBottom: "20px",
  },
  searchIcon: {
    position: "absolute",
    left: "12px",
    top: "50%",
    transform: "translateY(-50%)",
    color: "#475569",
  },
  searchInput: {
    width: "100%",
    backgroundColor: "rgba(255, 255, 255, 0.03)",
    border: "1px solid rgba(255, 255, 255, 0.08)",
    padding: "10px 12px 10px 38px",
    borderRadius: "10px",
    fontSize: "13px",
    color: "#ffffff",
    outline: "none",
    transition: "all 0.2s ease",
  },
  navContainer: {
    display: "flex",
    flexDirection: "column",
    gap: "18px",
    flex: 1,
  },
  groupWrapper: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },
  groupHeader: {
    fontSize: "10px",
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: "1.5px",
    color: "#475569", // Darker silver for clean section divisions
    paddingLeft: "10px",
    marginBottom: "4px",
  },
  groupItemsContainer: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },
  menuItem: {
    display: "flex",
    alignItems: "center",
    width: "100%",
    padding: "10px 14px",
    fontSize: "14px",
    fontWeight: "500",
    borderRadius: "10px",
    color: "#94a3b8", // Soft silver
    textAlign: "left",
    transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
    position: "relative",
    cursor: "pointer",
    background: "none",
    border: "none",
    outline: "none",
  },
  activeIndicator: {
    position: "absolute",
    left: "0",
    width: "4px",
    height: "18px",
    backgroundColor: "#ffffff",
    borderRadius: "0 4px 4px 0",
  },
  activeMenuItem: {
    background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)", // Vibrant gradient highlight
    color: "#ffffff",
    fontWeight: "600",
    boxShadow: "0 4px 14px rgba(99, 102, 241, 0.35)",
  },
  activeParentMenuItem: {
    backgroundColor: "rgba(255, 255, 255, 0.03)",
    color: "#ffffff",
    fontWeight: "600",
    border: "1px solid rgba(255, 255, 255, 0.05)",
  },
  menuIcon: {
    marginRight: "12px",
    flexShrink: 0,
    transition: "color 0.2s ease",
  },
  menuText: {
    flex: 1,
  },
  dropdownContainer: {
    display: "flex",
    flexDirection: "column",
  },
  submenu: {
    display: "flex",
    flexDirection: "column",
    padding: "8px 12px",
    margin: "6px 4px 6px 16px",
    backgroundColor: "rgba(255, 255, 255, 0.015)",
    border: "1px solid rgba(255, 255, 255, 0.03)",
    borderRadius: "10px",
    gap: "8px",
  },
  submenuItem: {
    display: "flex",
    alignItems: "center",
    fontSize: "13px",
    fontWeight: "500",
    color: "#64748b",
    padding: "4px 8px",
    transition: "all 0.15s ease",
    borderRadius: "6px",
  },
  activeSubmenuItem: {
    color: "#818cf8", // Active color matches our primary theme highlight
    backgroundColor: "rgba(99, 102, 241, 0.05)",
    fontWeight: "600",
  },
  submenuDot: {
    width: "5px",
    height: "5px",
    borderRadius: "50%",
    marginRight: "10px",
    flexShrink: 0,
    transition: "all 0.15s ease",
  },
  footer: {
    marginTop: "auto",
    paddingTop: "20px",
    borderTop: "1px solid rgba(255, 255, 255, 0.05)",
  },
  logoutBtn: {
    display: "flex",
    alignItems: "center",
    width: "100%",
    padding: "10px 14px",
    fontSize: "14px",
    fontWeight: "600",
    color: "#ef4444",
    backgroundColor: "rgba(239, 68, 68, 0.02)",
    border: "1px solid rgba(239, 68, 68, 0.08)",
    borderRadius: "10px",
    cursor: "pointer",
    transition: "all 0.2s ease",
    justifyContent: "center",
    outline: "none",
  },
};
