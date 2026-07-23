import { PackageSearch } from "lucide-react";

export interface ToolsEmptyStateProps {
  hasActiveFilters: boolean;
}

export function ToolsEmptyState({ hasActiveFilters }: ToolsEmptyStateProps) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed border-gray-300 py-16 text-center dark:border-gray-700">
      <PackageSearch className="h-8 w-8 text-gray-400" aria-hidden />
      <p className="font-medium text-gray-900 dark:text-gray-100">
        {hasActiveFilters ? "No tools match these filters" : "No tools yet"}
      </p>
      <p className="text-sm text-gray-500 dark:text-gray-400">
        {hasActiveFilters
          ? "Try adjusting or clearing your filters."
          : "Once tools are added, they'll show up here."}
      </p>
    </div>
  );
}
