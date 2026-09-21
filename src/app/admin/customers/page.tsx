"use client";

import React, { useState, useEffect } from "react";
import { Users, Search, DollarSign, ShoppingBag, TrendingUp, Calendar, Mail, User as UserIcon } from "lucide-react";

interface CustomerData {
  _id: string;
  username: string;
  email: string;
  createdAt: string;
  orderCount: number;
  totalSpend: number;
}

export default function CustomersDashboard() {
  const [customers, setCustomers] = useState<CustomerData[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [currency, setCurrency] = useState("$");
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch settings first to get the active currency
        const settingsRes = await fetch("/api/settings");
        const settingsData = await settingsRes.json();
        if (settingsRes.ok && settingsData?.currency) {
          setCurrency(settingsData.currency);
        }

        // Fetch customers list
        const res = await fetch("/api/admin/customers");
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to fetch customers");
        setCustomers(data);
      } catch (err: any) {
        setError(err.message || "Failed to load customers dashboard");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredCustomers = customers.filter(
    (c) =>
      c.username?.toLowerCase().includes(search.toLowerCase()) ||
      c.email?.toLowerCase().includes(search.toLowerCase())
  );

  // Statistics calculations
  const totalSpendSum = customers.reduce((sum, c) => sum + c.totalSpend, 0);
  const totalOrdersSum = customers.reduce((sum, c) => sum + c.orderCount, 0);
  const avgSpend = customers.length > 0 ? totalSpendSum / customers.length : 0;

  return (
    <div style={styles.container}>
      {/* Header Row */}
      <div style={styles.header}>
        <div>
          <h2 style={styles.title}>Customers Directory</h2>
          <p style={styles.subtitle}>View your registered storefront users, their total orders, and cumulative lifetime value.</p>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div style={styles.errorAlert}>
          <p>{error}</p>
        </div>
      )}

      {/* Stats Grid */}
      <div style={styles.statsGrid}>
        <div style={{ ...styles.statCard, borderLeft: "4px solid #3b82f6" }}>
          <div style={styles.statHeader}>
            <span style={styles.statLabel}>Total Customers</span>
            <div style={{ ...styles.iconBg, backgroundColor: "#eff6ff" }}>
              <Users size={20} color="#3b82f6" />
            </div>
          </div>
          <h3 style={styles.statValue}>{customers.length}</h3>
          <p style={styles.statSub}>Registered customer accounts</p>
        </div>

        <div style={{ ...styles.statCard, borderLeft: "4px solid #10b981" }}>
          <div style={styles.statHeader}>
            <span style={styles.statLabel}>Lifetime Value (LTV)</span>
            <div style={{ ...styles.iconBg, backgroundColor: "#ecfdf5" }}>
              <DollarSign size={20} color="#10b981" />
            </div>
          </div>
          <h3 style={styles.statValue}>
            {currency}{totalSpendSum.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </h3>
          <p style={styles.statSub}>Total revenue generated</p>
        </div>

        <div style={{ ...styles.statCard, borderLeft: "4px solid #8b5cf6" }}>
          <div style={styles.statHeader}>
            <span style={styles.statLabel}>Total Orders Placed</span>
            <div style={{ ...styles.iconBg, backgroundColor: "#f5f3ff" }}>
              <ShoppingBag size={20} color="#8b5cf6" />
            </div>
          </div>
          <h3 style={styles.statValue}>{totalOrdersSum}</h3>
          <p style={styles.statSub}>From checkouts completed</p>
        </div>

        <div style={{ ...styles.statCard, borderLeft: "4px solid #f59e0b" }}>
          <div style={styles.statHeader}>
            <span style={styles.statLabel}>Average Customer LTV</span>
            <div style={{ ...styles.iconBg, backgroundColor: "#fffbeb" }}>
              <TrendingUp size={20} color="#f59e0b" />
            </div>
          </div>
          <h3 style={styles.statValue}>
            {currency}{avgSpend.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </h3>
          <p style={styles.statSub}>Revenue per individual customer</p>
        </div>
      </div>

      {/* Main Content Card */}
      <div style={styles.mainCard}>
        {/* Search Toolbar */}
        <div style={styles.toolbar}>
          <div style={styles.searchWrapper}>
            <Search size={18} style={styles.searchIcon} />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={styles.searchInput}
            />
          </div>
        </div>

        {/* Table Container */}
        {loading ? (
          <div style={styles.loaderContainer}>
            <div style={styles.spinner}></div>
            <p style={{ marginTop: "12px", color: "#64748b" }}>Fetching customers...</p>
          </div>
        ) : filteredCustomers.length === 0 ? (
          <div style={styles.emptyState}>
            <Users size={48} style={{ marginBottom: "12px", color: "#cbd5e1" }} />
            <p>No customers found matching that criteria.</p>
          </div>
        ) : (
          <div style={styles.tableWrapper}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Customer Details</th>
                  <th style={styles.th}>Email Address</th>
                  <th style={styles.th}>Joined Date</th>
                  <th style={styles.th}>Orders Placed</th>
                  <th style={{ ...styles.th, textAlign: "right" }}>Lifetime Spend</th>
                </tr>
              </thead>
              <tbody>
                {filteredCustomers.map((cust) => (
                  <tr key={cust._id} style={styles.tr}>
                    <td style={styles.td}>
                      <div style={styles.customerNameCell}>
                        <div style={styles.avatar}>
                          <UserIcon size={16} color="#475569" />
                        </div>
                        <div>
                          <p style={styles.usernameText}>{cust.username}</p>
                          <p style={styles.idText}>ID: #{cust._id.substring(cust._id.length - 8)}</p>
                        </div>
                      </div>
                    </td>
                    <td style={styles.td}>
                      <div style={styles.emailCell}>
                        <Mail size={14} color="#64748b" style={{ marginRight: 6 }} />
                        <span style={styles.emailText}>{cust.email}</span>
                      </div>
                    </td>
                    <td style={styles.td}>
                      <div style={styles.dateCell}>
                        <Calendar size={14} color="#64748b" style={{ marginRight: 6 }} />
                        <span>{new Date(cust.createdAt).toLocaleDateString()}</span>
                      </div>
                    </td>
                    <td style={styles.td}>
                      <span style={styles.orderBadge}>{cust.orderCount} orders</span>
                    </td>
                    <td style={{ ...styles.td, textAlign: "right" }}>
                      <span style={styles.spendText}>
                        {currency}{cust.totalSpend.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
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
  errorAlert: {
    backgroundColor: "#fef2f2",
    color: "#ef4444",
    border: "1px solid #fca5a5",
    padding: "12px 16px",
    borderRadius: "8px",
    fontSize: "14px",
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "20px",
  },
  statCard: {
    backgroundColor: "#ffffff",
    borderRadius: "16px",
    border: "1px solid #e2e8f0",
    padding: "20px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
  },
  statHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "12px",
  },
  statLabel: {
    fontSize: "13px",
    fontWeight: "600",
    color: "#64748b",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  iconBg: {
    width: "36px",
    height: "36px",
    borderRadius: "8px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  statValue: {
    fontSize: "22px",
    fontWeight: "700",
    color: "#0f172a",
    marginBottom: "4px",
  },
  statSub: {
    fontSize: "12px",
    color: "#94a3b8",
  },
  mainCard: {
    backgroundColor: "#ffffff",
    borderRadius: "16px",
    border: "1px solid #e2e8f0",
    boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
    overflow: "hidden",
  },
  toolbar: {
    padding: "20px",
    borderBottom: "1px solid #e2e8f0",
    backgroundColor: "#f8fafc",
  },
  searchWrapper: {
    position: "relative",
    width: "100%",
    maxWidth: "320px",
  },
  searchIcon: {
    position: "absolute",
    left: "12px",
    top: "50%",
    transform: "translateY(-50%)",
    color: "#94a3b8",
  },
  searchInput: {
    width: "100%",
    padding: "10px 12px 10px 38px",
    borderRadius: "8px",
    border: "1px solid #cbd5e1",
    fontSize: "14px",
    outline: "none",
    transition: "border-color 0.15s ease",
  },
  loaderContainer: {
    padding: "60px",
    textAlign: "center",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  spinner: {
    width: "36px",
    height: "36px",
    border: "3px solid #f1f5f9",
    borderTop: "3px solid #0f172a",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
  },
  emptyState: {
    padding: "60px",
    textAlign: "center",
    color: "#64748b",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  tableWrapper: {
    overflowX: "auto",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    textAlign: "left",
  },
  th: {
    padding: "16px 20px",
    fontSize: "12px",
    fontWeight: "700",
    color: "#64748b",
    textTransform: "uppercase",
    borderBottom: "1px solid #e2e8f0",
    backgroundColor: "#f8fafc",
  },
  tr: {
    borderBottom: "1px solid #f1f5f9",
    transition: "background-color 0.15s",
  },
  td: {
    padding: "16px 20px",
    fontSize: "14px",
    color: "#334155",
    verticalAlign: "middle",
  },
  customerNameCell: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  avatar: {
    width: "36px",
    height: "36px",
    borderRadius: "50%",
    backgroundColor: "#f1f5f9",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  usernameText: {
    fontWeight: "600",
    color: "#0f172a",
  },
  idText: {
    fontSize: "11px",
    color: "#94a3b8",
  },
  emailCell: {
    display: "flex",
    alignItems: "center",
  },
  emailText: {
    fontWeight: "500",
  },
  dateCell: {
    display: "flex",
    alignItems: "center",
    color: "#475569",
  },
  orderBadge: {
    fontSize: "12px",
    fontWeight: "600",
    color: "#3b82f6",
    backgroundColor: "#eff6ff",
    padding: "4px 10px",
    borderRadius: "12px",
  },
  spendText: {
    fontWeight: "700",
    color: "#0f172a",
  },
};
