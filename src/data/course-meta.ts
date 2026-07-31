/**
 * COURSE CATALOG METADATA
 * =======================
 * Kept OUT of `course-content.ts` so that file stays exactly as delivered.
 *
 * This records what each course is *nominally* meant to contain versus what
 * content actually exists — see README section 2b. Two lessons were excluded
 * from the content file rather than stubbed with invented material, so
 * "Dialysis Fundamentals" ships 9 of its nominal 10 modules.
 *
 * Re-grouping courses later is a change to this file plus `courses` in the
 * content file — not a change to any component.
 */

export interface MissingModuleNote {
  /** Title as it appeared in the original source list. */
  title: string;
  /** Where it would sit in the original numbering (1-based). */
  nominalPosition: number;
  reason: string;
}

export interface CourseMeta {
  courseId: string;
  /**
   * Modules the course was originally scoped to contain. Where this exceeds
   * the number of modules actually present, the course renders the honest
   * "content incomplete" state instead of a misleading denominator.
   */
  nominalModuleCount: number;
  missingModules: MissingModuleNote[];
  /** Editorial notes surfaced in the UI where relevant; never invented facts. */
  contentNotes: string[];
}

export const courseMeta: CourseMeta[] = [
  {
    courseId: "dialysis-fundamentals",
    // Introduction + Lessons 1–9 = 10. Nine are present; "Hemodialysis
    // Machines" has no transcript and was deliberately not stubbed.
    nominalModuleCount: 10,
    missingModules: [
      {
        title: "Hemodialysis Machines",
        nominalPosition: 6,
        reason:
          "No lesson transcript has been produced for this module yet, so it was left out rather than filled with placeholder content.",
      },
    ],
    contentNotes: [
      'A second "Hemodialysis Fundamentals" video appeared in the source list pointing at a different recording, also without a transcript. It was excluded as a duplicate and does not count toward this course’s module total.',
    ],
  },
  {
    courseId: "advanced-dialysis-techniques",
    nominalModuleCount: 1,
    missingModules: [],
    contentNotes: [],
  },
  {
    courseId: "dialysis-machines-explained",
    nominalModuleCount: 1,
    missingModules: [],
    contentNotes: [],
  },
  {
    courseId: "complications-in-dialysis",
    nominalModuleCount: 1,
    missingModules: [],
    contentNotes: [],
  },
];

export function getCourseMeta(courseId: string): CourseMeta | undefined {
  return courseMeta.find((m) => m.courseId === courseId);
}
