"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";

export type ToastTone = "success" | "error" | "info" | "warning";

export type ToastOptions = {
  title?: string;
  description?: string;
  tone?: ToastTone;
  durationMs?: number;
};

type ToastItem = ToastOptions & { id: string };

type ToastContextValue = {
  toast: (options: ToastOptions) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

function toneStyles(tone: ToastTone = "info") {
  switch (tone) {
    case "success":
      return "border-emerald-200 bg-emerald-50 text-emerald-900";
    case "error":
      return "border-rose-200 bg-rose-50 text-rose-900";
    case "warning":
      return "border-amber-200 bg-amber-50 text-amber-900";
    default:
      return "border-slate-200 bg-white text-slate-900";
  }
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const remove = useCallback((id: string) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const toast = useCallback(
    (options: ToastOptions) => {
      const id = crypto.randomUUID();
      const item: ToastItem = {
        id,
        tone: "info",
        durationMs: 4500,
        ...options
      };

      setToasts((current) => [...current, item]);
      setTimeout(() => remove(id), item.durationMs);
    },
    [remove]
  );

  const value = useMemo<ToastContextValue>(() => ({ toast }), [toast]);

  const portal =
    mounted && typeof document !== "undefined"
      ? createPortal(
          <div className="pointer-events-none fixed inset-x-0 top-4 z-50 flex flex-col items-center gap-3 px-3 sm:items-end sm:px-6">
            {toasts.map((item) => (
              <div
                key={item.id}
                className={`pointer-events-auto w-full max-w-sm rounded-2xl border px-4 py-3 shadow-[0_18px_40px_rgba(15,23,42,0.18)] backdrop-blur ${toneStyles(item.tone)}`}
              >
                {item.title ? (
                  <p className="text-sm font-semibold leading-5">{item.title}</p>
                ) : null}
                {item.description ? (
                  <p className="mt-1 text-sm leading-5 text-slate-700">
                    {item.description}
                  </p>
                ) : null}
              </div>
            ))}
          </div>,
          document.body
        )
      : null;

  return (
    <ToastContext.Provider value={value}>
      {children}
      {portal}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast must be used within a ToastProvider.");
  }
  return ctx;
}
