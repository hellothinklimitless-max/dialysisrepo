/**
 * CONTENT SELECTORS
 * =================
 * The only module allowed to reach into `src/data/*`. Components read courses
 * and modules through here so that re-grouping content later stays a data
 * change rather than a code change (README section 2a).
 */

import {
  courses,
  modules,
  getCourseById,
  getModuleById,
  getModulesForCourse,
  type Course,
  type Module,
  type QuizData,
  type QuizQuestion,
} from "@/data/course-content";
import { getCourseMeta, type CourseMeta } from "@/data/course-meta";
import generatedDurations from "@/data/video-durations.generated.json";
import { formatClock } from "@/lib/format";

export {
  courses,
  modules,
  getCourseById,
  getModuleById,
  getModulesForCourse,
  getCourseMeta,
};
export type { Course, Module, QuizData, QuizQuestion, CourseMeta };

/* -------------------------------------------------------------------------
 * Video identity
 * ---------------------------------------------------------------------- */

export function parseYouTubeId(url: string): string | null {
  const shortForm = /youtu\.be\/([A-Za-z0-9_-]{6,})/.exec(url);
  if (shortForm?.[1]) return shortForm[1];
  const longForm = /[?&]v=([A-Za-z0-9_-]{6,})/.exec(url);
  if (longForm?.[1]) return longForm[1];
  const embedForm = /youtube\.com\/embed\/([A-Za-z0-9_-]{6,})/.exec(url);
  if (embedForm?.[1]) return embedForm[1];
  return null;
}

export function getPosterUrl(module: Module): string | null {
  const id = parseYouTubeId(module.videoUrl);
  return id ? `https://i.ytimg.com/vi/${id}/maxresdefault.jpg` : null;
}

/* -------------------------------------------------------------------------
 * Duration — README section 2f
 *
 * Never present the transcript-derived estimate as fact. If a real duration
 * has been fetched (npm run fetch:durations), use it. Otherwise fall back to
 * the estimate and mark it approximate so the UI can say so.
 * ---------------------------------------------------------------------- */

const fetchedDurations = generatedDurations.durations as Record<string, number>;

export interface ResolvedDuration {
  seconds: number;
  /** "4:45" when real, "~4:45" when estimated. */
  label: string;
  isEstimate: boolean;
}

export function resolveDuration(module: Module): ResolvedDuration {
  const id = parseYouTubeId(module.videoUrl);
  const fetched = id ? fetchedDurations[id] : undefined;

  if (typeof fetched === "number" && fetched > 0) {
    return { seconds: fetched, label: formatClock(fetched), isEstimate: false };
  }

  return {
    seconds: module.durationSeconds,
    label: `~${module.durationLabel}`,
    isEstimate: true,
  };
}

/** True when no real durations have been fetched at all — surfaced once in
 *  the UI rather than repeated on every module. */
export function durationsAreUnverified(): boolean {
  return Object.keys(fetchedDurations).length === 0;
}

/* -------------------------------------------------------------------------
 * Quiz shape
 * ---------------------------------------------------------------------- */

/**
 * Only `single-best` questions count toward a score.
 *
 * `conceptual-flagged` questions (README section 2e) have a source answer that
 * doesn't map cleanly to any one option, so grading them right/wrong would be
 * inventing a correct answer the source never gave. They are still asked, still
 * answered, and still explained — they just don't move the score.
 */
export function isGradedQuestion(question: QuizQuestion): boolean {
  return question.type === "single-best";
}

export interface QuizFacts {
  questionCount: number;
  gradedCount: number;
  flaggedCount: number;
  estimatedMinutes: number;
  passingScore: number;
  topics: string[];
}

export function getQuizFacts(quiz: QuizData): QuizFacts {
  const graded = quiz.questions.filter(isGradedQuestion);
  return {
    questionCount: quiz.questions.length,
    gradedCount: graded.length,
    flaggedCount: quiz.questions.length - graded.length,
    estimatedMinutes: quiz.estimatedMinutes,
    passingScore: quiz.passingScore,
    topics: [...new Set(quiz.questions.map((q) => q.topic))],
  };
}

export function hasQuiz(module: Module): boolean {
  return module.quiz !== null && module.quiz.questions.length > 0;
}

/* -------------------------------------------------------------------------
 * Course structure
 * ---------------------------------------------------------------------- */

export interface CourseStructure {
  course: Course;
  meta: CourseMeta | undefined;
  modules: Module[];
  nominalModuleCount: number;
  /** True when the course ships fewer modules than it nominally contains. */
  isContentIncomplete: boolean;
}

export function getCourseStructure(courseId: string): CourseStructure | null {
  const course = getCourseById(courseId);
  if (!course) return null;

  const courseModules = getModulesForCourse(courseId);
  const meta = getCourseMeta(courseId);
  const nominalModuleCount = meta?.nominalModuleCount ?? courseModules.length;

  return {
    course,
    meta,
    modules: courseModules,
    nominalModuleCount,
    isContentIncomplete: nominalModuleCount > courseModules.length,
  };
}

export interface ModuleNeighbours {
  previous: Module | null;
  next: Module | null;
  /** 1-based position among the modules that actually exist. */
  position: number;
  total: number;
}

export function getModuleNeighbours(
  courseId: string,
  moduleId: string,
): ModuleNeighbours {
  const list = getModulesForCourse(courseId);
  const index = list.findIndex((m) => m.id === moduleId);
  if (index === -1) {
    return { previous: null, next: null, position: 0, total: list.length };
  }
  return {
    previous: list[index - 1] ?? null,
    next: list[index + 1] ?? null,
    position: index + 1,
    total: list.length,
  };
}

/** Total runtime of a course, using real durations where they exist. */
export function getCourseRuntimeSeconds(courseId: string): number {
  return getModulesForCourse(courseId).reduce(
    (total, module) => total + resolveDuration(module).seconds,
    0,
  );
}

export function getCourseQuestionCount(courseId: string): number {
  return getModulesForCourse(courseId).reduce(
    (total, module) => total + (module.quiz?.questions.length ?? 0),
    0,
  );
}
