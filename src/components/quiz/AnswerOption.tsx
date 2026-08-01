"use client";

import type { ResponseOutcome } from "@/lib/types";

const LABELS = ["A", "B", "C", "D"] as const;

export function AnswerOption({
  index,
  text,
  selected,
  locked,
  outcome,
  isCorrect,
  onSelect,
}: {
  index: 0 | 1 | 2 | 3;
  text: string;
  selected: boolean;
  locked: boolean;
  /** Set after submission; null while still answering. */
  outcome: ResponseOutcome | null;
  /** Whether this option is the correct answer — shown post-submit. */
  isCorrect: boolean;
  onSelect: () => void;
}) {
  const label = LABELS[index];

  // Visual state resolution
  let ringClass = "ring-border";
  let bgClass = "bg-raised";
  let labelBgClass = "bg-sunken text-muted";
  let labelTextClass = "";

  if (locked) {
    if (isCorrect) {
      ringClass = "ring-success";
      bgClass = "bg-success-tint";
      labelBgClass = "bg-success/15";
      labelTextClass = "text-success";
    } else if (selected && outcome === "incorrect") {
      ringClass = "ring-error";
      bgClass = "bg-error-tint";
      labelBgClass = "bg-error/15";
      labelTextClass = "text-error";
    } else {
      ringClass = "ring-border";
      bgClass = "bg-raised opacity-60";
    }
  } else if (selected) {
    ringClass = "ring-primary";
    bgClass = "bg-primary-tint";
    labelBgClass = "bg-primary/15";
    labelTextClass = "text-primary";
  }

  return (
    <button
      role="radio"
      aria-checked={selected}
      onClick={locked ? undefined : onSelect}
      disabled={locked}
      className={[
        "group flex w-full items-start gap-3 rounded-card p-4 text-left ring-1 transition-all duration-150",
        ringClass,
        bgClass,
        locked ? "cursor-default" : "cursor-pointer hover:ring-primary/50",
      ].join(" ")}
    >
      <span
        className={[
          "numeric mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-[6px] text-xs font-semibold transition-colors duration-150",
          labelBgClass,
          labelTextClass,
        ].join(" ")}
        aria-hidden="true"
      >
        {label}
      </span>
      <span className="text-sm leading-relaxed text-ink">{text}</span>
    </button>
  );
}
