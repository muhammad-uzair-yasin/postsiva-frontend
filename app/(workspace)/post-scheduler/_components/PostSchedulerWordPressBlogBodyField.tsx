"use client";

import type { ReactElement } from "react";

import { useTranslations } from "@/lib/i18n/WorkspaceLocaleProvider";

import { plainTextToWordPressHtml } from "../_utils/wordpressBlogPlainTextHtml";

export function PostSchedulerWordPressBlogBodyField({
  body,
  onBodyChange,
  loading,
}: {
  readonly body: string;
  readonly onBodyChange: (plain: string, html: string) => void;
  readonly loading?: boolean;
}): ReactElement {
  const { t } = useTranslations();
  const bodyCount = body.length;

  return (
    <div className="mt-8 space-y-3">
      <label className="block text-xs font-semibold text-on-surface-variant">
        {t("postScheduler.composer.blogContentBody")}
      </label>
      <div className="relative flex flex-col rounded-2xl border border-outline-variant/15 bg-surface-container-lowest/70 p-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] transition-shadow focus-within:ring-2 focus-within:ring-secondary/25">
        <textarea
          value={body}
          disabled={loading}
          rows={14}
          placeholder={t("postScheduler.composer.blogContentBodyPlaceholder")}
          onChange={(e) => {
            const plain = e.target.value;
            onBodyChange(plain, plainTextToWordPressHtml(plain));
          }}
          className="min-h-[min(18rem,36vh)] w-full resize-y rounded-[0.875rem] border-0 bg-transparent px-4 pb-10 pt-3 font-body text-sm leading-relaxed text-on-surface placeholder:text-outline/45 focus:outline-none focus:ring-0"
        />
        <div
          className="pointer-events-none absolute bottom-3 right-3 z-10 flex h-8 min-w-[3rem] items-center justify-center rounded-full px-2.5 text-[11px] font-bold tabular-nums leading-none text-on-surface-variant/85"
          aria-live="polite"
        >
          {bodyCount}
        </div>
      </div>
    </div>
  );
}
