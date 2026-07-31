"use client";

/**
 * QUIZ UNAVAILABLE — brief Section 32
 * ===================================
 * Not a hypothetical state. "Understanding Kidney Issues: AKI, AKF, and CKD"
 * has a real video and genuinely no quiz — its source transcript never included
 * one, so `quiz` is `null` in the content file by design (README section 2c).
 *
 * The brief asks that error and empty states "provide a clear recovery action",
 * and that incorrect/absent things never feel punitive. So this explains why
 * there's no assessment, confirms the module still counts as complete, and
 * points at the next thing to do.
 */

import { Card } from "@/components/ui/Card";
import { ButtonLink } from "@/components/ui/Button";
import { ArrowRightIcon, InfoIcon } from "@/components/ui/Icon";
import { getModuleNeighbours, type Module } from "@/lib/content";

export function QuizUnavailable({ module }: { module: Module }) {
  const neighbours = getModuleNeighbours(module.courseId, module.id);

  return (
    <Card className="p-6">
      <div className="flex gap-3">
        <InfoIcon className="mt-0.5 h-5 w-5 shrink-0 text-muted" />
        <div className="min-w-0">
          <h3 className="text-base font-semibold text-ink">
            This lesson doesn’t have an assessment.
          </h3>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted">
            No knowledge check was written for this lesson, and we’d rather say
            so than generate questions the source material doesn’t support.
            Watching the lesson is all this module asks of you — it counts as
            complete once the video is finished.
          </p>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            {neighbours.next ? (
              <ButtonLink
                href={`/courses/${module.courseId}/modules/${neighbours.next.id}`}
              >
                Continue to next module
                <ArrowRightIcon className="h-4 w-4" />
              </ButtonLink>
            ) : null}
            <ButtonLink variant="secondary" href={`/courses/${module.courseId}`}>
              Return to course
            </ButtonLink>
          </div>
        </div>
      </div>
    </Card>
  );
}
