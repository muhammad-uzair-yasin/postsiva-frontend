"use client";

import { useTranslations } from "@/lib/i18n/WorkspaceLocaleProvider";

interface SocialInboxReplyDraftFieldProps {
  readonly draft: string;
  readonly onDraftChange: (value: string) => void;
  readonly genBusy: boolean;
  readonly sendBlocked: boolean;
  readonly error: string | null;
  readonly canSend: boolean;
  readonly onSend: () => void;
}

export function SocialInboxReplyDraftField({
  draft,
  onDraftChange,
  genBusy,
  sendBlocked,
  error,
  canSend,
  onSend,
}: SocialInboxReplyDraftFieldProps): React.ReactElement {
  const { t } = useTranslations();

  return (
    <div className="relative rounded-xl border border-outline-variant/30 bg-surface-container-lowest p-3 shadow-inner transition-all focus-within:border-primary/50">
      <div className="relative min-h-[4.5rem]">
        <textarea
          placeholder={t("inbox.typeReplyPlaceholder")}
          rows={3}
          value={draft}
          onChange={(e) => {
            onDraftChange(e.target.value);
          }}
          disabled={genBusy}
          className="relative z-10 h-16 w-full resize-none border-none bg-transparent text-sm text-on-surface outline-none placeholder:text-outline/40 focus:outline-none focus:ring-0 focus-visible:outline-none disabled:opacity-70"
        />
        {genBusy ? (
          <>
            <div
              className="pointer-events-none absolute inset-0 z-20 overflow-hidden rounded-lg bg-surface-container-highest/75"
              aria-busy
              aria-label={t("inbox.generatingReplyAria")}
            />
            <div
              className="inbox-reply-generating-shimmer pointer-events-none absolute inset-0 z-20 rounded-lg"
              aria-hidden
            />
            <p className="pointer-events-none absolute inset-0 z-30 flex items-center justify-center text-center text-xs font-medium text-on-surface">
              {t("inbox.generatingReply")}
            </p>
          </>
        ) : null}
      </div>
      {error ? (
        <p className="mt-1 text-xs text-error" role="alert">
          {error}
        </p>
      ) : null}
      <div className="mt-2 flex items-center justify-end border-t border-outline-variant/10 pt-2">
        <button
          type="button"
          disabled={sendBlocked || !canSend}
          className="flex items-center gap-2 rounded-lg bg-primary-container px-5 py-1.5 text-xs font-bold text-on-primary-container shadow-lg shadow-primary-container/20 transition-all active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
          onClick={onSend}
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
  );
}
