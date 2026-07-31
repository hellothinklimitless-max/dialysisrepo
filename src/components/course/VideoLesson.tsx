"use client";

/**
 * VIDEO LESSON — brief Section 4
 * ================================
 * Full YouTube IFrame Player API integration with custom transport controls.
 *
 * Controls: play/pause, timeline scrubber, current time / duration (mono
 * face), volume + mute, playback speed, captions toggle, fullscreen.
 *
 * Captions are YouTube's native track (toggled via loadModule/unloadModule).
 * They cannot be restyled to match the app typography — this is stated in the
 * UI rather than omitted or overpromised (README section 2, known constraints).
 *
 * Completion fires at VIDEO_COMPLETION_RATIO (95%) — trailing credits should
 * not gate the lesson → assessment transition.
 */

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  CaptionsIcon,
  FullscreenEnterIcon,
  FullscreenExitIcon,
  PauseIcon,
  PlayIcon,
  ReplayIcon,
  VolumeHighIcon,
  VolumeMuteIcon,
} from "@/components/ui/Icon";
import { AlertIcon } from "@/components/ui/Icon";
import { VideoCompletion } from "@/components/course/VideoCompletion";
import { parseYouTubeId, resolveDuration, type Module } from "@/lib/content";
import { VIDEO_COMPLETION_RATIO } from "@/lib/learner-state";
import { useLearnerProgress } from "@/lib/progress-provider";
import { formatClock } from "@/lib/format";

/* -------------------------------------------------------------------------
 * YouTube IFrame Player API — minimal types
 * ---------------------------------------------------------------------- */

declare global {
  interface Window {
    YT: {
      Player: new (
        el: HTMLElement | string,
        opts: YTPlayerOptions,
      ) => YTPlayer;
    };
    onYouTubeIframeAPIReady?: () => void;
  }
}

interface YTPlayer {
  playVideo(): void;
  pauseVideo(): void;
  seekTo(seconds: number, allowSeekAhead: boolean): void;
  setVolume(volume: number): void;
  getVolume(): number;
  mute(): void;
  unMute(): void;
  isMuted(): boolean;
  setPlaybackRate(suggestedRate: number): void;
  getPlaybackRate(): number;
  getAvailablePlaybackRates(): number[];
  getCurrentTime(): number;
  getDuration(): number;
  getPlayerState(): number;
  getIframe(): HTMLIFrameElement;
  loadModule(moduleName: string): void;
  unloadModule(moduleName: string): void;
  destroy(): void;
}

interface YTPlayerOptions {
  videoId: string;
  playerVars?: Record<string, number | string>;
  events?: {
    onReady?: (event: { target: YTPlayer }) => void;
    onStateChange?: (event: { target: YTPlayer; data: number }) => void;
    onError?: (event: { target: YTPlayer; data: number }) => void;
  };
}

const YT_STATE = {
  UNSTARTED: -1,
  ENDED: 0,
  PLAYING: 1,
  PAUSED: 2,
  BUFFERING: 3,
  CUED: 5,
} as const;

/* -------------------------------------------------------------------------
 * YouTube API singleton loader
 * ---------------------------------------------------------------------- */

let ytApiState: "idle" | "loading" | "ready" = "idle";
const ytApiQueue: Array<() => void> = [];

function ensureYouTubeAPI(callback: () => void): void {
  if (ytApiState === "ready") {
    callback();
    return;
  }
  ytApiQueue.push(callback);
  if (ytApiState !== "idle") return;
  ytApiState = "loading";

  const prevReady = window.onYouTubeIframeAPIReady;
  window.onYouTubeIframeAPIReady = () => {
    ytApiState = "ready";
    for (const cb of ytApiQueue) cb();
    ytApiQueue.length = 0;
    prevReady?.();
  };

  const script = document.createElement("script");
  script.src = "https://www.youtube.com/iframe_api";
  document.head.appendChild(script);
}

/* -------------------------------------------------------------------------
 * Constants
 * ---------------------------------------------------------------------- */

const PLAYBACK_RATES = [0.75, 1, 1.25, 1.5, 2] as const;
const HIDE_CONTROLS_DELAY_MS = 3000;

/* -------------------------------------------------------------------------
 * Public component
 * ---------------------------------------------------------------------- */

export function VideoLesson({
  module,
  courseId,
  nextModuleId,
}: {
  module: Module;
  courseId: string;
  nextModuleId: string | null;
}) {
  const videoId = parseYouTubeId(module.videoUrl);

  if (!videoId) {
    return <VideoUnavailableState />;
  }

  return (
    <VideoLessonPlayer
      module={module}
      videoId={videoId}
      courseId={courseId}
      nextModuleId={nextModuleId}
    />
  );
}

/* -------------------------------------------------------------------------
 * Player
 * ---------------------------------------------------------------------- */

type VideoPhase = "poster" | "loading" | "active" | "complete";

function VideoLessonPlayer({
  module,
  videoId,
  courseId,
  nextModuleId,
}: {
  module: Module;
  videoId: string;
  courseId: string;
  nextModuleId: string | null;
}) {
  const { actions } = useLearnerProgress();
  const resolvedDuration = resolveDuration(module);

  // ------- phase / playback state ----------------------------------------
  const [phase, setPhase] = useState<VideoPhase>("poster");
  const [isPlaying, setIsPlaying] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(resolvedDuration.seconds);
  const [volume, setVolume] = useState(100);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [captionsOn, setCaptionsOn] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [controlsShown, setControlsShown] = useState(true);
  const [showVolume, setShowVolume] = useState(false);
  const [posterQuality, setPosterQuality] = useState<"maxres" | "hq" | "gone">("maxres");
  const [playerError, setPlayerError] = useState(false);

  // ------- refs ------------------------------------------------------------
  const containerRef = useRef<HTMLDivElement>(null);
  const playerDivRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<YTPlayer | null>(null);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const tickerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const furthestSecondsRef = useRef(0);
  const completionFiredRef = useRef(false);
  const isPlayingRef = useRef(false);

  // Unique ID for the player div (safe for multiple instances on one page)
  const uid = useId();
  const playerId = `yt-player-${uid.replace(/:/g, "")}`;

  // ------- controls show / hide -------------------------------------------
  const showControls = useCallback(() => {
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    setControlsShown(true);
  }, []);

  const startHideTimer = useCallback(() => {
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    hideTimerRef.current = setTimeout(() => {
      setControlsShown(false);
    }, HIDE_CONTROLS_DELAY_MS);
  }, []);

  // ------- progress ticker ------------------------------------------------
  function startTicker() {
    stopTicker();
    tickerRef.current = setInterval(() => {
      const player = playerRef.current;
      if (!player) return;
      const ct = player.getCurrentTime();
      const dur = player.getDuration();
      const furthest = Math.max(furthestSecondsRef.current, ct);
      furthestSecondsRef.current = furthest;

      setCurrentTime(ct);
      if (dur > 0) setDuration(dur);

      // Record progress at real-time resolution
      actions.recordVideoProgress(module, furthest, dur > 0 ? dur : null);

      // Check completion (fire once)
      if (!completionFiredRef.current && dur > 0 && ct >= dur * VIDEO_COMPLETION_RATIO) {
        completionFiredRef.current = true;
        actions.completeVideo(module);
        setPhase("complete");
        showControls();
      }
    }, 500);
  }

  function stopTicker() {
    if (tickerRef.current) {
      clearInterval(tickerRef.current);
      tickerRef.current = null;
    }
  }

  // ------- YouTube player events ------------------------------------------
  const handlePlayerReady = useCallback(
    (event: { target: YTPlayer }) => {
      const player = event.target;
      const dur = player.getDuration();
      if (dur > 0) setDuration(dur);
      setVolume(player.getVolume());
      setPhase("active");
      showControls();
      player.playVideo();
    },
    [showControls],
  );

  const handleStateChange = useCallback(
    (event: { target: YTPlayer; data: number }) => {
      const player = event.target;
      const state = event.data;

      if (state === YT_STATE.PLAYING) {
        setIsPlaying(true);
        setIsBuffering(false);
        isPlayingRef.current = true;
        startTicker();
        startHideTimer();
      } else if (state === YT_STATE.PAUSED) {
        setIsPlaying(false);
        setIsBuffering(false);
        isPlayingRef.current = false;
        stopTicker();
        showControls();
        // Capture exact time on pause
        const ct = player.getCurrentTime();
        setCurrentTime(ct);
        const furthest = Math.max(furthestSecondsRef.current, ct);
        furthestSecondsRef.current = furthest;
        actions.recordVideoProgress(module, furthest, duration || null);
      } else if (state === YT_STATE.BUFFERING) {
        setIsBuffering(true);
      } else if (state === YT_STATE.ENDED) {
        setIsPlaying(false);
        setIsBuffering(false);
        isPlayingRef.current = false;
        stopTicker();
        showControls();
        // Mark as complete if not already fired via the ticker
        if (!completionFiredRef.current) {
          completionFiredRef.current = true;
          actions.completeVideo(module);
          setPhase("complete");
        }
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [showControls, startHideTimer, duration, module],
  );

  const handleError = useCallback(() => {
    stopTicker();
    setPlayerError(true);
    setPhase("poster");
  }, []);

  // ------- init player when phase = "loading" ------------------------------
  useEffect(() => {
    if (phase !== "loading" || !playerDivRef.current) return;

    let destroyed = false;

    ensureYouTubeAPI(() => {
      if (destroyed || !playerDivRef.current) return;
      playerRef.current = new window.YT.Player(playerDivRef.current, {
        videoId,
        playerVars: {
          autoplay: 1,
          controls: 0,
          modestbranding: 1,
          rel: 0,
          iv_load_policy: 3,
          cc_load_policy: 0,
          enablejsapi: 1,
          playsinline: 1,
          origin: window.location.origin,
        },
        events: {
          onReady: handlePlayerReady,
          onStateChange: handleStateChange,
          onError: handleError,
        },
      });
    });

    return () => {
      destroyed = true;
    };
  // handleStateChange is stable for this video/module
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, videoId]);

  // ------- cleanup on unmount ----------------------------------------------
  useEffect(() => {
    return () => {
      stopTicker();
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
      playerRef.current?.destroy();
    };
  }, []);

  // ------- fullscreen -------------------------------------------------------
  useEffect(() => {
    function onFsChange() {
      setIsFullscreen(!!document.fullscreenElement);
    }
    document.addEventListener("fullscreenchange", onFsChange);
    return () => document.removeEventListener("fullscreenchange", onFsChange);
  }, []);

  // ------- keyboard shortcuts (when container is focused) ------------------
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    function onKey(e: KeyboardEvent) {
      if (phase !== "active") return;
      const player = playerRef.current;
      if (!player) return;

      // Only act when focus is within the player container
      if (!container!.contains(document.activeElement)) return;

      switch (e.key) {
        case " ":
        case "k":
          e.preventDefault();
          togglePlay();
          break;
        case "ArrowLeft":
          e.preventDefault();
          seekRelative(-5);
          break;
        case "ArrowRight":
          e.preventDefault();
          seekRelative(5);
          break;
        case "ArrowUp":
          e.preventDefault();
          adjustVolume(5);
          break;
        case "ArrowDown":
          e.preventDefault();
          adjustVolume(-5);
          break;
        case "m":
        case "M":
          e.preventDefault();
          toggleMute();
          break;
        case "f":
        case "F":
          e.preventDefault();
          toggleFullscreen();
          break;
      }
      showControls();
    }

    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  // ------- transport actions -----------------------------------------------
  function togglePlay() {
    const player = playerRef.current;
    if (!player) return;
    if (isPlayingRef.current) {
      player.pauseVideo();
    } else {
      player.playVideo();
    }
  }

  function seek(seconds: number) {
    const player = playerRef.current;
    if (!player) return;
    const clamped = Math.max(0, Math.min(seconds, duration));
    player.seekTo(clamped, true);
    setCurrentTime(clamped);
    showControls();
  }

  function seekRelative(delta: number) {
    seek(currentTime + delta);
  }

  function adjustVolume(delta: number) {
    const player = playerRef.current;
    if (!player) return;
    const next = Math.max(0, Math.min(100, volume + delta));
    player.setVolume(next);
    if (next > 0 && isMuted) {
      player.unMute();
      setIsMuted(false);
    }
    setVolume(next);
  }

  function toggleMute() {
    const player = playerRef.current;
    if (!player) return;
    if (isMuted || player.isMuted()) {
      player.unMute();
      setIsMuted(false);
    } else {
      player.mute();
      setIsMuted(true);
    }
  }

  function setRate(rate: number) {
    playerRef.current?.setPlaybackRate(rate);
    setPlaybackRate(rate);
  }

  function toggleCaptions() {
    const player = playerRef.current;
    if (!player) return;
    if (captionsOn) {
      player.unloadModule("captions");
      setCaptionsOn(false);
    } else {
      player.loadModule("captions");
      setCaptionsOn(true);
    }
  }

  function toggleFullscreen() {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {
        // Fullscreen denied — silently ignore
      });
    } else {
      document.exitFullscreen().catch(() => {});
    }
  }

  // ------- overlay interaction (video surface clicks + hover) ---------------
  function handleOverlayClick() {
    if (phase === "active") togglePlay();
  }

  function handleOverlayMouseMove() {
    showControls();
    if (isPlayingRef.current) startHideTimer();
  }

  function handleOverlayMouseLeave() {
    if (isPlayingRef.current) startHideTimer();
  }

  // ------- derived ---------------------------------------------------------
  const seekPercent = duration > 0 ? (currentTime / duration) * 100 : 0;
  const volPercent = isMuted ? 0 : volume;

  // ------- render ----------------------------------------------------------
  return (
    <figure className="m-0" ref={containerRef}>
      <div
        className="relative aspect-video w-full overflow-hidden rounded-card bg-ink"
        tabIndex={-1}
      >
        {/* ---- Poster frame (phase = poster) ---- */}
        {phase === "poster" && (
          <div className="absolute inset-0 z-10">
            {posterQuality !== "gone" ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={`https://i.ytimg.com/vi/${videoId}/${
                  posterQuality === "maxres" ? "maxresdefault" : "hqdefault"
                }.jpg`}
                alt=""
                className="h-full w-full object-cover opacity-75"
                onError={() =>
                  setPosterQuality((q) =>
                    q === "maxres" ? "hq" : "gone",
                  )
                }
              />
            ) : null}
            <div className="absolute inset-0 flex items-center justify-center bg-ink/40">
              <button
                onClick={() => {
                  setPlayerError(false);
                  setPhase("loading");
                }}
                aria-label="Play lesson"
                className="group flex h-18 w-18 items-center justify-center rounded-full bg-surface/95 text-primary shadow-raised transition-transform duration-200 ease-[var(--ease-out-quint)] hover:scale-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-surface"
              >
                <PlayIcon className="ml-0.5 h-7 w-7" />
              </button>
            </div>
            {playerError && (
              <div className="absolute bottom-4 left-0 right-0 text-center text-sm text-error">
                Video could not be loaded — check your connection and try again.
              </div>
            )}
          </div>
        )}

        {/* ---- YouTube player div (phases: loading, active, complete) ---- */}
        {phase !== "poster" && (
          <div
            ref={playerDivRef}
            id={playerId}
            className="h-full w-full"
          />
        )}

        {/* ---- Buffering spinner ---- */}
        {isBuffering && phase === "active" && (
          <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center">
            <div className="h-10 w-10 animate-spin rounded-full border-2 border-surface/20 border-t-surface/80" />
          </div>
        )}

        {/* ---- Transparent overlay: captures hover + click while playing ---- */}
        {phase === "active" && (
          <div
            className="absolute inset-0 z-10 cursor-pointer"
            onClick={handleOverlayClick}
            onMouseMove={handleOverlayMouseMove}
            onMouseLeave={handleOverlayMouseLeave}
            aria-hidden="true"
          />
        )}

        {/* ---- Custom controls bar ---- */}
        {(phase === "active" || phase === "loading") && (
          <motion.div
            initial={{ opacity: 1 }}
            animate={{ opacity: controlsShown ? 1 : 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute bottom-0 left-0 right-0 z-20 flex flex-col gap-0 bg-gradient-to-t from-ink/80 via-ink/40 to-transparent px-3 pb-3 pt-10"
            onMouseEnter={showControls}
            onMouseLeave={() => {
              if (isPlayingRef.current) startHideTimer();
            }}
          >
            {/* Timeline */}
            <input
              type="range"
              min={0}
              max={100}
              step={0.1}
              value={seekPercent}
              className="video-scrubber mb-2 w-full"
              style={{ "--seek": `${seekPercent}%` } as React.CSSProperties}
              aria-label="Video progress"
              onChange={(e) => seek((Number(e.target.value) / 100) * duration)}
            />

            {/* Buttons row */}
            <div className="flex items-center gap-1">
              {/* Play / Pause */}
              <ControlButton
                onClick={togglePlay}
                aria-label={isPlaying ? "Pause" : "Play"}
                title={isPlaying ? "Pause (k)" : "Play (k)"}
              >
                {isPlaying ? (
                  <PauseIcon className="h-4.5 w-4.5" />
                ) : (
                  <PlayIcon className="h-4.5 w-4.5" />
                )}
              </ControlButton>

              {/* Replay (when ended before completion overlay) */}
              {!isPlaying && currentTime > 0 && phase === "active" && (
                <ControlButton
                  onClick={() => seek(0)}
                  aria-label="Replay from start"
                  title="Replay"
                >
                  <ReplayIcon className="h-4.5 w-4.5" />
                </ControlButton>
              )}

              {/* Volume */}
              <div
                className="group/vol relative flex items-center"
                onMouseEnter={() => setShowVolume(true)}
                onMouseLeave={() => setShowVolume(false)}
              >
                <ControlButton
                  onClick={toggleMute}
                  aria-label={isMuted || volume === 0 ? "Unmute" : "Mute (m)"}
                  title={isMuted || volume === 0 ? "Unmute (m)" : "Mute (m)"}
                >
                  {isMuted || volume === 0 ? (
                    <VolumeMuteIcon className="h-4.5 w-4.5" />
                  ) : (
                    <VolumeHighIcon className="h-4.5 w-4.5" />
                  )}
                </ControlButton>

                <AnimatePresence>
                  {showVolume && (
                    <motion.div
                      initial={{ width: 0, opacity: 0 }}
                      animate={{ width: 68, opacity: 1 }}
                      exit={{ width: 0, opacity: 0 }}
                      transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
                      className="overflow-hidden"
                    >
                      <input
                        type="range"
                        min={0}
                        max={100}
                        step={1}
                        value={volPercent}
                        className="volume-slider mx-2 w-16"
                        style={{ "--seek": `${volPercent}%` } as React.CSSProperties}
                        aria-label="Volume"
                        onChange={(e) => {
                          const v = Number(e.target.value);
                          playerRef.current?.setVolume(v);
                          setVolume(v);
                          if (v > 0 && isMuted) {
                            playerRef.current?.unMute();
                            setIsMuted(false);
                          }
                          if (v === 0) {
                            playerRef.current?.mute();
                            setIsMuted(true);
                          }
                        }}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Time */}
              <span className="numeric ml-1 shrink-0 select-none text-xs tabular-nums text-surface/80">
                {formatClock(Math.floor(currentTime))}
                <span className="mx-0.5 text-surface/40">/</span>
                {formatClock(Math.floor(duration))}
              </span>

              {/* Spacer */}
              <div className="flex-1" />

              {/* Playback speed */}
              <div className="relative">
                <SpeedMenu
                  currentRate={playbackRate}
                  rates={PLAYBACK_RATES}
                  onSelect={setRate}
                />
              </div>

              {/* Captions */}
              <ControlButton
                onClick={toggleCaptions}
                aria-label={captionsOn ? "Turn off captions" : "Turn on captions"}
                aria-pressed={captionsOn}
                title="Captions (YouTube track)"
                active={captionsOn}
              >
                <CaptionsIcon className="h-4.5 w-4.5" />
              </ControlButton>

              {/* Fullscreen */}
              <ControlButton
                onClick={toggleFullscreen}
                aria-label={isFullscreen ? "Exit fullscreen (f)" : "Enter fullscreen (f)"}
                title={isFullscreen ? "Exit fullscreen (f)" : "Fullscreen (f)"}
              >
                {isFullscreen ? (
                  <FullscreenExitIcon className="h-4.5 w-4.5" />
                ) : (
                  <FullscreenEnterIcon className="h-4.5 w-4.5" />
                )}
              </ControlButton>
            </div>
          </motion.div>
        )}

        {/* ---- Loading overlay ---- */}
        {phase === "loading" && (
          <div className="absolute inset-0 z-30 flex items-center justify-center bg-ink/60">
            <div className="h-10 w-10 animate-spin rounded-full border-2 border-surface/20 border-t-surface/80" />
          </div>
        )}

        {/* ---- Video completion overlay ---- */}
        <AnimatePresence>
          {phase === "complete" && (
            <VideoCompletion
              module={module}
              courseId={courseId}
              nextModuleId={nextModuleId}
              onWatchAgain={() => {
                seek(0);
                setPhase("active");
                completionFiredRef.current = true; // don't re-fire
                setTimeout(() => playerRef.current?.playVideo(), 100);
              }}
            />
          )}
        </AnimatePresence>
      </div>

      {/* Caption caveat — brief known constraint */}
      {captionsOn && (
        <p className="mt-1.5 text-xs text-muted">
          Captions are YouTube&apos;s native track and cannot be restyled to match
          the app typography.
        </p>
      )}
    </figure>
  );
}

/* -------------------------------------------------------------------------
 * Sub-components
 * ---------------------------------------------------------------------- */

function ControlButton({
  children,
  onClick,
  active = false,
  title,
  ...props
}: {
  children: React.ReactNode;
  onClick: () => void;
  active?: boolean;
  title?: string;
  "aria-label"?: string;
  "aria-pressed"?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={[
        "flex h-8 w-8 items-center justify-center rounded-[6px] transition-colors",
        "focus-visible:outline focus-visible:outline-2 focus-visible:outline-surface",
        active
          ? "bg-primary/70 text-surface hover:bg-primary"
          : "text-surface/75 hover:bg-surface/15 hover:text-surface",
      ].join(" ")}
      {...props}
    >
      {children}
    </button>
  );
}

function SpeedMenu({
  currentRate,
  rates,
  onSelect,
}: {
  currentRate: number;
  rates: readonly number[];
  onSelect: (rate: number) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label={`Playback speed: ${currentRate}×`}
        aria-expanded={open}
        className="numeric flex h-8 min-w-[2.5rem] items-center justify-center rounded-[6px] px-1.5 text-xs font-medium text-surface/75 transition-colors hover:bg-surface/15 hover:text-surface focus-visible:outline focus-visible:outline-2 focus-visible:outline-surface"
      >
        {currentRate === 1 ? "1×" : `${currentRate}×`}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.95 }}
            transition={{ duration: 0.15, ease: [0.22, 1, 0.36, 1] }}
            className="absolute bottom-full right-0 mb-1.5 flex flex-col overflow-hidden rounded-[8px] bg-ink/90 py-1 shadow-raised backdrop-blur-md"
            role="menu"
          >
            {rates.map((rate) => (
              <button
                key={rate}
                type="button"
                role="menuitem"
                onClick={() => {
                  onSelect(rate);
                  setOpen(false);
                }}
                className={[
                  "numeric flex items-center justify-center px-5 py-1.5 text-xs transition-colors",
                  rate === currentRate
                    ? "bg-primary/60 font-semibold text-surface"
                    : "text-surface/75 hover:bg-surface/15 hover:text-surface",
                ].join(" ")}
              >
                {rate === 1 ? "Normal" : `${rate}×`}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function VideoUnavailableState() {
  return (
    <div className="flex aspect-video w-full flex-col items-center justify-center gap-3 rounded-card border border-dashed border-border-strong bg-sunken p-8 text-center">
      <AlertIcon className="h-6 w-6 text-muted" />
      <p className="text-sm font-medium text-ink">
        This lesson&apos;s video is unavailable.
      </p>
      <p className="max-w-sm text-sm text-muted">
        The module&apos;s video link could not be resolved. The assessment for this
        module is still available below.
      </p>
    </div>
  );
}
