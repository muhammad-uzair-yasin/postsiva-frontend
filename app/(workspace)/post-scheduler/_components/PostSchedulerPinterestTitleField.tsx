"use client";

import { useTranslations } from "@/lib/i18n/WorkspaceLocaleProvider";

const MAX_PINTEREST_TITLE = 100;

interface PostSchedulerPinterestTitleFieldProps {
  readonly value: string;
  readonly onChange: (value: string) => void;
}

/** Shown when Pinterest is selected — maps to unified post `pinterest.pinterest_text` (pin title). */
export function PostSchedulerPinterestTitleField({
  value,
  onChange,
}: PostSchedulerPinterestTitleFieldProps): React.ReactElement {
  const { t } = useTranslations();

  return (
    <div className="mb-4 rounded-xl border border-outline-variant/15 bg-surface-container-low/80 px-4 py-3">
      <label
        htmlFor="post-scheduler-pinterest-title"
        className="mb-1 flex items-center gap-2 text-[10px] font-extrabold uppercase tracking-widest text-on-surface-variant"
      >
        <span className="material-symbols-outlined text-base text-[#e60023]">
          push_pin
        </span>
        {t("postScheduler.pinterest.pinTitle")}
      </label>
      <input
        id="post-scheduler-pinterest-title"
        type="text"
        value={value}
        maxLength={MAX_PINTEREST_TITLE}
        placeholder={t("postScheduler.pinterest.pinTitlePlaceholder")}
        onChange={(e) => {
          onChange(e.target.value);
        }}
        className="mt-2 w-full rounded-lg border border-outline-variant/20 bg-surface-container-lowest px-3 py-2.5 font-body text-sm text-on-surface placeholder:text-outline/45 focus:outline-none focus:ring-2 focus:ring-secondary/25"
      />
      <p className="mt-2 text-[11px] leading-relaxed text-on-surface-variant">
        {t("postScheduler.pinterest.maxChars")}
      </p>
    </div>
  );
}
