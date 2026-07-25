"use client";

import { useQuery } from "@tanstack/react-query";
import { listRoles } from "@/lib/api";

export function useRoles() {
  return useQuery({
    queryKey: ["roles"],
    queryFn: listRoles,
    // No create/update/delete endpoint exists for roles anywhere in the
    // app — they're seeded once and never change at runtime, so cached
    // data can never actually go stale.
    staleTime: Infinity,
  });
}
