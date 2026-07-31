"use client";

/**
 * Previous / next module navigation — brief Section 20's "Continue to Next
 * Module →" and "Return to Course", available from the module page itself so
 * the learner always knows what comes next.
 */

import Link from "next/link";
import { ArrowLeftIcon, ArrowRightIcon } from "@/components/ui/Icon";
import { formatModuleNumber } from "@/lib/format";
import type { Module } from "@/lib/content";

function PagerLink({
  module,
  courseId,
  direction,
}: {
  module: Module;
  courseId: string;
  direction: "previous" | "next";
}) {
  const isNext = direction === "next";
  return (
    <Link
      href={`/courses/${courseId}/modules/${module.id}`}
      className={[
        "group flex flex-1 items-center gap-3 rounded-card border border-border bg-raised p-4",
        "transition-[border-color,background-color] duration-200 hover:border-border-strong hover:bg-sunken",
        isNext ? "text-right" : "",
      ].join(" ")}
    >
      {!isNext ? (
        <ArrowLeftIcon className="h-4 w-4 shrink-0 text-muted transition-transform duration-200 ease-[var(--ease-out-quint)] group-hover:-translate-x-0.5 motion-reduce:group-hover:translate-x-0" />
      ) : null}

      <span className={`min-w-0 flex-1 ${isNext ? "text-right" : ""}`}>
        <span className="block text-xs uppercase tracking-[0.08em] text-muted">
          {isNext ? "Next module" : "Previous module"}
        </span>
        <span className="mt-1 block truncate text-sm font-medium text-ink">
          <span className="numeric text-muted">
            {formatModuleNumber(module.moduleNumber)}
          </span>{" "}
          {module.title}
        </span>
      </span>

      {isNext ? (
        <ArrowRightIcon className="h-4 w-4 shrink-0 text-muted transition-transform duration-200 ease-[var(--ease-out-quint)] group-hover:translate-x-0.5 motion-reduce:group-hover:translate-x-0" />
      ) : null}
    </Link>
  );
}

export function ModulePager({
  courseId,
  previous,
  next,
}: {
  courseId: string;
  previous: Module | null;
  next: Module | null;
}) {
  if (!previous && !next) return null;

  return (
    <nav
      aria-label="Module navigation"
      className="mt-10 flex flex-col gap-3 border-t border-border pt-6 sm:flex-row"
    >
      {previous ? (
        <PagerLink module={previous} courseId={courseId} direction="previous" />
      ) : (
        <span className="hidden flex-1 sm:block" />
      )}
      {next ? (
        <PagerLink module={next} courseId={courseId} direction="next" />
      ) : (
        <span className="hidden flex-1 sm:block" />
      )}
    </nav>
  );
}
