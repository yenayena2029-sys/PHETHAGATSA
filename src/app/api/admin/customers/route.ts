import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import Order from "@/models/Order";
import { isAdmin } from "@/lib/auth";

export async function GET() {
  try {
    const isUserAdmin = await isAdmin();
    if (!isUserAdmin) {
      return NextResponse.json({ error: "Unauthorized. Admin access required." }, { status: 403 });
    }

    await dbConnect();

    // Fetch all users that are not admins
    const customers = await User.find({ role: { $ne: "admin" } }).select("-password").sort({ createdAt: -1 }).lean();
    const customerEmails = customers.map((c: any) => c.email);

    // Fetch all orders from those customers
    const orders = await Order.find({ "customer.email": { $in: customerEmails } }).lean();

    // Merge customer data with their order statistics
    const aggregatedCustomers = customers.map((cust: any) => {
      const custOrders = orders.filter(
        (o: any) => o.customer?.email?.toLowerCase() === cust.email.toLowerCase()
      );
      const totalSpend = custOrders.reduce((sum: number, o: any) => sum + (o.total || 0), 0);
      return {
        _id: cust._id,
        username: cust.username,
        email: cust.email,
        role: cust.role,
        createdAt: cust.createdAt,
        orderCount: custOrders.length,
        totalSpend,
      };
    });

    return NextResponse.json(aggregatedCustomers, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to fetch customers" }, { status: 500 });
  }
}
