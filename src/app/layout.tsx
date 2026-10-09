import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Teams Management - Property Portfolio",
  description: "Teams Management property portfolio in New York City",
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
