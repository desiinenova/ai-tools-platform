import { cn } from "@/lib/cn";

export type BadgeVariant = "default" | "blue" | "green" | "red" | "gray";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

const variantClasses: Record<BadgeVariant, string> = {
  default: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200",
  blue: "bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300",
  green: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300",
  red: "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300",
  gray: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
};

export function Badge({ variant = "default", className, children, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        variantClasses[variant],
        className,
      )}
      {...props}
    >
      {children}
    </span>
  );
}
