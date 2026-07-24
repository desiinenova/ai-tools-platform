"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCurrentUser } from "@/lib/hooks/useCurrentUser";
import { isOwner } from "@/lib/permissions";
import { Spinner } from "@/components/ui/Spinner";
import { cn } from "@/lib/cn";

const tabs = [
  { href: "/dashboard/admin/tools", label: "Pending Tools" },
  { href: "/dashboard/admin/categories", label: "Categories" },
  { href: "/dashboard/admin/tags", label: "Tags" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { data: user, isLoading } = useCurrentUser();

  const isForbidden = !isLoading && !isOwner(user);

  // Presentation-only gate — the API's own policies (ToolPolicy::moderate,
  // CategoryPolicy, TagPolicy) are what actually enforce this.
  useEffect(() => {
    if (isForbidden) {
      router.replace("/dashboard");
    }
  }, [isForbidden, router]);

  if (isLoading || isForbidden) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Admin</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Tool moderation and taxonomy management.
        </p>
      </div>

      <div className="flex gap-1 border-b border-gray-200 dark:border-gray-800">
        {tabs.map((tab) => (
          <Link
            key={tab.href}
            href={tab.href}
            className={cn(
              "border-b-2 px-3 py-2 text-sm font-medium",
              pathname === tab.href
                ? "border-blue-600 text-blue-700 dark:text-blue-400"
                : "border-transparent text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100",
            )}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      {children}
    </div>
  );
}
