import { forwardRef } from "react";
import { cn } from "@/lib/cn";
import { Spinner } from "./Spinner";

export type ButtonVariant = "primary" | "secondary" | "danger" | "success" | "ghost";
export type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: "bg-accent text-white hover:bg-accent-hover disabled:bg-indigo-300",
  secondary:
    "border border-gray-300 bg-white text-gray-900 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:hover:bg-gray-800",
  danger: "bg-danger text-white hover:bg-danger-hover disabled:bg-rose-300",
  success: "bg-success text-white hover:bg-success-hover disabled:bg-emerald-300",
  ghost: "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-4 py-2 text-sm",
  lg: "px-5 py-2.5 text-base",
};

/**
 * Shared with LinkButton, so a Button-styled <a> (via next/link) and a real
 * <button> always render identical classes, including the focus ring — one
 * place to keep them from drifting apart.
 */
export function buttonClassName({
  variant = "primary",
  size = "md",
  className,
}: {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
}) {
  return cn(
    "inline-flex items-center justify-center gap-2 rounded-md font-medium",
    "transition-[color,background-color,border-color,scale] duration-[180ms] ease-[var(--ease-motion)]",
    "focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 dark:focus:ring-offset-gray-900",
    "disabled:cursor-not-allowed",
    // Press feedback. `disabled:active:scale-100` cancels it for a real
    // disabled <button>; it's a no-op on LinkButton's <a> since anchors
    // have no :disabled state to begin with.
    "active:scale-[0.98] disabled:active:scale-100",
    variantClasses[variant],
    sizeClasses[size],
    className,
  );
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = "primary", size = "md", isLoading = false, disabled, className, children, ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      disabled={disabled || isLoading}
      className={buttonClassName({ variant, size, className })}
      {...props}
    >
      {isLoading && <Spinner size="sm" />}
      {children}
    </button>
  );
});
