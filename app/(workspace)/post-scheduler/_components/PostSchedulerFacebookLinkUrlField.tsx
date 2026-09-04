"use client";

import type { ReactElement } from "react";

import { useTranslations } from "@/lib/i18n/WorkspaceLocaleProvider";

export function PostSchedulerFacebookLinkUrlField({
  value,
  onChange,
  publishBlockMessage = null,
}: {
  readonly value: string;
  readonly onChange: (value: string) => void;
  readonly publishBlockMessage?: string | null;
}): ReactElement {
  const { t } = useTranslations();
  return (
    <div className="space-y-1.5">
      <label
        htmlFor="postsiva-facebook-link-url"
        className="text-[10px] font-bold uppercase tracking-[0.15em] text-on-surface-variant"
      >
        {t("postScheduler.composer.linkUrlLabel")}
      </label>
      <input
        id="postsiva-facebook-link-url"
        type="url"
        inputMode="url"
        autoComplete="url"
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
        }}
        placeholder={t("postScheduler.composer.linkUrlPlaceholder")}
        className="w-full rounded-xl border border-outline-variant/30 bg-surface-container-low px-3 py-2.5 text-sm text-on-surface placeholder:text-outline/45 focus:border-secondary/50 focus:outline-none focus:ring-2 focus:ring-secondary/20"
      />
      {publishBlockMessage ? (
        <div
          role="alert"
          className="rounded-xl border border-amber-500/35 bg-amber-500/10 px-3 py-2.5 text-xs text-on-surface"
        >
          <p className="font-semibold text-amber-900 dark:text-amber-100">
            {t("postScheduler.composer.linkUrlPublishBlockedTitle")}
          </p>
          <p className="mt-1 leading-relaxed">{publishBlockMessage}</p>
        </div>
      ) : null}
    </div>
  );
}
