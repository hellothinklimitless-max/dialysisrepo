/**
 * SCORING + REWARD CONFIGURATION
 * ==============================
 * Brief Section 13: "Do not hard-code these values deeply into components.
 * Keep thresholds configurable." Every threshold in the product lives here.
 */

import { PERFORMANCE_TIERS, type QuizData, type QuizQuestion } from "@/data/course-content";
import { isGradedQuestion } from "@/lib/content";
import type {
  AttemptScore,
  CompletedAttempt,
  QuestionResponse,
  RankingData,
  ResponseOutcome,
  XpEventKind,
} from "@/lib/types";

export { PERFORMANCE_TIERS };

export type PerformanceTier = (typeof PERFORMANCE_TIERS)[number];

/** Fallback only — every real quiz in the content carries its own passingScore. */
export const DEFAULT_PASSING_SCORE = 70;

/** A score at or above this reads as a "high score" for XP purposes. */
export const HIGH_SCORE_THRESHOLD = 90;

export function resolveTier(scorePercent: number): PerformanceTier {
  const clamped = Math.max(0, Math.min(100, Math.round(scorePercent)));
  const tier = PERFORMANCE_TIERS.find(
    (t) => clamped >= t.minPercent && clamped <= t.maxPercent,
  );
  // PERFORMANCE_TIERS covers 0–100 contiguously; the fallback satisfies the
  // type checker without inventing a tier.
  return tier ?? PERFORMANCE_TIERS[0];
}

/* -------------------------------------------------------------------------
 * Grading
 * ---------------------------------------------------------------------- */

export function gradeResponse(
  question: QuizQuestion,
  selectedOptionIndex: 0 | 1 | 2 | 3,
): ResponseOutcome {
  if (!isGradedQuestion(question)) return "ungraded";
  return selectedOptionIndex === question.correctAnswerIndex
    ? "correct"
    : "incorrect";
}

/**
 * Score = correct / graded. Ungraded (flagged) questions are excluded from
 * both numerator and denominator — see README section 2e. A quiz whose
 * questions are ALL ungraded scores 0/0, which we report as 100% ungraded
 * rather than dividing by zero.
 */
export function computeScore(
  responses: QuestionResponse[],
  passingScore: number,
): AttemptScore {
  const correctCount = responses.filter((r) => r.outcome === "correct").length;
  const incorrectCount = responses.filter((r) => r.outcome === "incorrect").length;
  const ungradedCount = responses.filter((r) => r.outcome === "ungraded").length;
  const gradedCount = correctCount + incorrectCount;
  const scorePercent =
    gradedCount === 0 ? 0 : Math.round((correctCount / gradedCount) * 100);

  return {
    correctCount,
    incorrectCount,
    gradedCount,
    ungradedCount,
    scorePercent,
    passed: gradedCount > 0 && scorePercent >= passingScore,
  };
}

export function scoreFromQuiz(
  responses: QuestionResponse[],
  quiz: QuizData,
): AttemptScore {
  return computeScore(responses, quiz.passingScore);
}

export function bestScore(attempts: CompletedAttempt[]): number | null {
  if (attempts.length === 0) return null;
  return attempts.reduce((best, a) => Math.max(best, a.scorePercent), 0);
}

export function latestAttempt(
  attempts: CompletedAttempt[],
): CompletedAttempt | null {
  if (attempts.length === 0) return null;
  return attempts.reduce((latest, a) =>
    a.attemptNumber > latest.attemptNumber ? a : latest,
  );
}

/** Positive = improved since the previous attempt (brief Section 14). */
export function improvementSincePreviousAttempt(
  attempts: CompletedAttempt[],
): number | null {
  if (attempts.length < 2) return null;
  const ordered = [...attempts].sort((a, b) => a.attemptNumber - b.attemptNumber);
  const last = ordered[ordered.length - 1];
  const previous = ordered[ordered.length - 2];
  if (!last || !previous) return null;
  return last.scorePercent - previous.scorePercent;
}

/* -------------------------------------------------------------------------
 * XP — restrained by design (brief Section 16). These are deliberately small,
 * flat numbers: enough to acknowledge progress, not enough to become the point.
 * ---------------------------------------------------------------------- */

export const XP_RULES: Record<XpEventKind, { amount: number; label: string }> = {
  "lesson-complete": { amount: 40, label: "Lesson complete" },
  "assessment-complete": { amount: 60, label: "Assessment complete" },
  "assessment-passed": { amount: 80, label: "Assessment passed" },
  "high-score": { amount: 40, label: `Scored ${HIGH_SCORE_THRESHOLD}% or above` },
  "perfect-score": { amount: 60, label: "Perfect score" },
  "first-attempt-pass": { amount: 40, label: "Passed on the first attempt" },
  "course-complete": { amount: 200, label: "Course complete" },
};

export const ACHIEVEMENTS = [
  {
    id: "first-assessment",
    label: "First Assessment",
    description: "Completed your first knowledge check.",
  },
  {
    id: "first-attempt-pass",
    label: "First Attempt Pass",
    description: "Passed an assessment on the first try.",
  },
  {
    id: "perfect-score",
    label: "Perfect Score",
    description: "Answered every graded question correctly.",
  },
  {
    id: "clinical-mastery",
    label: "Clinical Mastery",
    description: "Reached the Expert tier or above on three assessments.",
  },
  {
    id: "course-complete",
    label: "Course Complete",
    description: "Finished every available module in a course.",
  },
] as const;

/** Number of Expert-or-above assessments required for Clinical Mastery. */
export const CLINICAL_MASTERY_THRESHOLD = 3;

/* -------------------------------------------------------------------------
 * Ranking — brief Section 15: "If real cohort data does not currently exist,
 * DO NOT fabricate rankings."
 *
 * No cohort backend exists. This returns the unavailable state, always. When a
 * real source appears, only this function changes; the RankingCard already
 * renders whichever shape it is handed.
 * ---------------------------------------------------------------------- */
export function getRankingData(_moduleId: string): RankingData {
  return { status: "unavailable", reason: "no-cohort-data" };
}
