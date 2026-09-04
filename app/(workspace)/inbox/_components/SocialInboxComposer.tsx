"use client";

import { useTranslations } from "@/lib/i18n/WorkspaceLocaleProvider";

const QUICK_REPLY_KEYS = [
  "inbox.quickReplyThankYou",
  "inbox.quickReplyChecking",
  "inbox.quickReplyHappy",
] as const;

export function SocialInboxComposer(): React.ReactElement {
  const { t } = useTranslations();

  return (
    <div className="border-t border-outline-variant/15 bg-surface-container-low p-4 pb-24">
      <div className="no-scrollbar mb-3 flex items-center gap-2 overflow-x-auto py-1">
        <div className="flex shrink-0 items-center gap-1.5 rounded-lg bg-primary/10 px-2 py-1">
          <span
            className="material-symbols-outlined text-sm text-primary"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            auto_awesome
          </span>
          <span className="text-[10px] font-bold uppercase tracking-tighter text-primary">
            {t("inbox.aiRepliesLabel")}
          </span>
        </div>
        {QUICK_REPLY_KEYS.map((key) => (
          <button
            key={key}
            type="button"
            className="shrink-0 rounded-full border border-outline-variant/20 bg-surface-container-highest px-4 py-1.5 text-xs transition-all hover:border-primary active:scale-95"
          >
            {t(key)}
          </button>
        ))}
      </div>
      <div className="rounded-xl border border-outline-variant/30 bg-surface-container-lowest p-3 shadow-xl transition-all focus-within:border-primary/50">
        <textarea
          placeholder={t("inbox.typeReplyPlaceholder")}
          rows={3}
          className="h-16 w-full resize-none border-none bg-transparent text-sm text-on-surface outline-none placeholder:text-outline/40 focus:outline-none focus:ring-0 focus-visible:outline-none"
        />
        <div className="mt-2 flex items-center justify-between border-t border-outline-variant/10 pt-2">
          <div className="flex items-center gap-4">
            <label className="group flex cursor-pointer items-center gap-2">
              <div className="relative h-4 w-7 rounded-full bg-surface-container-highest transition-colors group-has-[:checked]:bg-primary/30">
                <input type="checkbox" defaultChecked className="peer sr-only" />
                <div className="absolute left-0.5 top-0.5 h-3 w-3 rounded-full bg-outline transition-all peer-checked:left-3.5 peer-checked:bg-primary" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-tight text-on-surface-variant">
                {t("inbox.aiEnhance")}
              </span>
            </label>
            <div className="flex items-center gap-3">
              <button
                type="button"
                className="text-on-surface-variant transition-colors hover:text-on-surface"
              >
                <span className="material-symbols-outlined text-lg">image</span>
              </button>
              <button
                type="button"
                className="text-on-surface-variant transition-colors hover:text-on-surface"
              >
                <span className="material-symbols-outlined text-lg">mood</span>
              </button>
            </div>
          </div>
          <button
            type="button"
            className="flex items-center gap-2 rounded-lg bg-primary-container px-5 py-1.5 text-xs font-bold text-on-primary-container shadow-lg shadow-primary-container/20 transition-all active:scale-95"
          >
            <span>{t("inbox.sendReply")}</span>
            <span
              className="material-symbols-outlined text-sm"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              send
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
