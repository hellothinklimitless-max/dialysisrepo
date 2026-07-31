"use client";

/**
 * MODULE PAGE — brief Sections 2, 3, 26, 32
 * =========================================
 * The lesson is the visual priority; navigation is contextual (Section 3:
 * "visually prioritise the learning content rather than navigation").
 *
 * The assessment block below the video is where Phases 3–5 land: the player
 * gets wired up, then the lesson→quiz transition, then the quiz itself. What
 * exists today is the module context and the honest status of each piece.
 */

import { notFound } from "next/navigation";
import { CourseProgress } from "@/components/course/CourseProgress";
import { CourseShell } from "@/components/course/CourseShell";
import { LessonHeader } from "@/components/course/LessonHeader";
import { ModuleNavigation } from "@/components/course/ModuleNavigation";
import { ModulePager } from "@/components/course/ModulePager";
import { ModuleRequirements } from "@/components/course/ModuleRequirements";
import { PersistenceNotice } from "@/components/course/PersistenceNotice";
import { QuizUnavailable } from "@/components/course/QuizUnavailable";
import { VideoSlot } from "@/components/course/VideoSlot";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ArrowRightIcon, ChecklistIcon, ClockIcon, FlagIcon } from "@/components/ui/Icon";
import {
  getCourseStructure,
  getModuleById,
  getModuleNeighbours,
  getQuizFacts,
} from "@/lib/content";
import { useLearnerProgress } from "@/lib/progress-provider";
import { getModuleCompletion } from "@/lib/progress-selectors";

export function ModuleOverview({
  courseId,
  moduleId,
}: {
  courseId: string;
  moduleId: string;
}) {
  const { state, status } = useLearnerProgress();
  const structure = getCourseStructure(courseId);
  const courseModule = getModuleById(moduleId);

  if (!structure || !courseModule || courseModule.courseId !== courseId) notFound();

  const completion = getModuleCompletion(state, courseModule);
  const neighbours = getModuleNeighbours(courseId, moduleId);
  const quizFacts = courseModule.quiz ? getQuizFacts(courseModule.quiz) : null;

  return (
    <CourseShell
      breadcrumb={[
        { label: structure.course.title, href: `/courses/${courseId}` },
        { label: courseModule.title },
      ]}
      mobileSummary={<CourseProgress courseId={courseId} variant="compact" />}
      sidebar={
        <div className="flex flex-col gap-4">
          <CourseProgress courseId={courseId} />
          <ModuleRequirements
            completion={completion}
            loading={status === "loading"}
          />
          <ModuleNavigation
            courseId={courseId}
            modules={structure.modules}
            currentModuleId={moduleId}
            meta={structure.meta}
          />
        </div>
      }
    >
      <PersistenceNotice />

      <LessonHeader
        course={structure.course}
        module={courseModule}
        position={neighbours.position}
        total={structure.modules.length}
      />

      <div className="mt-7">
        <VideoSlot module={courseModule} />
      </div>

      <section className="mt-10 border-t border-border pt-8">
        <h2 className="text-sm font-semibold uppercase tracking-[0.08em] text-muted">
          Knowledge check
        </h2>

        {quizFacts && courseModule.quiz ? (
          <Card className="mt-4 p-6">
            <p className="text-lg font-semibold leading-snug text-ink">
              Test your understanding of {courseModule.title.toLowerCase()}.
            </p>

            <dl className="mt-5 flex flex-wrap gap-x-10 gap-y-4">
              <div>
                <dt className="flex items-center gap-1.5 text-xs uppercase tracking-[0.08em] text-muted">
                  <ChecklistIcon className="h-3.5 w-3.5" />
                  Questions
                </dt>
                <dd className="numeric mt-1 text-xl font-semibold text-ink">
                  {quizFacts.questionCount}
                </dd>
              </div>
              <div>
                <dt className="flex items-center gap-1.5 text-xs uppercase tracking-[0.08em] text-muted">
                  <ClockIcon className="h-3.5 w-3.5" />
                  Estimated
                </dt>
                <dd className="numeric mt-1 text-xl font-semibold text-ink">
                  ~{quizFacts.estimatedMinutes} min
                </dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-[0.08em] text-muted">
                  Passing score
                </dt>
                <dd className="numeric mt-1 text-xl font-semibold text-ink">
                  {quizFacts.passingScore}%
                </dd>
              </div>
            </dl>

            <p className="mt-5 max-w-xl text-sm leading-relaxed text-muted">
              Every response includes an explanation and a clinical learning
              insight — whether you answer correctly or not.
            </p>

            {quizFacts.flaggedCount > 0 ? (
              <p className="mt-4 flex items-start gap-2 text-sm leading-relaxed text-muted">
                <FlagIcon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-accent-strong" />
                <span>
                  <span className="numeric">{quizFacts.flaggedCount}</span> of
                  these {quizFacts.flaggedCount === 1 ? "questions is" : "questions are"}{" "}
                  a discussion question rather than a graded one, and{" "}
                  {quizFacts.flaggedCount === 1 ? "does" : "do"} not affect your
                  score.
                </span>
              </p>
            ) : null}

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Button size="lg" disabled>
                Begin assessment
                <ArrowRightIcon className="h-4 w-4" />
              </Button>
              <span className="text-sm text-muted">
                The quiz engine is Phase 4 of the build.
              </span>
            </div>
          </Card>
        ) : (
          <div className="mt-4">
            <QuizUnavailable module={courseModule} />
          </div>
        )}
      </section>

      <ModulePager
        courseId={courseId}
        previous={neighbours.previous}
        next={neighbours.next}
      />
    </CourseShell>
  );
}
