"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useCurrentUser } from "@/lib/hooks/useCurrentUser";
import { ApiError } from "@/lib/api";
import { Sidebar } from "@/components/layout/Sidebar";
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
    <div className="flex min-h-screen">
      <Sidebar user={user} mobileOpen={mobileNavOpen} onMobileOpenChange={setMobileNavOpen} />
      <div className="flex flex-1 flex-col">
        <Topbar user={user} onMenuClick={() => setMobileNavOpen(true)} />
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
