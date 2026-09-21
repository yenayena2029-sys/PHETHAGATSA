import { redirect } from "next/navigation";
import { unstable_noStore } from "next/cache";
import dbConnect from "@/lib/db";
import User from "@/models/User";

export const metadata = {
  title: "SnapShop - Installation Wizard",
  description: "Install and configure your SnapShop platform.",
};

export default async function InstallLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  unstable_noStore();
  
  let isInstalled = false;
  try {
    await dbConnect();
    const adminCount = await User.countDocuments({ role: "admin" });
    if (adminCount > 0) {
      isInstalled = true;
    }
  } catch (error) {
    // If DB fails, allow installation
  }

  if (isInstalled) {
    redirect("/");
  }

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#0f172a", fontFamily: "var(--font-outfit), sans-serif", color: "#f8fafc" }}>
      {children}
    </div>
  );
}
