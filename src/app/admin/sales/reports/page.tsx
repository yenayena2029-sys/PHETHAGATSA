import React from "react";
import dbConnect from "@/lib/db";
import Order from "@/models/Order";
import Product from "@/models/Product";
import { getSettings } from "@/lib/settings";
import { 
  TrendingUp, 
  ShoppingBag, 
  DollarSign, 
  BarChart3, 
  ArrowUpRight, 
  Percent, 
  Layers, 
  Activity,
  Award
} from "lucide-react";

export const dynamic = "force-dynamic";

async function getSalesReportData() {
  await dbConnect();
  try {
    const settings = await getSettings();
    const currency = settings?.currency || "$";

    const orders = await Order.find().sort({ createdAt: -1 });

    let totalRevenue = 0;
    let paidRevenue = 0;
    let codSales = 0;
    let stripeSales = 0;
    let paypalSales = 0;
    let razorpaySales = 0;

    let codCount = 0;
    let stripeCount = 0;
    let paypalCount = 0;
    let razorpayCount = 0;

    let totalItemsSold = 0;
    const productSalesMap: Record<string, { name: string; image: string; quantity: number; revenue: number }> = {};

    orders.forEach((order) => {
      totalRevenue += order.total;
      if (order.paymentStatus === "paid") {
        paidRevenue += order.total;
      }

      // Method breakdown
      const method = order.paymentMethod?.toUpperCase() || "COD";
      if (method === "COD") {
        codSales += order.total;
        codCount++;
      } else if (method === "STRIPE") {
        stripeSales += order.total;
        stripeCount++;
      } else if (method === "PAYPAL") {
        paypalSales += order.total;
        paypalCount++;
      } else if (method === "RAZORPAY") {
        razorpaySales += order.total;
        razorpayCount++;
      }

      // Items calculation
      order.items.forEach((item: any) => {
        totalItemsSold += item.quantity;
        const key = item.productId?.toString() || item.name;
        if (productSalesMap[key]) {
          productSalesMap[key].quantity += item.quantity;
          productSalesMap[key].revenue += item.price * item.quantity;
        } else {
          productSalesMap[key] = {
            name: item.name,
            image: item.image || "/images/placeholder.png",
            quantity: item.quantity,
            revenue: item.price * item.quantity,
          };
        }
      });
    });

    const topProducts = Object.values(productSalesMap)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);

    const totalOrders = orders.length;
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    return {
      stats: {
        totalRevenue,
        paidRevenue,
        totalOrders,
        avgOrderValue,
        totalItemsSold,
      },
      paymentMethods: [
        { label: "Stripe", sales: stripeSales, count: stripeCount, color: "#635bff" },
        { label: "PayPal", sales: paypalSales, count: paypalCount, color: "#0070ba" },
        { label: "Razorpay", sales: razorpaySales, count: razorpayCount, color: "#005bff" },
        { label: "Cash on Delivery", sales: codSales, count: codCount, color: "#475569" },
      ],
      topProducts,
      currency,
    };
  } catch (error) {
    console.error("Sales report error:", error);
    return {
      stats: {
        totalRevenue: 0,
        paidRevenue: 0,
        totalOrders: 0,
        avgOrderValue: 0,
        totalItemsSold: 0,
      },
      paymentMethods: [],
      topProducts: [],
      currency: "$",
    };
  }
}

export default async function SalesReportsPage() {
  const { stats, paymentMethods, topProducts, currency } = await getSalesReportData();

  return (
    <div style={styles.container}>
      {/* Page Header */}
      <div style={styles.titleRow}>
        <div>
          <h2 style={styles.title}>Sales Analytics & Reports</h2>
          <p style={styles.subtitle}>Track storefront revenues, payment gateway shares, and item catalog velocities.</p>
        </div>
        <div style={styles.badge}>
          <BarChart3 size={14} style={{ marginRight: 6 }} />
          Live Report
        </div>
      </div>

      {/* Grid: Main Stats */}
      <div style={styles.statsGrid}>
        {/* Card 1: Gross Sales */}
        <div style={styles.statCard}>
          <div style={styles.cardHeader}>
            <div style={{ ...styles.iconContainer, backgroundColor: "rgba(99, 102, 241, 0.08)", border: "1px solid rgba(99, 102, 241, 0.15)" }}>
              <DollarSign size={20} color="#6366f1" />
            </div>
            <span style={styles.successBadge}>Gross</span>
          </div>
          <p style={styles.statLabel}>GROSS VOLUME</p>
          <h3 style={styles.statValue}>{currency}{stats.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</h3>
          <p style={styles.statSubText}>Total store volume logged</p>
        </div>

        {/* Card 2: Settled Sales */}
        <div style={styles.statCard}>
          <div style={styles.cardHeader}>
            <div style={{ ...styles.iconContainer, backgroundColor: "rgba(16, 185, 129, 0.08)", border: "1px solid rgba(16, 185, 129, 0.15)" }}>
              <TrendingUp size={20} color="#10b981" />
            </div>
            <span style={styles.settledBadge}>Settled</span>
          </div>
          <p style={styles.statLabel}>SETTLED REVENUE</p>
          <h3 style={styles.statValue}>{currency}{stats.paidRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</h3>
          <p style={styles.statSubText}>Total paid receipts</p>
        </div>

        {/* Card 3: Orders Velocity */}
        <div style={styles.statCard}>
          <div style={styles.cardHeader}>
            <div style={{ ...styles.iconContainer, backgroundColor: "rgba(249, 115, 22, 0.08)", border: "1px solid rgba(249, 115, 22, 0.15)" }}>
              <ShoppingBag size={20} color="#f97316" />
            </div>
            <span style={styles.activeBadge}>Transactions</span>
          </div>
          <p style={styles.statLabel}>ORDER VELOCITY</p>
          <h3 style={styles.statValue}>{stats.totalOrders} Orders</h3>
          <p style={styles.statSubText}>Average size: {currency}{stats.avgOrderValue.toFixed(2)}</p>
        </div>

        {/* Card 4: Catalog Sales */}
        <div style={styles.statCard}>
          <div style={styles.cardHeader}>
            <div style={{ ...styles.iconContainer, backgroundColor: "rgba(139, 92, 246, 0.08)", border: "1px solid rgba(139, 92, 246, 0.15)" }}>
              <Award size={20} color="#8b5cf6" />
            </div>
            <span style={styles.purpleBadge}>Units</span>
          </div>
          <p style={styles.statLabel}>UNITS SHIPPED</p>
          <h3 style={styles.statValue}>{stats.totalItemsSold} Items</h3>
          <p style={styles.statSubText}>Total product units sold</p>
        </div>
      </div>

      {/* Grid: Charts & Analytics */}
      <div style={styles.chartsGrid}>
        {/* Payment Gateway Distribution */}
        <div style={styles.card}>
          <h3 style={styles.cardTitle}>Payment Gateway Distribution</h3>
          <p style={styles.cardSub}>Analysis of sales and share volumes across payment processors.</p>
          
          <div style={styles.gatewayList}>
            {paymentMethods.length === 0 ? (
              <p style={{ color: "#64748b" }}>No gateway metrics logged yet.</p>
            ) : (
              paymentMethods.map((method, idx) => {
                const percentage = stats.totalRevenue > 0 ? (method.sales / stats.totalRevenue) * 100 : 0;
                return (
                  <div key={idx} style={styles.gatewayRow}>
                    <div style={styles.gatewayMeta}>
                      <span style={{ fontWeight: "700", color: "#1e293b" }}>{method.label}</span>
                      <span style={{ fontSize: "13px", color: "#64748b" }}>
                        {method.count} txn ({percentage.toFixed(1)}%)
                      </span>
                    </div>
                    <div style={styles.barWrapper}>
                      <div style={{ ...styles.barFill, backgroundColor: method.color, width: `${percentage}%` }}></div>
                    </div>
                    <div style={styles.gatewayTotal}>
                      {currency}{method.sales.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Top Product Listings */}
        <div style={styles.card}>
          <h3 style={styles.cardTitle}>Top Selling Catalogs</h3>
          <p style={styles.cardSub}>Leading listings sorted by unit volume velocity.</p>

          <div style={styles.productsList}>
            {topProducts.length === 0 ? (
              <div style={styles.emptyState}>
                <ShoppingBag size={32} color="#94a3b8" style={{ marginBottom: 12 }} />
                <p style={{ color: "#64748b", margin: 0 }}>No product sales logged yet.</p>
              </div>
            ) : (
              topProducts.map((prod, idx) => (
                <div key={idx} style={styles.productRow}>
                  <img src={prod.image} alt={prod.name} style={styles.productImg} />
                  <div style={{ flex: 1, textAlign: "left" }}>
                    <div style={styles.prodName}>{prod.name}</div>
                    <div style={styles.prodMeta}>Units Sold: {prod.quantity}</div>
                  </div>
                  <div style={styles.prodRevenue}>
                    {currency}{prod.revenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </div>
                </div>
              ))
            )}
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
  badge: { display: "flex", alignItems: "center", backgroundColor: "rgba(99, 102, 241, 0.08)", color: "#6366f1", padding: "8px 16px", borderRadius: "20px", fontSize: "13px", fontWeight: "600" },
  statsGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(230px, 1fr))", gap: "24px" },
  statCard: { backgroundColor: "white", borderRadius: "20px", padding: "24px", border: "1px solid #e2e8f0", boxShadow: "0 1px 3px rgba(0,0,0,0.02)" },
  cardHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" },
  iconContainer: { width: "36px", height: "36px", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center" },
  successBadge: { fontSize: "11px", backgroundColor: "#ecfdf5", color: "#10b981", padding: "2px 8px", borderRadius: "10px", fontWeight: "700" },
  settledBadge: { fontSize: "11px", backgroundColor: "#eff6ff", color: "#3b82f6", padding: "2px 8px", borderRadius: "10px", fontWeight: "700" },
  activeBadge: { fontSize: "11px", backgroundColor: "#fff7ed", color: "#f97316", padding: "2px 8px", borderRadius: "10px", fontWeight: "700" },
  purpleBadge: { fontSize: "11px", backgroundColor: "#f5f3ff", color: "#8b5cf6", padding: "2px 8px", borderRadius: "10px", fontWeight: "700" },
  statLabel: { fontSize: "11px", fontWeight: "700", color: "#94a3b8", letterSpacing: "0.5px", marginBottom: "6px", textAlign: "left" },
  statValue: { fontSize: "24px", fontWeight: "800", color: "#0f172a", margin: 0, textAlign: "left", letterSpacing: "-0.5px" },
  statSubText: { fontSize: "12px", color: "#64748b", marginTop: "8px", textAlign: "left" },
  chartsGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px", alignItems: "start" },
  card: { backgroundColor: "white", borderRadius: "20px", padding: "28px", border: "1px solid #e2e8f0", boxShadow: "0 1px 3px rgba(0,0,0,0.02)" },
  cardTitle: { fontSize: "18px", fontWeight: "700", color: "#0f172a", margin: 0, textAlign: "left" },
  cardSub: { fontSize: "13px", color: "#64748b", margin: "4px 0 24px 0", textAlign: "left" },
  gatewayList: { display: "flex", flexDirection: "column", gap: "20px" },
  gatewayRow: { display: "flex", flexDirection: "column", gap: "6px" },
  gatewayMeta: { display: "flex", justifyContent: "space-between", fontSize: "14px" },
  barWrapper: { width: "100%", height: "8px", backgroundColor: "#f1f5f9", borderRadius: "4px", overflow: "hidden" },
  barFill: { height: "100%", borderRadius: "4px" },
  gatewayTotal: { fontSize: "14px", fontWeight: "700", color: "#0f172a", textAlign: "right" },
  productsList: { display: "flex", flexDirection: "column", gap: "16px" },
  productRow: { display: "flex", alignItems: "center", gap: "16px", paddingBottom: "12px", borderBottom: "1px solid #f8fafc" },
  productImg: { width: "40px", height: "48px", borderRadius: "6px", objectFit: "cover", backgroundColor: "#f1f5f9" },
  prodName: { fontSize: "14px", fontWeight: "700", color: "#1e293b" },
  prodMeta: { fontSize: "12px", color: "#94a3b8", marginTop: "2px" },
  prodRevenue: { fontSize: "14px", fontWeight: "700", color: "#0f172a" },
  emptyState: { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 20px" },
};
