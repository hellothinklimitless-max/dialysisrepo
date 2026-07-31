import type { ReactNode } from "react";

/**
 * Status badges. Tone is never the only signal — every badge carries a label,
 * and status badges pair it with an icon (brief Section 25).
 */

export type BadgeTone =
  | "neutral"
  | "primary"
  | "accent"
  | "success"
  | "error"
  | "outline";

const tones: Record<BadgeTone, string> = {
  neutral: "bg-sunken text-muted border-transparent",
  primary: "bg-primary-tint text-primary border-transparent",
  accent: "bg-accent-tint text-accent-strong border-transparent",
  success: "bg-success-tint text-success border-transparent",
  error: "bg-error-tint text-error border-transparent",
  outline: "bg-transparent text-muted border-border",
};

export function Badge({
  tone = "neutral",
  className = "",
  icon,
  children,
}: {
  tone?: BadgeTone;
  className?: string;
  icon?: ReactNode;
  children: ReactNode;
}) {
  return (
    <span
      className={[
        "inline-flex items-center gap-1.5 rounded-control border px-2 py-1",
        "text-xs font-medium tracking-tight",
        tones[tone],
        className,
      ].join(" ")}
    >
      {icon}
      {children}
    </span>
  );
}

/** Small label + numeric value pair. The value always uses the mono face. */
export function MetaStat({
  label,
  value,
  className = "",
}: {
  label: string;
  value: ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <dt className="text-xs uppercase tracking-[0.08em] text-muted">{label}</dt>
      <dd className="numeric mt-1 text-lg font-medium text-ink">{value}</dd>
    </div>
  );
}
