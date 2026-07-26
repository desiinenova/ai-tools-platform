"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { navItems } from "@/lib/navigation";
import { Modal } from "@/components/ui/Modal";
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
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium",
                isActive
                  ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300"
                  : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800",
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

export function Sidebar({ user, mobileOpen, onMobileOpenChange }: SidebarProps) {
  return (
    <>
      <aside className="hidden w-60 shrink-0 border-r border-gray-200 p-4 dark:border-gray-800 md:block">
        <div className="mb-6 px-3 text-lg font-semibold text-gray-900 dark:text-gray-100">
          AI Tools Platform
        </div>
        <NavLinks user={user} />
      </aside>

      <Modal open={mobileOpen} onOpenChange={onMobileOpenChange} title="Menu" variant="drawer">
        <NavLinks user={user} onNavigate={() => onMobileOpenChange(false)} />
      </Modal>
    </>
  );
}
