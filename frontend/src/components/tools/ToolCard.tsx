import { ExternalLink } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import type { Tool } from "@/types";

export interface ToolCardProps {
  tool: Tool;
}

export function ToolCard({ tool }: ToolCardProps) {
  return (
    <Card className="flex flex-col gap-3">
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
        <h3 className="font-semibold text-gray-900 dark:text-gray-100">{tool.name}</h3>
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
          className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 hover:underline dark:text-blue-400"
        >
          Visit website
          <ExternalLink className="h-3.5 w-3.5" aria-hidden />
        </a>
        {/* Edit/Delete land here in Milestone 4, gated by lib/permissions.ts */}
      </div>
    </Card>
  );
}
