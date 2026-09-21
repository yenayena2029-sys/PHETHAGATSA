import React from "react";
import dbConnect from "@/lib/db";
import Order from "@/models/Order";
import { getSettings } from "@/lib/settings";
import ReturnsClient from "./ReturnsClient";

export const dynamic = "force-dynamic";

export default async function AdminReturnsPage() {
  await dbConnect();
  
  // Get orders that are delivered or returned
  const orders = await Order.find({
    orderStatus: { $in: ["delivered", "returned", "cancelled"] }
  }).sort({ updatedAt: -1 });

  const settings = await getSettings();

  return (
    <ReturnsClient
      initialOrders={JSON.parse(JSON.stringify(orders))}
      currency={settings.currency || "$"}
    />
  );
}
