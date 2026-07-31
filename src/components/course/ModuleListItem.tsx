"use client";

/**
 * A module row on the course overview. Answers the brief's four orientation
 * questions at a glance: what it is, how long it takes, what state it's in,
 * and what happens next (Section 37).
 */

import Link from "next/link";
import { Card } from "@/components/ui/Card";
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

  return (
    <Card interactive className="group relative">
      <div className="flex items-start gap-4 p-5">
        <span
          className="numeric mt-0.5 w-8 shrink-0 text-sm font-medium text-muted"
          aria-hidden="true"
        >
          {formatModuleNumber(module.moduleNumber)}
        </span>

        <div className="min-w-0 flex-1">
          <h3 className="text-base font-semibold leading-snug text-ink">
            <Link
              href={`/courses/${courseId}/modules/${module.id}`}
              // Stretched link: the whole card is the target (large touch
              // target, brief Section 28) while the accessible name stays the
              // module title rather than the entire card's text.
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
                <span>Lesson only — no assessment</span>
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
    </Card>
  );
}
