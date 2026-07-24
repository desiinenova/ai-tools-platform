import type { BadgeVariant } from "@/components/ui";
import type { ToolStatus } from "@/types";

export const TOOL_STATUS_LABELS: Record<ToolStatus, string> = {
  pending: "Pending",
  approved: "Approved",
  rejected: "Rejected",
};

export const TOOL_STATUS_BADGE_VARIANTS: Record<ToolStatus, BadgeVariant> = {
  pending: "default",
  approved: "green",
  rejected: "red",
};
