import type { ElementType, ReactNode } from "react";

/**
 * One card level only. The brief explicitly warns against "cards inside cards"
 * (Section 34), so nested surfaces use `Panel` — a tinted, borderless region —
 * rather than a second bordered card.
 */

export interface CardProps {
  as?: ElementType;
  className?: string;
  children: ReactNode;
  /** Raised cards lift slightly on hover; use only when the whole card is a link. */
  interactive?: boolean;
  /** Passed through to the rendered element (aria-label, id, role, …). */
  [key: `aria-${string}`]: unknown;
  id?: string;
}

export function Card({
  as: Tag = "div",
  className = "",
  children,
  interactive = false,
  ...rest
}: CardProps) {
  return (
    <Tag
      {...rest}
      className={[
        "rounded-card border border-border bg-raised shadow-subtle",
        interactive
          ? "transition-[border-color,box-shadow] duration-200 ease-[var(--ease-out-quint)] hover:border-border-strong hover:shadow-raised"
          : "",
        className,
      ].join(" ")}
    >
      {children}
    </Tag>
  );
}

export type PanelTone = "neutral" | "primary" | "accent" | "success" | "error";

const panelTones: Record<PanelTone, string> = {
  neutral: "bg-sunken text-ink",
  primary: "bg-primary-tint text-ink",
  accent: "bg-accent-tint text-ink",
  success: "bg-success-tint text-ink",
  error: "bg-error-tint text-ink",
};

export interface PanelProps {
  tone?: PanelTone;
  className?: string;
  children: ReactNode;
  as?: ElementType;
  role?: string;
  id?: string;
  [key: `aria-${string}`]: unknown;
}

export function Panel({
  tone = "neutral",
  className = "",
  children,
  as: Tag = "div",
  ...rest
}: PanelProps) {
  return (
    <Tag {...rest} className={`rounded-control ${panelTones[tone]} ${className}`}>
      {children}
    </Tag>
  );
}
