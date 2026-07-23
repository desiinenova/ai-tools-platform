import { Card } from "@/components/ui/Card";

export function ToolCardSkeleton() {
  return (
    <Card className="flex flex-col gap-3">
      <div className="h-32 w-full animate-pulse rounded-md bg-gray-200 dark:bg-gray-800" />
      <div className="flex flex-col gap-2">
        <div className="h-4 w-2/3 animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
        <div className="h-3 w-full animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
        <div className="h-3 w-4/5 animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
      </div>
      <div className="flex gap-1.5">
        <div className="h-5 w-16 animate-pulse rounded-full bg-gray-200 dark:bg-gray-800" />
        <div className="h-5 w-12 animate-pulse rounded-full bg-gray-200 dark:bg-gray-800" />
      </div>
    </Card>
  );
}
