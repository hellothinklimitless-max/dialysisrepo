"use client";

/**
 * SAVE FAILURE / STORAGE UNAVAILABLE — brief Section 32
 * =====================================================
 * "We couldn't save your response. Your answer is still stored locally.
 *  Try Again."
 *
 * The honest version of that for this build: state lives in memory for the
 * session either way, so nothing is lost right now — what's at risk is
 * remembering it next visit. Every error names a recovery action.
 */

import { Button } from "@/components/ui/Button";
import { Panel } from "@/components/ui/Card";
import { AlertIcon } from "@/components/ui/Icon";
import { useLearnerProgress } from "@/lib/progress-provider";

export function PersistenceNotice() {
  const { status, saveStatus, saveError, retrySave } = useLearnerProgress();

  const isBlocked = status === "unavailable";
  const isSaveError = saveStatus === "error";
  if (!isBlocked && !isSaveError) return null;

  return (
    <Panel
      tone="error"
      className="mb-6 border border-error/25 p-4"
      // Announced without stealing focus mid-lesson.
      role="status"
      aria-live="polite"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-3">
          <AlertIcon className="mt-0.5 h-4 w-4 shrink-0 text-error" />
          <div className="text-sm leading-relaxed">
            <p className="font-medium text-ink">
              {isSaveError
                ? "We couldn’t save your progress."
                : "Progress can’t be saved in this browser."}
            </p>
            <p className="mt-1 text-muted">
              {saveError ??
                "Your progress is still here for this session — it just may not be waiting for you next time."}
            </p>
          </div>
        </div>

        {isSaveError ? (
          <Button variant="secondary" size="sm" onClick={retrySave} className="shrink-0">
            Try again
          </Button>
        ) : null}
      </div>
    </Panel>
  );
}
