import React from "react";
import dbConnect from "@/lib/db";
import Order from "@/models/Order";
import { getSettings } from "@/lib/settings";
import BatchProcessingClient from "./BatchProcessingClient";

export const dynamic = "force-dynamic";

export default async function AdminBatchProcessingPage() {
  await dbConnect();
  
  const orders = await Order.find().sort({ createdAt: -1 });
  const settings = await getSettings();

  return (
    <BatchProcessingClient
      initialOrders={JSON.parse(JSON.stringify(orders))}
      currency={settings.currency || "$"}
    />
  );
}
