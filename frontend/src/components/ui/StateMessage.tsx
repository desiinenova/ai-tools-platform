import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/cn";

export interface StateMessageProps {
  icon?: LucideIcon;
  /** Optional heading above `message` — for empty states that need a title + supporting line. */
  title?: string;
  message: string;
  tone?: "neutral" | "danger";
  action?: React.ReactNode;
  className?: string;
}

/**
 * Centered "message + one action" block — the same shape that showed up,
 * byte-for-byte, in ToolDetailsPage, ToolForm (twice), and a close variant
 * in ToolList's error state. Extracted once that real duplication appeared.
 * `icon`/`title` cover the app's empty-state uses (ToolsEmptyState,
 * EntityManager, pending-tools), which are the same shape plus an icon.
 */
export function StateMessage({
  icon: Icon,
  title,
  message,
  tone = "neutral",
  action,
  className,
}: StateMessageProps) {
  return (
    <div className={cn("flex flex-col items-center gap-3 py-16 text-center", className)}>
      {Icon && <Icon className="h-8 w-8 text-gray-400 dark:text-gray-500" aria-hidden />}
      <div className="flex flex-col gap-1">
        {title && <p className="font-medium text-gray-900 dark:text-gray-100">{title}</p>}
        <p
          className={cn(
            "text-sm",
            tone === "danger" ? "text-rose-600 dark:text-rose-400" : "text-gray-600 dark:text-gray-400",
          )}
        >
          {message}
        </p>
      </div>
      {action}
    </div>
  );
}
