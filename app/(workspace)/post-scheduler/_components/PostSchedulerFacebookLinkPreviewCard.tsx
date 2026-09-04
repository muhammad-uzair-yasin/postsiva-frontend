"use client";

import type { ReactElement } from "react";

import { useTranslations } from "@/lib/i18n/WorkspaceLocaleProvider";
import type { LinkOpenGraphPreview } from "@/lib/social/linkPreviewOgApi";

import {
  collapseLinkPreviewText,
  linkPreviewDisplayTitle,
} from "../_utils/linkPreviewDisplayText";

function cleanOgText(value: string | null | undefined, maxLen: number): string {
  if (!value) return "";
  return collapseLinkPreviewText(value).slice(0, maxLen);
}

export function PostSchedulerFacebookLinkPreviewCard({
  preview,
  loading,
  error,
  fallbackUrl,
  fillImageArea = false,
  publishBlockMessage = null,
}: {
  readonly preview: LinkOpenGraphPreview | null;
  readonly loading: boolean;
  readonly error: string | null;
  readonly fallbackUrl: string;
  readonly publishBlockMessage?: string | null;
  /** Grow link image like standard post media in modal preview. */
  readonly fillImageArea?: boolean;
}): ReactElement {
  const { t } = useTranslations();
  const domain = (() => {
    try {
      return new URL(preview?.url ?? fallbackUrl).hostname.replace(/^www\./, "");
    } catch {
      return fallbackUrl;
    }
  })();

  const rootClass = fillImageArea
    ? "flex h-full min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-outline-variant/15 bg-[#f0f2f5] dark:bg-surface-container-high"
    : "mt-4 flex shrink-0 flex-col overflow-hidden rounded-xl border border-outline-variant/15 bg-[#f0f2f5] dark:bg-surface-container-high";

  const imageShellClass = fillImageArea
    ? "flex min-h-[320px] w-full min-h-0 flex-1 overflow-hidden bg-surface-container"
    : "max-h-[220px] w-full shrink-0 overflow-hidden bg-surface-container";

  const imageClass = fillImageArea
    ? "block h-full min-h-[320px] w-full object-cover object-center"
    : "block max-h-[220px] w-full object-cover object-center";

  if (loading) {
    return (
      <div className={`${rootClass} animate-pulse`}>
        {publishBlockMessage ? (
          <div
            role="alert"
            className="mx-3 mt-3 shrink-0 rounded-lg border border-amber-500/35 bg-amber-500/10 px-3 py-2 text-[11px] text-on-surface animate-none"
          >
            <p className="font-semibold text-amber-900 dark:text-amber-100">
              {t("postScheduler.preview.linkUrlPublishBlockedTitle")}
            </p>
            <p className="mt-1 leading-relaxed">{publishBlockMessage}</p>
          </div>
        ) : null}
        <div
          className={
            fillImageArea
              ? "min-h-[320px] flex-1 bg-surface-container"
              : "aspect-[1.91/1] max-h-[220px] bg-surface-container"
          }
        />
        <div className="space-y-2 p-3">
          <div className="h-3 w-2/3 rounded bg-surface-container" />
          <div className="h-2 w-full rounded bg-surface-container" />
        </div>
      </div>
    );
  }

  if (error && !preview) {
    return (
      <div className="mt-4 shrink-0 rounded-xl border border-outline-variant/20 bg-surface-container-high px-3 py-3 text-[11px] text-on-surface-variant">
        <p className="font-semibold text-on-surface">
          {t("postScheduler.preview.linkPreviewUnavailable")}
        </p>
        <p className="mt-1 break-all">{domain}</p>
        <p className="mt-1 text-[10px]">{error}</p>
      </div>
    );
  }

  const title = linkPreviewDisplayTitle(preview?.title, preview?.engagement_summary, domain);
  const site = cleanOgText(preview?.site_name, 80) || domain.toUpperCase();
  const imageUrl = preview?.image_url?.trim();
  const engagement = cleanOgText(preview?.engagement_summary, 120);
  const showTitle = Boolean(title.trim());
  const showEngagement = Boolean(engagement?.trim()) && showTitle;

  const metaRow =
    "m-0 min-w-0 truncate whitespace-nowrap text-ellipsis overflow-hidden leading-5";

  const publishBlockBanner = publishBlockMessage ? (
    <div
      role="alert"
      className="mx-3 mt-3 shrink-0 rounded-lg border border-amber-500/35 bg-amber-500/10 px-3 py-2 text-[11px] text-on-surface"
    >
      <p className="font-semibold text-amber-900 dark:text-amber-100">
        {t("postScheduler.preview.linkUrlPublishBlockedTitle")}
      </p>
      <p className="mt-1 leading-relaxed">{publishBlockMessage}</p>
    </div>
  ) : null;

  return (
    <div className={rootClass}>
      {publishBlockBanner}
      {imageUrl ? (
        <div className={imageShellClass}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={imageUrl} alt="" className={imageClass} />
        </div>
      ) : (
        <div
          className={`flex w-full shrink-0 items-center justify-center bg-surface-container ${
            fillImageArea
              ? "min-h-[320px] flex-1"
              : "aspect-[1.91/1] max-h-[220px]"
          }`}
        >
          <span className="material-symbols-outlined text-4xl text-on-surface-variant/40">
            link
          </span>
        </div>
      )}
      <div className="relative z-[2] flex shrink-0 grow-0 flex-col gap-2 border-t border-outline-variant/10 bg-[#f0f2f5] px-3 py-3 dark:bg-[#3a3b3c]">
        <p className={`${metaRow} text-[11px] font-semibold uppercase tracking-wide text-on-surface-variant`}>
          {site}
        </p>
        {showEngagement ? (
          <p
            className={`${metaRow} text-[11px] font-normal text-on-surface-variant/90`}
            title={engagement}
          >
            {engagement}
          </p>
        ) : null}
        {showTitle ? (
          <p className={`${metaRow} text-[15px] font-semibold text-on-surface`} title={title}>
            {title}
          </p>
        ) : null}
      </div>
    </div>
  );
}
