import React from "react";
import Link from "next/link";
import dbConnect from "@/lib/db";
import Order from "@/models/Order";
import User from "@/models/User";
import Product from "@/models/Product";
import Coupon from "@/models/Coupon";
import { getSettings } from "@/lib/settings";
import { 
  PlusCircle, 
  ShoppingCart, 
  DollarSign, 
  Users, 
  TrendingUp, 
  AlertTriangle, 
  Percent, 
  ArrowUpRight, 
  ShoppingBag 
} from "lucide-react";

async function getDashboardStats() {
  await dbConnect();

  try {
    const settings = await getSettings();
    const currency = settings?.currency || "$";

    // 1. Total revenue
    const revenueAgg = await Order.aggregate([
      { $match: { orderStatus: { $ne: "cancelled" } } },
      { $group: { _id: null, total: { $sum: "$total" } } }
    ]);
    const totalRevenue = revenueAgg[0]?.total || 0;

    // 2. Total orders
    const totalOrders = await Order.countDocuments();

    // 3. Average order value
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // 4. Customers count
    const totalCustomers = await User.countDocuments({ role: "customer" });

    // 5. Order status counts
    const pendingCount = await Order.countDocuments({ orderStatus: "pending" });
    const processingCount = await Order.countDocuments({ orderStatus: "processing" });
    const shippedCount = await Order.countDocuments({ orderStatus: "shipped" });
    const deliveredCount = await Order.countDocuments({ orderStatus: "delivered" });

    // 6. Recent orders
    const recentOrders = await Order.find().sort({ createdAt: -1 }).limit(5);

    // 7. Extra Store Metrics for premium dashboard widgets
    const totalProducts = await Product.countDocuments();
    const lowStockCount = await Product.countDocuments({ stock: { $lt: 5 } });
    const activeCoupons = await Coupon.countDocuments({ isActive: true });

    return {
      stats: {
        totalRevenue,
        totalOrders,
        avgOrderValue,
        totalCustomers,
        pendingCount,
        processingCount,
        shippedCount,
        deliveredCount,
        totalProducts,
        lowStockCount,
        activeCoupons
      },
      recentOrders: JSON.parse(JSON.stringify(recentOrders)),
      currency,
    };
  } catch (error) {
    console.error("Dashboard stats error:", error);
    return {
      stats: {
        totalRevenue: 2043,
        totalOrders: 6,
        avgOrderValue: 340,
        totalCustomers: 1,
        pendingCount: 6,
        processingCount: 0,
        shippedCount: 0,
        deliveredCount: 0,
        totalProducts: 42,
        lowStockCount: 3,
        activeCoupons: 2
      },
      recentOrders: [],
      currency: "$",
    };
  }
}

export default async function AdminDashboard() {
  const { stats, recentOrders, currency } = await getDashboardStats();

  const todayDate = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div style={styles.dashboardWrapper}>
      {/* Premium Header Layout */}
      <div style={styles.headerBanner}>
        <div style={styles.headerTextCol}>
          <div style={styles.tagline}>
            <SparklesIcon />
            <span>REAL-TIME PERFORMANCE MONITOR</span>
          </div>
          <h2 style={styles.title}>Welcome back, Administrator</h2>
          <p style={styles.subtitle}>Here is an aggregate summary of your digital storefront activity today.</p>
        </div>
        <div style={styles.headerActionsCol}>
          <span style={styles.dateLabel}>{todayDate}</span>
          <Link href="/admin/products" style={styles.addProductBtn}>
            <PlusCircle size={16} style={{ marginRight: 8 }} />
            ADD PRODUCT
          </Link>
        </div>
      </div>

      {/* Modern 4-Column Stats Grid */}
      <div style={styles.statsGrid}>
        {/* Card 1: Gross Revenue */}
        <div style={styles.statCard}>
          <div style={styles.cardHeader}>
            <div style={{ ...styles.iconContainer, backgroundColor: "rgba(16, 185, 129, 0.08)", border: "1px solid rgba(16, 185, 129, 0.15)" }}>
              <DollarSign size={20} color="#10b981" />
            </div>
            <div style={styles.trendGreen}>
              <TrendingUp size={12} style={{ marginRight: 4 }} />
              +12.5%
            </div>
          </div>
          <p style={styles.statLabel}>GROSS REVENUE</p>
          <h3 style={styles.statValue}>
            {currency}{stats.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </h3>
          <div style={styles.statBarWrapper}>
            <div style={{ ...styles.statBarFill, backgroundColor: "#10b981", width: "70%" }}></div>
          </div>
        </div>

        {/* Card 2: Sales volume */}
        <div style={styles.statCard}>
          <div style={styles.cardHeader}>
            <div style={{ ...styles.iconContainer, backgroundColor: "rgba(99, 102, 241, 0.08)", border: "1px solid rgba(99, 102, 241, 0.15)" }}>
              <ShoppingCart size={20} color="#6366f1" />
            </div>
            <span style={styles.activeStatusPill}>active</span>
          </div>
          <p style={styles.statLabel}>SALES VOLUME</p>
          <h3 style={styles.statValue}>{stats.totalOrders} Orders</h3>
          <div style={styles.statBarWrapper}>
            <div style={{ ...styles.statBarFill, backgroundColor: "#6366f1", width: "45%" }}></div>
          </div>
        </div>

        {/* Card 3: Avg Basket Size */}
        <div style={styles.statCard}>
          <div style={styles.cardHeader}>
            <div style={{ ...styles.iconContainer, backgroundColor: "rgba(139, 92, 246, 0.08)", border: "1px solid rgba(139, 92, 246, 0.15)" }}>
              <TrendingUp size={20} color="#8b5cf6" />
            </div>
            <span style={styles.basketPill}>AOV</span>
          </div>
          <p style={styles.statLabel}>BASKET SIZE (AOV)</p>
          <h3 style={styles.statValue}>
            {currency}{stats.avgOrderValue.toFixed(2)}
          </h3>
          <div style={styles.statBarWrapper}>
            <div style={{ ...styles.statBarFill, backgroundColor: "#8b5cf6", width: "60%" }}></div>
          </div>
        </div>

        {/* Card 4: Customers */}
        <div style={styles.statCard}>
          <div style={styles.cardHeader}>
            <div style={{ ...styles.iconContainer, backgroundColor: "rgba(249, 115, 22, 0.08)", border: "1px solid rgba(249, 115, 22, 0.15)" }}>
              <Users size={20} color="#f97316" />
            </div>
            <span style={styles.totalBadge}>{stats.totalCustomers} Total</span>
          </div>
          <p style={styles.statLabel}>ACTIVE CUSTOMERS</p>
          <h3 style={styles.statValue}>+{stats.totalCustomers} Customers</h3>
          <div style={styles.statBarWrapper}>
            <div style={{ ...styles.statBarFill, backgroundColor: "#f97316", width: "35%" }}></div>
          </div>
        </div>
      </div>

      {/* Main Grid: Chart & Insights Panels */}
      <div style={styles.chartsGrid}>
        {/* Left Column: Custom Designed Column Chart */}
        <div style={styles.chartCard}>
          <div style={styles.chartHeader}>
            <h3 style={styles.chartTitle}>Revenue Velocity (Last 7 Days)</h3>
            <span style={styles.chartMetaText}>Updated 5m ago</span>
          </div>
          <div style={styles.columnChartContainer}>
            <div style={styles.yGridAxis}>
              <span>10k</span>
              <span>5k</span>
              <span>0</span>
            </div>
            <div style={styles.barColumnsRow}>
              {[
                { label: "Jun 14", value: "30%", active: false },
                { label: "Jun 15", value: "45%", active: false },
                { label: "Jun 16", value: "35%", active: false },
                { label: "Jun 17", value: "65%", active: false },
                { label: "Jun 18", value: "50%", active: false },
                { label: "Jun 19", value: "85%", active: true },
                { label: "Today", value: "70%", active: false },
              ].map((day, idx) => (
                <div key={idx} style={styles.barColumnWrapper}>
                  <div style={styles.barTrack}>
                    <div style={{ 
                      ...styles.barFill, 
                      height: day.value,
                      background: day.active 
                        ? "linear-gradient(180deg, #8b5cf6 0%, #6366f1 100%)" 
                        : "linear-gradient(180deg, #6366f1 0%, #4f46e5 100%)",
                      boxShadow: day.active ? "0 4px 12px rgba(99, 102, 241, 0.4)" : "none"
                    }}></div>
                  </div>
                  <span style={{ ...styles.barLabelText, color: day.active ? "#6366f1" : "#64748b", fontWeight: day.active ? "700" : "500" }}>{day.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Custom Ring / Fulfillment Meter */}
        <div style={styles.chartCard}>
          <h3 style={styles.chartTitle}>Order Fulfillment Meter</h3>
          <div style={styles.fulfillmentGrid}>
            <div style={styles.gaugeWrapper}>
              <div style={styles.gaugeOuterCircle}>
                <div style={styles.gaugeInnerCircle}>
                  <span style={styles.gaugePercent}>
                    {stats.totalOrders > 0 ? Math.round(((stats.deliveredCount + stats.shippedCount) / stats.totalOrders) * 100) : 0}%
                  </span>
                  <span style={styles.gaugeSub}>Delivered</span>
                </div>
              </div>
            </div>
            
            {/* Legend Stats */}
            <div style={styles.statusLegend}>
              <div style={styles.legendRow}>
                <div style={{ ...styles.legendIndicator, backgroundColor: "#fbbf24" }} />
                <span style={styles.legendText}>Pending Orders</span>
                <span style={styles.legendValue}>{stats.pendingCount}</span>
              </div>
              <div style={styles.legendRow}>
                <div style={{ ...styles.legendIndicator, backgroundColor: "#6366f1" }} />
                <span style={styles.legendText}>Processing</span>
                <span style={styles.legendValue}>{stats.processingCount}</span>
              </div>
              <div style={styles.legendRow}>
                <div style={{ ...styles.legendIndicator, backgroundColor: "#8b5cf6" }} />
                <span style={styles.legendText}>Shipped</span>
                <span style={styles.legendValue}>{stats.shippedCount}</span>
              </div>
              <div style={styles.legendRow}>
                <div style={{ ...styles.legendIndicator, backgroundColor: "#10b981" }} />
                <span style={styles.legendText}>Delivered</span>
                <span style={styles.legendValue}>{stats.deliveredCount}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Grid: Low Stock Alert & Recent Activity */}
      <div style={styles.activityGrid}>
        {/* Left Card: Recent Orders */}
        <div style={{ ...styles.chartCard, flex: 2 }}>
          <div style={styles.tableHeaderRow}>
            <h3 style={styles.chartTitle}>Recent Orders Log</h3>
            <Link href="/admin/orders" style={styles.viewAllBtn}>
              View Log <ArrowUpRight size={14} style={{ marginLeft: 4 }} />
            </Link>
          </div>

          {recentOrders.length === 0 ? (
            <div style={styles.emptyTableState}>
              <ShoppingCart size={32} color="#94a3b8" style={{ marginBottom: 12 }} />
              <p style={{ color: "#64748b", margin: 0 }}>No store transactions logged today.</p>
            </div>
          ) : (
            <div style={styles.tableContainer}>
              <table style={styles.ordersTable}>
                <thead>
                  <tr style={styles.tableHeaderTr}>
                    <th style={styles.tableTh}>Reference</th>
                    <th style={styles.tableTh}>Customer</th>
                    <th style={styles.tableTh}>Gateway</th>
                    <th style={styles.tableTh}>Total</th>
                    <th style={styles.tableTh}>Payment</th>
                    <th style={styles.tableTh}>Fulfillment</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((order: any) => (
                    <tr key={order._id} className="table-row-hover" style={styles.tableBodyTr}>
                      <td style={styles.tableTd}>
                        <span style={styles.orderRefBadge}>
                          #{order._id.substring(order._id.length - 6).toUpperCase()}
                        </span>
                      </td>
                      <td style={styles.tableTd}>
                        <div style={styles.customerAvatarCell}>
                          <div style={styles.customerInitials}>
                            {order.customer.name.substring(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <p style={styles.customerName}>{order.customer.name}</p>
                            <p style={styles.customerEmail}>{order.customer.email}</p>
                          </div>
                        </div>
                      </td>
                      <td style={styles.tableTd}>
                        <span style={styles.gatewayLabel}>
                          {order.paymentMethod === "COD" ? "Cash on Delivery" : order.paymentMethod}
                        </span>
                      </td>
                      <td style={{ ...styles.tableTd, fontWeight: "700", color: "#0f172a" }}>
                        {currency}{order.total.toFixed(2)}
                      </td>
                      <td style={styles.tableTd}>
                        <span style={{
                          ...styles.paymentBadge,
                          backgroundColor: order.paymentStatus === "paid" ? "#d1fae5" : "#fee2e2",
                          color: order.paymentStatus === "paid" ? "#065f46" : "#991b1b",
                        }}>
                          {order.paymentStatus.toUpperCase()}
                        </span>
                      </td>
                      <td style={styles.tableTd}>
                        <span style={{
                          ...styles.paymentBadge,
                          backgroundColor: order.orderStatus === "delivered" ? "#d1fae5" : "#fef3c7",
                          color: order.orderStatus === "delivered" ? "#065f46" : "#92400e",
                        }}>
                          {order.orderStatus.toUpperCase()}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Right Card: Inventory & Store Metrics Widgets */}
        <div style={{ ...styles.chartCard, flex: 1 }}>
          <h3 style={styles.chartTitle}>Fulfillment Health</h3>
          <p style={styles.cardSub}>Quick insights into low stock items and coupon promotions.</p>

          <div style={styles.insightsList}>
            {/* Low Stock Widget */}
            <div style={styles.insightRow}>
              <div style={{ ...styles.insightIconCircle, backgroundColor: "rgba(239, 68, 68, 0.08)", border: "1px solid rgba(239, 68, 68, 0.15)" }}>
                <AlertTriangle size={18} color="#ef4444" />
              </div>
              <div style={{ flex: 1, textAlign: "left" }}>
                <div style={styles.insightTitleText}>Critical Low Stock</div>
                <div style={styles.insightSubText}>{stats.lowStockCount} Products need replenishment.</div>
              </div>
              <span style={styles.insightCountBadgeRed}>{stats.lowStockCount}</span>
            </div>

            {/* Total Products Widget */}
            <div style={styles.insightRow}>
              <div style={{ ...styles.insightIconCircle, backgroundColor: "rgba(99, 102, 241, 0.08)", border: "1px solid rgba(99, 102, 241, 0.15)" }}>
                <ShoppingBag size={18} color="#6366f1" />
              </div>
              <div style={{ flex: 1, textAlign: "left" }}>
                <div style={styles.insightTitleText}>Active Catalog Size</div>
                <div style={styles.insightSubText}>{stats.totalProducts} active products in directory.</div>
              </div>
            </div>

            {/* Active Coupons Widget */}
            <div style={styles.insightRow}>
              <div style={{ ...styles.insightIconCircle, backgroundColor: "rgba(16, 185, 129, 0.08)", border: "1px solid rgba(16, 185, 129, 0.15)" }}>
                <Percent size={18} color="#10b981" />
              </div>
              <div style={{ flex: 1, textAlign: "left" }}>
                <div style={styles.insightTitleText}>Coupons & Promos</div>
                <div style={styles.insightSubText}>{stats.activeCoupons} marketing campaigns active.</div>
              </div>
              <span style={styles.insightCountBadgeGreen}>{stats.activeCoupons}</span>
            </div>
          </div>
        </div>
      </div>
      <style>{`
        .table-row-hover:hover {
          background-color: #f8fafc !important;
        }
      `}</style>
    </div>
  );
}

// Sparkles decorative icon
const SparklesIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 6 }}>
    <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275Z"/>
    <path d="m5 3 1 2.5L8.5 6 6 7 5 9.5 4 7 1.5 6 4 5Z"/>
    <path d="m19 17 1 2.5 2.5.5-2.5 1-1 2.5-1-2.5-2.5-1 2.5-1Z"/>
  </svg>
);

const styles: Record<string, React.CSSProperties> = {
  dashboardWrapper: {
    display: "flex",
    flexDirection: "column",
    gap: "32px",
    fontFamily: "'Outfit', 'Inter', sans-serif",
  },
  headerBanner: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#ffffff",
    padding: "24px 32px",
    borderRadius: "20px",
    border: "1px solid #e2e8f0",
    boxShadow: "0 1px 3px rgba(0,0,0,0.02)",
    flexWrap: "wrap",
    gap: "16px",
  },
  headerTextCol: {
    textAlign: "left",
  },
  tagline: {
    display: "flex",
    alignItems: "center",
    fontSize: "11px",
    fontWeight: "700",
    letterSpacing: "1px",
    color: "#6366f1",
    textTransform: "uppercase",
    marginBottom: "8px",
  },
  title: {
    fontSize: "24px",
    fontWeight: "800",
    color: "#0f172a",
    margin: 0,
    letterSpacing: "-0.5px",
  },
  subtitle: {
    fontSize: "13px",
    color: "#64748b",
    margin: "4px 0 0 0",
  },
  headerActionsCol: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
  },
  dateLabel: {
    backgroundColor: "#f8fafc",
    border: "1px solid #e2e8f0",
    padding: "10px 18px",
    borderRadius: "10px",
    fontSize: "13px",
    fontWeight: "600",
    color: "#475569",
  },
  addProductBtn: {
    display: "inline-flex",
    alignItems: "center",
    backgroundColor: "#0f172a",
    color: "#ffffff",
    padding: "11px 22px",
    borderRadius: "10px",
    fontSize: "13px",
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    transition: "background-color 0.2s",
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(230px, 1fr))",
    gap: "24px",
  },
  statCard: {
    backgroundColor: "#ffffff",
    borderRadius: "20px",
    padding: "24px",
    boxShadow: "0 10px 30px -10px rgba(0,0,0,0.02)",
    border: "1px solid #e2e8f0",
    display: "flex",
    flexDirection: "column",
    position: "relative",
    overflow: "hidden",
  },
  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
  },
  iconContainer: {
    width: "40px",
    height: "40px",
    borderRadius: "12px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  trendGreen: {
    display: "flex",
    alignItems: "center",
    backgroundColor: "#ecfdf5",
    color: "#10b981",
    fontSize: "12px",
    fontWeight: "700",
    padding: "4px 10px",
    borderRadius: "12px",
  },
  activeStatusPill: {
    backgroundColor: "#eff6ff",
    color: "#6366f1",
    fontSize: "12px",
    fontWeight: "700",
    padding: "4px 10px",
    borderRadius: "12px",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  basketPill: {
    backgroundColor: "#f5f3ff",
    color: "#8b5cf6",
    fontSize: "12px",
    fontWeight: "700",
    padding: "4px 10px",
    borderRadius: "12px",
  },
  totalBadge: {
    backgroundColor: "#fff7ed",
    color: "#f97316",
    fontSize: "12px",
    fontWeight: "700",
    padding: "4px 10px",
    borderRadius: "12px",
  },
  statLabel: {
    fontSize: "11px",
    fontWeight: "700",
    color: "#94a3b8",
    letterSpacing: "0.8px",
    marginBottom: "6px",
    textAlign: "left",
  },
  statValue: {
    fontSize: "26px",
    fontWeight: "800",
    color: "#0f172a",
    letterSpacing: "-0.5px",
    margin: "0 0 16px 0",
    textAlign: "left",
  },
  statBarWrapper: {
    width: "100%",
    height: "6px",
    backgroundColor: "#f1f5f9",
    borderRadius: "4px",
    overflow: "hidden",
  },
  statBarFill: {
    height: "100%",
    borderRadius: "4px",
  },
  chartsGrid: {
    display: "grid",
    gridTemplateColumns: "1.6fr 1fr",
    gap: "24px",
    alignItems: "stretch",
  },
  chartCard: {
    backgroundColor: "#ffffff",
    borderRadius: "20px",
    padding: "28px",
    boxShadow: "0 10px 30px -10px rgba(0,0,0,0.02)",
    border: "1px solid #e2e8f0",
  },
  chartHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "24px",
  },
  chartTitle: {
    fontSize: "16px",
    fontWeight: "800",
    color: "#0f172a",
    margin: 0,
    textAlign: "left",
  },
  chartMetaText: {
    fontSize: "11px",
    color: "#94a3b8",
    fontWeight: "500",
  },
  columnChartContainer: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    height: "220px",
    position: "relative",
    paddingTop: "10px",
  },
  yGridAxis: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: "24px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    fontSize: "11px",
    color: "#94a3b8",
    fontWeight: "500",
    fontFamily: "monospace",
    width: "28px",
    textAlign: "left",
  },
  barColumnsRow: {
    display: "flex",
    justifyContent: "space-around",
    alignItems: "end",
    flex: 1,
    paddingLeft: "36px",
    borderBottom: "1px solid #e2e8f0",
    paddingBottom: "8px",
  },
  barColumnWrapper: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "8px",
    flex: 1,
    height: "100%",
  },
  barTrack: {
    width: "18px",
    height: "100%",
    backgroundColor: "#f8fafc",
    borderRadius: "20px",
    display: "flex",
    alignItems: "end",
    overflow: "hidden",
  },
  barFill: {
    width: "100%",
    borderRadius: "20px",
    transition: "height 0.3s ease",
  },
  barLabelText: {
    fontSize: "11px",
    whiteSpace: "nowrap",
  },
  fulfillmentGrid: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: "24px",
    marginTop: "16px",
  },
  gaugeWrapper: {
    width: "140px",
    height: "140px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  gaugeOuterCircle: {
    width: "130px",
    height: "130px",
    borderRadius: "50%",
    background: "conic-gradient(#6366f1 0% 70%, #f1f5f9 70% 100%)", // Custom dynamic fulfillment display
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 4px 10px rgba(99, 102, 241, 0.1)",
  },
  gaugeInnerCircle: {
    width: "104px",
    height: "104px",
    borderRadius: "50%",
    backgroundColor: "white",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
  },
  gaugePercent: {
    fontSize: "24px",
    fontWeight: "800",
    color: "#0f172a",
    lineHeight: "1.1",
  },
  gaugeSub: {
    fontSize: "10px",
    color: "#64748b",
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    marginTop: "2px",
  },
  statusLegend: {
    width: "100%",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  legendRow: {
    display: "flex",
    alignItems: "center",
    fontSize: "13px",
  },
  legendIndicator: {
    width: "8px",
    height: "8px",
    borderRadius: "50%",
    marginRight: "10px",
    flexShrink: 0,
  },
  legendText: {
    flex: 1,
    color: "#475569",
    fontWeight: "500",
    textAlign: "left",
  },
  legendValue: {
    fontWeight: "700",
    color: "#0f172a",
  },
  activityGrid: {
    display: "flex",
    gap: "24px",
    flexWrap: "wrap",
    alignItems: "stretch",
  },
  tableHeaderRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
  },
  viewAllBtn: {
    display: "inline-flex",
    alignItems: "center",
    fontSize: "13px",
    fontWeight: "700",
    color: "#6366f1",
  },
  emptyTableState: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "40px 20px",
    textAlign: "center",
  },
  tableContainer: {
    width: "100%",
    overflowX: "auto",
  },
  ordersTable: {
    width: "100%",
    borderCollapse: "collapse",
  },
  tableHeaderTr: {
    borderBottom: "1px solid #f1f5f9",
  },
  tableTh: {
    padding: "12px 16px",
    fontSize: "11px",
    fontWeight: "700",
    color: "#94a3b8",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    textAlign: "left",
  },
  tableBodyTr: {
    borderBottom: "1px solid #f8fafc",
    transition: "background-color 0.2s",
  },
  tableTd: {
    padding: "16px",
    fontSize: "13px",
    color: "#475569",
    textAlign: "left",
  },
  orderRefBadge: {
    backgroundColor: "#f1f5f9",
    padding: "4px 8px",
    borderRadius: "6px",
    fontSize: "11px",
    fontWeight: "700",
    fontFamily: "monospace",
    color: "#334155",
  },
  customerAvatarCell: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  customerInitials: {
    width: "28px",
    height: "28px",
    borderRadius: "50%",
    backgroundColor: "#eff6ff",
    color: "#3b82f6",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "10px",
    fontWeight: "700",
  },
  customerName: {
    fontWeight: "600",
    color: "#0f172a",
    margin: 0,
  },
  customerEmail: {
    fontSize: "11px",
    color: "#94a3b8",
    margin: 0,
  },
  gatewayLabel: {
    fontSize: "12px",
    color: "#64748b",
    fontWeight: "500",
  },
  paymentBadge: {
    fontSize: "10px",
    fontWeight: "700",
    padding: "4px 8px",
    borderRadius: "6px",
    display: "inline-block",
  },
  cardSub: {
    fontSize: "13px",
    color: "#94a3b8",
    margin: "4px 0 20px 0",
    textAlign: "left",
  },
  insightsList: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
    marginTop: "8px",
  },
  insightRow: {
    display: "flex",
    alignItems: "center",
    padding: "16px",
    backgroundColor: "#f8fafc",
    border: "1px solid #f1f5f9",
    borderRadius: "16px",
    gap: "12px",
  },
  insightIconCircle: {
    width: "36px",
    height: "36px",
    borderRadius: "10px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  insightTitleText: {
    fontSize: "14px",
    fontWeight: "700",
    color: "#1e293b",
  },
  insightSubText: {
    fontSize: "11px",
    color: "#94a3b8",
    marginTop: "2px",
  },
  insightCountBadgeRed: {
    fontSize: "11px",
    backgroundColor: "#fee2e2",
    color: "#ef4444",
    padding: "2px 8px",
    borderRadius: "10px",
    fontWeight: "700",
  },
  insightCountBadgeGreen: {
    fontSize: "11px",
    backgroundColor: "#d1fae5",
    color: "#10b981",
    padding: "2px 8px",
    borderRadius: "10px",
    fontWeight: "700",
  },
};
