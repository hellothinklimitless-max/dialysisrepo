"use client";

import { motion } from "motion/react";
import { ArrowRightIcon, ChecklistIcon, ClockIcon, FlagIcon } from "@/components/ui/Icon";
import type { QuizFacts } from "@/lib/content";
import type { Module } from "@/lib/content";

export function QuizIntro({
  module,
  quizFacts,
  attemptNumber,
  onBegin,
  onExit,
}: {
  module: Module;
  quizFacts: QuizFacts;
  /** 1 for a first attempt, >1 for a retry. */
  attemptNumber: number;
  onBegin: () => void;
  onExit: () => void;
}) {
  const isRetry = attemptNumber > 1;

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className="mx-auto max-w-2xl"
    >
      <p className="text-sm font-semibold uppercase tracking-[0.08em] text-muted">
        Knowledge check
      </p>
      <h1 className="mt-2 text-2xl font-semibold leading-snug text-ink sm:text-3xl">
        {isRetry ? "Try again" : `Test your understanding`}
      </h1>
      <p className="mt-2 text-base text-muted">{module.title}</p>

      {/* Stats strip */}
      <dl className="mt-7 flex flex-wrap gap-x-10 gap-y-4 rounded-card border border-border bg-raised px-6 py-5">
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
        Every response includes an explanation and a clinical learning insight —
        whether you answer correctly or not.
      </p>

      {quizFacts.flaggedCount > 0 && (
        <p className="mt-3 flex items-start gap-2 text-sm leading-relaxed text-muted">
          <FlagIcon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-accent-strong" />
          <span>
            <span className="numeric">{quizFacts.flaggedCount}</span> of these{" "}
            {quizFacts.flaggedCount === 1 ? "questions is" : "questions are"} a
            discussion question rather than a graded one, and{" "}
            {quizFacts.flaggedCount === 1 ? "does" : "do"} not affect your score.
          </span>
        </p>
      )}

      <div className="mt-8 flex flex-wrap items-center gap-3">
        <button
          onClick={onBegin}
          className="inline-flex items-center gap-2 rounded-control bg-primary px-7 py-3.5 text-base font-semibold text-surface transition-colors hover:bg-primary-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
        >
          {isRetry ? "Begin retry" : "Begin assessment"}
          <ArrowRightIcon className="h-4 w-4" />
        </button>
        <button
          onClick={onExit}
          className="text-sm text-muted transition-colors hover:text-ink"
        >
          Back to lesson
        </button>
      </div>
    </motion.div>
  );
}
