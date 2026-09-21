import type { Metadata } from "next";
import AccountClient from "../AccountClient";
import { notFound } from "next/navigation";

interface Props {
  params: Promise<{
    lang: string;
    tab: string;
  }>;
}

const validTabs = ["profile", "orders", "addresses", "returns", "refunds", "preferences", "wishlist"];
const tabTitles: Record<string, string> = {
  profile: "Profile",
  orders: "Orders",
  addresses: "Addresses",
  returns: "Returns",
  refunds: "Refunds",
  preferences: "Preferences",
  wishlist: "Wishlist",
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { tab } = await params;
  if (!validTabs.includes(tab)) {
    return {};
  }

  return {
    title: tabTitles[tab] || "Account",
  };
}

export default async function AccountTabPage({ params }: Props) {
  const { lang, tab } = await params;

  if (!validTabs.includes(tab)) {
    notFound();
  }

  return <AccountClient initialTab={tab as any} />;
}
