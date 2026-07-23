"use client";

import { useQuery } from "@tanstack/react-query";
import { getCurrentUser } from "@/lib/api";

/**
 * Session/identity only — no permission logic. See lib/permissions.ts for
 * "can this user do X" checks, which are kept separate so they can later
 * mirror Laravel Policies one-to-one.
 */
export function useCurrentUser() {
  return useQuery({
    queryKey: ["user"],
    queryFn: getCurrentUser,
  });
}
