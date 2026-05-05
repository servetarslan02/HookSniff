import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Hookrelay Dashboard",
  description: "Global Webhook Delivery Service",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen bg-gray-50">
        <nav className="bg-white border-b border-gray-200 px-6 py-3">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🪝</span>
              <span className="font-bold text-xl text-gray-900">Hookrelay</span>
            </div>
            <div className="flex items-center gap-6 text-sm">
              <a href="/dashboard" className="text-gray-600 hover:text-gray-900">Dashboard</a>
              <a href="/dashboard/endpoints" className="text-gray-600 hover:text-gray-900">Endpoints</a>
              <a href="/dashboard/deliveries" className="text-gray-600 hover:text-gray-900">Deliveries</a>
              <a href="/dashboard/settings" className="text-gray-600 hover:text-gray-900">Settings</a>
            </div>
          </div>
        </nav>
        <main className="max-w-7xl mx-auto px-6 py-8">
          {children}
        </main>
      </body>
    </html>
  );
}
