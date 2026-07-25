"use client";

import { useState } from "react";
import Link from "next/link";
import { Button, Card, Modal } from "@/components/ui";
import { useToast } from "@/components/ui/Toast";
import { useApproveTool, useRejectTool } from "@/lib/hooks/useTools";
import type { Tool } from "@/types";

export interface PendingToolCardProps {
  tool: Tool;
}

/**
 * Owns its own approve/reject mutations rather than sharing one instance
 * across the whole pending-tools list — otherwise every row's button would
 * show a loading spinner whenever any single tool was being approved.
 */
export function PendingToolCard({ tool }: PendingToolCardProps) {
  const { toast } = useToast();
  const approveTool = useApproveTool();
  const rejectTool = useRejectTool();
  const [confirmOpen, setConfirmOpen] = useState(false);

  function handleApprove() {
    approveTool.mutate(tool.id, {
      onSuccess: () => toast({ title: `"${tool.name}" approved.`, variant: "success" }),
      onError: () => toast({ title: "Failed to approve tool.", variant: "error" }),
    });
  }

  function handleReject() {
    rejectTool.mutate(tool.id, {
      onSuccess: () => {
        toast({ title: `"${tool.name}" rejected.`, variant: "success" });
        setConfirmOpen(false);
      },
      onError: () => toast({ title: "Failed to reject tool.", variant: "error" }),
    });
  }

  return (
    <Card className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <Link
          href={`/dashboard/tools/${tool.id}`}
          className="font-semibold text-gray-900 hover:underline dark:text-gray-100"
        >
          {tool.name}
        </Link>
        <p className="line-clamp-2 text-sm text-gray-600 dark:text-gray-400">{tool.description}</p>
        {tool.creator && (
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-500">
            Submitted by {tool.creator.name}
          </p>
        )}
      </div>
      <div className="flex shrink-0 gap-2">
        <Button
          size="sm"
          variant="success"
          isLoading={approveTool.isPending}
          disabled={rejectTool.isPending}
          onClick={handleApprove}
        >
          Approve
        </Button>
        <Button
          size="sm"
          variant="danger"
          disabled={approveTool.isPending}
          onClick={() => setConfirmOpen(true)}
        >
          Reject
        </Button>
      </div>

      <Modal
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Reject tool"
        description={`Reject "${tool.name}"? Its creator can edit and resubmit it for another review.`}
      >
        <div className="flex justify-end gap-3">
          <Button variant="secondary" size="sm" onClick={() => setConfirmOpen(false)}>
            Cancel
          </Button>
          <Button variant="danger" size="sm" isLoading={rejectTool.isPending} onClick={handleReject}>
            Reject
          </Button>
        </div>
      </Modal>
    </Card>
  );
}
