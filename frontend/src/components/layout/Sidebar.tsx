"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { navItems } from "@/lib/navigation";
import { Modal } from "@/components/ui/Modal";
import { UserMenu } from "./UserMenu";
import { cn } from "@/lib/cn";
import type { AuthUser } from "@/types";

export interface SidebarProps {
  user: AuthUser;
  mobileOpen: boolean;
  onMobileOpenChange: (open: boolean) => void;
}

function NavLinks({ user, onNavigate }: { user: AuthUser; onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-1">
      {navItems
        .filter((item) => item.isEnabled !== false)
        .filter((item) => !item.isVisible || item.isVisible(user))
        .map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-3 rounded-md border-l-2 py-2 pl-[10px] pr-3 text-sm font-medium",
                isActive
                  ? "border-accent bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300"
                  : "border-transparent text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800",
              )}
            >
              <Icon className="h-4 w-4" aria-hidden />
              {item.title}
            </Link>
          );
        })}
    </nav>
  );
}

function SidebarFooter({ user, onNavigate }: { user: AuthUser; onNavigate?: () => void }) {
  return (
    <div className="shrink-0 border-t border-gray-200 pt-3 dark:border-gray-800">
      <UserMenu user={user} onNavigate={onNavigate} />
    </div>
  );
}

export function Sidebar({ user, mobileOpen, onMobileOpenChange }: SidebarProps) {
  return (
    <>
      {/* Full-height flex column: brand and footer are fixed; only the nav
          list (flex-1 + overflow-y-auto) scrolls if it ever outgrows the
          viewport, so the user menu stays pinned in view regardless of the
          page's own scroll position.

          Same surface as the page (bg-[var(--background)], not a distinct
          color) — the app reads as one continuous canvas, with only the
          border-r marking where nav ends and content begins. NavLinks'
          indigo active-state + left accent bar are what carry "where you
          are" now, not a different sidebar background. */}
      <aside className="hidden w-60 shrink-0 flex-col border-r border-gray-200 bg-[var(--background)] p-4 dark:border-gray-800 md:flex">
        <div className="mb-6 shrink-0 px-2.5 text-xs font-semibold uppercase tracking-[0.12em] text-gray-500 dark:text-gray-400">
          AI Tools Platform
        </div>
        <div className="flex-1 overflow-y-auto">
          <NavLinks user={user} />
        </div>
        <SidebarFooter user={user} />
      </aside>

      <Modal open={mobileOpen} onOpenChange={onMobileOpenChange} title="Menu" variant="drawer">
        <div className="flex flex-1 flex-col">
          <div className="flex-1 overflow-y-auto">
            <NavLinks user={user} onNavigate={() => onMobileOpenChange(false)} />
          </div>
          <SidebarFooter user={user} onNavigate={() => onMobileOpenChange(false)} />
        </div>
      </Modal>
    </>
  );
}
