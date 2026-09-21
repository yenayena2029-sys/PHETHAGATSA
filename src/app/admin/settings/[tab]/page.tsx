import React from "react";
import { redirect } from "next/navigation";
import { getSettings } from "@/lib/settings";
import SettingsClient from "../SettingsClient";

export const dynamic = "force-dynamic";

const VALID_TABS = [
  "general",
  "theme",
  "languages",
  "currencies",
  "tax",
  "gateways",
  "storage",
  "backup",
  "mobile",
  "auth",
  "ai"
];

interface SettingsPageProps {
  params: Promise<{ tab: string }>;
}

export default async function AdminSettingsTabPage({ params }: SettingsPageProps) {
  const { tab } = await params;

  if (!VALID_TABS.includes(tab)) {
    redirect("/admin/settings/general");
  }

  const settings = await getSettings();

  return (
    <SettingsClient
      initialSettings={JSON.parse(JSON.stringify(settings))}
      activeTab={tab}
    />
  );
}
