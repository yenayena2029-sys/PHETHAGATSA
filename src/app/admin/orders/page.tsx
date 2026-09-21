import React from "react";
import dbConnect from "@/lib/db";
import Order from "@/models/Order";
import { getSettings } from "@/lib/settings";
import OrdersClient from "./OrdersClient";

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage() {
  await dbConnect();
  
  const orders = await Order.find().sort({ createdAt: -1 });
  const settings = await getSettings();

  return (
    <OrdersClient
      initialOrders={JSON.parse(JSON.stringify(orders))}
      currency={settings.currency}
    />
  );
}
