"use client";

import { useTranslations } from "@/lib/i18n/WorkspaceLocaleProvider";

const MAX_YT_TITLE = 100;

interface PostSchedulerYoutubeTitleFieldProps {
  readonly value: string;
  readonly onChange: (value: string) => void;
}

/** Shown when YouTube is among selected channels — maps to unified post `youtube_title` for video jobs. */
export function PostSchedulerYoutubeTitleField({
  value,
  onChange,
}: PostSchedulerYoutubeTitleFieldProps): React.ReactElement {
  const { t } = useTranslations();

  return (
    <div className="mb-4 rounded-xl border border-outline-variant/15 bg-surface-container-low/80 px-4 py-3">
      <label
        htmlFor="post-scheduler-youtube-title"
        className="mb-1 flex items-center gap-2 text-[10px] font-extrabold uppercase tracking-widest text-on-surface-variant"
      >
        <span className="material-symbols-outlined text-base text-red-500">
          smart_display
        </span>
        {t("postScheduler.youtube.videoTitle")}
      </label>
      <input
        id="post-scheduler-youtube-title"
        type="text"
        value={value}
        maxLength={MAX_YT_TITLE}
        placeholder={t("postScheduler.youtube.videoTitlePlaceholder")}
        onChange={(e) => {
          onChange(e.target.value);
        }}
        className="mt-2 w-full rounded-lg border border-outline-variant/20 bg-surface-container-lowest px-3 py-2.5 font-body text-sm text-on-surface placeholder:text-outline/45 focus:outline-none focus:ring-2 focus:ring-secondary/25"
      />
      <p className="mt-2 text-[11px] leading-relaxed text-on-surface-variant">
        {t("postScheduler.youtube.videoTitleHint")}
      </p>
    </div>
  );
}
