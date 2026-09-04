"use client";

import { useCallback, useState, type ReactElement } from "react";

import { useTranslations } from "@/lib/i18n/WorkspaceLocaleProvider";
import type { CloudProvider } from "@/lib/social/cloudStorageApi";
import { invalidateUnifiedMediaListCache } from "@/lib/social/unifiedMediaApi";

import { CloudFolderBrowser } from "../../post-scheduler/_components/CloudFolderBrowser";
import { useCloudImport, type CloudImportFile } from "../../post-scheduler/_hooks/useCloudImport";
import { useGoogleDriveImport } from "../../post-scheduler/_hooks/useGoogleDriveImport";
import { useCloudConnections } from "../../settings/_hooks/useCloudConnections";

const PROVIDER_TABS: readonly { provider: CloudProvider; icon: string }[] = [
  { provider: "google_drive", icon: "add_to_drive" },
  { provider: "onedrive", icon: "cloud" },
  { provider: "dropbox", icon: "cloud_queue" },
];

function providerLabel(provider: CloudProvider, t: (k: string) => string): string {
  if (provider === "google_drive") return t("cloudStorage.sourceGoogleDrive");
  if (provider === "onedrive") return t("cloudStorage.sourceOneDrive");
  return t("cloudStorage.sourceDropbox");
}

function providerImportHint(provider: CloudProvider, t: (k: string) => string): string {
  if (provider === "google_drive") return t("cloudStorage.sourceGoogleDriveHint");
  if (provider === "onedrive") return t("cloudStorage.sourceOneDriveHint");
  return t("cloudStorage.sourceDropboxHint");
}

/**
 * Library "Cloud" tab. Google Drive uses the Picker; OneDrive and Dropbox use
 * the native folder browser. Both import chosen files straight into the
 * workspace library (no composer handoff) and refresh the list afterward.
 */
export function CloudStorageSection({
  onSavedToLibrary,
}: {
  onSavedToLibrary: () => void;
}): ReactElement {
  const { t } = useTranslations();
  const { loading, error: connectionsError, connectingProvider, connect, connectionFor } =
    useCloudConnections();
  const drive = useGoogleDriveImport();
  const cloudImport = useCloudImport();
  const [activeProvider, setActiveProvider] = useState<CloudProvider>("google_drive");
  const [browserOpen, setBrowserOpen] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const connection = connectionFor(activeProvider);
  const connected = connection?.status === "connected";
  const reconnectRequired = connection?.status === "reconnect_required";

  const announceSaved = useCallback(
    (count: number): void => {
      if (count > 0) {
        setNotice(t("cloudStorage.savedCount", { count: String(count) }));
        onSavedToLibrary();
        window.setTimeout(() => {
          setNotice(null);
        }, 4000);
      }
    },
    [onSavedToLibrary, t],
  );

  const handleDriveImport = useCallback((): void => {
    setNotice(null);
    let count = 0;
    void drive
      .startPick(() => {
        count += 1;
        invalidateUnifiedMediaListCache();
      })
      .then(() => announceSaved(count));
  }, [drive, announceSaved]);

  const confirmNativeSave = useCallback(
    (files: CloudImportFile[]): void => {
      setNotice(null);
      void cloudImport
        .importFiles(activeProvider, files, () => {
          invalidateUnifiedMediaListCache();
        })
        .then((count) => {
          if (count > 0) {
            setBrowserOpen(false);
            announceSaved(count);
          }
        });
    },
    [activeProvider, announceSaved, cloudImport],
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center rounded-2xl border border-dashed border-outline-variant/25 bg-surface-container-low/40 px-4 py-16">
        <span className="material-symbols-outlined animate-spin text-3xl text-secondary/50" aria-hidden>
          progress_activity
        </span>
      </div>
    );
  }

  const isGoogle = activeProvider === "google_drive";
  const importing = drive.phase !== "idle";
  const label = providerLabel(activeProvider, t);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-2" role="tablist" aria-label={t("cloudStorage.sectionTitle")}>
        {PROVIDER_TABS.map((tab) => (
          <button
            key={tab.provider}
            type="button"
            role="tab"
            aria-selected={activeProvider === tab.provider}
            onClick={() => {
              setActiveProvider(tab.provider);
              setNotice(null);
            }}
            className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-bold transition-colors ${
              activeProvider === tab.provider
                ? "border-secondary/50 bg-secondary/10 text-secondary"
                : "border-outline-variant/25 text-on-surface-variant hover:bg-surface-container"
            }`}
          >
            <span className="material-symbols-outlined text-base" aria-hidden>
              {tab.icon}
            </span>
            {providerLabel(tab.provider, t)}
          </button>
        ))}
      </div>

      {notice ? (
        <p className="rounded-xl border border-secondary/30 bg-secondary/10 px-4 py-2.5 text-xs font-bold text-secondary" role="status">
          {notice}
        </p>
      ) : null}
      {isGoogle && drive.error ? (
        <div className="flex items-center justify-between gap-3 rounded-xl border border-error/30 bg-error/5 px-4 py-2.5">
          <p className="text-xs font-semibold text-error" role="alert">
            {t("cloudStorage.importFailed")}
          </p>
          <button
            type="button"
            onClick={handleDriveImport}
            className="shrink-0 rounded-lg border border-error/35 px-3 py-1.5 text-xs font-bold text-error hover:bg-error/10"
          >
            {t("cloudStorage.tryAgain")}
          </button>
        </div>
      ) : null}
      {connectionsError ? (
        <p className="rounded-xl border border-error/30 bg-error/5 px-4 py-2.5 text-xs font-semibold text-error" role="alert">
          {connectionsError}
        </p>
      ) : null}

      {!connected ? (
        <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-outline-variant/25 bg-surface-container-low/40 px-4 py-16 text-center">
          <span className="material-symbols-outlined text-5xl text-secondary/40" aria-hidden>
            cloud
          </span>
          <p className="max-w-[22rem] text-sm leading-relaxed text-on-surface-variant">
            {reconnectRequired
              ? t("cloudStorage.reconnectPrompt", { provider: label })
              : t("cloudStorage.connectPrompt", { provider: label })}
          </p>
          <button
            type="button"
            disabled={connectingProvider === activeProvider}
            onClick={() => {
              void connect(activeProvider);
            }}
            className="rounded-xl bg-primary px-5 py-2.5 text-xs font-bold text-on-primary shadow-md transition-colors hover:bg-primary/90 disabled:opacity-60"
          >
            {connectingProvider === activeProvider
              ? t("adPlatform.cardConnecting")
              : reconnectRequired
                ? t("cloudStorage.reconnect")
                : t("cloudStorage.connect")}
          </button>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-outline-variant/25 bg-surface-container-low/40 px-4 py-16 text-center">
          <span className="material-symbols-outlined text-5xl text-secondary/40" aria-hidden>
            cloud_download
          </span>
          <p className="max-w-[22rem] text-sm leading-relaxed text-on-surface-variant">
            {providerImportHint(activeProvider, t)}
          </p>
          <button
            type="button"
            disabled={isGoogle ? importing : cloudImport.phase !== "idle"}
            onClick={() => {
              if (isGoogle) {
                handleDriveImport();
              } else {
                setBrowserOpen(true);
              }
            }}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-xs font-bold text-on-primary shadow-md transition-colors hover:bg-primary/90 disabled:opacity-60"
          >
            {isGoogle && importing ? (
              <span className="material-symbols-outlined animate-spin text-base" aria-hidden>
                progress_activity
              </span>
            ) : (
              <span className="material-symbols-outlined text-base" aria-hidden>
                cloud_download
              </span>
            )}
            {isGoogle && importing
              ? (drive.statusLabel ?? t("cloudStorage.importing"))
              : t("cloudStorage.importFromProvider", { provider: label })}
          </button>
        </div>
      )}

      {browserOpen && !isGoogle ? (
        <CloudFolderBrowser
          provider={activeProvider}
          providerLabel={label}
          visible
          confirmLabel={t("cloudStorage.saveSelected")}
          busy={cloudImport.phase !== "idle"}
          statusLabel={cloudImport.statusLabel}
          importError={cloudImport.error}
          reconnectRequired={reconnectRequired}
          onReconnect={() => {
            void connect(activeProvider);
          }}
          onClose={() => {
            setBrowserOpen(false);
          }}
          onConfirm={confirmNativeSave}
        />
      ) : null}
    </div>
  );
}
