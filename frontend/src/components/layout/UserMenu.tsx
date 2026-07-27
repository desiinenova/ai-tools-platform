"use client";

import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { ChevronDown, LogOut, User as UserIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { logout } from "@/lib/api";
import { navItems } from "@/lib/navigation";
import type { AuthUser } from "@/types";
import { useToast } from "@/components/ui/Toast";

export interface UserMenuProps {
  user: AuthUser;
  /** Called after navigating to Profile — lets the mobile drawer close itself. */
  onNavigate?: () => void;
}

// Sourced from navItems rather than hardcoded, so this link can't drift out
// of sync with the Sidebar (same isEnabled gating a page not being built yet).
const profileNavItem = navItems.find((item) => item.title === "Profile");

function initials(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function UserMenu({ user, onNavigate }: UserMenuProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  async function handleLogout() {
    try {
      await logout();
      queryClient.removeQueries({ queryKey: ["user"] });
      router.push("/login");
    } catch {
      toast({ title: "Failed to log out", variant: "error" });
    }
  }

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-gray-100 dark:hover:bg-gray-800">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent text-xs font-semibold text-white">
          {initials(user.name)}
        </span>
        <span className="min-w-0 flex-1 text-left">
          <span className="block truncate font-medium text-gray-900 dark:text-gray-100">
            {user.name}
          </span>
          <span className="block truncate text-xs text-gray-500 dark:text-gray-400">
            {user.role.name}
          </span>
        </span>
        <ChevronDown className="h-4 w-4 shrink-0 text-gray-400" />
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          side="top"
          align="start"
          sideOffset={8}
          className="z-50 w-48 rounded-md border border-gray-200 bg-white p-1 shadow-lg dark:border-gray-800 dark:bg-gray-900"
        >
          {profileNavItem?.isEnabled !== false && (
            <DropdownMenu.Item asChild>
              <Link
                href={profileNavItem?.href ?? "/dashboard/profile"}
                onClick={onNavigate}
                className="flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-sm text-gray-700 outline-none data-[highlighted]:bg-gray-100 dark:text-gray-300 dark:data-[highlighted]:bg-gray-800"
              >
                <UserIcon className="h-4 w-4" />
                Profile
              </Link>
            </DropdownMenu.Item>
          )}
          <DropdownMenu.Separator className="my-1 h-px bg-gray-200 dark:bg-gray-800" />
          <DropdownMenu.Item
            onSelect={handleLogout}
            className="flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-sm text-rose-600 outline-none data-[highlighted]:bg-rose-50 dark:data-[highlighted]:bg-rose-950"
          >
            <LogOut className="h-4 w-4" />
            Log out
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
