"use client";

/**
 * LESSON HEADER — brief Section 3
 * ===============================
 * Course title, module title, module number, estimated duration, assessment
 * size. The example the brief gives is:
 *
 *   Dialysis Equipment & Machine Operation
 *   Module 03 of 08
 *   12 min lesson · 8 question assessment
 *
 * Numbers use the mono face; nothing else does.
 */

import Link from "next/link";
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
      <Link
        href={`/courses/${course.id}`}
        className="text-xs font-semibold uppercase tracking-[0.12em] text-accent-strong hover:text-accent"
      >
        {course.title}
      </Link>

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
