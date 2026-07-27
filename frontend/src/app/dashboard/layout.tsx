"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useCurrentUser } from "@/lib/hooks/useCurrentUser";
import { ApiError } from "@/lib/api";
import { Sidebar } from "@/components/layout/Sidebar";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { Topbar } from "@/components/layout/Topbar";
import { Spinner } from "@/components/ui/Spinner";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { data: user, isLoading, error } = useCurrentUser();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const isUnauthenticated = error instanceof ApiError && error.status === 401;

  useEffect(() => {
    if (isUnauthenticated) {
      router.replace("/login");
    }
  }, [isUnauthenticated, router]);

  if (isLoading || isUnauthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center p-8">
        <p className="text-sm text-rose-600 dark:text-rose-400">
          Something went wrong loading your account. Please try again.
        </p>
      </div>
    );
  }

  return (
    <div className="flex h-dvh overflow-hidden">
      <Sidebar user={user} mobileOpen={mobileNavOpen} onMobileOpenChange={setMobileNavOpen} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Topbar onMenuClick={() => setMobileNavOpen(true)} />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
      <ThemeToggle />
    </div>
  );
}
