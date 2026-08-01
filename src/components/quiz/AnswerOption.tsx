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
  outcome: ResponseOutcome | null;
  isCorrect: boolean;
  onSelect: () => void;
}) {
  const label = LABELS[index];

  let containerClass: string;
  let labelClass: string;

  if (locked) {
    if (isCorrect) {
      containerClass = "ring-success bg-success-tint";
      labelClass = "bg-success/15 text-success font-semibold";
    } else if (selected && outcome === "incorrect") {
      containerClass = "ring-error bg-error-tint";
      labelClass = "bg-error/15 text-error font-semibold";
    } else {
      containerClass = "ring-border bg-raised opacity-50";
      labelClass = "bg-sunken text-muted";
    }
  } else if (selected) {
    containerClass = "ring-primary bg-primary-tint shadow-subtle";
    labelClass = "bg-primary/15 text-primary font-semibold";
  } else {
    containerClass = "ring-border bg-raised hover:ring-border-strong hover:bg-sunken/50";
    labelClass = "bg-sunken text-muted";
  }

  return (
    <button
      role="radio"
      aria-checked={selected}
      onClick={locked ? undefined : onSelect}
      disabled={locked}
      className={[
        "group flex w-full items-start gap-4 rounded-card p-4 text-left ring-1 transition-all duration-150",
        containerClass,
        locked ? "cursor-default" : "cursor-pointer",
      ].join(" ")}
    >
      <span
        className={[
          "numeric mt-[1px] flex h-7 w-7 shrink-0 items-center justify-center rounded-[6px] text-xs transition-colors duration-150",
          labelClass,
        ].join(" ")}
        aria-hidden="true"
      >
        {label}
      </span>
      <span className="text-sm leading-relaxed text-ink">{text}</span>
    </button>
  );
}
