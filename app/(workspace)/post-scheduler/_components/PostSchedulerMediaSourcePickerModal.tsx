"use client";

import { useSyncExternalStore, type ReactElement } from "react";
import { createPortal } from "react-dom";

import { useTranslations } from "@/lib/i18n/WorkspaceLocaleProvider";
import type { CloudProvider } from "@/lib/social/cloudStorageApi";
import { CLOUD_PROVIDER_ICON_SRC } from "@/lib/social/cloudProviderIconSrc";
import { CANVA_ICON_SRC } from "@/lib/social/designProviderIconSrc";

const subscribeToClient = () => () => undefined;
type MediaSourceOption = {
  key: string;
  label: string;
  icon?: string;
  iconSrc?: string;
  onClick?: () => void;
  status?: "connected" | "not-connected" | "coming-soon";
};

function StatusBadge({ status }: { readonly status?: MediaSourceOption["status"] }): ReactElement | null {
  if (!status) return null;
  const label =
    status === "connected" ? "Connected" : status === "not-connected" ? "Not connected" : "Coming soon";
  return (
    <span className="rounded-full bg-surface-container-highest px-2 py-0.5 text-[9px] font-bold uppercase text-on-surface-variant">
      {label}
    </span>
  );
}

function SourceCard({ option }: { readonly option: MediaSourceOption }): ReactElement {
  const disabled = option.status === "coming-soon";
  const content = (
    <>
      <div className="absolute right-2 top-2 flex flex-col items-end gap-1">
        <StatusBadge status={option.status} />
      </div>
      {option.iconSrc ? (
        // eslint-disable-next-line @next/next/no-img-element -- Provider icons are small static assets.
        <img
          src={option.iconSrc}
          alt=""
          className={`${option.key === "canva" ? "h-14 w-14" : "h-8 w-8"} object-contain`}
          loading="lazy"
          decoding="async"
        />
      ) : (
        <span className="material-symbols-outlined text-4xl text-secondary" aria-hidden>
          {option.icon}
        </span>
      )}
      <span className="text-center font-body text-xs font-bold text-on-surface">{option.label}</span>
    </>
  );

  if (disabled || !option.onClick) {
    return (
      <div className="relative flex min-h-24 flex-col items-center justify-center gap-2 rounded-xl border border-outline-variant/20 bg-surface-container/60 p-3 opacity-60">
        {content}
      </div>
    );
  }
  return (
    <button
      type="button"
      onClick={option.onClick}
      className="relative flex min-h-24 flex-col items-center justify-center gap-2 rounded-xl border border-outline-variant/20 bg-surface-container p-3 transition-colors hover:border-secondary/40 hover:bg-surface-container-highest"
    >
      {content}
    </button>
  );
}

/** "Add media" chooser: upload, library, stock, cloud, and coming-soon sources. */
export function PostSchedulerMediaSourcePickerModal({
  visible,
  onClose,
  onPickDevice,
  onPickLibrary,
  onPickWordPress,
  onPickStock,
  onPickCloudProvider,
  cloudProviderStatus,
  onPickCanva,
  canvaStatus,
}: {
  visible: boolean;
  onClose: () => void;
  onPickDevice: () => void;
  onPickLibrary: () => void;
  onPickWordPress?: () => void;
  onPickStock?: () => void;
  onPickCloudProvider?: (provider: CloudProvider) => void;
  cloudProviderStatus?: (provider: CloudProvider) => "connected" | "not-connected";
  onPickCanva?: () => void;
  canvaStatus?: "connected" | "not-connected";
}): ReactElement | null {
  const { t } = useTranslations();
  const mounted = useSyncExternalStore(
    subscribeToClient,
    () => true,
    () => false,
  );

  if (!visible || !mounted) {
    return null;
  }

  const importOptions: MediaSourceOption[] = [
    {
      key: "device",
      icon: "upload",
      label: t("postScheduler.mediaLibrary.sourceFromDevice"),
      onClick: onPickDevice,
    },
    {
      key: "library",
      icon: "photo_library",
      label: t("postScheduler.mediaLibrary.sourceFromLibrary"),
      onClick: onPickLibrary,
    },
    ...(onPickStock
      ? [{ key: "stock", icon: "image_search", label: "Stock", onClick: onPickStock }]
      : []),
    ...(onPickCloudProvider && cloudProviderStatus
      ? [
          {
            key: "google-drive",
            iconSrc: CLOUD_PROVIDER_ICON_SRC.google_drive,
            label: t("cloudStorage.sourceGoogleDrive"),
            status: cloudProviderStatus("google_drive"),
            onClick: () => onPickCloudProvider("google_drive"),
          },
          {
            key: "dropbox",
            iconSrc: CLOUD_PROVIDER_ICON_SRC.dropbox,
            label: t("cloudStorage.sourceDropbox"),
            status: cloudProviderStatus("dropbox"),
            onClick: () => onPickCloudProvider("dropbox"),
          },
          {
            key: "onedrive",
            iconSrc: CLOUD_PROVIDER_ICON_SRC.onedrive,
            label: t("cloudStorage.sourceOneDrive"),
            status: cloudProviderStatus("onedrive"),
            onClick: () => onPickCloudProvider("onedrive"),
          },
        ]
      : []),
    ...(onPickWordPress
      ? [
          {
            key: "wordpress",
            icon: "language",
            label: "From WordPress media",
            onClick: onPickWordPress,
          },
        ]
      : []),
  ];
  const designOptions: MediaSourceOption[] = [
    ...(onPickCanva
      ? [
          {
            key: "canva",
            iconSrc: CANVA_ICON_SRC,
            label: "Canva",
            status: canvaStatus ?? "not-connected",
            onClick: onPickCanva,
          },
        ]
      : [{ key: "canva", iconSrc: CANVA_ICON_SRC, label: "Canva", status: "coming-soon" as const }]),
    { key: "vistacreate", icon: "design_services", label: "VistaCreate", status: "coming-soon" },
    { key: "postnitro", icon: "layers", label: "PostNitro", status: "coming-soon" },
    { key: "contentdrips", icon: "auto_awesome", label: "Contentdrips", status: "coming-soon" },
    { key: "openai", icon: "neurology", label: "OpenAI", status: "coming-soon" },
  ];

  return createPortal(
    <div className="fixed inset-0 z-[1300] bg-black/55">
      <button
        type="button"
        aria-label={t("common.dismiss")}
        className="absolute inset-0 cursor-default"
        onClick={onClose}
      />
      <div className="pointer-events-none fixed left-1/2 top-1/2 w-full max-w-5xl -translate-x-1/2 -translate-y-1/2 px-5">
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="media-source-picker-title"
          className="pointer-events-auto relative z-10 flex max-h-[88vh] w-full flex-col overflow-hidden rounded-2xl border border-outline-variant/20 bg-surface-container-high shadow-2xl"
        >
          <header className="flex shrink-0 items-center justify-between border-b border-outline-variant/15 px-6 py-4">
            <h2 id="media-source-picker-title" className="font-headline text-lg font-bold text-on-surface">
              Attach Media
            </h2>
            <button
              type="button"
              onClick={onClose}
              aria-label={t("common.dismiss")}
              className="rounded-full p-1.5 text-on-surface-variant transition-colors hover:bg-surface-container-highest hover:text-on-surface"
            >
              <span className="material-symbols-outlined text-xl" aria-hidden>
                close
              </span>
            </button>
          </header>
          <div className="media-library-scrollbar min-h-0 flex-1 overflow-y-auto px-6 py-5">
            <section>
              <h3 className="font-body text-sm font-bold text-on-surface-variant">Import from</h3>
              <div className="mt-3 grid gap-3 sm:grid-cols-4 lg:grid-cols-6">
                {importOptions.map((option) => (
                  <SourceCard key={option.key} option={option} />
                ))}
              </div>
            </section>
            <section className="mt-6">
              <h3 className="font-body text-sm font-bold text-on-surface-variant">Design with</h3>
              <div className="mt-3 grid gap-3 sm:grid-cols-3 lg:grid-cols-5">
                {designOptions.map((option) => (
                  <SourceCard key={option.key} option={option} />
                ))}
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
