"use client";

/**
 * LESSON HEADER — brief Section 3
 * ===============================
 * Course title, module title, module number, estimated duration, assessment
 * size. Numbers use the mono face; nothing else does.
 */

import Link from "next/link";
import { TickProgress } from "@/components/ui/TickProgress";
import { DurationLabel } from "@/components/course/DurationLabel";
import { ModuleStatusBadges } from "@/components/course/ModuleStatus";
import { formatModuleNumber } from "@/lib/format";
import { getQuizFacts, resolveDuration, type Course, type Module } from "@/lib/content";
import { useLearnerProgress } from "@/lib/progress-provider";
import { getModuleCompletion } from "@/lib/progress-selectors";

export function LessonHeader({
  course,
  module,
  position,
  total,
}: {
  course: Course;
  module: Module;
  /** 1-based position among modules that exist. */
  position: number;
  total: number;
}) {
  const { state, status } = useLearnerProgress();
  const completion = getModuleCompletion(state, module);
  const duration = resolveDuration(module);
  const quizFacts = module.quiz ? getQuizFacts(module.quiz) : null;

  return (
    <header>
      {/* Course breadcrumb + position */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          href={`/courses/${course.id}`}
          className="text-xs font-semibold uppercase tracking-[0.12em] text-accent-strong hover:text-accent"
        >
          {course.title}
        </Link>

        <div className="flex items-center gap-3">
          <TickProgress
            value={position - 1}
            max={total}
            mode="segments"
            tone="primary"
            size="sm"
            label={`Module ${position} of ${total}`}
            valueText={`${position - 1} of ${total} modules completed`}
          />
          <span className="numeric text-xs text-muted">
            {formatModuleNumber(position)}&nbsp;/&nbsp;{formatModuleNumber(total)}
          </span>
        </div>
      </div>

      {/* Topic chip */}
      {quizFacts?.topics[0] ? (
        <span className="mt-3 inline-block rounded-[5px] bg-accent-tint px-2.5 py-1 text-xs font-medium text-accent-strong">
          {quizFacts.topics[0]}
        </span>
      ) : null}

      <h1 className="mt-3 text-3xl font-semibold leading-tight tracking-tight text-ink sm:text-[2.5rem]">
        {module.title}
      </h1>

      <p className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted">
        <span>
          Module{" "}
          <span className="numeric text-ink">
            {formatModuleNumber(module.moduleNumber)}
          </span>{" "}
          of{" "}
          <span className="numeric text-ink">{formatModuleNumber(total)}</span>
        </span>
        <span aria-hidden="true" className="text-border-strong">
          ·
        </span>
        <span className="inline-flex items-center gap-1">
          <DurationLabel duration={duration} withIcon={false} />
          <span>lesson</span>
        </span>
        <span aria-hidden="true" className="text-border-strong">
          ·
        </span>
        <span>
          {quizFacts ? (
            <>
              <span className="numeric text-ink">
                {quizFacts.questionCount}
              </span>{" "}
              question assessment
            </>
          ) : (
            "no assessment for this lesson"
          )}
        </span>
        {position !== module.moduleNumber ? (
          <span className="sr-only">
            Lesson {position} of {total} available in this course.
          </span>
        ) : null}
      </p>

      <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted">
        {module.summary}
      </p>

      <div className="mt-5">
        <ModuleStatusBadges
          completion={completion}
          loading={status === "loading"}
        />
      </div>
    </header>
  );
}
