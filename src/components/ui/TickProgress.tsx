/**
 * TICK PROGRESS — the product's signature motif (README section 5)
 * ================================================================
 * Progress is drawn as discrete measurement ticks, like a dosage or volume
 * scale, rather than a smooth gradient-filled bar. This is the one place the
 * system spends visual boldness; everything around it stays quiet.
 *
 * Three modes:
 *   segments — one tick per unit (modules in a course, questions in a quiz)
 *   scale    — a fixed tick count filled proportionally (percentages)
 *   ghosts   — hollow, dashed ticks for content that is nominally part of the
 *              course but genuinely missing (README section 2b). The gap is
 *              shown rather than hidden.
 */

export type TickTone = "primary" | "accent" | "success";

export interface TickProgressProps {
  /** Units completed (segments mode) or percent complete (scale mode). */
  value: number;
  /** Total units (segments) or 100 (scale). */
  max: number;
  mode?: "segments" | "scale";
  /** Tick count in scale mode. Ignored in segments mode. */
  tickCount?: number;
  /**
   * Below this many units, one-tick-per-unit stops reading as a scale (a
   * single-module course would draw a single stray mark), so the component
   * falls back to a proportionally-filled scale.
   */
  minTicks?: number;
  /** Hollow trailing ticks for nominal-but-absent content. */
  ghostCount?: number;
  tone?: TickTone;
  size?: "sm" | "md";
  className?: string;
  /** Accessible name; the bar is exposed as a progressbar to screen readers. */
  label: string;
  /** Human phrasing announced instead of a bare percentage. */
  valueText?: string;
}

const toneFill: Record<TickTone, string> = {
  primary: "bg-primary",
  accent: "bg-accent",
  success: "bg-success",
};

export function TickProgress({
  value,
  max,
  mode = "segments",
  // 12 keeps a scale-mode band roughly the same physical width as the
  // segment-mode bands elsewhere, so courses sit consistently side by side.
  tickCount = 12,
  minTicks = 6,
  ghostCount = 0,
  tone = "primary",
  size = "md",
  className = "",
  label,
  valueText,
}: TickProgressProps) {
  const safeMax = Math.max(1, max);
  const clamped = Math.max(0, Math.min(value, safeMax));

  const useScale = mode === "scale" || safeMax + ghostCount < minTicks;
  const total = useScale ? tickCount : safeMax;
  const filled = useScale
    ? Math.round((clamped / safeMax) * total)
    : Math.round(clamped);
  // Ghost ticks only mean something when each tick is one unit.
  const ghosts = useScale ? 0 : ghostCount;

  const height = size === "sm" ? "h-3.5" : "h-4";
  const majorHeight = size === "sm" ? "h-5" : "h-6";
  const gap = size === "sm" ? "gap-[3px]" : "gap-[4px]";
  const width = size === "sm" ? "w-[3px]" : "w-[4px]";
  // Major ticks every few units read as a measurement scale rather than a row
  // of dashes. With few segments, every tick is already meaningful.
  const majorEvery = useScale ? 4 : total >= 6 ? 5 : 0;

  return (
    <div
      className={`flex w-fit items-end ${gap} ${className}`}
      role="progressbar"
      aria-label={label}
      aria-valuenow={Math.round(clamped)}
      aria-valuemin={0}
      aria-valuemax={safeMax}
      aria-valuetext={valueText}
    >
      {Array.from({ length: total }, (_, index) => {
        const isFilled = index < filled;
        const isMajor = majorEvery > 0 && (index + 1) % majorEvery === 0;
        return (
          <span
            key={`tick-${index}`}
            className={[
              width,
              "shrink-0 rounded-[1.5px] transition-[background-color,height] duration-300 ease-[var(--ease-out-quint)]",
              isMajor ? majorHeight : height,
              isFilled ? toneFill[tone] : "bg-border-strong",
            ].join(" ")}
          />
        );
      })}

      {ghosts > 0
        ? Array.from({ length: ghosts }, (_, index) => (
            <span
              key={`ghost-${index}`}
              className={`${width} shrink-0 rounded-[1.5px] border border-dashed border-border-strong ${height}`}
            />
          ))
        : null}
    </div>
  );
}
