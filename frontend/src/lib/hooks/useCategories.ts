"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createCategory, deleteCategory, listCategories, updateCategory } from "@/lib/api";
import type { CategoryInput } from "@/types";

const categoryKeys = { all: ["categories"] as const };

export function useCategories() {
  return useQuery({
    queryKey: categoryKeys.all,
    queryFn: listCategories,
    // Owner-managed taxonomy, changed only via the mutations below, which
    // already invalidate this query explicitly on success — a long
    // staleTime just avoids needless refetches, it isn't relied on for
    // correctness.
    staleTime: 5 * 60_000,
  });
}

export function useCreateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CategoryInput) => createCategory(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: categoryKeys.all }),
  });
}

export function useUpdateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: CategoryInput }) => updateCategory(id, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: categoryKeys.all }),
  });
}

export function useDeleteCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => deleteCategory(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: categoryKeys.all }),
  });
}
