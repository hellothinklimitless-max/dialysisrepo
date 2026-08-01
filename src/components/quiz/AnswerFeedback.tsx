"use client";

import { motion } from "motion/react";
import { ArrowRightIcon, CheckIcon, XIcon } from "@/components/ui/Icon";
import type { ResponseOutcome } from "@/lib/types";

export function AnswerFeedback({
  outcome,
  explanation,
  clinicalInsight,
  isLast,
  onContinue,
}: {
  outcome: ResponseOutcome;
  explanation: string;
  clinicalInsight: string;
  isLast: boolean;
  onContinue: () => void;
}) {
  const isUngraded = outcome === "ungraded";
  const isCorrect = outcome === "correct";

  let headerBg: string;
  let headerText: string;
  let Icon: React.ComponentType<{ className?: string }>;
  let iconClass: string;
  let label: string;

  if (isUngraded) {
    headerBg = "bg-accent-tint border-accent/30";
    headerText = "text-accent-strong";
    Icon = CheckIcon;
    iconClass = "text-accent-strong";
    label = "Discussion question";
  } else if (isCorrect) {
    headerBg = "bg-success-tint border-success/30";
    headerText = "text-success";
    Icon = CheckIcon;
    iconClass = "text-success";
    label = "Correct";
  } else {
    headerBg = "bg-error-tint border-error/30";
    headerText = "text-error";
    Icon = XIcon;
    iconClass = "text-error";
    label = "Incorrect";
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
      className="mt-5"
    >
      {/* Outcome header */}
      <div
        className={`flex items-center gap-2 rounded-t-card border-x border-t px-4 py-3 ${headerBg}`}
      >
        <Icon className={`h-4 w-4 shrink-0 ${iconClass}`} />
        <span className={`text-sm font-semibold ${headerText}`}>{label}</span>
        {isUngraded && (
          <span className="ml-auto text-xs text-muted">
            Not counted toward score
          </span>
        )}
      </div>

      {/* Explanation body */}
      <div className="rounded-b-card border border-t-0 border-border bg-raised px-4 py-4">
        <p className="text-sm leading-relaxed text-ink">{explanation}</p>

        {clinicalInsight && (
          <div className="mt-3 border-l-2 border-accent/40 pl-3">
            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-muted">
              Clinical insight
            </p>
            <p className="mt-1 text-sm leading-relaxed text-muted">
              {clinicalInsight}
            </p>
          </div>
        )}

        <div className="mt-4 flex justify-end">
          <button
            onClick={onContinue}
            className="inline-flex items-center gap-1.5 rounded-control bg-primary px-5 py-2.5 text-sm font-semibold text-surface transition-colors hover:bg-primary-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          >
            {isLast ? "See results" : "Continue"}
            <ArrowRightIcon className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
