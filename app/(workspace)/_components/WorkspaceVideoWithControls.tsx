"use client";

import {
  useCallback,
  useRef,
  useState,
  type KeyboardEvent,
  type MouseEvent,
  type ReactElement,
  type SyntheticEvent,
} from "react";

import { useTranslations } from "@/lib/i18n/WorkspaceLocaleProvider";
import { formatVideoTimestamp } from "@/lib/ui/formatVideoTimestamp";

export type WorkspaceVideoControlsSize = "compact" | "preview" | "card";

interface WorkspaceVideoWithControlsProps {
  readonly src: string;
  readonly className?: string;
  readonly size?: WorkspaceVideoControlsSize;
  readonly objectFit?: "cover" | "contain";
}

function stopBubble(event: MouseEvent | KeyboardEvent | SyntheticEvent): void {
  event.stopPropagation();
}

const SIZE = {
  compact: {
    bar: "gap-1 px-1.5 py-1",
    btn: "h-6 w-6",
    icon: "text-base",
    time: "text-[9px] min-w-[4.5rem]",
    range: "h-1",
    centerPlay: "h-9 w-9",
    centerIcon: "text-2xl",
  },
  card: {
    bar: "gap-1.5 px-2 py-1.5",
    btn: "h-7 w-7",
    icon: "text-lg",
    time: "text-[10px] min-w-[5.25rem]",
    range: "h-1.5",
    centerPlay: "h-11 w-11",
    centerIcon: "text-3xl",
  },
  preview: {
    bar: "gap-2 px-2.5 py-2",
    btn: "h-8 w-8",
    icon: "text-xl",
    time: "text-xs min-w-[5.75rem]",
    range: "h-1.5",
    centerPlay: "h-14 w-14",
    centerIcon: "text-3xl",
  },
} as const;

export function WorkspaceVideoWithControls({
  src,
  className = "",
  size = "card",
  objectFit = "cover",
}: WorkspaceVideoWithControlsProps): ReactElement {
  const { t } = useTranslations();
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [muted, setMuted] = useState(true);
  const [seeking, setSeeking] = useState(false);
  const tokens = SIZE[size];

  const togglePlay = useCallback(() => {
    const el = videoRef.current;
    if (!el) {
      return;
    }
    if (el.paused) {
      void el.play().catch(() => {
        /* autoplay policy */
      });
    } else {
      el.pause();
    }
  }, []);

  const stop = useCallback(() => {
    const el = videoRef.current;
    if (!el) {
      return;
    }
    el.pause();
    el.currentTime = 0;
    setCurrentTime(0);
  }, []);

  const toggleMute = useCallback(() => {
    const el = videoRef.current;
    if (!el) {
      return;
    }
    el.muted = !el.muted;
    setMuted(el.muted);
  }, []);

  const toggleFullscreen = useCallback(() => {
    const node = containerRef.current;
    if (!node) {
      return;
    }
    if (document.fullscreenElement) {
      void document.exitFullscreen();
    } else {
      void node.requestFullscreen().catch(() => {
        /* unsupported */
      });
    }
  }, []);

  const showCenterPlay = !playing && currentTime < 0.05;

  const fitClass =
    objectFit === "contain"
      ? "max-h-full max-w-full object-contain"
      : "h-full w-full object-cover";

  const containerClass =
    objectFit === "contain"
      ? "group/video relative flex max-h-full max-w-full items-center justify-center overflow-hidden bg-black"
      : "group/video relative h-full w-full overflow-hidden bg-black";

  return (
    <div
      ref={containerRef}
      className={`${containerClass} ${className}`}
      onClick={stopBubble}
      onKeyDown={stopBubble}
      role="presentation"
    >
      <video
        ref={videoRef}
        src={src}
        className={fitClass}
        playsInline
        preload="metadata"
        muted={muted}
        onPlay={() => {
          setPlaying(true);
        }}
        onPause={() => {
          setPlaying(false);
        }}
        onEnded={() => {
          setPlaying(false);
        }}
        onLoadedMetadata={(event) => {
          const el = event.currentTarget;
          setDuration(Number.isFinite(el.duration) ? el.duration : 0);
          setMuted(el.muted);
        }}
        onTimeUpdate={(event) => {
          if (seeking) {
            return;
          }
          setCurrentTime(event.currentTarget.currentTime);
        }}
      />

      {showCenterPlay ? (
        <div className="absolute inset-0 flex items-center justify-center bg-black/25">
          <button
            type="button"
            aria-label={t("postScheduler.video.play")}
            onClick={(event) => {
              stopBubble(event);
              togglePlay();
            }}
            className={`flex items-center justify-center rounded-full bg-white/95 text-black shadow-lg ${tokens.centerPlay}`}
          >
            <span className={`material-symbols-outlined leading-none ${tokens.centerIcon}`}>
              play_arrow
            </span>
          </button>
        </div>
      ) : null}

      <div
        className={`absolute inset-x-0 bottom-0 flex items-center bg-gradient-to-t from-black/85 via-black/55 to-transparent ${tokens.bar}`}
      >
        <button
          type="button"
          aria-label={playing ? t("postScheduler.video.pause") : t("postScheduler.video.play")}
          onClick={(event) => {
            stopBubble(event);
            togglePlay();
          }}
          className={`flex shrink-0 items-center justify-center rounded-md text-white hover:bg-white/15 ${tokens.btn}`}
        >
          <span className={`material-symbols-outlined leading-none ${tokens.icon}`}>
            {playing ? "pause" : "play_arrow"}
          </span>
        </button>

        <input
          type="range"
          min={0}
          max={duration > 0 ? duration : 100}
          step={0.1}
          value={Math.min(currentTime, duration || currentTime)}
          aria-label={t("postScheduler.video.seek")}
          aria-valuetext={`${formatVideoTimestamp(currentTime)} / ${formatVideoTimestamp(duration)}`}
          onPointerDown={(event) => {
            stopBubble(event);
            setSeeking(true);
          }}
          onClick={stopBubble}
          onChange={(event) => {
            const next = Number(event.target.value);
            const el = videoRef.current;
            if (!el) {
              return;
            }
            el.currentTime = next;
            setCurrentTime(next);
          }}
          onPointerUp={() => {
            setSeeking(false);
          }}
          onPointerCancel={() => {
            setSeeking(false);
          }}
          className={`min-w-0 flex-1 cursor-pointer accent-white ${tokens.range}`}
        />

        <span
          className={`shrink-0 tabular-nums text-white/90 ${tokens.time}`}
          aria-hidden
        >
          {formatVideoTimestamp(currentTime)} / {formatVideoTimestamp(duration)}
        </span>

        <button
          type="button"
          aria-label={muted ? t("postScheduler.video.unmute") : t("postScheduler.video.mute")}
          onClick={(event) => {
            stopBubble(event);
            toggleMute();
          }}
          className={`flex shrink-0 items-center justify-center rounded-md text-white hover:bg-white/15 ${tokens.btn}`}
        >
          <span className={`material-symbols-outlined leading-none ${tokens.icon}`}>
            {muted ? "volume_off" : "volume_up"}
          </span>
        </button>

        {size !== "compact" ? (
          <button
            type="button"
            aria-label={t("postScheduler.video.fullscreen")}
            onClick={(event) => {
              stopBubble(event);
              toggleFullscreen();
            }}
            className={`flex shrink-0 items-center justify-center rounded-md text-white hover:bg-white/15 ${tokens.btn}`}
          >
            <span className={`material-symbols-outlined leading-none ${tokens.icon}`}>
              fullscreen
            </span>
          </button>
        ) : null}

        <button
          type="button"
          aria-label={t("postScheduler.video.stop")}
          onClick={(event) => {
            stopBubble(event);
            stop();
          }}
          className={`flex shrink-0 items-center justify-center rounded-md text-white hover:bg-white/15 ${tokens.btn}`}
        >
          <span className={`material-symbols-outlined leading-none ${tokens.icon}`}>
            stop
          </span>
        </button>
      </div>
    </div>
  );
}
