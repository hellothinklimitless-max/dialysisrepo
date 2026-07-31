/**
 * LEARNER STATE TYPES
 * ===================
 * Deliberately separate from the content types in `src/data/course-content.ts`
 * (brief Section 30: "Separate educational content from presentation logic").
 *
 * Content types describe what the course IS. These describe what one learner
 * HAS DONE. Nothing here embeds educational text — responses reference content
 * by id only, so the content file stays the single source of truth.
 */

import type { QuizData, QuizQuestion } from "@/data/course-content";

/* -------------------------------------------------------------------------
 * Question responses
 * ---------------------------------------------------------------------- */

/**
 * Three outcomes, not two.
 *
 * `ungraded` exists for `type: 'conceptual-flagged'` questions — see README
 * section 2e. The one flagged question in the content (mach-q4, "What is the
 * backbone of a dialysis machine?") has a source answer that maps to no single
 * option. Rather than silently picking a winner and marking learners wrong, it
 * is answered, explained, and excluded from the score denominator.
 */
export type ResponseOutcome = "correct" | "incorrect" | "ungraded";

export interface QuestionResponse {
  questionId: string;
  selectedOptionIndex: 0 | 1 | 2 | 3;
  outcome: ResponseOutcome;
  /** Recorded so review mode can show the source-of-truth answer per attempt. */
  correctAnswerIndex: 0 | 1 | 2 | 3;
  answeredAt: string;
  timeSpentMs: number;
}

/* -------------------------------------------------------------------------
 * Attempts
 * ---------------------------------------------------------------------- */

/** An assessment in progress. Persisted so a refresh never destroys it. */
export interface ActiveAttempt {
  attemptNumber: number;
  startedAt: string;
  /** Index into the quiz's question array. */
  currentQuestionIndex: number;
  /** Responses recorded so far, in answer order. */
  responses: QuestionResponse[];
  /** Pending selection for the current question; null until the learner picks. */
  selectedOptionIndex: 0 | 1 | 2 | 3 | null;
  /**
   * `answering` — options live, Check Answer available.
   * `feedback`  — options locked, feedback panel shown, Continue available.
   */
  phase: "answering" | "feedback";
  /** Accumulated across pauses, so time-taken survives a refresh. */
  elapsedMs: number;
  /** Wall-clock marker for the current run of the timer. */
  resumedAt: string;
  /** When the current question was first shown — drives per-question timing. */
  questionStartedAt: string;
}

export interface CompletedAttempt {
  attemptNumber: number;
  startedAt: string;
  completedAt: string;
  responses: QuestionResponse[];
  /** Correct / graded — ungraded flagged questions are excluded from both. */
  correctCount: number;
  gradedCount: number;
  scorePercent: number;
  passed: boolean;
  durationMs: number;
}

/* -------------------------------------------------------------------------
 * Ratings — quiz quality and module usefulness are stored separately and
 * must never be merged into one metric (brief Sections 21 + 22).
 * ---------------------------------------------------------------------- */

export type StarRating = 1 | 2 | 3 | 4 | 5;
export type DifficultyVerdict = "too-easy" | "just-right" | "too-difficult";

export interface QuizRating {
  stars: StarRating;
  difficulty: DifficultyVerdict | null;
  comment: string | null;
  submittedAt: string;
}

export interface ModuleRating {
  stars: StarRating;
  comment: string | null;
  submittedAt: string;
}

/* -------------------------------------------------------------------------
 * Per-module progress
 * ---------------------------------------------------------------------- */

export interface VideoProgress {
  /** Furthest point reached, in seconds — not the current scrub position. */
  furthestSeconds: number;
  /** Real duration observed from the player, once known. */
  observedDurationSeconds: number | null;
  completed: boolean;
  completedAt: string | null;
}

export interface ModuleProgress {
  moduleId: string;
  video: VideoProgress;
  activeAttempt: ActiveAttempt | null;
  attempts: CompletedAttempt[];
  quizRating: QuizRating | null;
  moduleRating: ModuleRating | null;
  completedAt: string | null;
}

/* -------------------------------------------------------------------------
 * XP + achievements — restrained, professional (brief Section 16)
 * ---------------------------------------------------------------------- */

export type XpEventKind =
  | "lesson-complete"
  | "assessment-complete"
  | "assessment-passed"
  | "high-score"
  | "perfect-score"
  | "first-attempt-pass"
  | "course-complete";

export interface XpEvent {
  id: string;
  kind: XpEventKind;
  amount: number;
  moduleId: string | null;
  courseId: string | null;
  awardedAt: string;
}

export type AchievementId =
  | "first-assessment"
  | "first-attempt-pass"
  | "perfect-score"
  | "clinical-mastery"
  | "course-complete";

export interface UnlockedAchievement {
  id: AchievementId;
  unlockedAt: string;
  moduleId: string | null;
  courseId: string | null;
}

/* -------------------------------------------------------------------------
 * Root persisted state
 * ---------------------------------------------------------------------- */

export interface LearnerState {
  /** Bumped when the shape changes incompatibly; see storage.ts. */
  version: number;
  modules: Record<string, ModuleProgress>;
  xpEvents: XpEvent[];
  achievements: UnlockedAchievement[];
  updatedAt: string;
}

/* -------------------------------------------------------------------------
 * Derived (never persisted) — computed by selectors
 * ---------------------------------------------------------------------- */

/**
 * A module with no quiz is not "incomplete forever" — its assessment
 * requirement is `unavailable` and completion rests on the video alone.
 * This is the real trigger case from the content: `akiAkfCkd` has a video but
 * genuinely no quiz in its source material (README section 2c).
 */
export type AssessmentRequirement = "required" | "unavailable";

export interface ModuleCompletionState {
  videoComplete: boolean;
  assessmentRequirement: AssessmentRequirement;
  assessmentComplete: boolean;
  assessmentPassed: boolean;
  moduleComplete: boolean;
  hasActiveAttempt: boolean;
  attemptCount: number;
  bestScorePercent: number | null;
  latestScorePercent: number | null;
}

export interface CourseProgressSummary {
  courseId: string;
  /** Modules actually present in the data. */
  availableModules: number;
  /**
   * Modules the course is nominally meant to contain. Larger than
   * `availableModules` where source content is missing — drives the honest
   * "course incomplete" state rather than a silently-wrong denominator.
   */
  nominalModules: number;
  completedModules: number;
  /** Percent of AVAILABLE modules complete — what the learner can actually do. */
  percentComplete: number;
  isContentIncomplete: boolean;
}

/* -------------------------------------------------------------------------
 * Ranking — structure exists, data does not. Never fabricated.
 * (brief Section 15)
 * ---------------------------------------------------------------------- */

export type RankingData =
  | {
      status: "available";
      cohortAveragePercent: number;
      percentile: number;
      cohortSize: number;
    }
  | { status: "unavailable"; reason: "no-cohort-data" };

/* -------------------------------------------------------------------------
 * Grading helpers' input shapes
 * ---------------------------------------------------------------------- */

export interface AttemptScore {
  correctCount: number;
  incorrectCount: number;
  gradedCount: number;
  ungradedCount: number;
  scorePercent: number;
  passed: boolean;
}

export type { QuizData, QuizQuestion };
