import React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import { verifyToken } from "@/lib/auth";
import Sidebar from "@/components/admin/Sidebar";
import HeaderNotifications from "@/components/admin/HeaderNotifications";
import { AppProvider } from "@/context/AppContext";
import { 
  LayoutDashboard, 
  ShoppingBag, 
  Layers, 
  CreditCard, 
  Users, 
  Settings, 
  TrendingUp, 
  FileText, 
  Bell, 
  Search, 
  ChevronDown, 
  ShieldAlert,
  LogOut
} from "lucide-react";

async function checkAdminAuth() {
  await dbConnect();
  
  let needsInstall = false;
  try {
    const adminCount = await User.countDocuments({ role: "admin" });
    if (adminCount === 0) {
      needsInstall = true;
    }
  } catch (error) {
    needsInstall = true;
  }

  if (needsInstall) {
    redirect("/install");
  }

  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) {
    redirect("/login?error=unauthorized");
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    redirect("/login?error=unauthorized");
  }

  const user = await User.findById(decoded.id);
  if (!user || user.role !== "admin") {
    redirect("/login?error=admin-required");
  }

  return JSON.parse(JSON.stringify(user));
}

import AdminLayoutClient from "@/components/admin/AdminLayoutClient";



export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const adminUser = await checkAdminAuth();

  const headerRight = (
    <>
      <HeaderNotifications />
      <div style={styles.adminProfile}>
        <div style={styles.profileAvatar}>
          {adminUser.username.substring(0, 2).toUpperCase()}
        </div>
        <div style={styles.profileText}>
          <p style={styles.profileName}>@{adminUser.username}</p>
          <p style={styles.profileRole}>Administrator</p>
        </div>
      </div>
    </>
  );

  return (
    <AppProvider>
      <AdminLayoutClient sidebar={<Sidebar />} headerRight={headerRight}>
        {children}
      </AdminLayoutClient>
    </AppProvider>
  );
}

const styles: Record<string, React.CSSProperties> = {
  adminContainer: {
    display: "flex",
    minHeight: "100vh",
    backgroundColor: "#f8fafc",
  },
  sidebar: {
    width: "250px",
    backgroundColor: "#0f172a", /* Very dark navy blue */
    color: "#ffffff",
    display: "flex",
    flexDirection: "column",
    padding: "24px 16px",
    flexShrink: 0,
    borderRight: "1px solid #1e293b",
  },
  brandSection: {
    paddingBottom: "24px",
    borderBottom: "1px solid #1e293b",
    marginBottom: "20px",
  },
  brandTitle: {
    fontSize: "20px",
    fontWeight: "700",
    letterSpacing: "0.5px",
  },
  searchWrapper: {
    position: "relative",
    marginBottom: "24px",
  },
  searchIcon: {
    position: "absolute",
    left: "12px",
    top: "50%",
    transform: "translateY(-50%)",
    color: "#64748b",
  },
  searchInput: {
    width: "100%",
    backgroundColor: "#1e293b",
    border: "none",
    borderRadius: "8px",
    padding: "10px 12px 10px 36px",
    color: "#ffffff",
    fontSize: "13px",
    outline: "none",
  },
  sidebarMenu: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
    flex: 1,
  },
  menuItem: {
    display: "flex",
    alignItems: "center",
    padding: "12px 16px",
    fontSize: "14px",
    fontWeight: "500",
    borderRadius: "8px",
    color: "#94a3b8",
    transition: "all 0.2s",
  },
  menuItemMock: {
    display: "flex",
    alignItems: "center",
    padding: "12px 16px",
    fontSize: "14px",
    fontWeight: "500",
    borderRadius: "8px",
    color: "#475569",
    cursor: "not-allowed",
    position: "relative",
  },
  mockBadge: {
    position: "absolute",
    right: "12px",
    fontSize: "10px",
    backgroundColor: "#334155",
    color: "#94a3b8",
    padding: "2px 6px",
    borderRadius: "4px",
  },
  menuSectionHeader: {
    fontSize: "10px",
    fontWeight: "700",
    color: "#475569",
    letterSpacing: "1px",
    margin: "20px 0 8px 16px",
  },
  menuIcon: {
    marginRight: "12px",
  },
  mainContent: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
  },
  topHeader: {
    height: "70px",
    backgroundColor: "#ffffff",
    borderBottom: "1px solid #e2e8f0",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0 32px",
  },
  adminLabel: {
    fontSize: "15px",
    fontWeight: "600",
    color: "#334155",
  },
  headerRight: {
    display: "flex",
    alignItems: "center",
    gap: "24px",
  },
  headerActionBtn: {
    color: "#64748b",
    position: "relative",
    padding: "6px",
    borderRadius: "50%",
  },
  bellDot: {
    position: "absolute",
    top: "6px",
    right: "6px",
    width: "6px",
    height: "6px",
    backgroundColor: "#ef4444",
    borderRadius: "50%",
  },
  langSelector: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    fontSize: "13px",
    fontWeight: "600",
    color: "#64748b",
    cursor: "pointer",
  },
  flag: {
    fontSize: "16px",
  },
  adminProfile: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  profileAvatar: {
    width: "36px",
    height: "36px",
    borderRadius: "50%",
    backgroundColor: "var(--primary)",
    color: "#ffffff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "700",
    fontSize: "14px",
  },
  profileText: {
    display: "flex",
    flexDirection: "column",
  },
  profileName: {
    fontSize: "13px",
    fontWeight: "600",
    color: "#334155",
    lineHeight: "1",
  },
  profileRole: {
    fontSize: "11px",
    color: "#64748b",
    marginTop: "2px",
  },
  contentBody: {
    padding: "32px",
    overflowY: "auto",
    flex: 1,
  },
};
