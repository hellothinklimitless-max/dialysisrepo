"use client";

/**
 * QUIZ ENGINE — Phase 4 orchestrator
 * ====================================
 * Renders the correct quiz phase based on ActiveAttempt state from the reducer.
 * The engine does NOT own state — it reads from LearnerProgressContext and
 * dispatches actions through LearnerActions.
 *
 * Phases:
 *   intro      — shown before startQuiz is called (or after completeQuiz + retry)
 *   answering  — QuestionCard with options enabled
 *   feedback   — QuestionCard with options locked + AnswerFeedback panel
 *   complete   — QuizComplete results screen
 *
 * The "intro" phase is rendered by the parent (ModuleOverview) before QuizEngine
 * mounts; QuizEngine takes over once an activeAttempt exists.
 */

import { CourseShell } from "@/components/course/CourseShell";
import { QuestionCard } from "@/components/quiz/QuestionCard";
import { QuizComplete } from "@/components/quiz/QuizComplete";
import type { Module, QuizData, QuizQuestion } from "@/lib/content";
import { useLearnerProgress } from "@/lib/progress-provider";
import { getModuleProgressRecord } from "@/lib/progress-selectors";

export function QuizEngine({
  module,
  quiz,
  courseId,
  nextModuleId,
  onExit,
}: {
  module: Module;
  quiz: QuizData;
  courseId: string;
  nextModuleId: string | null;
  /** Called when learner wants to return to the lesson view. */
  onExit: () => void;
}) {
  const { state, actions } = useLearnerProgress();
  const progress = getModuleProgressRecord(state, module.id);
  const attempt = progress.activeAttempt;

  // No active attempt means the quiz was just completed — show results.
  // This happens immediately after completeQuiz is dispatched.
  if (!attempt) {
    const lastAttempt = progress.attempts[progress.attempts.length - 1];
    if (!lastAttempt) {
      // Edge case: engine mounted with no attempt and no history — go back.
      onExit();
      return null;
    }
    return (
      <QuizShell moduleTitle={module.title} onExit={onExit}>
        <QuizComplete
          quiz={quiz}
          responses={lastAttempt.responses}
          attemptNumber={lastAttempt.attemptNumber}
          courseId={courseId}
          nextModuleId={nextModuleId}
          onRetry={() => actions.startQuiz(module)}
        />
      </QuizShell>
    );
  }

  const currentQuestion: QuizQuestion | undefined =
    quiz.questions[attempt.currentQuestionIndex];

  if (!currentQuestion) {
    // All questions answered — trigger completion.
    actions.completeQuiz(module, quiz);
    return null;
  }

  const isLastQuestion =
    attempt.currentQuestionIndex === quiz.questions.length - 1;

  function handleSelect(optionIndex: 0 | 1 | 2 | 3) {
    actions.selectOption(module.id, optionIndex);
  }

  function handleSubmit() {
    actions.submitAnswer(module, currentQuestion!);
  }

  function handleContinue() {
    if (isLastQuestion) {
      actions.completeQuiz(module, quiz);
    } else {
      actions.advanceQuestion(module.id);
    }
  }

  return (
    <QuizShell moduleTitle={module.title} onExit={onExit}>
      <QuestionCard
        question={currentQuestion}
        attempt={attempt}
        questionNumber={attempt.currentQuestionIndex + 1}
        totalQuestions={quiz.questions.length}
        onSelect={handleSelect}
        onSubmit={handleSubmit}
        onContinue={handleContinue}
      />
    </QuizShell>
  );
}

/** Minimal-chrome shell wrapper for quiz mode. */
function QuizShell({
  moduleTitle,
  onExit,
  children,
}: {
  moduleTitle: string;
  onExit: () => void;
  children: React.ReactNode;
}) {
  return (
    <CourseShell
      chrome="minimal"
      width="narrow"
      headerAside={
        <button
          onClick={onExit}
          className="text-sm text-muted transition-colors hover:text-ink"
          aria-label="Exit quiz and return to lesson"
        >
          ← Back to lesson
        </button>
      }
    >
      <div className="pt-2">
        <p className="mb-8 text-xs text-muted">{moduleTitle}</p>
        {children}
      </div>
    </CourseShell>
  );
}
