import { LayoutDashboard, PlusCircle, ShieldCheck, User as UserIcon, Wrench } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { AuthUser } from "@/types";
import { isOwner } from "@/lib/permissions";

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
  { title: "Add Tool", href: "/dashboard/tools/new", icon: PlusCircle },
  { title: "Profile", href: "/dashboard/profile", icon: UserIcon },
  { title: "Admin", href: "/dashboard/admin", icon: ShieldCheck, isVisible: isOwner },
];
