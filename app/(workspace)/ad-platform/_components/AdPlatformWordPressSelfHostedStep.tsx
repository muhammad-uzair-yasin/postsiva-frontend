"use client";

import { useState } from "react";

import { WordPressSelfHostedHelpModal } from "@/components/help/WordPressSelfHostedHelpModal";
import { useTranslations } from "@/lib/i18n/WorkspaceLocaleProvider";

interface Props {
  isSubmitting: boolean;
  error: string | null;
  onBack: () => void;
  onConnect: (payload: {
    siteUrl: string;
    userLogin: string;
    applicationPassword: string;
  }) => Promise<void>;
}

/**
 * Self-hosted connect (Publer-style): site URL + username + Application Password
 * created under Users → Profile on the WordPress site.
 */
export function AdPlatformWordPressSelfHostedStep({
  isSubmitting,
  error,
  onBack,
  onConnect,
}: Props): React.ReactElement {
  const { t } = useTranslations();
  const [siteUrl, setSiteUrl] = useState("");
  const [userLogin, setUserLogin] = useState("");
  const [applicationPassword, setApplicationPassword] = useState("");
  const [localError, setLocalError] = useState<string | null>(null);
  const [guideOpen, setGuideOpen] = useState(false);

  return (
    <div>
      <WordPressSelfHostedHelpModal open={guideOpen} onClose={() => setGuideOpen(false)} />
      <button
        type="button"
        onClick={onBack}
        className="mb-4 flex items-center gap-1 text-sm text-on-surface-variant hover:text-on-surface"
      >
        <span className="material-symbols-outlined text-base">arrow_back</span>
        {t("adPlatform.wordpressBack")}
      </button>

      <button
        type="button"
        onClick={() => setGuideOpen(true)}
        className="mb-5 flex w-full items-center justify-between gap-3 rounded-xl border border-secondary/35 bg-secondary/10 px-4 py-3 text-left transition hover:border-secondary/55 hover:bg-secondary/15"
      >
        <span className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary/20 text-secondary">
            <span className="material-symbols-outlined">menu_book</span>
          </span>
          <span>
            <span className="block text-sm font-bold text-on-surface">
              {t("adPlatform.wordpressSetupGuide")}
            </span>
            <span className="block text-xs text-on-surface-variant">
              {t("adPlatform.wordpressSetupGuideTeaser")}
            </span>
          </span>
        </span>
        <span className="material-symbols-outlined text-secondary">chevron_right</span>
      </button>

      <form
        className="flex flex-col gap-4"
        onSubmit={(event) => {
          event.preventDefault();
          const url = siteUrl.trim();
          const login = userLogin.trim();
          const password = applicationPassword.trim();
          if (!url) {
            setLocalError(t("adPlatform.wordpressEnterUrl"));
            return;
          }
          if (!login || !password) {
            setLocalError(t("adPlatform.wordpressEnterCredentials"));
            return;
          }
          setLocalError(null);
          void onConnect({ siteUrl: url, userLogin: login, applicationPassword: password });
        }}
      >
        <label className="flex flex-col gap-2 text-sm font-semibold">
          {t("adPlatform.wordpressSiteUrl")}
          <input
            value={siteUrl}
            onChange={(event) => setSiteUrl(event.target.value)}
            placeholder="https://"
            disabled={isSubmitting}
            autoComplete="url"
            className="h-11 rounded-lg border border-outline-variant/50 bg-surface px-3 text-sm font-normal outline-none focus:border-secondary"
          />
        </label>

        <div>
          <p className="text-sm font-semibold">{t("adPlatform.wordpressApiCredentials")}</p>
          <div className="mt-2 grid gap-3 sm:grid-cols-2">
            <input
              value={userLogin}
              onChange={(event) => setUserLogin(event.target.value)}
              placeholder={t("adPlatform.wordpressLoginPlaceholder")}
              disabled={isSubmitting}
              autoComplete="username"
              className="h-11 rounded-lg border border-outline-variant/50 bg-surface px-3 text-sm outline-none focus:border-secondary"
            />
            <input
              value={applicationPassword}
              onChange={(event) => setApplicationPassword(event.target.value)}
              placeholder={t("adPlatform.wordpressAppPasswordPlaceholder")}
              disabled={isSubmitting}
              type="password"
              autoComplete="off"
              className="h-11 rounded-lg border border-outline-variant/50 bg-surface px-3 text-sm outline-none focus:border-secondary"
            />
          </div>
        </div>

        <p className="text-xs leading-relaxed text-on-surface-variant">
          {t("adPlatform.wordpressManualConnectHint")}{" "}
          <button
            type="button"
            onClick={() => setGuideOpen(true)}
            className="font-semibold text-secondary hover:underline"
          >
            {t("adPlatform.wordpressSetupGuide")}
          </button>
        </p>

        {localError || error ? (
          <p className="rounded-lg border border-error/30 bg-error/10 px-3 py-2 text-sm text-error">
            {localError ?? error}
          </p>
        ) : null}

        <div className="flex justify-end gap-2 pt-1">
          <button
            type="button"
            onClick={onBack}
            disabled={isSubmitting}
            className="h-10 rounded-lg border border-outline-variant/50 px-4 text-sm font-semibold text-on-surface hover:bg-surface-container-high disabled:opacity-60"
          >
            {t("adPlatform.wordpressCancel")}
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="h-10 rounded-lg bg-secondary px-4 text-sm font-semibold text-on-secondary hover:opacity-90 disabled:opacity-60"
          >
            {isSubmitting ? t("adPlatform.wordpressAdding") : t("adPlatform.wordpressAdd")}
          </button>
        </div>
      </form>
    </div>
  );
}
