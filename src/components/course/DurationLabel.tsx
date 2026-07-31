/**
 * Duration display — README section 2f.
 *
 * The transcript-derived values in the content file are estimates. Until real
 * durations are fetched (`npm run fetch:durations`), they render with a leading
 * "~" and an explicit "estimated" note for screen readers, so the product never
 * states an unverified number as fact.
 */

import { ClockIcon } from "@/components/ui/Icon";
import type { ResolvedDuration } from "@/lib/content";

export function DurationLabel({
  duration,
  withIcon = true,
  className = "",
}: {
  duration: ResolvedDuration;
  withIcon?: boolean;
  className?: string;
}) {
  return (
    <span className={`inline-flex items-center gap-1.5 ${className}`}>
      {withIcon ? <ClockIcon className="h-3.5 w-3.5 text-muted" /> : null}
      <span
        className="numeric"
        title={
          duration.isEstimate
            ? "Estimated from the lesson transcript — not yet verified against the source video."
            : undefined
        }
      >
        {duration.label}
      </span>
      {duration.isEstimate ? (
        <span className="sr-only">(estimated duration)</span>
      ) : null}
    </span>
  );
}
