"use client";

import { Menu } from "lucide-react";

export interface TopbarProps {
  onMenuClick: () => void;
}

/**
 * Mobile-only: opens the nav drawer. On desktop the Sidebar is always
 * visible and now carries the user menu + theme toggle itself, so there's
 * nothing left for a persistent top bar to do — rendering one anyway was
 * what made it feel like a bar bolted on top of the page rather than part
 * of the layout.
 */
export function Topbar({ onMenuClick }: TopbarProps) {
  return (
    <header className="flex items-center border-b border-gray-200 px-4 py-3 dark:border-gray-800 md:hidden">
      <button
        type="button"
        onClick={onMenuClick}
        aria-label="Open menu"
        className="rounded-md p-2 text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
      >
        <Menu className="h-5 w-5" />
      </button>
    </header>
  );
}
