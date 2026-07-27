import { PackageSearch } from "lucide-react";
import { StateMessage } from "@/components/ui/StateMessage";

export interface ToolsEmptyStateProps {
  hasActiveFilters: boolean;
}

export function ToolsEmptyState({ hasActiveFilters }: ToolsEmptyStateProps) {
  return (
    <StateMessage
      icon={PackageSearch}
      title={hasActiveFilters ? "No tools match these filters" : "No tools yet"}
      message={
        hasActiveFilters
          ? "Try adjusting or clearing your filters."
          : "Once tools are added, they'll show up here."
      }
      className="rounded-xl border border-dashed border-gray-300 dark:border-gray-700"
    />
  );
}
