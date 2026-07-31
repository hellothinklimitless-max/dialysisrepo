"use client";

/**
 * VIDEO COMPLETION — brief Section 4
 * ===================================
 * The deliberate transition between learning mode and assessment mode.
 * Appears as an overlay on the video player when the lesson reaches 95%
 * completion. "Do not abruptly dump the learner into a quiz" (Section 4).
 *
 * For modules without a quiz (quiz: null) the CTA navigates to the next
 * module instead.
 */

import Link from "next/link";
import { motion } from "motion/react";
import { ButtonLink } from "@/components/ui/Button";
import {
  ArrowRightIcon,
  CheckIcon,
  ReplayIcon,
} from "@/components/ui/Icon";
import type { Module } from "@/lib/content";

export function VideoCompletion({
  module,
  courseId,
  nextModuleId,
  onWatchAgain,
}: {
  module: Module;
  courseId: string;
  /** Next module in the course, or null if this is the last module. */
  nextModuleId: string | null;
  /** Re-watch: dismiss completion overlay so the video is visible. */
  onWatchAgain: () => void;
}) {
  const hasQuiz = module.quiz !== null;

  function scrollToKnowledgeCheck() {
    document
      .getElementById("knowledge-check")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="absolute inset-0 z-30 flex flex-col items-center justify-center gap-0 bg-ink/88 px-8 text-center"
      role="status"
      aria-label="Lesson complete"
    >
      {/* Success mark */}
      <motion.div
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="flex h-16 w-16 items-center justify-center rounded-full bg-success/20 ring-1 ring-success/40"
      >
        <CheckIcon className="h-8 w-8 text-success" title="Complete" />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="mt-5 flex flex-col items-center gap-2"
      >
        <h2 className="text-2xl font-semibold tracking-tight text-surface sm:text-3xl">
          Lesson complete
        </h2>
        <p className="max-w-xs text-sm leading-relaxed text-surface/65 sm:max-w-sm sm:text-base">
          {hasQuiz
            ? "You're ready to test what you've learned."
            : "This lesson has no assessment — you're all done here."}
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="mt-7 flex flex-col items-center gap-3"
      >
        {hasQuiz ? (
          <button
            onClick={scrollToKnowledgeCheck}
            className="inline-flex items-center gap-2 rounded-control bg-primary px-7 py-3.5 text-base font-semibold text-surface ring-2 ring-transparent transition-colors hover:bg-primary-strong focus-visible:outline-none focus-visible:ring-primary"
          >
            Start Knowledge Check
            <ArrowRightIcon className="h-4 w-4" />
          </button>
        ) : nextModuleId ? (
          <ButtonLink
            size="lg"
            href={`/courses/${courseId}/modules/${nextModuleId}`}
          >
            Next module
            <ArrowRightIcon className="h-4 w-4" />
          </ButtonLink>
        ) : (
          <ButtonLink size="lg" href={`/courses/${courseId}`}>
            Back to course
            <ArrowRightIcon className="h-4 w-4" />
          </ButtonLink>
        )}

        <button
          onClick={onWatchAgain}
          className="inline-flex items-center gap-1.5 text-sm text-surface/50 transition-colors hover:text-surface/80"
        >
          <ReplayIcon className="h-3.5 w-3.5" />
          Watch again
        </button>
      </motion.div>

      {/* Module title for context */}
      <p className="absolute bottom-4 left-0 right-0 text-center text-xs text-surface/30">
        {module.title}
      </p>
    </motion.div>
  );
}

/**
 * Non-overlay variant: shown below the player when the video was already
 * complete before this session started (e.g., returning learner).
 */
export function VideoAlreadyComplete({
  module,
  courseId,
  nextModuleId,
}: {
  module: Module;
  courseId: string;
  nextModuleId: string | null;
}) {
  const hasQuiz = module.quiz !== null;

  function scrollToKnowledgeCheck() {
    document
      .getElementById("knowledge-check")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-card border border-success/30 bg-success-tint px-5 py-3.5">
      <div className="flex items-center gap-2.5">
        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-success/15">
          <CheckIcon className="h-3.5 w-3.5 text-success" />
        </span>
        <span className="text-sm font-medium text-ink">Lesson watched</span>
        {hasQuiz && (
          <span className="text-sm text-muted">· scroll down to take the knowledge check</span>
        )}
      </div>
      <div className="flex items-center gap-3">
        {hasQuiz ? (
          <button
            onClick={scrollToKnowledgeCheck}
            className="inline-flex items-center gap-1.5 rounded-control bg-primary px-4 py-1.5 text-sm font-semibold text-surface transition-colors hover:bg-primary-strong"
          >
            Knowledge check
            <ArrowRightIcon className="h-3.5 w-3.5" />
          </button>
        ) : nextModuleId ? (
          <Link
            href={`/courses/${courseId}/modules/${nextModuleId}`}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-primary transition-colors hover:text-primary-strong"
          >
            Next module <ArrowRightIcon className="h-3.5 w-3.5" />
          </Link>
        ) : null}
      </div>
    </div>
  );
}
