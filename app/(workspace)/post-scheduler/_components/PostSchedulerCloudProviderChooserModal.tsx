"use client";

import { useRouter } from "next/navigation";
import { useSyncExternalStore, type ReactElement } from "react";
import { createPortal } from "react-dom";

import { useTranslations } from "@/lib/i18n/WorkspaceLocaleProvider";
import { CLOUD_PROVIDER_ICON_SRC } from "@/lib/social/cloudProviderIconSrc";

const subscribeToClient = () => () => undefined;

/**
 * Cloud provider chooser: pick Google Drive / OneDrive / Dropbox before importing.
 * Drive connects on demand; OneDrive/Dropbox open their browser when connected,
 * otherwise route the user to Settings → Connections to connect first.
 */
export function PostSchedulerCloudProviderChooserModal({
  visible,
  onClose,
  onPickGoogleDrive,
  onPickOneDrive,
  onPickDropbox,
  googleDriveConnected,
  oneDriveConnected,
  dropboxConnected,
}: {
  visible: boolean;
  onClose: () => void;
  onPickGoogleDrive: () => void;
  onPickOneDrive: () => void;
  onPickDropbox: () => void;
  googleDriveConnected: boolean;
  oneDriveConnected: boolean;
  dropboxConnected: boolean;
}): ReactElement | null {
  const { t } = useTranslations();
  const router = useRouter();
  const mounted = useSyncExternalStore(
    subscribeToClient,
    () => true,
    () => false,
  );

  if (!visible || !mounted) {
    return null;
  }

  const goConnect = (): void => {
    onClose();
    router.push("/settings/connections");
  };

  const options = [
    {
      iconSrc: CLOUD_PROVIDER_ICON_SRC.google_drive,
      label: t("cloudStorage.sourceGoogleDrive"),
      hint: t("cloudStorage.sourceGoogleDriveHint"),
      connected: googleDriveConnected,
      onClick: googleDriveConnected ? onPickGoogleDrive : goConnect,
    },
    {
      iconSrc: CLOUD_PROVIDER_ICON_SRC.onedrive,
      label: t("cloudStorage.sourceOneDrive"),
      hint: t("cloudStorage.sourceOneDriveHint"),
      connected: oneDriveConnected,
      onClick: oneDriveConnected ? onPickOneDrive : goConnect,
    },
    {
      iconSrc: CLOUD_PROVIDER_ICON_SRC.dropbox,
      label: t("cloudStorage.sourceDropbox"),
      hint: t("cloudStorage.sourceDropboxHint"),
      connected: dropboxConnected,
      onClick: dropboxConnected ? onPickDropbox : goConnect,
    },
  ];

  return createPortal(
    <div className="fixed inset-0 z-[1310] bg-black/55">
      <button
        type="button"
        aria-label={t("common.dismiss")}
        className="absolute inset-0 cursor-default"
        onClick={onClose}
      />
      <div className="pointer-events-none fixed left-1/2 top-1/2 w-full max-w-3xl -translate-x-1/2 -translate-y-1/2 px-5">
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="cloud-provider-chooser-title"
          className="pointer-events-auto relative z-10 w-full rounded-2xl border border-outline-variant/20 bg-surface-container-high p-5 shadow-2xl"
        >
          <div className="flex items-center justify-between">
            <h2
              id="cloud-provider-chooser-title"
              className="font-headline text-lg font-bold text-on-surface"
            >
              {t("cloudStorage.chooserTitle")}
            </h2>
            <button
              type="button"
              onClick={onClose}
              aria-label={t("common.back")}
              className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-bold text-on-surface-variant transition-colors hover:bg-surface-container-highest hover:text-on-surface"
            >
              <span className="material-symbols-outlined text-lg" aria-hidden>
                arrow_back
              </span>
              {t("common.back")}
            </button>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            {options.map((option) => (
              <button
                key={option.label}
                type="button"
                onClick={option.onClick}
                className="relative flex min-h-40 flex-col items-start gap-2.5 rounded-xl border border-outline-variant/20 bg-surface-container p-4 text-left transition-colors hover:border-secondary/40 hover:bg-surface-container-highest"
              >
                {!option.connected ? (
                  <span className="absolute right-3 top-3 rounded-full bg-surface-container-highest px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-on-surface-variant">
                    {t("cloudStorage.notConnected")}
                  </span>
                ) : null}
                <img
                  src={option.iconSrc}
                  alt=""
                  className="h-8 w-8 object-contain"
                  loading="lazy"
                  decoding="async"
                />
                <span className="font-body text-sm font-bold text-on-surface">
                  {option.label}
                </span>
                <span className="font-body text-xs leading-relaxed text-on-surface-variant">
                  {option.connected ? option.hint : t("cloudStorage.connect")}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
