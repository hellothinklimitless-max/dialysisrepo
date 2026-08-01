"use client";

/**
 * COURSE OVERVIEW — brief Sections 2, 3, 26
 * =========================================
 * Two columns on desktop: the module list is the content, progress and
 * navigation are contextual. On mobile the sidebar drops below and a compact
 * progress strip takes its place at the top, rather than the desktop layout
 * being squeezed.
 */

import { notFound } from "next/navigation";
import { ContentGapNotice } from "@/components/course/ContentGapNotice";
import { CourseProgress } from "@/components/course/CourseProgress";
import { CourseShell } from "@/components/course/CourseShell";
import { ModuleListItem } from "@/components/course/ModuleListItem";
import { ModuleNavigation } from "@/components/course/ModuleNavigation";
import { PersistenceNotice } from "@/components/course/PersistenceNotice";
import { ButtonLink } from "@/components/ui/Button";
import { ArrowRightIcon, ChecklistIcon, ClockIcon } from "@/components/ui/Icon";
import {
  durationsAreUnverified,
  getCourseQuestionCount,
  getCourseRuntimeSeconds,
  getCourseStructure,
} from "@/lib/content";
import { formatMinutes } from "@/lib/format";
import { useLearnerProgress } from "@/lib/progress-provider";
import { getCourseProgress, getResumeModule } from "@/lib/progress-selectors";

export function CourseOverview({ courseId }: { courseId: string }) {
  const { state, status } = useLearnerProgress();
  const structure = getCourseStructure(courseId);
  if (!structure) notFound();

  const { course, meta, modules } = structure;
  const progress = getCourseProgress(state, courseId);
  const resumeModule = getResumeModule(state, courseId);
  const runtime = getCourseRuntimeSeconds(courseId);
  const questionCount = getCourseQuestionCount(courseId);
  const loading = status === "loading";
  const started = !loading && progress.completedModules > 0;

  return (
    <CourseShell
      breadcrumb={[{ label: course.title }]}
      mobileSummary={<CourseProgress courseId={courseId} variant="compact" />}
      sidebar={
        <div className="flex flex-col gap-4">
          <CourseProgress courseId={courseId} />
          <ModuleNavigation
            courseId={courseId}
            modules={modules}
            meta={meta}
          />
        </div>
      }
    >
      <PersistenceNotice />

      <header className="border-b border-border pb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-accent-strong">
          Course
        </p>
        <h1 className="mt-3 text-3xl font-semibold leading-tight tracking-tight text-ink sm:text-4xl">
          {course.title}
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted">
          {course.description}
        </p>

        {/* Stats strip */}
        <div className="mt-6 flex flex-wrap gap-3">
          <div className="inline-flex items-center gap-2 rounded-control border border-border bg-raised px-3 py-2 text-sm">
            <span className="numeric font-semibold text-ink">
              {modules.length}
            </span>
            <span className="text-muted">
              {modules.length === 1 ? "lesson" : "lessons"}
            </span>
          </div>
          <div className="inline-flex items-center gap-2 rounded-control border border-border bg-raised px-3 py-2 text-sm">
            <ClockIcon className="h-3.5 w-3.5 text-muted" />
            <span className="numeric font-semibold text-ink">
              {durationsAreUnverified() ? "~" : ""}
              {formatMinutes(runtime)}
            </span>
            <span className="text-muted">of lessons</span>
          </div>
          <div className="inline-flex items-center gap-2 rounded-control border border-border bg-raised px-3 py-2 text-sm">
            <ChecklistIcon className="h-3.5 w-3.5 text-muted" />
            <span className="numeric font-semibold text-ink">
              {questionCount}
            </span>
            <span className="text-muted">questions</span>
          </div>
        </div>

        {resumeModule ? (
          <div className="mt-7">
            <ButtonLink
              size="lg"
              href={`/courses/${courseId}/modules/${resumeModule.id}`}
            >
              {started ? "Continue course" : "Start course"}
              <ArrowRightIcon className="h-4 w-4" />
            </ButtonLink>
            <p className="mt-2.5 text-sm text-muted">
              {started ? "Up next: " : "Starting with: "}
              <span className="font-medium text-ink">{resumeModule.title}</span>
            </p>
          </div>
        ) : null}
      </header>

      <div className="pt-8">
        {structure.isContentIncomplete || (meta?.contentNotes.length ?? 0) > 0 ? (
          <div className="mb-6">
            <ContentGapNotice meta={meta} availableModules={modules.length} />
          </div>
        ) : null}

        <div className="mb-4 flex items-center justify-between gap-4">
          <h2 className="text-sm font-semibold uppercase tracking-[0.08em] text-muted">
            Lessons
          </h2>
          {!loading && (
            <span className="numeric text-xs text-muted">
              {progress.completedModules}/{progress.availableModules} complete
            </span>
          )}
        </div>

        {modules.length === 0 ? (
          <p className="mt-4 rounded-card border border-dashed border-border-strong p-8 text-center text-sm text-muted">
            No lessons are available in this course yet.
          </p>
        ) : (
          <ul className="flex flex-col gap-3">
            {modules.map((module) => (
              <li key={module.id}>
                <ModuleListItem module={module} courseId={courseId} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </CourseShell>
  );
}
