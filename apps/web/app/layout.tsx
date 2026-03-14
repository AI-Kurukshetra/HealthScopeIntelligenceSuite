import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "HealthScope Analytics Suite",
  description: "Healthcare analytics platform for multi-tenant clinical and financial intelligence.",
  icons: {
    icon: "/icon.png"
  }
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
