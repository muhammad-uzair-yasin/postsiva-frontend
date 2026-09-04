"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ReactElement,
} from "react";
import { createPortal } from "react-dom";

import { useTranslations } from "@/lib/i18n/WorkspaceLocaleProvider";
import type { UnifiedInboxMessage } from "@/lib/inbox/unifiedInboxTypes";

interface SocialInboxCommentScoreProps {
  readonly comments: readonly UnifiedInboxMessage[];
}

interface ScoreMetric {
  readonly key: string;
  readonly label: string;
  readonly value: number;
}

function clampPercent(value: number): number {
  if (!Number.isFinite(value)) {
    return 0;
  }
  return Math.max(0, Math.min(100, Math.round(value)));
}

function calculateScore(comments: readonly UnifiedInboxMessage[]): {
  score: number;
  status: string;
  metrics: readonly ScoreMetric[];
} {
  const total = comments.length;
  if (total === 0) {
    return {
      score: 0,
      status: "inbox.commentScoreStatusNoData",
      metrics: [
        { key: "response", label: "inbox.commentScoreResponseRate", value: 0 },
        { key: "attention", label: "inbox.commentScoreAttentionCleared", value: 0 },
        { key: "consistency", label: "inbox.commentScoreConsistency", value: 0 },
      ],
    };
  }

  const replied = comments.filter(
    (comment) =>
      !comment.unreplied || (comment.threadReplyCount ?? 0) > 0,
  ).length;
  const attentionCleared = comments.filter((comment) => !comment.unreplied).length;
  const posts = new Map<string, { total: number; handled: number }>();
  for (const comment of comments) {
    const postId = comment.sourcePostId ?? comment.contextLabel;
    const current = posts.get(postId) ?? { total: 0, handled: 0 };
    current.total += 1;
    if (!comment.unreplied) {
      current.handled += 1;
    }
    posts.set(postId, current);
  }
  const handledPosts = Array.from(posts.values()).filter(
    (post) => post.total > 0 && post.handled > 0,
  ).length;

  const responseRate = clampPercent((replied / total) * 100);
  const attentionRate = clampPercent((attentionCleared / total) * 100);
  const consistency = clampPercent((handledPosts / Math.max(posts.size, 1)) * 100);
  const score = clampPercent((responseRate + attentionRate + consistency) / 3);
  const status =
    score >= 80
      ? "inbox.commentScoreStatusStrong"
      : score >= 50
        ? "inbox.commentScoreStatusRegular"
        : "inbox.commentScoreStatusNeedsWork";

  return {
    score,
    status,
    metrics: [
      { key: "response", label: "inbox.commentScoreResponseRate", value: responseRate },
      { key: "attention", label: "inbox.commentScoreAttentionCleared", value: attentionRate },
      { key: "consistency", label: "inbox.commentScoreConsistency", value: consistency },
    ],
  };
}

const SCORE_REVEAL_DELAY_MS = 120;
const SCORE_REVEAL_DURATION_MS = 1400;

function easeOutQuint(t: number): number {
  return 1 - Math.pow(1 - t, 5);
}

/** 0→1 after open, drives ring, bars, and counted numbers. */
function useScoreRevealProgress(open: boolean): number {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!open) {
      setProgress(0);
      return;
    }
    const reduceMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) {
      setProgress(1);
      return;
    }
    let rafId = 0;
    let delayId = 0;
    delayId = window.setTimeout(() => {
      let start: number | null = null;
      const tick = (ts: number): void => {
        if (start === null) {
          start = ts;
        }
        const elapsed = ts - start;
        const t = Math.min(1, elapsed / SCORE_REVEAL_DURATION_MS);
        setProgress(easeOutQuint(t));
        if (t < 1) {
          rafId = window.requestAnimationFrame(tick);
        }
      };
      rafId = window.requestAnimationFrame(tick);
    }, SCORE_REVEAL_DELAY_MS);
    return () => {
      window.clearTimeout(delayId);
      window.cancelAnimationFrame(rafId);
      setProgress(0);
    };
  }, [open]);

  return progress;
}

export function SocialInboxCommentScore({
  comments,
}: SocialInboxCommentScoreProps): ReactElement {
  const { t } = useTranslations();
  const [open, setOpen] = useState(false);
  const [popoverStyle, setPopoverStyle] = useState<CSSProperties>({});
  const [arrowLeftPx, setArrowLeftPx] = useState(40);
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const popoverRef = useRef<HTMLDivElement | null>(null);
  const score = useMemo(() => calculateScore(comments), [comments]);
  const revealProgress = useScoreRevealProgress(open);
  const displayedScore = Math.round(score.score * revealProgress);
  const ringStyle = {
    background: `conic-gradient(var(--color-primary) ${displayedScore * 3.6}deg, color-mix(in srgb, var(--color-primary) 18%, transparent) 0deg)`,
  };

  useEffect(() => {
    if (!open) {
      return;
    }
    const closeOnOutside = (event: MouseEvent) => {
      const target = event.target;
      if (!(target instanceof Node)) {
        return;
      }
      if (
        buttonRef.current?.contains(target) ||
        popoverRef.current?.contains(target)
      ) {
        return;
      }
      setOpen(false);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", closeOnOutside);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("mousedown", closeOnOutside);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [open]);
  const updatePopoverPosition = useCallback((): void => {
    const rect = buttonRef.current?.getBoundingClientRect();
    if (!rect) {
      return;
    }
    const width = Math.min(window.innerWidth - 32, 650);
    const anchorCenterX = rect.left + rect.width / 2;
    const left = Math.min(
      Math.max(16, anchorCenterX - width / 2),
      window.innerWidth - width - 16,
    );
    const arrowHalf = 8;
    const rawArrow = anchorCenterX - left - arrowHalf;
    const arrowLeft = Math.max(16, Math.min(width - 32, rawArrow));
    setPopoverStyle({
      left,
      top: rect.bottom + 12,
      width,
    });
    setArrowLeftPx(arrowLeft);
  }, []);

  useLayoutEffect(() => {
    if (!open) {
      return;
    }
    updatePopoverPosition();
    const onReposition = (): void => {
      updatePopoverPosition();
    };
    window.addEventListener("resize", onReposition);
    window.addEventListener("scroll", onReposition, true);
    return () => {
      window.removeEventListener("resize", onReposition);
      window.removeEventListener("scroll", onReposition, true);
    };
  }, [open, updatePopoverPosition]);

  const openPopover = () => {
    if (!open) {
      updatePopoverPosition();
    }
    setOpen((value) => !value);
  };

  return (
    <div className="relative inline-flex">
      <button
        ref={buttonRef}
        type="button"
        className="inline-flex h-11 w-11 items-center justify-center rounded-full border-2 border-primary/55 bg-primary/10 text-sm font-extrabold text-primary shadow-sm transition-colors hover:bg-primary/15"
        aria-expanded={open}
        aria-label={t("inbox.commentScoreTitle")}
        onClick={openPopover}
      >
        {score.score}
      </button>
      {open
        ? createPortal(
        <div
          ref={popoverRef}
          className="fixed z-[120] rounded-2xl border border-outline-variant/20 bg-surface-container-high p-5 text-on-surface shadow-2xl"
          style={popoverStyle}
        >
          <div
            className="absolute -top-2 h-4 w-4 rotate-45 border-l border-t border-outline-variant/20 bg-surface-container-high"
            style={{ left: arrowLeftPx }}
          />
          <h2 className="text-xl font-bold">{t("inbox.commentScoreTitle")}</h2>
          <p className="mt-1 text-sm text-on-surface-variant">
            {t("inbox.commentScoreSubtitle")}
          </p>
          <div className="my-4 h-px bg-outline-variant/15" />
          <div className="grid gap-6 sm:grid-cols-[240px_1fr] sm:items-center">
            <div className="flex flex-col items-center">
              <span className="mb-4 rounded-full bg-primary/12 px-4 py-2 text-sm font-extrabold text-primary">
                {t(score.status)}
              </span>
              <div
                className="flex h-36 w-36 items-center justify-center rounded-full p-4"
                style={ringStyle}
              >
                <div className="flex h-full w-full flex-col items-center justify-center rounded-full bg-surface text-primary">
                  <span className="text-4xl font-extrabold tabular-nums">{displayedScore}</span>
                  <span className="text-sm font-bold text-on-surface-variant">/100</span>
                </div>
              </div>
            </div>
            <div className="space-y-5">
              {score.metrics.map((metric) => {
                const displayedMetric = Math.round(metric.value * revealProgress);
                return (
                <div key={metric.key}>
                  <div className="mb-2 flex items-center justify-between gap-3 text-sm font-bold">
                    <span>{t(metric.label)}</span>
                    <span className="tabular-nums">{displayedMetric}%</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-outline-variant/15">
                    <div
                      className="h-full rounded-full bg-primary"
                      style={{ width: `${displayedMetric}%` }}
                    />
                  </div>
                </div>
              );
              })}
              <details className="pt-1 text-sm text-on-surface-variant">
                <summary className="cursor-pointer font-medium">
                  {t("inbox.commentScoreHow")}
                </summary>
                <p className="mt-2 leading-relaxed">
                  {t("inbox.commentScoreHowBody")}
                </p>
              </details>
            </div>
          </div>
        </div>,
        document.body,
      )
        : null}
    </div>
  );
}
