"use client";

import { Inbox } from "lucide-react";
import { PendingToolCard } from "@/components/admin/PendingToolCard";
import { Spinner } from "@/components/ui/Spinner";
import { StateMessage } from "@/components/ui/StateMessage";
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
        <StateMessage icon={Inbox} message="No tools awaiting review." className="py-12" />
      )}

      {tools?.map((tool) => (
        <PendingToolCard key={tool.id} tool={tool} />
      ))}
    </div>
  );
}
