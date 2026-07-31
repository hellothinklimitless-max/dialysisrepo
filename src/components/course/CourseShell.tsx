"use client";

/**
 * COURSE SHELL — brief Sections 2, 26
 * ===================================
 * The frame every learning page sits in. Three chrome levels, because the brief
 * asks for full orientation on course pages but a stripped environment during
 * an active assessment ("simplify the environment and minimise distractions").
 *
 *   full    — brand, breadcrumb trail, contextual sidebar
 *   minimal — brand and an exit affordance only (used by the quiz in Phase 4)
 *   bare    — no header at all (completion sequences)
 *
 * Desktop is a genuine two-column layout. Mobile is not that layout scaled
 * down: the sidebar moves below the main content and pages supply their own
 * compact summary above it.
 */

import Link from "next/link";
import type { ReactNode } from "react";
import { BrandMark, ChevronRightIcon } from "@/components/ui/Icon";

export interface Crumb {
  label: string;
  href?: string;
}

export interface CourseShellProps {
  chrome?: "full" | "minimal" | "bare";
  breadcrumb?: Crumb[];
  /** Right-hand slot in the header — progress readouts, exit actions. */
  headerAside?: ReactNode;
  /** Contextual sidebar: course progress, module navigation, completion. */
  sidebar?: ReactNode;
  /** Compact progress strip shown above content on small screens only. */
  mobileSummary?: ReactNode;
  children: ReactNode;
  /** Constrains reading measure on single-column pages. */
  width?: "wide" | "narrow";
}

export function CourseShell({
  chrome = "full",
  breadcrumb = [],
  headerAside,
  sidebar,
  mobileSummary,
  children,
  width = "wide",
}: CourseShellProps) {
  const container = width === "narrow" ? "max-w-3xl" : "max-w-6xl";

  return (
    <div className="min-h-dvh">
      {chrome !== "bare" ? (
        <header className="sticky top-0 z-30 border-b border-border bg-surface/85 backdrop-blur-sm">
          <div
            className={`mx-auto flex h-16 ${container} items-center gap-4 px-4 sm:px-6`}
          >
            <Link
              href="/"
              className="flex shrink-0 items-center gap-2 text-ink"
              aria-label="Dialysis Academy home"
            >
              <span className="text-primary">
                <BrandMark className="h-5 w-5" />
              </span>
              <span className="text-sm font-semibold tracking-tight">
                Dialysis Academy
              </span>
            </Link>

            {chrome === "full" && breadcrumb.length > 0 ? (
              <nav
                aria-label="Breadcrumb"
                className="hidden min-w-0 flex-1 md:block"
              >
                <ol className="flex min-w-0 items-center gap-1 text-sm text-muted">
                  {breadcrumb.map((crumb, index) => (
                    <li key={`${crumb.label}-${index}`} className="flex min-w-0 items-center gap-1">
                      <ChevronRightIcon className="h-3.5 w-3.5 shrink-0 text-border-strong" />
                      {crumb.href ? (
                        <Link
                          href={crumb.href}
                          className="truncate rounded-[4px] hover:text-ink"
                        >
                          {crumb.label}
                        </Link>
                      ) : (
                        <span
                          className="truncate text-ink"
                          aria-current="page"
                        >
                          {crumb.label}
                        </span>
                      )}
                    </li>
                  ))}
                </ol>
              </nav>
            ) : (
              <div className="flex-1" />
            )}

            {headerAside ? (
              <div className="flex shrink-0 items-center gap-3">{headerAside}</div>
            ) : null}
          </div>
        </header>
      ) : null}

      <main id="main" className={`mx-auto ${container} px-4 pb-24 pt-8 sm:px-6`}>
        {mobileSummary ? (
          <div className="mb-6 lg:hidden">{mobileSummary}</div>
        ) : null}

        {sidebar ? (
          <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_19rem] lg:gap-12">
            <div className="min-w-0">{children}</div>
            {/* Sidebar follows content in DOM order, so it also reads last on
                mobile and to screen readers — the lesson is the priority. */}
            <aside className="min-w-0 lg:sticky lg:top-24 lg:self-start">
              {sidebar}
            </aside>
          </div>
        ) : (
          children
        )}
      </main>
    </div>
  );
}
