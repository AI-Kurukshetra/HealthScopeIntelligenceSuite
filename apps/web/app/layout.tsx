import type { Metadata } from "next";
import "./globals.css";
import { ToastShell } from "../components/toast-shell";

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
      <body>
        <ToastShell>{children}</ToastShell>
      </body>
    </html>
  );
}
