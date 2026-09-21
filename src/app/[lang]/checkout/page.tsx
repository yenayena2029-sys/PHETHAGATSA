import React from "react";
import dbConnect from "@/lib/db";
import { getSettings } from "@/lib/settings";
import CheckoutClient from "./CheckoutClient";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ lang: string }>;
}

export default async function CheckoutPage({ params }: PageProps) {
  await dbConnect();
  const settings = await getSettings();

  return (
    <CheckoutClient initialSettings={JSON.parse(JSON.stringify(settings))} />
  );
}
