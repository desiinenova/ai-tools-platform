"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  confirmTwoFactor,
  disableTwoFactor,
  enableTwoFactor,
  regenerateRecoveryCodes,
} from "@/lib/api";

export function useEnableTwoFactor() {
  return useMutation({ mutationFn: enableTwoFactor });
}

export function useConfirmTwoFactor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: confirmTwoFactor,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["user"] }),
  });
}

export function useDisableTwoFactor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: disableTwoFactor,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["user"] }),
  });
}

export function useRegenerateRecoveryCodes() {
  return useMutation({ mutationFn: regenerateRecoveryCodes });
}
