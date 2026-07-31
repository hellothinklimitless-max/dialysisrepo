/** Formatting helpers. Every value returned here is rendered in the mono
 *  numeric face (README section 5) — these are numbers, never prose. */

/** 285 -> "4:45", 3725 -> "1:02:05" */
export function formatClock(totalSeconds: number): string {
  const safe = Math.max(0, Math.round(totalSeconds));
  const hours = Math.floor(safe / 3600);
  const minutes = Math.floor((safe % 3600) / 60);
  const seconds = safe % 60;
  const pad = (n: number) => n.toString().padStart(2, "0");
  return hours > 0
    ? `${hours}:${pad(minutes)}:${pad(seconds)}`
    : `${minutes}:${pad(seconds)}`;
}

/** 285 -> "5 min" — for at-a-glance module lists, where seconds are noise. */
export function formatMinutes(totalSeconds: number): string {
  const minutes = Math.max(1, Math.round(totalSeconds / 60));
  return `${minutes} min`;
}

/** Zero-padded module number: 3 -> "03" */
export function formatModuleNumber(moduleNumber: number): string {
  return moduleNumber.toString().padStart(2, "0");
}

export function formatPercent(value: number): string {
  return `${Math.round(value)}%`;
}

export function formatCount(value: number, singular: string, plural?: string) {
  return `${value} ${value === 1 ? singular : (plural ?? `${singular}s`)}`;
}

/** Elapsed quiz time: 92000 -> "1:32" */
export function formatElapsed(milliseconds: number): string {
  return formatClock(milliseconds / 1000);
}
