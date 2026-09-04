"use client";

import type { ReactElement } from "react";

import { useTranslations } from "@/lib/i18n/WorkspaceLocaleProvider";
import type { ComposerPostFormat } from "@/lib/post-composer/composerPostFormat";

interface PostSchedulerPostFormatToggleProps {
  readonly value: ComposerPostFormat;
  readonly onChange: (value: ComposerPostFormat) => void;
  /** Link posts are Facebook-only — hide when no Facebook Page is selected. */
  readonly showLinkOption?: boolean;
}

const OPTIONS = ["reel", "story", "link"] as const;

export function PostSchedulerPostFormatToggle({
  value,
  onChange,
  showLinkOption = true,
}: PostSchedulerPostFormatToggleProps): ReactElement {
  const { t } = useTranslations();
  const visibleOptions = showLinkOption
    ? OPTIONS
    : OPTIONS.filter((opt) => opt !== "link");
  return (
    <div className="space-y-1.5">
      <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-on-surface-variant">
        {t("postScheduler.composer.postFormat")}
      </p>
      <div
        className="flex flex-wrap gap-1.5"
        role="group"
        aria-label={t("postScheduler.composer.postFormatAria")}
      >
        {visibleOptions.map((opt) => {
          const selected = value === opt;
          const label =
            opt === "reel"
              ? t("postScheduler.composer.formatReel")
              : opt === "story"
                ? t("postScheduler.composer.formatStory")
                : t("postScheduler.composer.formatLink");
          return (
            <button
              key={opt}
              type="button"
              aria-pressed={selected}
              className={`rounded-lg px-2.5 py-1.5 text-[11px] font-bold transition-colors ${
                selected
                  ? "bg-primary text-on-primary"
                  : "bg-surface-container-high text-on-surface-variant hover:bg-surface-container-highest"
              }`}
              onClick={() => {
                onChange(selected ? "standard" : opt);
              }}
            >
              {label}
            </button>
          );
        })}
      </div>
      {value === "story" ? (
        <p className="text-[11px] text-on-surface-variant">
          {t("postScheduler.composer.storyHint")}
        </p>
      ) : null}
      {value === "reel" ? (
        <p className="text-[11px] text-on-surface-variant">
          {t("postScheduler.composer.reelHint")}
        </p>
      ) : null}
      {value === "link" ? (
        <p className="text-[11px] text-on-surface-variant">
          {t("postScheduler.composer.linkHint")}
        </p>
      ) : null}
    </div>
  );
}
