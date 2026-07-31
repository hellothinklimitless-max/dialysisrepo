"use client";

/**
 * MODULE NAVIGATION — brief Sections 3, 26
 * ========================================
 * The contextual sidebar list. Shows where the learner is, what is done, and
 * what comes next, without competing with the lesson for attention.
 *
 * Modules are never locked: the brief asks for orientation, not gating, and
 * gating would strand any learner on the module whose assessment doesn't exist.
 */

import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { ModuleStatusDot, statusText } from "@/components/course/ModuleStatus";
import { formatModuleNumber } from "@/lib/format";
import { getModuleCompletion } from "@/lib/progress-selectors";
import { useLearnerProgress } from "@/lib/progress-provider";
import type { Module } from "@/lib/content";
import type { CourseMeta, MissingModuleNote } from "@/data/course-meta";

type NavEntry =
  | { kind: "module"; module: Module }
  | { kind: "missing"; missing: MissingModuleNote };

/**
 * Nominal-but-absent lessons sit in their original position in the sequence,
 * not appended at the end — the gap is where the source material left it
 * (README section 2b). They carry no number, because the modules that do exist
 * were renumbered contiguously and reusing the nominal position would collide
 * with a real module's number.
 */
function buildEntries(modules: Module[], meta?: CourseMeta): NavEntry[] {
  const entries: NavEntry[] = modules.map((module) => ({
    kind: "module",
    module,
  }));

  const missing = [...(meta?.missingModules ?? [])].sort(
    (a, b) => a.nominalPosition - b.nominalPosition,
  );

  for (const item of missing) {
    const at = Math.min(Math.max(item.nominalPosition - 1, 0), entries.length);
    entries.splice(at, 0, { kind: "missing", missing: item });
  }

  return entries;
}

export function ModuleNavigation({
  courseId,
  modules,
  currentModuleId,
  meta,
}: {
  courseId: string;
  modules: Module[];
  currentModuleId?: string;
  meta?: CourseMeta;
}) {
  const { state, status } = useLearnerProgress();
  const loading = status === "loading";

  return (
    <Card as="nav" className="p-2" aria-label="Course modules">
      <h2 className="px-3 pb-2 pt-3 text-xs font-semibold uppercase tracking-[0.08em] text-muted">
        Modules
      </h2>

      <ol className="flex flex-col">
        {buildEntries(modules, meta).map((entry) => {
          if (entry.kind === "missing") {
            const { missing } = entry;
            return (
              <li key={`missing-${missing.title}`}>
                <div className="flex items-start gap-3 rounded-control px-3 py-2.5">
                  <span
                    className="mt-[3px] h-4 w-4 shrink-0 rounded-full border border-dashed border-border-strong"
                    aria-hidden="true"
                  />
                  <span className="min-w-0 flex-1">
                    <span className="flex items-baseline gap-2">
                      <span
                        className="numeric text-xs text-border-strong"
                        aria-hidden="true"
                      >
                        ——
                      </span>
                      <span className="min-w-0 text-sm leading-snug text-muted">
                        {missing.title}
                      </span>
                    </span>
                    <span className="mt-0.5 block text-xs text-muted">
                      Not yet available
                    </span>
                  </span>
                </div>
              </li>
            );
          }

          const { module } = entry;
          const completion = getModuleCompletion(state, module);
          const isCurrent = module.id === currentModuleId;

          return (
            <li key={module.id}>
              <Link
                href={`/courses/${courseId}/modules/${module.id}`}
                aria-current={isCurrent ? "page" : undefined}
                className={[
                  "flex items-start gap-3 rounded-control px-3 py-2.5",
                  "transition-colors duration-150",
                  isCurrent ? "bg-primary-tint" : "hover:bg-sunken",
                ].join(" ")}
              >
                <ModuleStatusDot completion={completion} loading={loading} />

                <span className="min-w-0 flex-1">
                  <span className="flex items-baseline gap-2">
                    <span className="numeric text-xs text-muted">
                      {formatModuleNumber(module.moduleNumber)}
                    </span>
                    <span
                      className={[
                        "min-w-0 text-sm leading-snug",
                        isCurrent ? "font-semibold text-ink" : "text-ink",
                      ].join(" ")}
                    >
                      {module.title}
                    </span>
                  </span>
                  {!loading ? (
                    <span className="mt-0.5 block text-xs text-muted">
                      {statusText(completion)}
                    </span>
                  ) : null}
                </span>
              </Link>
            </li>
          );
        })}
      </ol>
    </Card>
  );
}
