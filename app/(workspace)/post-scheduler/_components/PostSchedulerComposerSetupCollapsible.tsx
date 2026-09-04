"use client";

import { useState, type ReactElement, type ReactNode } from "react";

import { useTranslations } from "@/lib/i18n/WorkspaceLocaleProvider";
import type { ComposerDraftScope } from "@/lib/post-composer/composerDraftScopeTypes";
import type { ComposerPostFormat } from "@/lib/post-composer/composerPostFormat";

export function PostSchedulerComposerSetupCollapsible({
  channelCount,
  draftScope,
  postFormat,
  showPostFormat,
  headerActions,
  children,
}: {
  readonly channelCount: number;
  readonly draftScope: ComposerDraftScope;
  readonly postFormat: ComposerPostFormat;
  readonly showPostFormat: boolean;
  readonly headerActions?: ReactNode;
  readonly children: ReactNode;
}): ReactElement {
  const { t } = useTranslations();
  const [open, setOpen] = useState(true);

  const formatLabel =
    postFormat === "reel"
      ? t("postScheduler.composer.formatReel")
      : postFormat === "story"
        ? t("postScheduler.composer.formatStory")
        : postFormat === "link"
          ? t("postScheduler.composer.formatLink")
          : t("postScheduler.composer.formatStandard");

  const scopeLabel =
    draftScope === "per_channel"
      ? t("postScheduler.composer.perPlatform")
      : t("postScheduler.composer.sameForAll");

  const summaryParts = [
    t("postScheduler.composer.setupSummaryChannels", {
      count: String(channelCount),
    }),
    scopeLabel,
  ];
  if (showPostFormat) {
    summaryParts.push(formatLabel);
  }

  return (
    <div className="relative shrink-0 rounded-xl border border-outline-variant/15 bg-surface-container-low/30">
      <div className="flex w-full items-center gap-2 px-3 py-2 transition hover:bg-surface-container-low/50 sm:px-4">
        {!open ? (
          <button
            type="button"
            aria-expanded={open}
            onClick={() => setOpen((prev) => !prev)}
            className="flex min-w-0 flex-1 text-left"
          >
            <span className="block truncate text-xs font-bold text-on-surface-variant">
              {summaryParts.join(" · ")}
            </span>
          </button>
        ) : (
          <span className="min-w-0 flex-1" />
        )}
        {headerActions ? <div className="shrink-0">{headerActions}</div> : null}
        <button
          type="button"
          aria-label={t("postScheduler.composer.setupSectionTitle")}
          aria-expanded={open}
          onClick={() => setOpen((prev) => !prev)}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-on-surface-variant transition hover:bg-surface-container-high"
        >
          <span
            className={`material-symbols-outlined text-[20px] transition ${
              open ? "rotate-180" : ""
            }`}
          >
            expand_more
          </span>
        </button>
      </div>
      {open ? (
        <div className="space-y-3 border-t border-outline-variant/10 px-3 pb-2.5 pt-1 sm:px-4">
          {children}
        </div>
      ) : null}
    </div>
  );
}
