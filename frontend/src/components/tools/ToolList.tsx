import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { StateMessage } from "@/components/ui/StateMessage";
import { ToolCard } from "./ToolCard";
import { ToolCardSkeleton } from "./ToolCardSkeleton";
import { ToolsEmptyState } from "./ToolsEmptyState";
import type { Tool } from "@/types";

export interface ToolListProps {
  tools: Tool[] | undefined;
  isLoading: boolean;
  isFetching: boolean;
  error: unknown;
  hasActiveFilters: boolean;
  onRetry: () => void;
}

const SKELETON_COUNT = 6;

export function ToolList({
  tools,
  isLoading,
  isFetching,
  error,
  hasActiveFilters,
  onRetry,
}: ToolListProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: SKELETON_COUNT }).map((_, index) => (
          <ToolCardSkeleton key={index} />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <StateMessage
        tone="danger"
        message="Something went wrong loading tools."
        className="rounded-xl border border-dashed border-rose-300 dark:border-rose-900"
        action={
          <Button variant="secondary" size="sm" onClick={onRetry}>
            Retry
          </Button>
        }
      />
    );
  }

  if (!tools || tools.length === 0) {
    return <ToolsEmptyState hasActiveFilters={hasActiveFilters} />;
  }

  return (
    <div className="flex flex-col gap-3">
      {isFetching && (
        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
          <Spinner size="sm" />
          Updating…
        </div>
      )}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {tools.map((tool) => (
          <ToolCard key={tool.id} tool={tool} />
        ))}
      </div>
    </div>
  );
}
