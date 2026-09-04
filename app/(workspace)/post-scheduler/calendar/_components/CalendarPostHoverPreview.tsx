"use client";

import { useMemo, type ReactElement, type ReactPortal } from "react";
import { createPortal } from "react-dom";

import { useTranslations } from "@/lib/i18n/WorkspaceLocaleProvider";
import { cn } from "@/lib/cn";
import { SocialPlatformIcon } from "@/lib/social/SocialPlatformIcon";
import { isSocialPlatformIconId } from "@/lib/social/socialPlatformIconSrc";

import { useWorkspaceHeaderAccounts } from "../../../_components/WorkspaceHeaderAccountsProvider";
import {
  partsFromHtml,
  type ArticlePart,
} from "../../../wordpress/blogs/_components/wordpressArticleParts";
import type { CalendarPost } from "../_types/calendarTypes";
import { resolveCalendarPostAccountDisplay } from "../_utils/resolveCalendarPostAccount";
import { WorkspaceVideoWithControls } from "../../../_components/WorkspaceVideoWithControls";

function actionIcons(platform: string): readonly string[] {
  if (platform === "linkedin") return ["thumb_up", "comment", "repeat", "send"];
  if (platform === "youtube") return ["thumb_up", "thumb_down", "share"];
  if (platform === "tiktok") return ["favorite", "chat_bubble", "bookmark", "share"];
  if (platform === "facebook") return ["thumb_up", "chat_bubble", "share"];
  if (platform === "x") return ["chat_bubble", "repeat", "favorite", "bar_chart"];
  if (platform === "threads") return ["favorite", "chat_bubble", "repeat", "send"];
  if (platform === "bluesky") return ["chat_bubble", "repeat", "favorite"];
  if (platform === "pinterest") return ["favorite", "share"];
  if (platform === "snapchat") return ["chat_bubble", "share"];
  return ["favorite", "chat_bubble", "send", "bookmark"];
}

function renderWordPressPart(part: ArticlePart, index: number): ReactElement {
  if (part.kind === "heading") {
    return (
      <h2 key={index} className="pt-2 text-base font-bold leading-snug text-on-surface">
        {part.value}
      </h2>
    );
  }
  if (part.kind === "subheading") {
    return (
      <h3 key={index} className="pt-1.5 text-sm font-bold leading-snug text-on-surface">
        {part.value}
      </h3>
    );
  }
  if (part.kind === "image") {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- scheduled preview URL
      <img
        key={index}
        src={part.value}
        alt=""
        className="mt-2 aspect-[16/10] w-full rounded-lg object-cover ring-1 ring-outline-variant/15"
      />
    );
  }
  if (part.kind === "video") {
    return (
      <WorkspaceVideoWithControls
        key={index}
        src={part.value}
        size="card"
        objectFit="contain"
        className="mt-2 aspect-video w-full rounded-lg ring-1 ring-outline-variant/15"
      />
    );
  }
  return (
    <p key={index} className="text-sm leading-relaxed text-on-surface-variant">
      {part.value}
    </p>
  );
}

function PreviewCountdownBar({
  durationMs,
  resetKey,
}: {
  readonly durationMs: number;
  readonly resetKey: number;
}): ReactElement {
  return (
    <div
      className="h-1 shrink-0 bg-outline-variant/20"
      aria-hidden={false}
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={0}
      aria-label="Preview closing"
    >
      <div
        key={resetKey}
        className="inbox-post-preview-countdown-bar h-full bg-secondary"
        style={{ animationDuration: `${durationMs}ms` }}
      />
    </div>
  );
}

function rightPanelShell(
  open: boolean,
  children: React.ReactNode,
  options?: {
    readonly interactive?: boolean;
    readonly onClose?: () => void;
    readonly onMouseEnter?: () => void;
    readonly onMouseLeave?: () => void;
    readonly countdownDurationMs?: number;
    readonly countdownResetKey?: number;
    readonly placement?: "fixed" | "inline";
  },
): ReactPortal | ReactElement {
  const interactive = options?.interactive === true && open;
  const placement = options?.placement ?? "fixed";
  const showCountdown =
    placement === "fixed" &&
    open &&
    typeof options?.countdownDurationMs === "number" &&
    options.countdownDurationMs > 0 &&
    typeof options.countdownResetKey === "number";
  const shell = (
    <aside
      aria-hidden={!open}
      onMouseEnter={options?.onMouseEnter}
      onMouseLeave={options?.onMouseLeave}
      className={cn(
        "z-[140] flex flex-col overflow-y-auto overflow-x-hidden rounded-xl border border-outline-variant/25 bg-surface-container-lowest shadow-[0_16px_48px_rgba(0,0,0,0.45)]",
        interactive ? "pointer-events-auto" : "pointer-events-none",
        placement === "inline"
          ? "absolute bottom-full left-0 max-h-[24vh] min-h-0 w-full"
          : "fixed right-3 bottom-3 h-auto max-h-[30vh] min-h-0 w-[min(400px,calc(100vw-1.25rem))] transition-all duration-300 ease-out sm:right-4 sm:bottom-4",
        open ? "opacity-100" : "opacity-0",
        placement === "fixed" && !open ? "translate-x-2 translate-y-6" : "",
      )}
    >
      {showCountdown ? (
        <PreviewCountdownBar
          durationMs={options.countdownDurationMs as number}
          resetKey={options.countdownResetKey as number}
        />
      ) : null}
      {children}
    </aside>
  );

  if (placement === "inline") {
    return shell;
  }
  return createPortal(shell, document.body);
}

function MetricPill({
  label,
  value,
}: {
  readonly label: string;
  readonly value: string;
}): ReactElement {
  return (
    <div className="rounded-lg bg-surface-container px-1.5 py-1.5 text-center">
      <p className="truncate text-[8px] font-bold uppercase tracking-wide text-on-surface-variant">
        {label}
      </p>
      <p className="mt-0.5 text-xs font-bold text-on-surface">{value}</p>
    </div>
  );
}

function CalendarWordPressHoverPreview({
  post,
  open,
  siteName,
  platformLabel,
  whenLabel,
  statusLabel,
  shellOptions,
}: {
  post: CalendarPost;
  open: boolean;
  siteName: string;
  platformLabel: string;
  whenLabel: string;
  statusLabel: string;
  shellOptions?: {
    readonly interactive?: boolean;
    readonly onClose?: () => void;
    readonly onMouseEnter?: () => void;
    readonly onMouseLeave?: () => void;
    readonly placement?: "fixed" | "inline";
  };
}): ReactPortal | ReactElement | null {
  const contentHtml = post.wordpressContent?.trim() ?? "";
  const parts = useMemo(() => partsFromHtml(contentHtml), [contentHtml]);

  if (typeof document === "undefined") return null;

  const title = post.wordpressTitle?.trim() || post.caption || "Blog post";
  const excerpt = post.wordpressExcerpt?.trim();

  return rightPanelShell(
    open,
    <>
      <div className="flex items-center justify-between gap-3 border-b border-outline-variant/15 bg-surface-container px-4 py-3">
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <SocialPlatformIcon platform="wordpress" className="h-9 w-9 shrink-0 rounded-lg" alt="" />
          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-on-surface">{siteName}</p>
            <p className="text-[11px] font-medium capitalize text-on-surface-variant">
              {platformLabel}
            </p>
          </div>
        </div>
        <div className="flex shrink-0 items-start gap-2">
          <div className="text-right">
            <p className="text-[10px] font-bold uppercase text-primary">{statusLabel}</p>
            <p className="text-[11px] font-semibold text-on-surface-variant">{whenLabel}</p>
          </div>
        </div>
      </div>

      {post.mediaUrl && post.mediaKind !== "video" ? (
        // eslint-disable-next-line @next/next/no-img-element -- featured image
        <img
          src={post.mediaUrl}
          alt=""
          className="max-h-[12vh] w-full shrink-0 object-contain object-center bg-black/80"
        />
      ) : null}

      {post.metrics ? (
        <div className="grid shrink-0 grid-cols-3 gap-2 border-b border-outline-variant/10 px-4 py-3">
          <MetricPill label="Likes" value={post.metrics.likes} />
          <MetricPill label="Comments" value={post.metrics.comments} />
          <MetricPill label="Reach" value={post.metrics.reach} />
        </div>
      ) : null}

      <div className="min-h-0 shrink overflow-y-auto px-4 py-3">
        <h1 className="font-serif text-xl font-bold leading-tight text-on-surface">{title}</h1>
        {excerpt ? (
          <p className="mt-3 border-l-4 border-primary pl-3 text-sm leading-relaxed text-on-surface-variant">
            {excerpt}
          </p>
        ) : null}
        <div className="mt-4 space-y-3">
          {parts.length > 0
            ? parts.map((part, index) => renderWordPressPart(part, index))
            : (
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-on-surface">
                {post.previewText || post.caption}
              </p>
            )}
        </div>
      </div>
    </>,
    shellOptions,
  );
}

export function CalendarPostHoverPreview({
  post,
  open,
  interactive = false,
  onClose,
  onPanelMouseEnter,
  onPanelMouseLeave,
  autoCloseDurationMs,
  autoCloseResetKey,
  placement = "fixed",
}: {
  post: CalendarPost;
  open: boolean;
  /** Inbox: allow moving pointer onto panel + close button. */
  interactive?: boolean;
  onClose?: () => void;
  onPanelMouseEnter?: () => void;
  onPanelMouseLeave?: () => void;
  /** Inbox: shrinking top bar duration (ms). */
  autoCloseDurationMs?: number;
  autoCloseResetKey?: number;
  placement?: "fixed" | "inline";
}): ReactPortal | ReactElement | null {
  const { t } = useTranslations();
  const { accounts, selectedAccount } = useWorkspaceHeaderAccounts();
  if (typeof document === "undefined") return null;

  const platform = isSocialPlatformIconId(post.platform) ? post.platform : "instagram";
  const isWordPress = post.platform?.trim().toLowerCase() === "wordpress";
  const { name: accountName, avatarUrl } = resolveCalendarPostAccountDisplay(
    {
      platform: post.platform,
      account: post.account,
      platformUserId: post.platformUserId ?? post.source?.platform_user_id,
    },
    accounts,
    selectedAccount,
  );
  const whenLabel = post.scheduledAt.toLocaleString([], {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
  const statusLabel =
    post.postKind === "published"
      ? t("postScheduler.published.title")
      : t("postScheduler.calendar.badgeScheduled");

  const shellOptions =
    interactive ||
    onClose ||
    onPanelMouseEnter ||
    onPanelMouseLeave ||
    autoCloseDurationMs ||
    placement !== "fixed"
      ? {
          interactive,
          onClose,
          onMouseEnter: onPanelMouseEnter,
          onMouseLeave: onPanelMouseLeave,
          countdownDurationMs: autoCloseDurationMs,
          countdownResetKey: autoCloseResetKey,
          placement,
        }
      : undefined;
  if (isWordPress) {
    return (
      <CalendarWordPressHoverPreview
        post={post}
        open={open}
        siteName={accountName}
        platformLabel={platform}
        whenLabel={whenLabel}
        statusLabel={statusLabel}
        shellOptions={shellOptions}
      />
    );
  }

  return rightPanelShell(
    open,
    <>
      <div className="flex items-center gap-2 border-b border-outline-variant/15 bg-surface-container px-2 py-2">
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt=""
            className="h-8 w-8 shrink-0 rounded-full object-cover"
          />
        ) : (
          <SocialPlatformIcon platform={platform} className="h-8 w-8 shrink-0 rounded-lg" alt="" />
        )}
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs font-bold text-on-surface">{accountName}</p>
          <p className="text-[11px] font-medium capitalize text-on-surface-variant">
            {platform}
          </p>
        </div>
        <div className="flex shrink-0 items-start gap-2">
          <div className="text-right">
            <p className="text-[9px] font-bold uppercase text-primary">{statusLabel}</p>
            <p className="text-[10px] font-semibold text-on-surface-variant">{whenLabel}</p>
          </div>
        </div>
      </div>

      {post.mediaUrl ? (
        <div className="relative flex w-full shrink-0 items-center justify-center bg-black/85 px-2 py-1">
          {post.mediaKind === "video" ? (
            <WorkspaceVideoWithControls
              src={post.mediaUrl}
              size="card"
              objectFit="contain"
              className="max-h-[7vh] w-full"
            />
          ) : (
            <img
              src={post.mediaUrl}
              alt=""
              className="max-h-[7vh] w-full object-contain"
            />
          )}
        </div>
      ) : null}

      {post.metrics ? (
        <div className="grid shrink-0 grid-cols-3 gap-1 border-b border-outline-variant/10 px-2 py-2">
          <MetricPill label={t("dashboard.metricLikes")} value={post.metrics.likes} />
          <MetricPill label={t("dashboard.metricComments")} value={post.metrics.comments} />
          <MetricPill label={t("dashboard.metricReach")} value={post.metrics.reach} />
        </div>
      ) : (
        <div className="flex shrink-0 items-center gap-3 border-b border-outline-variant/10 px-3 py-2.5 text-on-surface-variant">
          {actionIcons(post.platform).map((icon) => (
            <span key={icon} className="material-symbols-outlined text-xl">
              {icon}
            </span>
          ))}
        </div>
      )}

      <div className="min-h-0 shrink overflow-y-auto px-2 py-2">
        <p className="whitespace-pre-wrap text-[11px] leading-snug text-on-surface">
          {post.previewText || post.caption || t("postScheduler.calendar.untitledPost")}
        </p>
      </div>
    </>,
    shellOptions,
  );
}
