"use client";

import { TickProgress } from "@/components/ui/TickProgress";

export function QuizProgress({
  current,
  total,
}: {
  /** 1-based index of the current question. */
  current: number;
  total: number;
}) {
  return (
    <div className="flex items-center gap-4">
      <TickProgress
        value={current - 1}
        max={total}
        mode="segments"
        tone="primary"
        size="sm"
        label={`Question ${current} of ${total}`}
        valueText={`${current - 1} of ${total} answered`}
      />
      <span className="numeric text-sm text-muted">
        {current}
        <span className="text-border-strong">/{total}</span>
      </span>
    </div>
  );
}
