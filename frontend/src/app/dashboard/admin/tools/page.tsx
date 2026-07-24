"use client";

import { PendingToolCard } from "@/components/admin/PendingToolCard";
import { usePendingTools } from "@/lib/hooks/useTools";

export default function AdminPendingToolsPage() {
  const { data: tools, isLoading } = usePendingTools();

  return (
    <div className="flex flex-col gap-4">
      {isLoading && <p className="text-sm text-gray-500 dark:text-gray-400">Loading…</p>}
      {!isLoading && (tools?.length ?? 0) === 0 && (
        <p className="text-sm text-gray-500 dark:text-gray-400">No tools awaiting review.</p>
      )}

      {tools?.map((tool) => (
        <PendingToolCard key={tool.id} tool={tool} />
      ))}
    </div>
  );
}
