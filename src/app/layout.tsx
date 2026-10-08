import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Teams Management - Premium Property Portfolio",
  description: "The Property Steward | Premium NYC property management and portfolio services",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased bg-white text-slate-700">
        {children}
      </body>
    </html>
  );
}
