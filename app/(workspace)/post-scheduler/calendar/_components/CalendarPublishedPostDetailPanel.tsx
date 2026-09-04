"use client";

import { useEffect, type ReactElement } from "react";
import { createPortal } from "react-dom";

import { useTranslations } from "@/lib/i18n/WorkspaceLocaleProvider";
import { SocialPlatformIcon } from "@/lib/social/SocialPlatformIcon";
import { isSocialPlatformIconId } from "@/lib/social/socialPlatformIconSrc";

import { useWorkspaceHeaderAccounts } from "../../../_components/WorkspaceHeaderAccountsProvider";
import type { CalendarPost } from "../_types/calendarTypes";
import { resolveCalendarPostAccountDisplay } from "../_utils/resolveCalendarPostAccount";

interface CalendarPublishedPostDetailPanelProps {
  readonly post: CalendarPost;
  readonly open: boolean;
  readonly onClose: () => void;
}

function formatPublishedWhen(at: Date, locale: string): string {
  return at.toLocaleString(locale, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

function MetricCell({
  icon,
  label,
  value,
}: {
  readonly icon: string;
  readonly label: string;
  readonly value: string;
}): ReactElement {
  return (
    <div className="flex flex-1 flex-col items-center gap-1 py-2 text-center">
      <span className="material-symbols-outlined text-[18px] text-on-surface-variant">{icon}</span>
      <span className="text-sm font-bold text-on-surface">{value}</span>
      <span className="text-[10px] font-semibold text-on-surface-variant">{label}</span>
    </div>
  );
}

export function CalendarPublishedPostDetailPanel({
  post,
  open,
  onClose,
}: CalendarPublishedPostDetailPanelProps): ReactElement | null {
  const { t, locale } = useTranslations();
  const { accounts, selectedAccount } = useWorkspaceHeaderAccounts();

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent): void => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!open || typeof document === "undefined") return null;

  const platform = isSocialPlatformIconId(post.platform) ? post.platform : "instagram";
  const { name: accountName, avatarUrl } = resolveCalendarPostAccountDisplay(
    {
      platform: post.platform,
      account: post.account,
      platformUserId: post.platformUserId ?? post.source?.platform_user_id,
    },
    accounts,
    selectedAccount,
  );
  const body = post.previewText || post.caption || t("postScheduler.calendar.untitledPost");
  const truncated = body.length > 120;
  const preview = truncated ? `${body.slice(0, 120).trim()}…` : body;
  const whenLabel = formatPublishedWhen(post.scheduledAt, locale);
  const likes = post.metrics?.likes ?? "0";
  const comments = post.metrics?.comments ?? "0";
  const engRate = "—";
  const postUrl = post.publishedPostUrl?.trim() || "";

  const openPostUrl = (): void => {
    if (!postUrl) return;
    window.open(postUrl, "_blank", "noopener,noreferrer");
  };

  return createPortal(
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
      <button
        type="button"
        aria-label={t("common.close")}
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby="calendar-published-post-detail-title"
        className="relative z-[151] w-full max-w-[420px] overflow-hidden rounded-xl border border-outline-variant/25 bg-surface shadow-2xl"
      >
        <header className="flex items-center justify-between gap-3 border-b border-outline-variant/15 px-4 py-3">
          <div className="min-w-0">
            <p id="calendar-published-post-detail-title" className="truncate text-sm font-bold text-on-surface">
              {whenLabel}
            </p>
            <p className="text-[11px] font-medium text-on-surface-variant">
              {t("postScheduler.published.title")}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={t("common.close")}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-on-surface-variant transition-colors hover:bg-surface-container-high hover:text-on-surface"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </header>

        <div className="flex items-center gap-3 border-b border-outline-variant/15 px-4 py-3">
          <div className="relative shrink-0">
            {avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={avatarUrl} alt="" className="h-10 w-10 rounded-full object-cover" />
            ) : (
              <SocialPlatformIcon platform={platform} className="h-10 w-10 rounded-full" alt="" />
            )}
            <span className="absolute -bottom-0.5 -right-0.5 flex h-4 w-4 items-center justify-center overflow-hidden rounded-full border border-surface bg-surface">
              <SocialPlatformIcon platform={platform} className="h-3.5 w-3.5" alt="" />
            </span>
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-on-surface">{accountName}</p>
            <p className="truncate text-xs capitalize text-on-surface-variant">{platform}</p>
          </div>
        </div>

        <div className="flex gap-3 border-b border-outline-variant/15 px-4 py-3">
          <div className="min-w-0 flex-1">
            <p className="whitespace-pre-wrap text-sm leading-snug text-on-surface">{preview}</p>
            {truncated ? (
              <button
                type="button"
                onClick={openPostUrl}
                disabled={!postUrl}
                className="mt-1 text-xs font-semibold text-on-surface-variant hover:text-on-surface disabled:opacity-50"
              >
                {t("postScheduler.preview.seeMore")}
              </button>
            ) : null}
          </div>
          {post.mediaUrl ? (
            <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-surface-container-low">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={post.mediaUrl} alt="" className="h-full w-full object-cover" />
            </div>
          ) : null}
        </div>

        <div className="flex items-stretch border-b border-outline-variant/15 px-2">
          <MetricCell icon="thumb_up" label={t("postScheduler.calendar.reactions")} value={likes} />
          <MetricCell icon="chat_bubble" label={t("dashboard.metricComments")} value={comments} />
          <MetricCell icon="insights" label={t("postScheduler.calendar.engRateShort")} value={engRate} />
        </div>

        <footer className="px-4 py-3">
          <button
            type="button"
            onClick={openPostUrl}
            disabled={!postUrl}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-outline-variant/25 bg-surface-container px-4 py-2.5 text-sm font-bold text-on-surface transition-colors hover:bg-surface-container-high disabled:cursor-not-allowed disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-[18px]">open_in_new</span>
            {t("postScheduler.calendar.goToPost")}
          </button>
        </footer>
      </aside>
    </div>,
    document.body,
  );
}
