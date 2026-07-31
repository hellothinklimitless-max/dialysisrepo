"use client";

/**
 * COURSE PROGRESS — brief Sections 3, 20
 * ======================================
 * "5 of 8 Modules Complete" plus the tick-scale progress motif.
 *
 * Where a course ships fewer modules than it nominally contains, progress is
 * measured against what the learner can actually complete, and the shortfall is
 * stated separately as hollow ticks plus a footnote — never folded into a
 * denominator the learner can never reach (README section 2b).
 */

import { Card } from "@/components/ui/Card";
import { TickProgress } from "@/components/ui/TickProgress";
import { useLearnerProgress } from "@/lib/progress-provider";
import { getCourseProgress } from "@/lib/progress-selectors";
import { formatPercent } from "@/lib/format";

export function CourseProgress({
  courseId,
  variant = "card",
}: {
  courseId: string;
  variant?: "card" | "compact";
}) {
  const { state, status } = useLearnerProgress();
  const progress = getCourseProgress(state, courseId);
  const loading = status === "loading";

  const ghostCount = Math.max(
    0,
    progress.nominalModules - progress.availableModules,
  );

  const valueText = `${progress.completedModules} of ${progress.availableModules} modules complete`;

  if (variant === "compact") {
    return (
      <div className="flex items-center gap-3 rounded-card border border-border bg-raised px-4 py-3">
        <div className="min-w-0 flex-1">
          <TickProgress
            label="Course progress"
            value={loading ? 0 : progress.completedModules}
            max={progress.availableModules}
            ghostCount={ghostCount}
            size="sm"
            valueText={loading ? "Loading progress" : valueText}
          />
        </div>
        <p className="numeric shrink-0 text-sm font-medium text-ink">
          {loading ? "—" : formatPercent(progress.percentComplete)}
        </p>
      </div>
    );
  }

  return (
    <Card className="p-5">
      <h2 className="text-xs font-semibold uppercase tracking-[0.08em] text-muted">
        Course progress
      </h2>

      <p className="mt-3 flex items-baseline gap-2">
        <span className="numeric text-3xl font-semibold text-ink">
          {loading ? "—" : formatPercent(progress.percentComplete)}
        </span>
        <span className="text-sm text-muted">complete</span>
      </p>

      <TickProgress
        className="mt-4"
        label="Course progress"
        value={loading ? 0 : progress.completedModules}
        max={progress.availableModules}
        ghostCount={ghostCount}
        valueText={loading ? "Loading progress" : valueText}
      />

      <p className="mt-3 text-sm text-muted">
        {loading ? (
          <span aria-live="polite">Loading your progress…</span>
        ) : (
          <>
            <span className="numeric font-medium text-ink">
              {progress.completedModules}
            </span>{" "}
            of{" "}
            <span className="numeric font-medium text-ink">
              {progress.availableModules}
            </span>{" "}
            {progress.availableModules === 1 ? "module" : "modules"} complete
          </>
        )}
      </p>

      {ghostCount > 0 ? (
        <p className="mt-2 border-t border-border pt-3 text-xs leading-relaxed text-muted">
          This course is scoped for{" "}
          <span className="numeric">{progress.nominalModules}</span> modules.{" "}
          <span className="numeric">{ghostCount}</span>{" "}
          {ghostCount === 1 ? "lesson is" : "lessons are"} not yet available —
          shown as the hollow {ghostCount === 1 ? "tick" : "ticks"} above.
        </p>
      ) : null}
    </Card>
  );
}
