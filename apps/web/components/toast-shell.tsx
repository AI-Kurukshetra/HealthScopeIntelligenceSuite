"use client";

import { ToastProvider } from "./toast";

export function ToastShell({ children }: { children: React.ReactNode }) {
  return <ToastProvider>{children}</ToastProvider>;
}
