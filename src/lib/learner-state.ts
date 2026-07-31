/**
 * LEARNER STATE TRANSITIONS
 * =========================
 * Pure reducer over `LearnerState`. No React, no storage, no DOM — so the whole
 * quiz lifecycle (brief Section 11) is testable in isolation and the same
 * transitions would hold behind a server-backed store.
 *
 * Everything the brief asks state to support lives here: current question,
 * selected answer, submitted answer, correctness, score, completed/remaining
 * questions, attempt number, time taken, completion, best score, and previous
 * attempts.
 */

import type { Module, QuizData, QuizQuestion } from "@/data/course-content";
import { hasQuiz, isGradedQuestion } from "@/lib/content";
import {
  ACHIEVEMENTS,
  CLINICAL_MASTERY_THRESHOLD,
  HIGH_SCORE_THRESHOLD,
  computeScore,
  gradeResponse,
  resolveTier,
} from "@/lib/scoring";
import { STATE_VERSION, createEmptyState } from "@/lib/storage";
import type {
  AchievementId,
  ActiveAttempt,
  CompletedAttempt,
  LearnerState,
  ModuleProgress,
  ModuleRating,
  QuestionResponse,
  QuizRating,
  XpEvent,
  XpEventKind,
} from "@/lib/types";
import { XP_RULES } from "@/lib/scoring";

/** Video is treated as watched at 95% — trailing credits shouldn't gate a module. */
export const VIDEO_COMPLETION_RATIO = 0.95;

export type OptionIndex = 0 | 1 | 2 | 3;

export type LearnerAction =
  | { type: "hydrate"; state: LearnerState }
  | { type: "reset" }
  | {
      type: "video/progress";
      module: Module;
      furthestSeconds: number;
      durationSeconds: number | null;
      now: string;
    }
  | { type: "video/complete"; module: Module; now: string }
  | { type: "quiz/start"; module: Module; now: string }
  | { type: "quiz/select"; moduleId: string; optionIndex: OptionIndex; now: string }
  | { type: "quiz/submit"; module: Module; question: QuizQuestion; now: string }
  | { type: "quiz/advance"; moduleId: string; now: string }
  | { type: "quiz/complete"; module: Module; quiz: QuizData; now: string }
  | { type: "quiz/abandon"; moduleId: string; now: string }
  | { type: "rating/quiz"; moduleId: string; rating: QuizRating; now: string }
  | { type: "rating/module"; moduleId: string; rating: ModuleRating; now: string };

/* -------------------------------------------------------------------------
 * Factories
 * ---------------------------------------------------------------------- */

export function createModuleProgress(moduleId: string): ModuleProgress {
  return {
    moduleId,
    video: {
      furthestSeconds: 0,
      observedDurationSeconds: null,
      completed: false,
      completedAt: null,
    },
    activeAttempt: null,
    attempts: [],
    quizRating: null,
    moduleRating: null,
    completedAt: null,
  };
}

export function getModuleProgress(
  state: LearnerState,
  moduleId: string,
): ModuleProgress {
  return state.modules[moduleId] ?? createModuleProgress(moduleId);
}

function createAttempt(attemptNumber: number, now: string): ActiveAttempt {
  return {
    attemptNumber,
    startedAt: now,
    currentQuestionIndex: 0,
    responses: [],
    selectedOptionIndex: null,
    phase: "answering",
    elapsedMs: 0,
    resumedAt: now,
    questionStartedAt: now,
  };
}

/** Rolls the wall clock forward into `elapsedMs` so time survives refreshes. */
function touchTimer(attempt: ActiveAttempt, now: string): ActiveAttempt {
  const delta = Math.max(0, Date.parse(now) - Date.parse(attempt.resumedAt));
  return { ...attempt, elapsedMs: attempt.elapsedMs + delta, resumedAt: now };
}

/* -------------------------------------------------------------------------
 * Reducer
 * ---------------------------------------------------------------------- */

export function learnerReducer(
  state: LearnerState,
  action: LearnerAction,
): LearnerState {
  switch (action.type) {
    case "hydrate":
      return action.state;

    case "reset":
      return createEmptyState();

    case "video/progress": {
      const progress = getModuleProgress(state, action.module.id);
      const furthest = Math.max(
        progress.video.furthestSeconds,
        action.furthestSeconds,
      );
      const duration =
        action.durationSeconds ?? progress.video.observedDurationSeconds;
      const reachedEnd =
        duration !== null && duration > 0
          ? furthest >= duration * VIDEO_COMPLETION_RATIO
          : false;

      if (
        furthest === progress.video.furthestSeconds &&
        duration === progress.video.observedDurationSeconds &&
        (!reachedEnd || progress.video.completed)
      ) {
        return state; // no-op: avoids a write on every player tick
      }

      const next: ModuleProgress = {
        ...progress,
        video: {
          furthestSeconds: furthest,
          observedDurationSeconds: duration,
          completed: progress.video.completed || reachedEnd,
          completedAt:
            progress.video.completedAt ?? (reachedEnd ? action.now : null),
        },
      };

      return withModule(
        awardIfNewlyWatched(state, progress, next, action.module, action.now),
        applyModuleCompletion(next, action.module, action.now),
        action.now,
      );
    }

    case "video/complete": {
      const progress = getModuleProgress(state, action.module.id);
      if (progress.video.completed) return state;
      const next: ModuleProgress = {
        ...progress,
        video: {
          ...progress.video,
          completed: true,
          completedAt: progress.video.completedAt ?? action.now,
        },
      };
      return withModule(
        awardIfNewlyWatched(state, progress, next, action.module, action.now),
        applyModuleCompletion(next, action.module, action.now),
        action.now,
      );
    }

    case "quiz/start": {
      const progress = getModuleProgress(state, action.module.id);
      if (!hasQuiz(action.module)) return state;
      // Resuming an existing attempt is handled by simply not clobbering it.
      if (progress.activeAttempt) return state;
      const next: ModuleProgress = {
        ...progress,
        activeAttempt: createAttempt(progress.attempts.length + 1, action.now),
      };
      return withModule(state, next, action.now);
    }

    case "quiz/select": {
      const progress = getModuleProgress(state, action.moduleId);
      const attempt = progress.activeAttempt;
      if (!attempt || attempt.phase !== "answering") return state;
      const next: ModuleProgress = {
        ...progress,
        activeAttempt: {
          ...touchTimer(attempt, action.now),
          selectedOptionIndex: action.optionIndex,
        },
      };
      return withModule(state, next, action.now);
    }

    case "quiz/submit": {
      const progress = getModuleProgress(state, action.module.id);
      const attempt = progress.activeAttempt;
      if (!attempt || attempt.phase !== "answering") return state;
      if (attempt.selectedOptionIndex === null) return state;

      const selected = attempt.selectedOptionIndex;
      const response: QuestionResponse = {
        questionId: action.question.id,
        selectedOptionIndex: selected,
        outcome: gradeResponse(action.question, selected),
        correctAnswerIndex: action.question.correctAnswerIndex,
        answeredAt: action.now,
        timeSpentMs: Math.max(
          0,
          Date.parse(action.now) - Date.parse(attempt.questionStartedAt),
        ),
      };

      const next: ModuleProgress = {
        ...progress,
        activeAttempt: {
          ...touchTimer(attempt, action.now),
          responses: [...attempt.responses, response],
          phase: "feedback",
        },
      };
      return withModule(state, next, action.now);
    }

    case "quiz/advance": {
      const progress = getModuleProgress(state, action.moduleId);
      const attempt = progress.activeAttempt;
      if (!attempt || attempt.phase !== "feedback") return state;
      const next: ModuleProgress = {
        ...progress,
        activeAttempt: {
          ...touchTimer(attempt, action.now),
          currentQuestionIndex: attempt.currentQuestionIndex + 1,
          selectedOptionIndex: null,
          phase: "answering",
          questionStartedAt: action.now,
        },
      };
      return withModule(state, next, action.now);
    }

    case "quiz/complete": {
      const progress = getModuleProgress(state, action.module.id);
      const attempt = progress.activeAttempt;
      if (!attempt) return state;

      const timed = touchTimer(attempt, action.now);
      const score = computeScore(timed.responses, action.quiz.passingScore);
      const completed: CompletedAttempt = {
        attemptNumber: timed.attemptNumber,
        startedAt: timed.startedAt,
        completedAt: action.now,
        responses: timed.responses,
        correctCount: score.correctCount,
        gradedCount: score.gradedCount,
        scorePercent: score.scorePercent,
        passed: score.passed,
        durationMs: timed.elapsedMs,
      };

      const next: ModuleProgress = {
        ...progress,
        activeAttempt: null,
        attempts: [...progress.attempts, completed],
      };

      const rewarded = awardForAttempt(state, completed, action.module, action.now);
      return withModule(
        rewarded,
        applyModuleCompletion(next, action.module, action.now),
        action.now,
      );
    }

    case "quiz/abandon": {
      const progress = getModuleProgress(state, action.moduleId);
      if (!progress.activeAttempt) return state;
      return withModule(state, { ...progress, activeAttempt: null }, action.now);
    }

    case "rating/quiz": {
      const progress = getModuleProgress(state, action.moduleId);
      return withModule(
        state,
        { ...progress, quizRating: action.rating },
        action.now,
      );
    }

    case "rating/module": {
      const progress = getModuleProgress(state, action.moduleId);
      return withModule(
        state,
        { ...progress, moduleRating: action.rating },
        action.now,
      );
    }

    default:
      return state;
  }
}

function withModule(
  state: LearnerState,
  moduleProgress: ModuleProgress,
  now: string,
): LearnerState {
  return {
    ...state,
    version: STATE_VERSION,
    modules: { ...state.modules, [moduleProgress.moduleId]: moduleProgress },
    updatedAt: now,
  };
}

/**
 * A module is complete when its video is watched AND its assessment is either
 * passed or genuinely unavailable. The `akiAkfCkd` module has no quiz in its
 * source material, so requiring one would strand it permanently incomplete
 * (README section 2c).
 */
function applyModuleCompletion(
  progress: ModuleProgress,
  module: Module,
  now: string,
): ModuleProgress {
  const assessmentSatisfied = hasQuiz(module)
    ? progress.attempts.some((a) => a.passed)
    : true;

  if (!progress.video.completed || !assessmentSatisfied) return progress;
  if (progress.completedAt) return progress;
  return { ...progress, completedAt: now };
}

/* -------------------------------------------------------------------------
 * XP + achievements — awarded once, recorded as events so the reward history
 * is auditable rather than a single opaque counter (brief Section 16).
 * ---------------------------------------------------------------------- */

function awardXp(
  state: LearnerState,
  kind: XpEventKind,
  moduleId: string | null,
  courseId: string | null,
  now: string,
  dedupeKey: string,
): LearnerState {
  if (state.xpEvents.some((e) => e.id === dedupeKey)) return state;
  const event: XpEvent = {
    id: dedupeKey,
    kind,
    amount: XP_RULES[kind].amount,
    moduleId,
    courseId,
    awardedAt: now,
  };
  return { ...state, xpEvents: [...state.xpEvents, event] };
}

function unlock(
  state: LearnerState,
  id: AchievementId,
  moduleId: string | null,
  courseId: string | null,
  now: string,
): LearnerState {
  if (state.achievements.some((a) => a.id === id)) return state;
  return {
    ...state,
    achievements: [...state.achievements, { id, unlockedAt: now, moduleId, courseId }],
  };
}

function awardIfNewlyWatched(
  state: LearnerState,
  before: ModuleProgress,
  after: ModuleProgress,
  module: Module,
  now: string,
): LearnerState {
  if (before.video.completed || !after.video.completed) return state;
  return awardXp(
    state,
    "lesson-complete",
    module.id,
    module.courseId,
    now,
    `lesson-complete:${module.id}`,
  );
}

function awardForAttempt(
  state: LearnerState,
  attempt: CompletedAttempt,
  module: Module,
  now: string,
): LearnerState {
  const key = `${module.id}:${attempt.attemptNumber}`;
  let next = awardXp(
    state,
    "assessment-complete",
    module.id,
    module.courseId,
    now,
    `assessment-complete:${key}`,
  );

  if (attempt.passed) {
    next = awardXp(
      next,
      "assessment-passed",
      module.id,
      module.courseId,
      now,
      `assessment-passed:${module.id}`,
    );
    if (attempt.attemptNumber === 1) {
      next = awardXp(
        next,
        "first-attempt-pass",
        module.id,
        module.courseId,
        now,
        `first-attempt-pass:${module.id}`,
      );
      next = unlock(next, "first-attempt-pass", module.id, module.courseId, now);
    }
  }

  if (attempt.scorePercent >= HIGH_SCORE_THRESHOLD) {
    next = awardXp(
      next,
      "high-score",
      module.id,
      module.courseId,
      now,
      `high-score:${module.id}`,
    );
  }

  const perfect = attempt.gradedCount > 0 && attempt.correctCount === attempt.gradedCount;
  if (perfect) {
    next = awardXp(
      next,
      "perfect-score",
      module.id,
      module.courseId,
      now,
      `perfect-score:${module.id}`,
    );
    next = unlock(next, "perfect-score", module.id, module.courseId, now);
  }

  next = unlock(next, "first-assessment", module.id, module.courseId, now);

  // Clinical Mastery: Expert tier or above on N distinct modules.
  const expertModules = new Set<string>();
  for (const [moduleId, progress] of Object.entries(next.modules)) {
    const best = progress.attempts.reduce(
      (top, a) => Math.max(top, a.scorePercent),
      0,
    );
    if (progress.attempts.length > 0 && resolveTier(best).id === "expert") {
      expertModules.add(moduleId);
    }
    if (progress.attempts.length > 0 && resolveTier(best).id === "mastery") {
      expertModules.add(moduleId);
    }
  }
  if (resolveTier(attempt.scorePercent).id !== "developing") {
    // The module being completed isn't in `next.modules` yet at this point.
    const tierId = resolveTier(attempt.scorePercent).id;
    if (tierId === "expert" || tierId === "mastery") expertModules.add(module.id);
  }
  if (expertModules.size >= CLINICAL_MASTERY_THRESHOLD) {
    next = unlock(next, "clinical-mastery", null, module.courseId, now);
  }

  return next;
}

export function totalXp(state: LearnerState): number {
  return state.xpEvents.reduce((total, event) => total + event.amount, 0);
}

export function achievementDefinition(id: AchievementId) {
  return ACHIEVEMENTS.find((a) => a.id === id);
}

/** Kept exported for the quiz engine: which questions still count for score. */
export function gradedQuestionCount(quiz: QuizData): number {
  return quiz.questions.filter(isGradedQuestion).length;
}
