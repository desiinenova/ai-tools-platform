"use client";

import * as RadixToast from "@radix-ui/react-toast";
import { createContext, useCallback, useContext, useState } from "react";
import { CheckCircle2, X, XCircle } from "lucide-react";
import { cn } from "@/lib/cn";

export type ToastVariant = "success" | "error" | "info";

export interface ToastOptions {
  title: string;
  description?: string;
  variant?: ToastVariant;
}

interface ToastItem extends ToastOptions {
  id: number;
}

interface ToastContextValue {
  toast: (options: ToastOptions) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return ctx;
}

const variantStyles: Record<ToastVariant, string> = {
  success:
    "border-green-200 bg-green-50 text-green-900 dark:border-green-900 dark:bg-green-950 dark:text-green-100",
  error: "border-red-200 bg-red-50 text-red-900 dark:border-red-900 dark:bg-red-950 dark:text-red-100",
  info: "border-gray-200 bg-white text-gray-900 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-100",
};

const variantIcons: Record<ToastVariant, typeof CheckCircle2 | undefined> = {
  success: CheckCircle2,
  error: XCircle,
  info: undefined,
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const toast = useCallback((options: ToastOptions) => {
    const id = Date.now() + Math.random();
    setToasts((current) => [...current, { id, ...options }]);
  }, []);

  const dismiss = useCallback((id: number) => {
    setToasts((current) => current.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toast }}>
      <RadixToast.Provider swipeDirection="right">
        {children}
        {toasts.map(({ id, title, description, variant = "info" }) => {
          const Icon = variantIcons[variant];
          return (
            <RadixToast.Root
              key={id}
              duration={4000}
              onOpenChange={(open) => {
                if (!open) dismiss(id);
              }}
              className={cn(
                "flex items-start gap-3 rounded-lg border px-4 py-3 shadow-lg",
                variantStyles[variant],
              )}
            >
              {Icon && <Icon className="mt-0.5 h-5 w-5 shrink-0" aria-hidden />}
              <div className="flex-1">
                <RadixToast.Title className="text-sm font-medium">{title}</RadixToast.Title>
                {description && (
                  <RadixToast.Description className="mt-1 text-sm opacity-80">
                    {description}
                  </RadixToast.Description>
                )}
              </div>
              <RadixToast.Close aria-label="Dismiss" className="shrink-0 opacity-60 hover:opacity-100">
                <X className="h-4 w-4" />
              </RadixToast.Close>
            </RadixToast.Root>
          );
        })}
        <RadixToast.Viewport className="fixed bottom-0 right-0 z-[100] flex w-full max-w-sm flex-col gap-2 p-6 outline-none" />
      </RadixToast.Provider>
    </ToastContext.Provider>
  );
}
