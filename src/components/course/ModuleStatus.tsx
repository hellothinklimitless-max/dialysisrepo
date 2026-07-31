"use client";

/**
 * Module status vocabulary, in one place so the course list, the sidebar nav
 * and the module page can never disagree about what "complete" means.
 *
 * Status is always carried by text, not colour alone (brief Section 25).
 */

import { Badge } from "@/components/ui/Badge";
import { CheckIcon, ClockIcon, InfoIcon, PlayIcon } from "@/components/ui/Icon";
import type { Module } from "@/lib/content";
import { useLearnerProgress } from "@/lib/progress-provider";
import { getModuleCompletion } from "@/lib/progress-selectors";
import type { ModuleCompletionState } from "@/lib/types";

export function useModuleCompletion(module: Module): ModuleCompletionState {
  const { state } = useLearnerProgress();
  return getModuleCompletion(state, module);
}

export type ModuleStatusKind =
  | "complete"
  | "in-progress"
  | "assessment-ready"
  | "not-started";

export function resolveStatusKind(
  completion: ModuleCompletionState,
): ModuleStatusKind {
  if (completion.moduleComplete) return "complete";
  if (completion.hasActiveAttempt) return "in-progress";
  if (completion.videoComplete) return "assessment-ready";
  return "not-started";
}

const statusLabels: Record<ModuleStatusKind, string> = {
  complete: "Complete",
  "in-progress": "Assessment in progress",
  "assessment-ready": "Ready for assessment",
  "not-started": "Not started",
};

export function ModuleStatusBadges({
  completion,
  loading = false,
}: {
  completion: ModuleCompletionState;
  loading?: boolean;
}) {
  if (loading) {
    return (
      <span className="inline-block h-6 w-24 animate-pulse rounded-control bg-sunken" />
    );
  }

  const kind = resolveStatusKind(completion);

  return (
    <div className="flex flex-wrap items-center gap-2">
      {kind === "complete" ? (
        <Badge tone="success" icon={<CheckIcon className="h-3.5 w-3.5" />}>
          {statusLabels.complete}
        </Badge>
      ) : null}

      {kind === "in-progress" ? (
        <Badge tone="accent" icon={<ClockIcon className="h-3.5 w-3.5" />}>
          Resume assessment
        </Badge>
      ) : null}

      {kind === "assessment-ready" ? (
        <Badge tone="primary" icon={<CheckIcon className="h-3.5 w-3.5" />}>
          Lesson watched
        </Badge>
      ) : null}

      {kind === "not-started" ? (
        <Badge tone="outline" icon={<PlayIcon className="h-3 w-3" />}>
          {statusLabels["not-started"]}
        </Badge>
      ) : null}

      {/* The real "Quiz unavailable" case: this module's source material never
          included an assessment (README section 2c). Stated plainly rather
          than left looking broken. */}
      {completion.assessmentRequirement === "unavailable" ? (
        <Badge tone="neutral" icon={<InfoIcon className="h-3.5 w-3.5" />}>
          No assessment
        </Badge>
      ) : null}

      {completion.bestScorePercent !== null ? (
        <Badge tone="outline">
          <span className="text-muted">Best</span>
          <span className="numeric font-medium text-ink">
            {completion.bestScorePercent}%
          </span>
        </Badge>
      ) : null}
    </div>
  );
}

/** Compact dot used in the sidebar list, where a full badge row is too heavy. */
export function ModuleStatusDot({
  completion,
  loading = false,
}: {
  completion: ModuleCompletionState;
  loading?: boolean;
}) {
  const kind = resolveStatusKind(completion);

  if (loading) {
    return (
      <span
        className="mt-[3px] h-4 w-4 shrink-0 rounded-full border border-border bg-sunken"
        aria-hidden="true"
      />
    );
  }

  if (kind === "complete") {
    return (
      <span
        className="mt-[3px] flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-success text-white"
        aria-hidden="true"
      >
        <CheckIcon className="h-2.5 w-2.5" />
      </span>
    );
  }

  if (kind === "in-progress") {
    return (
      <span
        className="mt-[3px] h-4 w-4 shrink-0 rounded-full border-2 border-accent bg-accent-tint"
        aria-hidden="true"
      />
    );
  }

  if (kind === "assessment-ready") {
    return (
      <span
        className="mt-[3px] h-4 w-4 shrink-0 rounded-full border-2 border-primary bg-primary-tint"
        aria-hidden="true"
      />
    );
  }

  return (
    <span
      className="mt-[3px] h-4 w-4 shrink-0 rounded-full border border-border-strong"
      aria-hidden="true"
    />
  );
}

export function statusText(completion: ModuleCompletionState): string {
  return statusLabels[resolveStatusKind(completion)];
}
