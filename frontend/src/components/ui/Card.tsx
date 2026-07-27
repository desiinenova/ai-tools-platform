import { cn } from "@/lib/cn";

export type CardProps = React.HTMLAttributes<HTMLDivElement>;

export function Card({ className, children, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition dark:border-gray-800 dark:bg-gray-900",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
