"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { TickProgress } from "@/components/ui/TickProgress";
import { ArrowRightIcon, CheckIcon, XIcon } from "@/components/ui/Icon";
import type { QuizData } from "@/lib/content";
import { computeScore } from "@/lib/scoring";
import type { QuestionResponse } from "@/lib/types";

export function QuizComplete({
  quiz,
  responses,
  attemptNumber,
  courseId,
  nextModuleId,
  onRetry,
}: {
  quiz: QuizData;
  responses: QuestionResponse[];
  attemptNumber: number;
  courseId: string;
  nextModuleId: string | null;
  onRetry: () => void;
}) {
  const score = computeScore(responses, quiz.passingScore);
  const passed = score.passed;

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className="mx-auto max-w-2xl"
    >
      {/* Outcome mark */}
      <div className="flex items-center gap-3">
        <span
          className={[
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-full",
            passed
              ? "bg-success/15 ring-1 ring-success/30"
              : "bg-error/15 ring-1 ring-error/30",
          ].join(" ")}
        >
          {passed ? (
            <CheckIcon className="h-5 w-5 text-success" title="Passed" />
          ) : (
            <XIcon className="h-5 w-5 text-error" title="Not passed" />
          )}
        </span>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.08em] text-muted">
            Assessment complete
          </p>
          <h1 className="text-xl font-semibold leading-tight text-ink">
            {passed ? "Well done — you passed." : "Not quite — keep at it."}
          </h1>
        </div>
      </div>

      {/* Score card */}
      <div className="mt-7 rounded-card border border-border bg-raised px-6 py-5">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.08em] text-muted">
              Your score
            </p>
            <p className="numeric mt-0.5 text-4xl font-semibold text-ink">
              {score.scorePercent}
              <span className="text-xl text-muted">%</span>
            </p>
            <p className="mt-1 text-sm text-muted">
              <span className="numeric">{score.correctCount}</span> correct out
              of <span className="numeric">{score.gradedCount}</span> graded
              {score.ungradedCount > 0 && (
                <>
                  {" "}
                  ·{" "}
                  <span className="numeric">{score.ungradedCount}</span>{" "}
                  ungraded
                </>
              )}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs uppercase tracking-[0.08em] text-muted">
              Passing
            </p>
            <p className="numeric mt-0.5 text-2xl font-semibold text-muted">
              {quiz.passingScore}%
            </p>
          </div>
        </div>

        {/* Score tick bar */}
        <div className="mt-5">
          <TickProgress
            value={score.scorePercent}
            max={100}
            mode="scale"
            tickCount={20}
            tone={passed ? "success" : "primary"}
            size="sm"
            label={`Score: ${score.scorePercent}%`}
            valueText={`${score.scorePercent} percent`}
          />
        </div>
      </div>

      {/* Question review summary */}
      <div className="mt-6">
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.08em] text-muted">
          Question summary
        </p>
        <div className="flex flex-col gap-1.5">
          {quiz.questions.map((q, i) => {
            const resp = responses.find((r) => r.questionId === q.id);
            const outcome = resp?.outcome ?? null;
            const isUngraded = q.type === "conceptual-flagged";
            return (
              <div
                key={q.id}
                className="flex items-start gap-3 rounded-control border border-border bg-raised px-3 py-2.5"
              >
                <span className="numeric mt-0.5 text-xs text-muted">
                  {i + 1}
                </span>
                <p className="min-w-0 flex-1 truncate text-sm text-ink">
                  {q.question}
                </p>
                <span
                  className={[
                    "shrink-0 text-xs font-medium",
                    outcome === "correct"
                      ? "text-success"
                      : outcome === "incorrect"
                        ? "text-error"
                        : "text-muted",
                  ].join(" ")}
                >
                  {isUngraded ? "—" : outcome === "correct" ? "✓" : "✗"}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Actions */}
      <div className="mt-8 flex flex-wrap items-center gap-3">
        {nextModuleId ? (
          <Link
            href={`/courses/${courseId}/modules/${nextModuleId}`}
            className="inline-flex items-center gap-2 rounded-control bg-primary px-7 py-3.5 text-base font-semibold text-surface transition-colors hover:bg-primary-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          >
            Next module
            <ArrowRightIcon className="h-4 w-4" />
          </Link>
        ) : (
          <Link
            href={`/courses/${courseId}`}
            className="inline-flex items-center gap-2 rounded-control bg-primary px-7 py-3.5 text-base font-semibold text-surface transition-colors hover:bg-primary-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          >
            Back to course
            <ArrowRightIcon className="h-4 w-4" />
          </Link>
        )}

        <button
          onClick={onRetry}
          className="text-sm text-muted transition-colors hover:text-ink"
        >
          Try again
          {attemptNumber > 1 && (
            <span className="numeric ml-1 text-xs">
              (attempt {attemptNumber + 1})
            </span>
          )}
        </button>
      </div>
    </motion.div>
  );
}
