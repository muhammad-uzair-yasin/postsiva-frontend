"use client";

import { useMemo } from "react";
import { createPortal } from "react-dom";

import { useTranslations } from "@/lib/i18n/WorkspaceLocaleProvider";
import type { SocialPlatformIconId } from "@/lib/social/socialPlatformIconSrc";

interface PostSchedulerSaveDraftConfirmModalProps {
  readonly visible: boolean;
  readonly channelCount: number;
  readonly targets: readonly {
    displayName: string;
    platform: SocialPlatformIconId;
  }[];
  readonly onCancel: () => void;
  readonly onConfirm: () => void;
}

const PLATFORM_LABEL_KEY: Record<SocialPlatformIconId, string> = {
  linkedin: "postScheduler.preview.tabLinkedin",
  facebook: "postScheduler.preview.tabFacebook",
  instagram: "postScheduler.preview.tabInstagram",
  tiktok: "postScheduler.preview.tabTiktok",
  youtube: "postScheduler.preview.tabYoutube",
  pinterest: "postScheduler.preview.tabPinterest",
  threads: "postScheduler.preview.tabThreads",
  x: "postScheduler.preview.tabX",
  bluesky: "postScheduler.preview.tabBluesky",
  mastodon: "postScheduler.preview.tabMastodon",
  wordpress: "WordPress",
  whatsapp: "postScheduler.preview.tabWhatsapp",
};

export function PostSchedulerSaveDraftConfirmModal({
  visible,
  channelCount,
  targets,
  onCancel,
  onConfirm,
}: PostSchedulerSaveDraftConfirmModalProps): React.ReactElement | null {
  const { t } = useTranslations();
  const mounted = typeof document !== "undefined";
  const detailRows = useMemo(
    () =>
      targets.map((target) => ({
        label: target.displayName,
        platform:
          t(PLATFORM_LABEL_KEY[target.platform]) ??
          target.platform,
      })),
    [t, targets],
  );

  if (!visible) {
    return null;
  }
  if (!mounted) {
    return null;
  }

  return createPortal(
    <div className="fixed inset-0 z-[1100] bg-black/55">
      <button
        type="button"
        aria-label={t("common.dismiss")}
        className="absolute inset-0 cursor-default"
        onClick={onCancel}
      />
      <div className="pointer-events-none fixed left-1/2 top-1/2 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 px-5">
        <div
          role="dialog"
          aria-modal="true"
          className="pointer-events-auto relative z-10 w-full rounded-2xl border border-outline-variant/20 bg-surface-container-high p-5 shadow-2xl"
        >
          <h2 className="font-headline text-lg font-bold text-on-surface">
            {t("postScheduler.publish.saveDraftTitle")}
          </h2>
          <p className="mt-3 font-body text-sm leading-relaxed text-on-surface-variant">
            {t("postScheduler.publish.saveDraftBody", { count: channelCount })}
          </p>
          {detailRows.length > 0 ? (
            <div className="mt-3 max-h-44 overflow-auto rounded-xl border border-outline-variant/15 bg-surface-container-low px-3 py-2">
              <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-on-surface-variant/80">
                {t("postScheduler.publish.publishTargets")}
              </p>
              <ul className="space-y-1 text-sm text-on-surface">
                {detailRows.map((row, idx) => (
                  <li key={`${row.platform}-${row.label}-${idx}`} className="flex items-center justify-between gap-2">
                    <span className="truncate">{row.label}</span>
                    <span className="rounded-md bg-primary-container/70 px-2 py-0.5 text-xs font-semibold text-on-primary-container">
                      {row.platform}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
          <div className="mt-6 flex justify-end gap-2">
            <button
              type="button"
              className="rounded-xl px-5 py-3 font-body text-sm font-bold text-on-surface-variant transition-opacity hover:opacity-90"
              onClick={onCancel}
            >
              {t("common.cancel")}
            </button>
            <button
              type="button"
              className="rounded-xl bg-secondary-container px-5 py-3 font-body text-sm font-bold text-on-secondary-container transition-opacity hover:opacity-95"
              onClick={onConfirm}
            >
              {t("composer.saveDraft")}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
