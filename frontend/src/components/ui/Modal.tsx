"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "@/lib/cn";

export interface ModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  /**
   * "center" (default): a centered dialog box, for confirmations/forms.
   * "drawer": a full-height panel anchored to the left edge, for the mobile
   * nav — same Dialog behavior underneath, just repositioned, and matching
   * the desktop Sidebar's surface: bg-[var(--background)], the same
   * variable the page itself uses, so mobile nav and content read as one
   * canvas exactly like the desktop layout does.
   */
  variant?: "center" | "drawer";
}

const contentClassName: Record<NonNullable<ModalProps["variant"]>, string> = {
  center:
    "fixed left-1/2 top-1/2 z-50 w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-lg border border-gray-200 bg-white p-6 shadow-xl dark:border-gray-800 dark:bg-gray-900 data-[state=open]:animate-modal-in data-[state=closed]:animate-modal-out",
  drawer:
    "fixed inset-y-0 left-0 z-50 flex h-full w-72 max-w-[80vw] flex-col overflow-y-auto border-r border-gray-200 bg-[var(--background)] p-6 shadow-xl dark:border-gray-800 data-[state=open]:animate-drawer-in data-[state=closed]:animate-drawer-out",
};

export function Modal({
  open,
  onOpenChange,
  title,
  description,
  children,
  variant = "center",
}: ModalProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50 data-[state=open]:animate-overlay-in data-[state=closed]:animate-overlay-out" />
        <Dialog.Content className={cn(contentClassName[variant])}>
          <div className="mb-4 flex items-start justify-between gap-4">
            <div>
              <Dialog.Title className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {title}
              </Dialog.Title>
              {description && (
                <Dialog.Description className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  {description}
                </Dialog.Description>
              )}
            </div>
            <Dialog.Close
              aria-label="Close"
              className="shrink-0 rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800"
            >
              <X className="h-5 w-5" />
            </Dialog.Close>
          </div>
          {children}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
