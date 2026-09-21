import { getSettings } from "@/lib/settings";
import SettingsClient from "../SettingsClient";

export default async function EmailSettingsPage() {
  const settings = await getSettings();
  
  // We stringify and parse to avoid Mongoose document serialization issues in Next.js Server Components
  const serializedSettings = JSON.parse(JSON.stringify(settings));
  
  return <SettingsClient initialSettings={serializedSettings} activeTab="email" />;
}
