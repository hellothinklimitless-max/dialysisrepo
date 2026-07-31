#!/usr/bin/env node
/**
 * FETCH REAL VIDEO DURATIONS — README section 2f
 * ==============================================
 * The `durationLabel` / `durationSeconds` values in `course-content.ts` are
 * ESTIMATES derived from where each transcript's timestamps end. They must not
 * be presented to learners as fact.
 *
 * IMPORTANT — a correction to the README's suggestion: YouTube's **oEmbed
 * endpoint does not return duration**. Its response carries title, author,
 * thumbnail and embed HTML only. Duration is only available from the YouTube
 * **Data API v3** (`videos?part=contentDetails`), which requires an API key.
 *
 * So:
 *   YOUTUBE_API_KEY=... npm run fetch:durations
 *
 * Without a key this script exits cleanly without writing, and the app falls
 * back to the estimates — which are then labelled as approximate in the UI
 * ("~4:45", plus an accessible "estimated" note) rather than stated as fact.
 *
 * Output: src/data/video-durations.generated.json (committed, so builds without
 * network access still get real durations once this has been run).
 */

import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const contentPath = join(here, "..", "src", "data", "course-content.ts");
const outputPath = join(here, "..", "src", "data", "video-durations.generated.json");

/** Extract YouTube ids from the content file without importing TypeScript. */
function collectVideoIds() {
  const source = readFileSync(contentPath, "utf8");
  const ids = new Set();
  const urlPattern = /videoUrl:\s*"([^"]+)"/g;
  let match;
  while ((match = urlPattern.exec(source)) !== null) {
    const id = parseYouTubeId(match[1]);
    if (id) ids.add(id);
  }
  return [...ids];
}

function parseYouTubeId(url) {
  const shortForm = /youtu\.be\/([A-Za-z0-9_-]{6,})/.exec(url);
  if (shortForm) return shortForm[1];
  const longForm = /[?&]v=([A-Za-z0-9_-]{6,})/.exec(url);
  if (longForm) return longForm[1];
  const embedForm = /youtube\.com\/embed\/([A-Za-z0-9_-]{6,})/.exec(url);
  if (embedForm) return embedForm[1];
  return null;
}

/** ISO 8601 duration (e.g. "PT4M45S") -> seconds. */
function isoDurationToSeconds(iso) {
  const match = /^P(?:(\d+)D)?T(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$/.exec(iso);
  if (!match) return null;
  const [, d, h, m, s] = match;
  return (
    Number(d ?? 0) * 86400 +
    Number(h ?? 0) * 3600 +
    Number(m ?? 0) * 60 +
    Number(s ?? 0)
  );
}

async function main() {
  const apiKey = process.env.YOUTUBE_API_KEY;
  const ids = collectVideoIds();

  if (ids.length === 0) {
    console.error("No videoUrl entries found in course-content.ts — aborting.");
    process.exitCode = 1;
    return;
  }

  if (!apiKey) {
    console.warn(
      [
        "YOUTUBE_API_KEY is not set — no durations fetched.",
        `The app will fall back to the ${ids.length} transcript-derived estimates and`,
        "label them as approximate in the UI. Set YOUTUBE_API_KEY and re-run to",
        "replace them with real durations.",
      ].join("\n"),
    );
    return;
  }

  const durations = {};
  const failures = [];

  // Data API accepts up to 50 ids per request; this content has ~12.
  for (let i = 0; i < ids.length; i += 50) {
    const batch = ids.slice(i, i + 50);
    const endpoint = new URL("https://www.googleapis.com/youtube/v3/videos");
    endpoint.searchParams.set("part", "contentDetails");
    endpoint.searchParams.set("id", batch.join(","));
    endpoint.searchParams.set("key", apiKey);

    const response = await fetch(endpoint);
    if (!response.ok) {
      throw new Error(
        `YouTube Data API responded ${response.status}: ${await response.text()}`,
      );
    }
    const payload = await response.json();
    for (const item of payload.items ?? []) {
      const seconds = isoDurationToSeconds(item.contentDetails?.duration ?? "");
      if (seconds === null) {
        failures.push(item.id);
        continue;
      }
      durations[item.id] = seconds;
    }
    for (const id of batch) {
      if (!(id in durations) && !failures.includes(id)) failures.push(id);
    }
  }

  writeFileSync(
    outputPath,
    `${JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        source: "youtube-data-api-v3",
        durations,
      },
      null,
      2,
    )}\n`,
    "utf8",
  );

  console.log(`Wrote ${Object.keys(durations).length} real durations to ${outputPath}`);
  if (failures.length > 0) {
    console.warn(
      `No duration returned for ${failures.length} video(s): ${failures.join(", ")}. ` +
        "These keep their estimate and stay labelled as approximate.",
    );
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
