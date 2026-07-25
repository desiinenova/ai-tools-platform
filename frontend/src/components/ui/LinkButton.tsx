import Link from "next/link";
import type { ComponentProps } from "react";
import { buttonClassName } from "./Button";
import type { ButtonVariant, ButtonSize } from "./Button";

export interface LinkButtonProps extends ComponentProps<typeof Link> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

/** A real <a> (via next/link, so it's prefetched like any other Link)
 * styled identically to Button — for navigation that should look like a
 * button, without duplicating Button's classes by hand. */
export function LinkButton({ variant = "primary", size = "md", className, children, ...props }: LinkButtonProps) {
  return (
    <Link className={buttonClassName({ variant, size, className })} {...props}>
      {children}
    </Link>
  );
}
