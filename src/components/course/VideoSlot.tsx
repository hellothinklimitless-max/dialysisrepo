"use client";

/**
 * PHASE 3 SLOT.
 *
 * The lesson player (YouTube IFrame Player API, custom transport controls,
 * completion tracking) is Phase 3 of the build plan. This renders the real
 * poster frame for the real video so the module page's composition can be
 * reviewed now, and states plainly that the player is not wired up yet rather
 * than faking controls that do nothing.
 *
 * Also carries the "Video unavailable" edge state (brief Section 32) for any
 * module whose URL can't be resolved to a video id.
 */

import { useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { AlertIcon, PlayIcon } from "@/components/ui/Icon";
import { parseYouTubeId, type Module } from "@/lib/content";

export function VideoSlot({ module }: { module: Module }) {
  const videoId = parseYouTubeId(module.videoUrl);
  // maxres isn't generated for every upload, and the poster host may be
  // unreachable entirely — fall back once, then drop the image rather than
  // leaving a broken-image glyph on the page.
  const [posterQuality, setPosterQuality] = useState<
    "maxres" | "hq" | "unavailable"
  >("maxres");

  if (!videoId) {
    return (
      <div className="flex aspect-video w-full flex-col items-center justify-center gap-3 rounded-card border border-dashed border-border-strong bg-sunken p-8 text-center">
        <AlertIcon className="h-6 w-6 text-muted" />
        <p className="text-sm font-medium text-ink">
          This lesson’s video is unavailable.
        </p>
        <p className="max-w-sm text-sm text-muted">
          The module’s video link could not be resolved. The assessment for this
          module is still available below.
        </p>
      </div>
    );
  }

  return (
    <figure className="m-0">
      <div className="relative aspect-video w-full overflow-hidden rounded-card border border-border bg-ink">
        {posterQuality !== "unavailable" ? (
          /* eslint-disable-next-line @next/next/no-img-element -- swapped for
             the IFrame player in Phase 3; needs a runtime onError fallback. */
          <img
            src={`https://i.ytimg.com/vi/${videoId}/${
              posterQuality === "maxres" ? "maxresdefault" : "hqdefault"
            }.jpg`}
            alt=""
            className="h-full w-full object-cover opacity-70"
            onError={() =>
              setPosterQuality((current) =>
                current === "maxres" ? "hq" : "unavailable",
              )
            }
          />
        ) : null}

        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-ink/45 p-6 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-surface/95 text-primary">
            <PlayIcon className="h-6 w-6" />
          </span>
          <Badge tone="neutral" className="bg-surface/90">
            Player arrives in Phase 3
          </Badge>
        </div>
      </div>

      <figcaption className="mt-2 text-xs text-muted">
        Poster frame for the real lesson video. Playback, timeline, speed,
        captions and completion tracking are built in Phase 3.
      </figcaption>
    </figure>
  );
}
