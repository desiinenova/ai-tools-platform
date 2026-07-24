"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ExternalLink, Pencil, Trash2 } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";
import { useCurrentUser } from "@/lib/hooks/useCurrentUser";
import { useDeleteTool } from "@/lib/hooks/useTools";
import { canDeleteTool, canEditTool } from "@/lib/permissions";
import { TOOL_STATUS_BADGE_VARIANTS, TOOL_STATUS_LABELS } from "@/lib/toolStatus";
import type { Tool } from "@/types";

export interface ToolCardProps {
  tool: Tool;
}

export function ToolCard({ tool }: ToolCardProps) {
  const router = useRouter();
  const { data: currentUser } = useCurrentUser();
  const { toast } = useToast();
  const deleteTool = useDeleteTool();
  const [confirmOpen, setConfirmOpen] = useState(false);

  function handleDelete() {
    deleteTool.mutate(tool.id, {
      onSuccess: () => {
        setConfirmOpen(false);
        toast({ title: "Tool deleted.", variant: "success" });
      },
      onError: () => {
        toast({ title: "Failed to delete tool.", variant: "error" });
      },
    });
  }

  function goToDetails() {
    router.push(`/dashboard/tools/${tool.id}`);
  }

  return (
    <Card
      className="flex cursor-pointer flex-col gap-3 transition-shadow hover:shadow-md"
      role="button"
      tabIndex={0}
      onClick={goToDetails}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          goToDetails();
        }
      }}
    >
      {tool.image_url ? (
        // eslint-disable-next-line @next/next/no-img-element -- same-origin upload, not worth next/image's remotePatterns config for this milestone
        <img
          src={tool.image_url}
          alt={tool.name}
          className="h-32 w-full rounded-md object-cover"
          loading="lazy"
        />
      ) : (
        <div className="flex h-32 w-full items-center justify-center rounded-md bg-gray-100 text-sm text-gray-400 dark:bg-gray-800">
          No image
        </div>
      )}

      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between gap-2">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100">{tool.name}</h3>
          <Badge variant={TOOL_STATUS_BADGE_VARIANTS[tool.status]} className="shrink-0">
            {TOOL_STATUS_LABELS[tool.status]}
          </Badge>
        </div>
        <p className="line-clamp-2 text-sm text-gray-600 dark:text-gray-400">{tool.description}</p>
      </div>

      {(tool.categories.length > 0 || tool.tags.length > 0) && (
        <div className="flex flex-wrap gap-1.5">
          {tool.categories.map((category) => (
            <Badge key={`category-${category.id}`} variant="blue">
              {category.name}
            </Badge>
          ))}
          {tool.tags.map((tag) => (
            <Badge key={`tag-${tag.id}`} variant="gray">
              {tag.name}
            </Badge>
          ))}
        </div>
      )}

      <div className="mt-auto flex items-center justify-between pt-2">
        <a
          href={tool.website_url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 hover:underline dark:text-blue-400"
        >
          Visit website
          <ExternalLink className="h-3.5 w-3.5" aria-hidden />
        </a>

        <div className="flex items-center gap-1">
          {canEditTool(currentUser, tool) && (
            <Link
              href={`/dashboard/tools/${tool.id}/edit`}
              aria-label={`Edit ${tool.name}`}
              onClick={(e) => e.stopPropagation()}
              className="rounded p-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-200"
            >
              <Pencil className="h-4 w-4" />
            </Link>
          )}
          {canDeleteTool(currentUser, tool) && (
            <button
              type="button"
              aria-label={`Delete ${tool.name}`}
              onClick={(e) => {
                e.stopPropagation();
                setConfirmOpen(true);
              }}
              className="rounded p-1.5 text-gray-500 hover:bg-red-50 hover:text-red-600 dark:text-gray-400 dark:hover:bg-red-950 dark:hover:text-red-400"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      <Modal
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Delete tool"
        description={`Delete "${tool.name}"? This can't be undone.`}
      >
        {/* Radix portals this outside Card's DOM subtree, but React's
            synthetic events still bubble through the component tree, so
            this still needs its own stopPropagation to avoid also
            triggering the card's onClick navigation. */}
        <div className="flex justify-end gap-3 pt-2" onClick={(e) => e.stopPropagation()}>
          <Button variant="secondary" size="sm" onClick={() => setConfirmOpen(false)}>
            Cancel
          </Button>
          <Button variant="danger" size="sm" isLoading={deleteTool.isPending} onClick={handleDelete}>
            Delete
          </Button>
        </div>
      </Modal>
    </Card>
  );
}
