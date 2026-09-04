"use client";

import type { ComposerContentMode } from "@/lib/post-composer/composerContentModeTypes";
import { useTranslations } from "@/lib/i18n/WorkspaceLocaleProvider";

interface PostSchedulerComposerModeToggleProps {
  readonly contentMode: ComposerContentMode;
  readonly onChange: (mode: ComposerContentMode) => void;
}

/** Social multi-platform vs WordPress blog — shown when WordPress is connected. */
export function PostSchedulerComposerModeToggle({
  contentMode,
  onChange,
}: PostSchedulerComposerModeToggleProps): React.ReactElement {
  const { t } = useTranslations();

  return (
    <div
      className="grid grid-cols-2 gap-1 rounded-xl border border-outline-variant/20 bg-surface-container-low p-1"
      role="group"
      aria-label={t("postScheduler.composer.contentModeAria")}
    >
      <button
        type="button"
        aria-pressed={contentMode === "social"}
        className={`flex min-h-14 min-w-0 items-center justify-center rounded-lg px-2 text-center text-xs font-bold transition-colors ${
          contentMode === "social"
            ? "bg-primary-container text-on-primary-container"
            : "text-on-surface-variant hover:text-on-surface"
        }`}
        onClick={() => {
          onChange("social");
        }}
      >
        {t("postScheduler.composer.socialPosts")}
      </button>
      <button
        type="button"
        aria-pressed={contentMode === "blog"}
        className={`flex min-h-14 min-w-0 items-center justify-center rounded-lg px-2 text-center text-xs font-bold transition-colors ${
          contentMode === "blog"
            ? "bg-primary-container text-on-primary-container"
            : "text-on-surface-variant hover:text-on-surface"
        }`}
        onClick={() => {
          onChange("blog");
        }}
      >
        {t("postScheduler.composer.blogPost")}
      </button>
    </div>
  );
}
