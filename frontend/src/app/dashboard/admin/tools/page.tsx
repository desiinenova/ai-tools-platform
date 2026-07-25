"use client";

import { PendingToolCard } from "@/components/admin/PendingToolCard";
import { Spinner } from "@/components/ui/Spinner";
import { usePendingTools } from "@/lib/hooks/useTools";

export default function AdminPendingToolsPage() {
  const { data: tools, isLoading } = usePendingTools();

  return (
    <div className="flex flex-col gap-4">
      {isLoading && (
        <div className="flex justify-center py-8">
          <Spinner />
        </div>
      )}
      {!isLoading && (tools?.length ?? 0) === 0 && (
        <p className="py-8 text-center text-sm text-gray-500 dark:text-gray-400">
          No tools awaiting review.
        </p>
      )}

      {tools?.map((tool) => (
        <PendingToolCard key={tool.id} tool={tool} />
      ))}
    </div>
  );
}
