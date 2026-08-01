"use client";

/**
 * A module row on the course overview. Answers the brief's four orientation
 * questions at a glance: what it is, how long it takes, what state it's in,
 * and what happens next (Section 37).
 */

import Link from "next/link";
import { ChecklistIcon, ChevronRightIcon, InfoIcon } from "@/components/ui/Icon";
import { DurationLabel } from "@/components/course/DurationLabel";
import { ModuleStatusBadges } from "@/components/course/ModuleStatus";
import { formatModuleNumber } from "@/lib/format";
import { getQuizFacts, resolveDuration, type Module } from "@/lib/content";
import { useLearnerProgress } from "@/lib/progress-provider";
import { getModuleCompletion } from "@/lib/progress-selectors";

export function ModuleListItem({
  module,
  courseId,
}: {
  module: Module;
  courseId: string;
}) {
  const { state, status } = useLearnerProgress();
  const completion = getModuleCompletion(state, module);
  const duration = resolveDuration(module);
  const quizFacts = module.quiz ? getQuizFacts(module.quiz) : null;

  const isDone = completion.moduleComplete;
  const isReady = completion.videoComplete && !isDone;

  return (
    <div
      className={[
        "group relative flex items-start gap-4 rounded-card border bg-raised p-5 shadow-subtle",
        "transition-[border-color,box-shadow] duration-200 ease-[var(--ease-out-quint)]",
        "hover:border-border-strong hover:shadow-raised",
        isDone ? "border-success/30" : "border-border",
      ].join(" ")}
    >
      {/* Module number circle */}
      <span
        aria-hidden="true"
        className={[
          "numeric mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold",
          isDone
            ? "bg-success/12 text-success"
            : isReady
              ? "bg-primary-tint text-primary"
              : "bg-sunken text-muted",
        ].join(" ")}
      >
        {formatModuleNumber(module.moduleNumber)}
      </span>

      <div className="min-w-0 flex-1">
        {/* Topic chip */}
        {quizFacts && quizFacts.topics[0] ? (
          <span className="mb-2 inline-block rounded-[5px] bg-accent-tint px-2 py-0.5 text-xs font-medium text-accent-strong">
            {quizFacts.topics[0]}
          </span>
        ) : null}

        <h3 className="text-base font-semibold leading-snug text-ink">
          <Link
            href={`/courses/${courseId}/modules/${module.id}`}
            className="after:absolute after:inset-0 after:rounded-card"
          >
            <span className="sr-only">
              Module {module.moduleNumber}:{" "}
            </span>
            {module.title}
          </Link>
        </h3>

        <p className="mt-1.5 text-sm leading-relaxed text-muted">
          {module.summary}
        </p>

        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted">
          <DurationLabel duration={duration} />

          {quizFacts ? (
            <span className="inline-flex items-center gap-1.5">
              <ChecklistIcon className="h-3.5 w-3.5" />
              <span>
                <span className="numeric">{quizFacts.questionCount}</span>
                {"-question assessment"}
              </span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5">
              <InfoIcon className="h-3.5 w-3.5" />
              <span>Lesson only</span>
            </span>
          )}
        </div>

        <div className="mt-3">
          <ModuleStatusBadges
            completion={completion}
            loading={status === "loading"}
          />
        </div>
      </div>

      <ChevronRightIcon className="mt-1 h-5 w-5 shrink-0 text-border-strong transition-transform duration-200 ease-[var(--ease-out-quint)] group-hover:translate-x-0.5 group-hover:text-muted motion-reduce:group-hover:translate-x-0" />
    </div>
  );
}
