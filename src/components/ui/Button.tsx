import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "quiet";
export type ButtonSize = "sm" | "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 rounded-control font-medium " +
  "transition-[background-color,border-color,color,transform] duration-150 " +
  "ease-[var(--ease-out-quint)] active:translate-y-px " +
  "disabled:pointer-events-none disabled:opacity-45 " +
  "motion-reduce:active:translate-y-0";

const variants: Record<ButtonVariant, string> = {
  primary: "bg-primary text-white hover:bg-primary-strong",
  secondary:
    "bg-raised text-ink border border-border hover:border-border-strong hover:bg-sunken",
  ghost: "text-ink hover:bg-sunken",
  quiet: "text-primary hover:text-primary-strong underline underline-offset-4 decoration-border-strong hover:decoration-primary",
};

const sizes: Record<ButtonSize, string> = {
  // Minimum 44px tall at md/lg — large touch targets (brief Section 28).
  sm: "h-9 px-3 text-sm",
  md: "h-11 px-4 text-sm",
  lg: "h-12 px-5 text-base",
};

export function buttonClasses(
  variant: ButtonVariant = "primary",
  size: ButtonSize = "md",
  className = "",
) {
  return [base, variants[variant], sizes[size], className].join(" ");
}

export interface ButtonProps extends ComponentProps<"button"> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: ReactNode;
}

export function Button({
  variant = "primary",
  size = "md",
  className = "",
  type = "button",
  children,
  ...rest
}: ButtonProps) {
  return (
    <button type={type} className={buttonClasses(variant, size, className)} {...rest}>
      {children}
    </button>
  );
}

export interface ButtonLinkProps extends ComponentProps<typeof Link> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: ReactNode;
}

export function ButtonLink({
  variant = "primary",
  size = "md",
  className = "",
  children,
  ...rest
}: ButtonLinkProps) {
  return (
    <Link className={buttonClasses(variant, size, className)} {...rest}>
      {children}
    </Link>
  );
}
