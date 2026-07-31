"use client";

/**
 * MODULE REQUIREMENTS — brief Section 20
 * ======================================
 *   ✓ Video Complete
 *   ✓ Assessment Complete
 *   ✓ Module Complete
 *
 * With one honest deviation: a module whose source material has no assessment
 * shows that requirement as "not part of this lesson" rather than as an
 * unchecked box the learner could never tick (README section 2c).
 */

import { Card } from "@/components/ui/Card";
import { CheckIcon, InfoIcon } from "@/components/ui/Icon";
import type { ModuleCompletionState } from "@/lib/types";

function RequirementRow({
  label,
  state,
  detail,
}: {
  label: string;
  state: "done" | "pending" | "not-applicable";
  detail?: string;
}) {
  return (
    <li className="flex items-start gap-3 py-2.5">
      {state === "done" ? (
        <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-success text-white">
          <CheckIcon className="h-2.5 w-2.5" />
        </span>
      ) : state === "not-applicable" ? (
        <InfoIcon className="mt-0.5 h-4 w-4 shrink-0 text-muted" />
      ) : (
        <span
          className="mt-0.5 h-4 w-4 shrink-0 rounded-full border border-border-strong"
          aria-hidden="true"
        />
      )}

      <span className="min-w-0 flex-1">
        <span
          className={[
            "block text-sm",
            state === "done" ? "font-medium text-ink" : "text-muted",
          ].join(" ")}
        >
          {label}
        </span>
        {detail ? (
          <span className="mt-0.5 block text-xs text-muted">{detail}</span>
        ) : null}
      </span>

      <span className="sr-only">
        {state === "done"
          ? "Complete"
          : state === "not-applicable"
            ? "Not applicable"
            : "Not yet complete"}
      </span>
    </li>
  );
}

export function ModuleRequirements({
  completion,
  loading = false,
}: {
  completion: ModuleCompletionState;
  loading?: boolean;
}) {
  const assessmentUnavailable = completion.assessmentRequirement === "unavailable";

  return (
    <Card className="p-5">
      <h2 className="text-xs font-semibold uppercase tracking-[0.08em] text-muted">
        Module requirements
      </h2>

      {loading ? (
        <div className="mt-4 space-y-3" aria-live="polite">
          <span className="block h-4 w-3/4 animate-pulse rounded bg-sunken" />
          <span className="block h-4 w-2/3 animate-pulse rounded bg-sunken" />
          <span className="block h-4 w-1/2 animate-pulse rounded bg-sunken" />
          <span className="sr-only">Loading your progress…</span>
        </div>
      ) : (
        <ul className="mt-2 divide-y divide-border">
          <RequirementRow
            label="Watch the lesson"
            state={completion.videoComplete ? "done" : "pending"}
          />
          <RequirementRow
            label="Complete the knowledge check"
            state={
              assessmentUnavailable
                ? "not-applicable"
                : completion.assessmentPassed
                  ? "done"
                  : "pending"
            }
            detail={
              assessmentUnavailable
                ? "This lesson has no assessment in its source material."
                : completion.attemptCount > 0 && !completion.assessmentPassed
                  ? `${completion.attemptCount} ${completion.attemptCount === 1 ? "attempt" : "attempts"} so far — retakes are unlimited.`
                  : undefined
            }
          />
          <RequirementRow
            label="Module complete"
            state={completion.moduleComplete ? "done" : "pending"}
          />
        </ul>
      )}
    </Card>
  );
}
