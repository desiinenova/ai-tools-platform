"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createTool, deleteTool, getTool, listTools, updateTool } from "@/lib/api";
import type { ToolFilters, ToolInput } from "@/types";

export const toolKeys = {
  all: ["tools"] as const,
  lists: () => [...toolKeys.all, "list"] as const,
  list: (filters: ToolFilters) => [...toolKeys.lists(), filters] as const,
  details: () => [...toolKeys.all, "detail"] as const,
  detail: (id: number) => [...toolKeys.details(), id] as const,
};

export function useTools(filters: ToolFilters = {}) {
  return useQuery({
    queryKey: toolKeys.list(filters),
    queryFn: () => listTools(filters),
  });
}

export function useTool(id: number) {
  return useQuery({
    queryKey: toolKeys.detail(id),
    queryFn: () => getTool(id),
    enabled: !!id,
  });
}

export function useCreateTool() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createTool,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: toolKeys.lists() });
    },
  });
}

export function useUpdateTool() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: ToolInput }) => updateTool(id, input),
    onSuccess: (updated, { id }) => {
      queryClient.setQueryData(toolKeys.detail(id), updated);
      queryClient.invalidateQueries({ queryKey: toolKeys.lists() });
    },
  });
}

export function useDeleteTool() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteTool,
    onSuccess: (_data, id) => {
      queryClient.removeQueries({ queryKey: toolKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: toolKeys.lists() });
    },
  });
}
