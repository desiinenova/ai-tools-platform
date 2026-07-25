"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCurrentUser } from "@/lib/hooks/useCurrentUser";
import { ApiError } from "@/lib/api";
import { Spinner } from "@/components/ui/Spinner";

// Same session check dashboard/layout.tsx uses to gate the dashboard itself —
// this route just routes to /login or /dashboard based on the same result
// instead of rendering anything of its own.
export default function Home() {
  const router = useRouter();
  const { data: user, error } = useCurrentUser();

  const isUnauthenticated = error instanceof ApiError && error.status === 401;

  useEffect(() => {
    if (isUnauthenticated) {
      router.replace("/login");
    } else if (user) {
      router.replace("/dashboard");
    }
  }, [isUnauthenticated, user, router]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <Spinner size="lg" />
    </div>
  );
}
