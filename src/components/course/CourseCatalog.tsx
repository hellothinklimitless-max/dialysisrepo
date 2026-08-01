"use client";

/**
 * COURSE CATALOG — the entry point into the learning flow (brief Section 2).
 *
 * Four real courses from the content file. Nothing here is invented: module
 * counts, runtimes and question totals are all derived from the data.
 */

import Link from "next/link";
import { CourseShell } from "@/components/course/CourseShell";
import { PersistenceNotice } from "@/components/course/PersistenceNotice";
import { Badge } from "@/components/ui/Badge";
import { ArrowRightIcon, ChecklistIcon, ClockIcon } from "@/components/ui/Icon";
import { TickProgress } from "@/components/ui/TickProgress";
import {
  courses,
  durationsAreUnverified,
  getCourseQuestionCount,
  getCourseRuntimeSeconds,
  getCourseStructure,
} from "@/lib/content";
import { formatMinutes } from "@/lib/format";
import { useLearnerProgress } from "@/lib/progress-provider";
import { getCourseProgress } from "@/lib/progress-selectors";

export function CourseCatalog() {
  const { state, status } = useLearnerProgress();
  const loading = status === "loading";
  const estimated = durationsAreUnverified();

  const totalModules = courses.reduce(
    (total, course) => total + (getCourseStructure(course.id)?.modules.length ?? 0),
    0,
  );
  const totalMinutes = courses.reduce(
    (total, course) => total + Math.round(getCourseRuntimeSeconds(course.id) / 60),
    0,
  );

  return (
    <CourseShell chrome="full">
      <PersistenceNotice />

      {/* Hero */}
      <section className="border-b border-border pb-12">
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-accent-strong">
          Clinical education
        </p>
        <h1 className="mt-3 max-w-2xl text-4xl font-semibold leading-[1.1] tracking-tight text-ink sm:text-5xl">
          Dialysis care, taught one measured step at a time.
        </h1>
        <p className="mt-4 max-w-xl text-base leading-relaxed text-muted">
          Watch a lesson, work through a knowledge check, and leave every
          question knowing more than you did before answering it.
        </p>

        {/* Platform stats */}
        <div className="mt-10 grid grid-cols-3 gap-3 sm:max-w-sm">
          <div className="rounded-card border border-border bg-raised px-4 py-4">
            <p className="numeric text-2xl font-semibold text-ink">
              {courses.length}
            </p>
            <p className="mt-0.5 text-xs text-muted">Courses</p>
          </div>
          <div className="rounded-card border border-border bg-raised px-4 py-4">
            <p className="numeric text-2xl font-semibold text-ink">
              {totalModules}
            </p>
            <p className="mt-0.5 text-xs text-muted">Lessons</p>
          </div>
          <div className="rounded-card border border-border bg-raised px-4 py-4">
            <p className="numeric text-2xl font-semibold text-ink">
              {estimated ? "~" : ""}{totalMinutes}
            </p>
            <p className="mt-0.5 text-xs text-muted">Minutes</p>
          </div>
        </div>
      </section>

      {/* Course grid */}
      <section className="pt-10">
        <h2 className="mb-5 text-sm font-semibold uppercase tracking-[0.08em] text-muted">
          All courses
        </h2>

        <ul className="grid gap-5 md:grid-cols-2">
          {courses.map((course, courseIndex) => {
            const structure = getCourseStructure(course.id);
            if (!structure) return null;

            const progress = getCourseProgress(state, course.id);
            const runtime = getCourseRuntimeSeconds(course.id);
            const questionCount = getCourseQuestionCount(course.id);
            const ghostCount = Math.max(
              0,
              progress.nominalModules - progress.availableModules,
            );
            const started = !loading && progress.completedModules > 0;
            const percentDone = loading ? 0 : progress.percentComplete;

            return (
              <li key={course.id} className="min-w-0">
                <div className="group relative flex h-full flex-col overflow-hidden rounded-card border border-border bg-raised shadow-subtle transition-[border-color,box-shadow] duration-200 ease-[var(--ease-out-quint)] hover:border-border-strong hover:shadow-raised">
                  {/* Course number stripe */}
                  <div className="flex items-center gap-3 border-b border-border px-5 py-3">
                    <span className="numeric flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                      {courseIndex + 1}
                    </span>
                    <span className="text-xs font-semibold uppercase tracking-[0.08em] text-muted">
                      Course {courseIndex + 1}
                    </span>
                    {structure.isContentIncomplete ? (
                      <Badge tone="outline" className="ml-auto shrink-0">
                        <span className="numeric">
                          {structure.modules.length}/
                          {structure.nominalModuleCount}
                        </span>
                        <span className="text-muted">available</span>
                      </Badge>
                    ) : null}
                  </div>

                  {/* Body */}
                  <div className="flex flex-1 flex-col px-5 py-5">
                    <h3 className="text-lg font-semibold leading-snug text-ink">
                      <Link
                        href={`/courses/${course.id}`}
                        className="after:absolute after:inset-0 after:rounded-card"
                      >
                        {course.title}
                      </Link>
                    </h3>

                    <p className="mt-2 flex-1 text-sm leading-relaxed text-muted">
                      {course.description}
                    </p>

                    {/* Metadata row */}
                    <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted">
                      <span className="inline-flex items-center gap-1.5">
                        <ClockIcon className="h-3.5 w-3.5" />
                        <span className="numeric">
                          {estimated ? "~" : ""}
                          {formatMinutes(runtime)}
                        </span>
                        {estimated ? (
                          <span className="sr-only">(estimated)</span>
                        ) : null}
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <ChecklistIcon className="h-3.5 w-3.5" />
                        <span>
                          <span className="numeric">{questionCount}</span>{" "}
                          questions
                        </span>
                      </span>
                      <span>
                        <span className="numeric">{structure.modules.length}</span>{" "}
                        {structure.modules.length === 1 ? "lesson" : "lessons"}
                      </span>
                    </div>
                  </div>

                  {/* Progress footer */}
                  <div className="border-t border-border px-5 py-4">
                    <div className="mb-2.5 flex items-center justify-between gap-2">
                      <TickProgress
                        className="flex-1"
                        label={`${course.title} progress`}
                        value={loading ? 0 : progress.completedModules}
                        max={progress.availableModules}
                        ghostCount={ghostCount}
                        size="sm"
                        valueText={
                          loading
                            ? "Loading progress"
                            : `${progress.completedModules} of ${progress.availableModules} lessons complete`
                        }
                      />
                      <span className="numeric shrink-0 text-xs font-medium text-muted">
                        {loading ? "—" : `${percentDone}%`}
                      </span>
                    </div>
                    <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary transition-colors group-hover:text-primary-strong">
                      {started ? "Continue" : "Start course"}
                      <ArrowRightIcon className="h-4 w-4 transition-transform duration-200 ease-[var(--ease-out-quint)] group-hover:translate-x-0.5 motion-reduce:group-hover:translate-x-0" />
                    </span>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>

        {estimated ? (
          <p className="mt-8 max-w-2xl border-t border-border pt-5 text-xs leading-relaxed text-muted">
            Lesson durations marked with{" "}
            <span className="numeric text-ink">~</span> are estimated from each
            lesson&apos;s transcript and have not been verified against the source
            video. Run{" "}
            <code className="numeric rounded-[4px] bg-sunken px-1 py-0.5 text-[0.7rem] text-ink">
              npm run fetch:durations
            </code>{" "}
            with a YouTube API key to replace them with exact times.
          </p>
        ) : null}
      </section>
    </CourseShell>
  );
}
