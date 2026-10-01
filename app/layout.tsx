import "./globals.css";
export const metadata = { title: "PHETHAGATSA", description: "15 Products Live" };
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body className="bg-black text-white min-h-screen">{children}</body></html>
}
