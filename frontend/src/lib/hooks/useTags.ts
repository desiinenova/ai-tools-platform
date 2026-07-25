"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createTag, deleteTag, listTags, updateTag } from "@/lib/api";
import type { TagInput } from "@/types";

const tagKeys = { all: ["tags"] as const };

export function useTags() {
  return useQuery({
    queryKey: tagKeys.all,
    queryFn: listTags,
    // Same reasoning as useCategories: owner-managed, mutations already
    // invalidate explicitly, so a long staleTime is a safe refetch-reduction
    // rather than a correctness dependency.
    staleTime: 5 * 60_000,
  });
}

export function useCreateTag() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: TagInput) => createTag(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: tagKeys.all }),
  });
}

export function useUpdateTag() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: TagInput }) => updateTag(id, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: tagKeys.all }),
  });
}

export function useDeleteTag() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => deleteTag(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: tagKeys.all }),
  });
}
