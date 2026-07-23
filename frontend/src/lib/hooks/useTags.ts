"use client";

import { useQuery } from "@tanstack/react-query";
import { listTags } from "@/lib/api";

export function useTags() {
  return useQuery({
    queryKey: ["tags"],
    queryFn: listTags,
  });
}
