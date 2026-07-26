"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ExternalLink, FileText, Pencil, Trash2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Spinner } from "@/components/ui/Spinner";
import { StateMessage } from "@/components/ui/StateMessage";
import { useToast } from "@/components/ui/Toast";
import { useCurrentUser } from "@/lib/hooks/useCurrentUser";
import { useDeleteTool, useTool } from "@/lib/hooks/useTools";
import { canDeleteTool, canEditTool } from "@/lib/permissions";
import { TOOL_STATUS_BADGE_VARIANTS, TOOL_STATUS_LABELS } from "@/lib/toolStatus";
import { cn } from "@/lib/cn";

export interface ToolDetailsPageProps {
  toolId: number;
}

export function ToolDetailsPage({ toolId }: ToolDetailsPageProps) {
  const router = useRouter();
  const { toast } = useToast();

  const { data: currentUser } = useCurrentUser();
  const { data: tool, isLoading, error } = useTool(toolId);
  const deleteTool = useDeleteTool();
  const [confirmOpen, setConfirmOpen] = useState(false);

  function handleDelete() {
    deleteTool.mutate(toolId, {
      onSuccess: () => {
        toast({ title: "Tool deleted.", variant: "success" });
        router.push("/dashboard/tools");
      },
      onError: () => {
        toast({ title: "Failed to delete tool.", variant: "error" });
      },
    });
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error || !tool) {
    return (
      <StateMessage
        tone="danger"
        message="This tool couldn't be loaded."
        action={
          <Link
            href="/dashboard/tools"
            className="text-sm font-medium text-indigo-600 hover:underline dark:text-indigo-400"
          >
            Back to AI Tools
          </Link>
        }
      />
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <Link
        href="/dashboard/tools"
        className="inline-flex w-fit items-center gap-1 text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden />
        Back to AI Tools
      </Link>

      <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">{tool.name}</h1>
          <Badge variant={TOOL_STATUS_BADGE_VARIANTS[tool.status]}>
            {TOOL_STATUS_LABELS[tool.status]}
          </Badge>
        </div>

        <div className="flex items-center gap-2">
          {canEditTool(currentUser, tool) && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => router.push(`/dashboard/tools/${tool.id}/edit`)}
            >
              <Pencil className="h-4 w-4" />
              Edit
            </Button>
          )}
          {canDeleteTool(currentUser, tool) && (
            <Button variant="danger" size="sm" onClick={() => setConfirmOpen(true)}>
              <Trash2 className="h-4 w-4" />
              Delete
            </Button>
          )}
        </div>
      </div>

      <Card className="flex flex-col gap-6">
        {tool.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element -- same-origin upload, not worth next/image's remotePatterns config for this milestone
          <img
            src={tool.image_url}
            alt={tool.name}
            className="max-h-80 w-full rounded-md object-cover"
          />
        ) : (
          <div className="flex h-48 w-full items-center justify-center rounded-md bg-gray-100 text-sm text-gray-400 dark:bg-gray-800">
            No image
          </div>
        )}

        <div className="flex flex-col gap-2">
          <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400">Description</h2>
          <p className="whitespace-pre-line text-gray-900 dark:text-gray-100">{tool.description}</p>
        </div>

        <div className="flex flex-wrap gap-6">
          <a
            href={tool.website_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-sm font-medium text-indigo-600 hover:underline dark:text-indigo-400"
          >
            Visit website
            <ExternalLink className="h-3.5 w-3.5" aria-hidden />
          </a>
          {tool.documentation_url && (
            <a
              href={tool.documentation_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-sm font-medium text-indigo-600 hover:underline dark:text-indigo-400"
            >
              <FileText className="h-3.5 w-3.5" aria-hidden />
              Documentation
            </a>
          )}
        </div>

        {tool.documentation_body && (
          <div className="flex flex-col gap-2">
            <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400">Documentation</h2>
            <div
              className={cn(
                "text-gray-900 dark:text-gray-100",
                "[&_h1]:mt-4 [&_h1]:text-lg [&_h1]:font-semibold [&_h1]:first:mt-0",
                "[&_h2]:mt-4 [&_h2]:text-base [&_h2]:font-semibold [&_h2]:first:mt-0",
                "[&_h3]:mt-3 [&_h3]:text-sm [&_h3]:font-semibold",
                "[&_p]:mb-3 [&_p]:last:mb-0",
                "[&_ul]:mb-3 [&_ul]:list-disc [&_ul]:pl-5",
                "[&_ol]:mb-3 [&_ol]:list-decimal [&_ol]:pl-5",
                "[&_li]:mb-1",
                "[&_a]:text-indigo-600 [&_a]:underline dark:[&_a]:text-indigo-400",
                "[&_blockquote]:mb-3 [&_blockquote]:border-l-2 [&_blockquote]:border-gray-300 [&_blockquote]:pl-3 [&_blockquote]:text-gray-600 dark:[&_blockquote]:border-gray-700 dark:[&_blockquote]:text-gray-400",
                "[&_code]:rounded [&_code]:bg-gray-100 [&_code]:px-1 [&_code]:py-0.5 [&_code]:text-sm dark:[&_code]:bg-gray-800",
                "[&_pre]:mb-3 [&_pre]:overflow-x-auto [&_pre]:rounded-md [&_pre]:bg-gray-100 [&_pre]:p-3 [&_pre]:text-sm dark:[&_pre]:bg-gray-800",
                "[&_pre_code]:bg-transparent [&_pre_code]:p-0",
              )}
            >
              <ReactMarkdown>{tool.documentation_body}</ReactMarkdown>
            </div>
          </div>
        )}

        {tool.categories.length > 0 && (
          <div className="flex flex-col gap-2">
            <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400">Categories</h2>
            <div className="flex flex-wrap gap-1.5">
              {tool.categories.map((category) => (
                <Badge key={category.id} variant="blue">
                  {category.name}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {tool.roles.length > 0 && (
          <div className="flex flex-col gap-2">
            <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400">Roles</h2>
            <div className="flex flex-wrap gap-1.5">
              {tool.roles.map((role) => (
                <Badge key={role.id} variant="green">
                  {role.name}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {tool.tags.length > 0 && (
          <div className="flex flex-col gap-2">
            <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400">Tags</h2>
            <div className="flex flex-wrap gap-1.5">
              {tool.tags.map((tag) => (
                <Badge key={tag.id} variant="gray">
                  {tag.name}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {tool.creator && (
          <p className="text-sm text-gray-500 dark:text-gray-400">Added by {tool.creator.name}</p>
        )}
      </Card>

      <Modal
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Delete tool"
        description={`Delete "${tool.name}"? This can't be undone.`}
      >
        <div className="flex justify-end gap-3 pt-2">
          <Button variant="secondary" size="sm" onClick={() => setConfirmOpen(false)}>
            Cancel
          </Button>
          <Button variant="danger" size="sm" isLoading={deleteTool.isPending} onClick={handleDelete}>
            Delete
          </Button>
        </div>
      </Modal>
    </div>
  );
}
