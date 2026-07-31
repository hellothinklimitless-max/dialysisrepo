/**
 * COURSE INCOMPLETE — brief Section 32
 * ====================================
 * A real state, not a hypothetical one: "Dialysis Fundamentals" ships 9 of its
 * nominal 10 modules because one lesson has no transcript, and a duplicate
 * video was excluded (README section 2b).
 *
 * The brief asks that edge states provide clarity, not apology — so this states
 * what is missing and why, and does not block anything.
 */

import { Panel } from "@/components/ui/Card";
import { InfoIcon } from "@/components/ui/Icon";
import type { CourseMeta } from "@/data/course-meta";

export function ContentGapNotice({
  meta,
  availableModules,
}: {
  meta: CourseMeta | undefined;
  availableModules: number;
}) {
  if (!meta) return null;
  const gap = meta.nominalModuleCount - availableModules;
  if (gap <= 0 && meta.contentNotes.length === 0) return null;

  return (
    <Panel tone="neutral" className="border border-border p-4">
      <div className="flex gap-3">
        <InfoIcon className="mt-0.5 h-4 w-4 shrink-0 text-muted" />
        <div className="min-w-0 text-sm leading-relaxed">
          <p className="font-medium text-ink">
            {gap > 0
              ? `${availableModules} of ${meta.nominalModuleCount} modules are available`
              : "A note on this course’s content"}
          </p>

          {meta.missingModules.length > 0 ? (
            <ul className="mt-2 space-y-1.5 text-muted">
              {meta.missingModules.map((missing) => (
                <li key={missing.title}>
                  <span className="text-ink">{missing.title}</span> —{" "}
                  {missing.reason}
                </li>
              ))}
            </ul>
          ) : null}

          {meta.contentNotes.length > 0 ? (
            <ul className="mt-2 space-y-1.5 text-muted">
              {meta.contentNotes.map((note) => (
                <li key={note}>{note}</li>
              ))}
            </ul>
          ) : null}

          {gap > 0 ? (
            <p className="mt-2 text-muted">
              Everything else in the course works normally, and your progress is
              measured against the modules that exist.
            </p>
          ) : null}
        </div>
      </div>
    </Panel>
  );
}
