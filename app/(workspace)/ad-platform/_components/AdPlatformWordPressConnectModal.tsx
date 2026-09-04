"use client";

import Image from "next/image";

import { useTranslations } from "@/lib/i18n/WorkspaceLocaleProvider";
import { SOCIAL_PLATFORM_ICON_SRC } from "@/lib/social/socialPlatformIconSrc";

import { AdPlatformWordPressSelfHostedStep } from "./AdPlatformWordPressSelfHostedStep";

interface Props {
  open: boolean;
  error: string | null;
  isSubmitting: boolean;
  /** Sites whose stored credential was rejected and need re-authorizing. */
  reconnectSites: readonly string[];
  onClose: () => void;
  /** Starts the WordPress.com OAuth flow. */
  onConnectHosted: () => Promise<void>;
  selfHostedOpen: boolean;
  onOpenSelfHosted: () => void;
  onCloseSelfHosted: () => void;
  onConnectSelfHostedManual: (payload: {
    siteUrl: string;
    userLogin: string;
    applicationPassword: string;
  }) => Promise<void>;
}

/**
 * WordPress connect chooser: WordPress.com OAuth, or self-hosted via manual
 * Application Password (site URL + login + password from Users → Profile).
 */
export function AdPlatformWordPressConnectModal({
  open,
  error,
  isSubmitting,
  reconnectSites,
  onClose,
  onConnectHosted,
  selfHostedOpen,
  onOpenSelfHosted,
  onCloseSelfHosted,
  onConnectSelfHostedManual,
}: Props): React.ReactElement | null {
  const { t } = useTranslations();

  if (!open) {
    return null;
  }

  const iconSrc = SOCIAL_PLATFORM_ICON_SRC.wordpress;
  const title = selfHostedOpen
    ? t("adPlatform.wordpressConnectTitle")
    : t("adPlatform.wordpressTitle");

  return (
    <div className="fixed inset-0 z-[160] flex items-end justify-center bg-black/70 p-0 sm:items-center sm:p-4">
      <div className="w-full max-w-lg rounded-t-2xl border border-outline-variant/35 bg-surface p-6 text-on-surface shadow-2xl sm:rounded-2xl">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            {iconSrc ? (
              <Image src={iconSrc} alt="" width={36} height={36} className="h-9 w-9" />
            ) : null}
            <h2 className="text-xl font-bold">{title}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full text-on-surface-variant hover:bg-surface-container-high"
            aria-label="Close"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="mt-5 border-t border-outline-variant/35 pt-6">
          {selfHostedOpen ? (
            <AdPlatformWordPressSelfHostedStep
              isSubmitting={isSubmitting}
              error={error}
              onBack={onCloseSelfHosted}
              onConnect={onConnectSelfHostedManual}
            />
          ) : (
          <>
          {reconnectSites.length > 0 ? (
            <div className="mb-5 rounded-lg border border-error/30 bg-error/10 px-3 py-2 text-sm">
              <p className="font-semibold text-error">
                {t("adPlatform.wordpressReconnectNeeded")}
              </p>
              <ul className="mt-1 list-inside list-disc text-on-surface-variant">
                {reconnectSites.map((site) => (
                  <li key={site} className="truncate">
                    {site}
                  </li>
                ))}
              </ul>
              <p className="mt-1 text-xs text-on-surface-variant">
                {t("adPlatform.wordpressHosted")} →{" "}
                {t("adPlatform.wordpressReconnect")}
              </p>
            </div>
          ) : null}

          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={onOpenSelfHosted}
              disabled={isSubmitting}
              className="flex flex-col items-center justify-center gap-3 rounded-xl border border-outline-variant/50 px-4 py-8 hover:border-secondary hover:bg-surface-container-high disabled:opacity-60"
            >
              <span className="material-symbols-outlined text-4xl text-secondary">dns</span>
              <span className="text-sm font-semibold">
                {t("adPlatform.wordpressSelfHosted")}
              </span>
            </button>

            <button
              type="button"
              onClick={() => void onConnectHosted()}
              disabled={isSubmitting}
              className="flex flex-col items-center justify-center gap-3 rounded-xl border border-outline-variant/50 px-4 py-8 hover:border-secondary hover:bg-surface-container-high disabled:opacity-60"
            >
              <span className="material-symbols-outlined text-4xl text-secondary">
                cloud_done
              </span>
              <span className="text-center text-sm font-semibold">
                {t("adPlatform.wordpressHosted")}
              </span>
              {isSubmitting ? (
                <span className="text-xs text-on-surface-variant">
                  {t("adPlatform.wordpressOpening")}
                </span>
              ) : null}
            </button>
          </div>

          {error ? (
            <p className="mt-5 rounded-lg border border-error/30 bg-error/10 px-3 py-2 text-sm text-error">
              {error}
            </p>
          ) : null}
          </>
          )}
        </div>
      </div>
    </div>
  );
}
