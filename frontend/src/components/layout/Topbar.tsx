"use client";

import { Menu } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";
import { UserMenu } from "./UserMenu";
import type { AuthUser } from "@/types";

export interface TopbarProps {
  user: AuthUser;
  onMenuClick: () => void;
}

export function Topbar({ user, onMenuClick }: TopbarProps) {
  return (
    <header className="flex items-center justify-between border-b border-gray-200 px-6 py-4 dark:border-gray-800">
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={onMenuClick}
          aria-label="Open menu"
          className="rounded-md p-2 text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 md:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>
        <ThemeToggle />
      </div>
      <UserMenu user={user} />
    </header>
  );
}
