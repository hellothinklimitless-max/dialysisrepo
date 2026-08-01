"use client";

import { AnimatePresence } from "motion/react";
import { AnswerFeedback } from "@/components/quiz/AnswerFeedback";
import { AnswerOption } from "@/components/quiz/AnswerOption";
import { QuizProgress } from "@/components/quiz/QuizProgress";
import type { QuizQuestion } from "@/lib/content";
import type { ActiveAttempt, ResponseOutcome } from "@/lib/types";

export function QuestionCard({
  question,
  attempt,
  questionNumber,
  totalQuestions,
  onSelect,
  onSubmit,
  onContinue,
}: {
  question: QuizQuestion;
  attempt: ActiveAttempt;
  questionNumber: number;
  totalQuestions: number;
  onSelect: (index: 0 | 1 | 2 | 3) => void;
  onSubmit: () => void;
  onContinue: () => void;
}) {
  const isLocked = attempt.phase === "feedback";
  const isLast = questionNumber === totalQuestions;
  const isConceptual = question.type === "conceptual-flagged";
  const selectedIndex = attempt.selectedOptionIndex;

  // After submission, find the latest response to get the outcome
  const latestResponse = attempt.responses[attempt.responses.length - 1];
  const submittedOutcome: ResponseOutcome | null = isLocked
    ? (latestResponse?.outcome ?? null)
    : null;

  return (
    <div className="flex flex-col gap-0">
      {/* Progress bar */}
      <div className="mb-6">
        <QuizProgress current={questionNumber} total={totalQuestions} />
      </div>

      {/* Topic chip + conceptual flag */}
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <span className="rounded-[5px] bg-sunken px-2 py-0.5 text-xs text-muted">
          {question.topic}
        </span>
        {isConceptual && (
          <span className="rounded-[5px] bg-accent-tint px-2 py-0.5 text-xs text-accent-strong">
            Discussion — not graded
          </span>
        )}
      </div>

      {/* Question text */}
      <h2 className="text-lg font-semibold leading-snug text-ink sm:text-xl">
        {question.question}
      </h2>

      {/* Answer options */}
      <div
        role="radiogroup"
        aria-label="Answer options"
        className="mt-5 flex flex-col gap-2.5"
      >
        {(question.options as string[]).map((option, i) => {
          const idx = i as 0 | 1 | 2 | 3;
          return (
            <AnswerOption
              key={idx}
              index={idx}
              text={option}
              selected={selectedIndex === idx}
              locked={isLocked}
              outcome={selectedIndex === idx ? submittedOutcome : null}
              isCorrect={isLocked && idx === question.correctAnswerIndex}
              onSelect={() => onSelect(idx)}
            />
          );
        })}
      </div>

      {/* Check Answer button — only visible in answering phase */}
      {!isLocked && (
        <div className="mt-5 flex items-center gap-4">
          <button
            onClick={onSubmit}
            disabled={selectedIndex === null}
            aria-disabled={selectedIndex === null}
            className="inline-flex items-center gap-2 rounded-control bg-primary px-6 py-3 text-sm font-semibold text-surface transition-colors hover:bg-primary-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Check answer
          </button>
          {selectedIndex === null && (
            <span className="text-sm text-muted">Select an option above</span>
          )}
        </div>
      )}

      {/* Feedback panel */}
      <AnimatePresence>
        {isLocked && submittedOutcome !== null && (
          <AnswerFeedback
            key="feedback"
            outcome={submittedOutcome}
            explanation={question.explanation}
            clinicalInsight={question.clinicalInsight}
            isLast={isLast}
            onContinue={onContinue}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
