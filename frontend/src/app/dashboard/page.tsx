"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ApiError, AuthUser, getCurrentUser, logout } from "@/lib/api";

type Status = "loading" | "ready" | "unauthenticated" | "error";

export default function DashboardPage() {
  const router = useRouter();
  const [status, setStatus] = useState<Status>("loading");
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    getCurrentUser()
      .then((data) => {
        setUser(data);
        setStatus("ready");
      })
      .catch((err) => {
        if (err instanceof ApiError && err.status === 401) {
          setStatus("unauthenticated");
          router.push("/login");
          return;
        }

        console.error(err);
        setStatus("error");
      });
  }, [router]);

  async function handleLogout() {
    await logout();
    router.push("/login");
  }

  if (status === "loading" || status === "unauthenticated") {
    return (
      <main className="flex min-h-screen items-center justify-center p-8">
        <p className="text-sm text-gray-500">Loading...</p>
      </main>
    );
  }

  if (status === "error") {
    return (
      <main className="flex min-h-screen items-center justify-center p-8">
        <p className="text-sm text-red-600">
          Something went wrong loading your dashboard. Please try again.
        </p>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-8">
      <h1 className="text-2xl font-semibold">Dashboard</h1>
      <p>
        Logged in as <span className="font-medium">{user!.name}</span> (
        {user!.email})
      </p>
      <p>
        Role: <span className="font-medium">{user!.role.name}</span>
      </p>
      <button
        onClick={handleLogout}
        className="rounded border border-gray-300 px-4 py-2 text-sm font-medium dark:border-gray-700"
      >
        Log out
      </button>
    </main>
  );
}
