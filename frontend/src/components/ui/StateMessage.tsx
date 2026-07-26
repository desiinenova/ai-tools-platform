import { cn } from "@/lib/cn";

export interface StateMessageProps {
  message: string;
  tone?: "neutral" | "danger";
  action?: React.ReactNode;
  className?: string;
}

/**
 * Centered "message + one action" block — the same shape that showed up,
 * byte-for-byte, in ToolDetailsPage, ToolForm (twice), and a close variant
 * in ToolList's error state. Extracted once that real duplication appeared.
 */
export function StateMessage({ message, tone = "neutral", action, className }: StateMessageProps) {
  return (
    <div className={cn("flex flex-col items-center gap-3 py-16 text-center", className)}>
      <p
        className={cn(
          "text-sm",
          tone === "danger" ? "text-rose-600 dark:text-rose-400" : "text-gray-600 dark:text-gray-400",
        )}
      >
        {message}
      </p>
      {action}
    </div>
  );
}
