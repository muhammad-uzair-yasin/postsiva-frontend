"use client";

import { useState } from "react";

import { useTranslations } from "@/lib/i18n/WorkspaceLocaleProvider";

const DEFAULT_MASTODON_INSTANCES = [
  "mastodon.social",
  "mstdn.social",
  "mastodon.online",
  "fosstodon.org",
  "hachyderm.io",
] as const;

interface AdPlatformMastodonInstanceModalProps {
  open: boolean;
  error: string | null;
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (instanceBase: string) => Promise<void>;
}

export function AdPlatformMastodonInstanceModal({
  open,
  error,
  isSubmitting,
  onClose,
  onSubmit,
}: AdPlatformMastodonInstanceModalProps): React.ReactElement | null {
  const { t } = useTranslations();
  const [instanceBase, setInstanceBase] = useState("");
  const [localError, setLocalError] = useState<string | null>(null);

  if (!open) {
    return null;
  }

  const combinedError = localError ?? error;
  const close = (): void => {
    setInstanceBase("");
    setLocalError(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[160] flex items-center justify-center p-4">
      <button
        type="button"
        aria-label={t("adPlatform.mastodonCloseAria")}
        disabled={isSubmitting}
        className="absolute inset-0 bg-black/60 transition-opacity disabled:cursor-not-allowed"
        onClick={() => {
          if (!isSubmitting) {
            close();
          }
        }}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="mastodon-instance-title"
        className="relative z-[161] w-full max-w-md rounded-3xl border border-outline-variant/20 bg-surface p-6 shadow-2xl"
      >
        <h2
          id="mastodon-instance-title"
          className="text-lg font-bold text-on-surface"
        >
          {t("adPlatform.mastodonTitle")}
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-on-surface">
          {t("adPlatform.mastodonBody")}
        </p>
        <form
          className="mt-5 space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            const instance = instanceBase.trim();
            if (!instance) {
              setLocalError(t("adPlatform.mastodonErrorMissing"));
              return;
            }
            setLocalError(null);
            void onSubmit(instance);
          }}
        >
          <div>
            <label
              htmlFor="mastodon-instance"
              className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-on-surface-variant"
            >
              {t("adPlatform.mastodonInstance")}
            </label>
            <input
              id="mastodon-instance"
              type="text"
              autoComplete="url"
              placeholder={t("adPlatform.mastodonInstancePlaceholder")}
              value={instanceBase}
              disabled={isSubmitting}
              onChange={(ev) => {
                setInstanceBase(ev.target.value);
              }}
              className="w-full rounded-xl border border-outline-variant/20 bg-surface-container-low px-4 py-3 text-sm text-on-surface outline-none ring-secondary/0 transition-[box-shadow] focus:ring-2 focus:ring-secondary/40 disabled:opacity-60"
            />
            <div className="mt-3">
              <p className="mb-2 text-xs font-bold uppercase tracking-wide text-on-surface-variant">
                {t("adPlatform.mastodonSuggested")}
              </p>
              <div className="flex flex-wrap gap-2">
                {DEFAULT_MASTODON_INSTANCES.map((instance) => {
                  const selected = instanceBase.trim() === instance;
                  return (
                    <button
                      key={instance}
                      type="button"
                      disabled={isSubmitting}
                      onClick={() => {
                        setInstanceBase(instance);
                        setLocalError(null);
                      }}
                      className={[
                        "rounded-full border px-3 py-1.5 text-xs font-bold transition-colors disabled:opacity-50",
                        selected
                          ? "border-secondary bg-secondary-container text-on-secondary-container"
                          : "border-outline-variant/25 text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface",
                      ].join(" ")}
                    >
                      {instance}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
          {combinedError ? (
            <p className="text-sm font-medium text-error" role="alert">
              {combinedError}
            </p>
          ) : null}
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => {
                close();
              }}
              className="rounded-xl border border-outline-variant/25 px-4 py-2.5 text-sm font-bold text-on-surface transition-colors hover:bg-surface-container-high disabled:opacity-50"
            >
              {t("common.cancel")}
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-xl bg-primary-container px-4 py-2.5 text-sm font-bold text-on-primary-container transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting
                ? t("adPlatform.cardConnecting")
                : t("adPlatform.cardConnect")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
