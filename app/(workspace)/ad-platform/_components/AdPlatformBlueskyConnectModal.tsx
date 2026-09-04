"use client";

import { useEffect, useState } from "react";

import { useTranslations } from "@/lib/i18n/WorkspaceLocaleProvider";

const BLUESKY_APP_PASSWORDS_URL = "https://bsky.app/settings/app-passwords";

interface AdPlatformBlueskyConnectModalProps {
  open: boolean;
  error: string | null;
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (handle: string, appPassword: string) => Promise<void>;
}

export function AdPlatformBlueskyConnectModal({
  open,
  error,
  isSubmitting,
  onClose,
  onSubmit,
}: AdPlatformBlueskyConnectModalProps): React.ReactElement | null {
  const { t } = useTranslations();
  const [handle, setHandle] = useState("");
  const [appPassword, setAppPassword] = useState("");
  const [localError, setLocalError] = useState<string | null>(null);
  const [showAppPassword, setShowAppPassword] = useState(false);

  useEffect(() => {
    if (open) {
      setHandle("");
      setAppPassword("");
      setLocalError(null);
      setShowAppPassword(false);
    }
  }, [open]);

  if (!open) {
    return null;
  }

  const combinedError = localError ?? error;

  return (
    <div className="fixed inset-0 z-[160] flex items-center justify-center p-4">
      <button
        type="button"
        aria-label={t("adPlatform.blueskyCloseAria")}
        disabled={isSubmitting}
        className="absolute inset-0 bg-black/60 transition-opacity disabled:cursor-not-allowed"
        onClick={() => {
          if (!isSubmitting) {
            onClose();
          }
        }}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="bluesky-connect-title"
        className="relative z-[161] w-full max-w-md rounded-3xl border border-outline-variant/20 bg-surface p-6 shadow-2xl"
      >
        <h2
          id="bluesky-connect-title"
          className="text-lg font-bold text-on-surface"
        >
          {t("adPlatform.blueskyTitle")}
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-on-surface">
          {t("adPlatform.blueskyBody")}{" "}
          <a
            href={BLUESKY_APP_PASSWORDS_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-secondary underline underline-offset-2 hover:opacity-90"
          >
            {t("adPlatform.blueskyGenerateLink")}
          </a>
        </p>
        <form
          className="mt-5 space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            const h = handle.trim();
            const pw = appPassword.trim();
            if (!h || !pw) {
              setLocalError(t("adPlatform.blueskyErrorMissing"));
              return;
            }
            setLocalError(null);
            void onSubmit(h, pw);
          }}
        >
          <div>
            <label
              htmlFor="bluesky-handle"
              className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-on-surface-variant"
            >
              {t("adPlatform.blueskyHandle")}
            </label>
            <input
              id="bluesky-handle"
              type="text"
              autoComplete="username"
              placeholder={t("adPlatform.blueskyHandlePlaceholder")}
              value={handle}
              disabled={isSubmitting}
              onChange={(ev) => {
                setHandle(ev.target.value);
              }}
              className="w-full rounded-xl border border-outline-variant/20 bg-surface-container-low px-4 py-3 text-sm text-on-surface outline-none ring-secondary/0 transition-[box-shadow] focus:ring-2 focus:ring-secondary/40 disabled:opacity-60"
            />
          </div>
          <div>
            <label
              htmlFor="bluesky-app-password"
              className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-on-surface-variant"
            >
              {t("adPlatform.blueskyAppPassword")}
            </label>
            <div className="relative">
              <input
                id="bluesky-app-password"
                type={showAppPassword ? "text" : "password"}
                autoComplete="current-password"
                placeholder={t("adPlatform.blueskyPasswordPlaceholder")}
                value={appPassword}
                disabled={isSubmitting}
                onChange={(ev) => {
                  setAppPassword(ev.target.value);
                }}
                className="w-full rounded-xl border border-outline-variant/20 bg-surface-container-low py-3 pl-4 pr-12 text-sm text-on-surface outline-none ring-secondary/0 transition-[box-shadow] focus:ring-2 focus:ring-secondary/40 disabled:opacity-60"
              />
              <button
                type="button"
                tabIndex={-1}
                disabled={isSubmitting}
                aria-label={
                  showAppPassword
                    ? t("adPlatform.blueskyHidePassword")
                    : t("adPlatform.blueskyShowPassword")
                }
                onClick={() => {
                  setShowAppPassword((v) => !v);
                }}
                className="absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-on-surface-variant transition-colors hover:bg-surface-container-high hover:text-on-surface disabled:opacity-50"
              >
                <span className="material-symbols-outlined text-[22px]">
                  {showAppPassword ? "visibility" : "visibility_off"}
                </span>
              </button>
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
                onClose();
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
              {isSubmitting ? t("adPlatform.cardConnecting") : t("adPlatform.cardConnect")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
