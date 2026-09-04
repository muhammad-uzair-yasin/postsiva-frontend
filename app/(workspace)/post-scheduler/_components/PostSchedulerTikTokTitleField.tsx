"use client";

import { useTranslations } from "@/lib/i18n/WorkspaceLocaleProvider";

const MAX_TIKTOK_PHOTO_TITLE = 90;

interface PostSchedulerTikTokTitleFieldProps {
  readonly value: string;
  readonly onChange: (value: string) => void;
}

/** Shown for TikTok image/carousel — maps to unified `tiktok.tiktok_title` (Business API photo title). */
export function PostSchedulerTikTokTitleField({
  value,
  onChange,
}: PostSchedulerTikTokTitleFieldProps): React.ReactElement {
  const { t } = useTranslations();

  return (
    <div className="mb-4 rounded-xl border border-outline-variant/15 bg-surface-container-low/80 px-4 py-3">
      <label
        htmlFor="post-scheduler-tiktok-title"
        className="mb-1 flex items-center gap-2 text-[10px] font-extrabold uppercase tracking-widest text-on-surface-variant"
      >
        <span className="material-symbols-outlined text-base text-cyan-400">
          music_note
        </span>
        {t("postScheduler.tiktok.photoTitle")}
      </label>
      <input
        id="post-scheduler-tiktok-title"
        type="text"
        value={value}
        maxLength={MAX_TIKTOK_PHOTO_TITLE}
        placeholder={t("postScheduler.tiktok.photoTitlePlaceholder")}
        onChange={(e) => {
          onChange(e.target.value);
        }}
        className="mt-2 w-full rounded-lg border border-outline-variant/20 bg-surface-container-lowest px-3 py-2.5 font-body text-sm text-on-surface placeholder:text-outline/45 focus:outline-none focus:ring-2 focus:ring-secondary/25"
      />
      <p className="mt-2 text-[11px] leading-relaxed text-on-surface-variant">
        {t("postScheduler.tiktok.photoTitleHint")}
      </p>
    </div>
  );
}
