import type { Metadata } from "next";
import "./globals.css";
import "@/lib/env";

export const metadata: Metadata = {
  title: "Medocai",
  description: "Clinical documentation improvement platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
