"use client";

import { useState } from "react";
import Link from "next/link";
import { Button, Card, Modal } from "@/components/ui";
import { useToast } from "@/components/ui/Toast";
import { useApproveTool, usePendingTools, useRejectTool } from "@/lib/hooks/useTools";
import type { Tool } from "@/types";

export default function AdminPendingToolsPage() {
  const { data: tools, isLoading } = usePendingTools();
  const approveTool = useApproveTool();
  const rejectTool = useRejectTool();
  const { toast } = useToast();
  const [rejectTarget, setRejectTarget] = useState<Tool | null>(null);

  function handleApprove(tool: Tool) {
    approveTool.mutate(tool.id, {
      onSuccess: () => toast({ title: `"${tool.name}" approved.`, variant: "success" }),
      onError: () => toast({ title: "Failed to approve tool.", variant: "error" }),
    });
  }

  function handleReject() {
    if (!rejectTarget) return;

    rejectTool.mutate(rejectTarget.id, {
      onSuccess: () => {
        toast({ title: `"${rejectTarget.name}" rejected.`, variant: "success" });
        setRejectTarget(null);
      },
      onError: () => toast({ title: "Failed to reject tool.", variant: "error" }),
    });
  }

  return (
    <div className="flex flex-col gap-4">
      {isLoading && <p className="text-sm text-gray-500 dark:text-gray-400">Loading…</p>}
      {!isLoading && (tools?.length ?? 0) === 0 && (
        <p className="text-sm text-gray-500 dark:text-gray-400">No tools awaiting review.</p>
      )}

      {tools?.map((tool) => (
        <Card
          key={tool.id}
          className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
        >
          <div>
            <Link
              href={`/dashboard/tools/${tool.id}`}
              className="font-semibold text-gray-900 hover:underline dark:text-gray-100"
            >
              {tool.name}
            </Link>
            <p className="line-clamp-2 text-sm text-gray-600 dark:text-gray-400">
              {tool.description}
            </p>
            {tool.creator && (
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-500">
                Submitted by {tool.creator.name}
              </p>
            )}
          </div>
          <div className="flex shrink-0 gap-2">
            <Button
              size="sm"
              variant="secondary"
              isLoading={approveTool.isPending}
              onClick={() => handleApprove(tool)}
            >
              Approve
            </Button>
            <Button size="sm" variant="danger" onClick={() => setRejectTarget(tool)}>
              Reject
            </Button>
          </div>
        </Card>
      ))}

      <Modal
        open={!!rejectTarget}
        onOpenChange={(open) => !open && setRejectTarget(null)}
        title="Reject tool"
        description={
          rejectTarget
            ? `Reject "${rejectTarget.name}"? Its creator can edit and resubmit it for another review.`
            : undefined
        }
      >
        <div className="flex justify-end gap-3">
          <Button variant="secondary" size="sm" onClick={() => setRejectTarget(null)}>
            Cancel
          </Button>
          <Button
            variant="danger"
            size="sm"
            isLoading={rejectTool.isPending}
            onClick={handleReject}
          >
            Reject
          </Button>
        </div>
      </Modal>
    </div>
  );
}
