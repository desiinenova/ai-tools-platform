import { forwardRef } from "react";
import Link from "next/link";
import type { ComponentProps } from "react";
import { cn } from "@/lib/cn";

export type IconButtonVariant = "default" | "danger";

const variantClasses: Record<IconButtonVariant, string> = {
  default:
    "text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-200",
  danger:
    "text-gray-500 hover:bg-red-50 hover:text-red-600 dark:text-gray-400 dark:hover:bg-red-950 dark:hover:text-red-400",
};

function iconButtonClassName(variant: IconButtonVariant, className?: string) {
  return cn(
    "rounded p-1.5 transition-colors",
    "focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 dark:focus:ring-offset-gray-900",
    variantClasses[variant],
    className,
  );
}

export interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: IconButtonVariant;
  /** Required — an icon-only control has no visible text, so it needs an explicit accessible name. */
  "aria-label": string;
}

/** For icon-only actions that perform an in-place action (open a modal, etc). Use IconLinkButton for navigation. */
export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(function IconButton(
  { variant = "default", className, type = "button", ...props },
  ref,
) {
  return <button ref={ref} type={type} className={iconButtonClassName(variant, className)} {...props} />;
});

export interface IconLinkButtonProps extends ComponentProps<typeof Link> {
  variant?: IconButtonVariant;
  /** Required — an icon-only control has no visible text, so it needs an explicit accessible name. */
  "aria-label": string;
}

/** For icon-only actions that navigate. Renders a real next/link Link, so it's prefetched and keyboard-focusable like any other link. */
export function IconLinkButton({ variant = "default", className, ...props }: IconLinkButtonProps) {
  return <Link className={iconButtonClassName(variant, className)} {...props} />;
}
