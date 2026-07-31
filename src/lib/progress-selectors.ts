/**
 * DERIVED PROGRESS
 * ================
 * Read-only projections of `LearnerState` onto the content graph. Nothing here
 * is persisted — these are recomputed on render so there is exactly one source
 * of truth for "is this module done?".
 */

import type { Course, Module } from "@/data/course-content";
import { getCourseStructure, hasQuiz } from "@/lib/content";
import { getModuleProgress } from "@/lib/learner-state";
import { bestScore, latestAttempt } from "@/lib/scoring";
import type {
  CourseProgressSummary,
  LearnerState,
  ModuleCompletionState,
  ModuleProgress,
} from "@/lib/types";

export function getModuleCompletion(
  state: LearnerState,
  module: Module,
): ModuleCompletionState {
  const progress = getModuleProgress(state, module.id);
  const assessmentRequirement = hasQuiz(module) ? "required" : "unavailable";
  const assessmentPassed = progress.attempts.some((a) => a.passed);
  const assessmentComplete =
    assessmentRequirement === "unavailable"
      ? true
      : progress.attempts.length > 0;
  const latest = latestAttempt(progress.attempts);

  return {
    videoComplete: progress.video.completed,
    assessmentRequirement,
    assessmentComplete,
    assessmentPassed,
    moduleComplete: progress.completedAt !== null,
    hasActiveAttempt: progress.activeAttempt !== null,
    attemptCount: progress.attempts.length,
    bestScorePercent: bestScore(progress.attempts),
    latestScorePercent: latest?.scorePercent ?? null,
  };
}

export function getCourseProgress(
  state: LearnerState,
  courseId: string,
): CourseProgressSummary {
  const structure = getCourseStructure(courseId);
  if (!structure) {
    return {
      courseId,
      availableModules: 0,
      nominalModules: 0,
      completedModules: 0,
      percentComplete: 0,
      isContentIncomplete: false,
    };
  }

  const completedModules = structure.modules.filter(
    (module) => getModuleProgress(state, module.id).completedAt !== null,
  ).length;

  const availableModules = structure.modules.length;

  return {
    courseId,
    availableModules,
    nominalModules: structure.nominalModuleCount,
    completedModules,
    // Measured against what the learner can actually complete today. The
    // nominal count is shown separately rather than baked into a denominator
    // the learner could never reach.
    percentComplete:
      availableModules === 0
        ? 0
        : Math.round((completedModules / availableModules) * 100),
    isContentIncomplete: structure.isContentIncomplete,
  };
}

/** The module a learner should land on when they resume a course. */
export function getResumeModule(
  state: LearnerState,
  courseId: string,
): Module | null {
  const structure = getCourseStructure(courseId);
  if (!structure || structure.modules.length === 0) return null;

  const inProgress = structure.modules.find((module) => {
    const progress = getModuleProgress(state, module.id);
    return progress.activeAttempt !== null;
  });
  if (inProgress) return inProgress;

  const firstUnfinished = structure.modules.find(
    (module) => getModuleProgress(state, module.id).completedAt === null,
  );
  return firstUnfinished ?? structure.modules[0] ?? null;
}

export interface CourseRollup {
  course: Course;
  progress: CourseProgressSummary;
}

export function getAllCourseProgress(
  state: LearnerState,
  courseList: Course[],
): CourseRollup[] {
  return courseList.map((course) => ({
    course,
    progress: getCourseProgress(state, course.id),
  }));
}

/** True once every available module in the course is complete. */
export function isCourseComplete(
  state: LearnerState,
  courseId: string,
): boolean {
  const progress = getCourseProgress(state, courseId);
  return (
    progress.availableModules > 0 &&
    progress.completedModules === progress.availableModules
  );
}

export function getModuleProgressRecord(
  state: LearnerState,
  moduleId: string,
): ModuleProgress {
  return getModuleProgress(state, moduleId);
}
