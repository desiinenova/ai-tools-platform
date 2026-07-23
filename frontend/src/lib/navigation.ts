import { LayoutDashboard, PlusCircle, User as UserIcon, Wrench } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { AuthUser } from "@/types";

export interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
  /** Omit to show the item to every authenticated user. */
  isVisible?: (user: AuthUser) => boolean;
  /** Set to false while the target page hasn't been built yet; the Sidebar won't render the link at all. */
  isEnabled?: boolean;
}

export const navItems: NavItem[] = [
  { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { title: "AI Tools", href: "/dashboard/tools", icon: Wrench },
  { title: "Add Tool", href: "/dashboard/tools/new", icon: PlusCircle, isEnabled: false },
  { title: "Profile", href: "/dashboard/profile", icon: UserIcon, isEnabled: false },
];
