import React from "react";
import dbConnect from "@/lib/db";
import Order from "@/models/Order";
import { getSettings } from "@/lib/settings";
import RefundsClient from "./RefundsClient";

export const dynamic = "force-dynamic";

export default async function AdminRefundsPage() {
  await dbConnect();
  
  const orders = await Order.find({
    $or: [
      { paymentStatus: "paid" },
      { paymentStatus: "refunded" }
    ]
  }).sort({ createdAt: -1 });

  const settings = await getSettings();

  return (
    <RefundsClient
      initialOrders={JSON.parse(JSON.stringify(orders))}
      currency={settings.currency || "$"}
    />
  );
}
