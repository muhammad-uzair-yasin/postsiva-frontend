"use client";

import { useTranslations } from "@/lib/i18n/WorkspaceLocaleProvider";
import type { CloudConnection } from "@/lib/social/cloudStorageApi";
import { CLOUD_PROVIDER_ICON_SRC } from "@/lib/social/cloudProviderIconSrc";

import type { CloudProviderItem } from "../_data/cloudProviders";

interface CloudStorageConnectionCardProps {
  item: CloudProviderItem;
  connection: CloudConnection | undefined;
  isLoading: boolean;
  connectPending: boolean;
  disconnectPending: boolean;
  onConnect: () => void;
  onDisconnect: () => void;
}

/**
 * Compact horizontal row for a cloud provider (matches Social accounts rows).
 * Coming-soon providers show a disabled badge instead of Connect.
 */
export function CloudStorageConnectionCard({
  item,
  connection,
  isLoading,
  connectPending,
  disconnectPending,
  onConnect,
  onDisconnect,
}: CloudStorageConnectionCardProps): React.ReactElement {
  const { t } = useTranslations();
  const connected = connection?.status === "connected";
  const reconnectRequired = connection?.status === "reconnect_required";

  return (
    <article
      className={`flex min-h-[72px] items-center gap-4 rounded-lg border border-outline-variant/35 bg-surface-container-low px-4 py-3 ${
        item.comingSoon ? "opacity-70" : ""
      }`}
    >
      <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-surface-container-high">
        {/* eslint-disable-next-line @next/next/no-img-element -- static brand asset */}
        <img
          src={CLOUD_PROVIDER_ICON_SRC[item.provider]}
          alt=""
          className="h-8 w-8 object-contain"
          loading="lazy"
          decoding="async"
        />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="truncate text-sm font-bold text-on-surface">{item.name}</h3>
          <span className="rounded bg-primary/12 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-primary">
            {t("cloudStorage.beta")}
          </span>
          {item.comingSoon ? (
            <span className="rounded bg-on-surface-variant/12 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-on-surface-variant">
              {t("cloudStorage.comingSoon")}
            </span>
          ) : connected ? (
            <span className="rounded bg-secondary/12 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-secondary">
              {t("adPlatform.cardConnected")}
            </span>
          ) : reconnectRequired ? (
            <span className="rounded bg-error/12 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-error">
              {t("cloudStorage.reconnectBadge")}
            </span>
          ) : null}
        </div>
        <p className="mt-0.5 truncate text-sm text-on-surface-variant">
          {connected && connection?.account_email
            ? connection.account_email
            : item.description}
        </p>
      </div>
      {renderAction()}
    </article>
  );

  function renderAction(): React.ReactElement {
    if (item.comingSoon) {
      return (
        <span className="shrink-0 rounded-lg border border-outline-variant/40 px-3 py-1.5 text-xs font-semibold text-on-surface-variant">
          {t("cloudStorage.comingSoon")}
        </span>
      );
    }
    if (isLoading) {
      return (
        <div className="h-9 w-24 shrink-0 animate-pulse rounded-lg bg-on-surface-variant/15" />
      );
    }
    if (connected) {
      return (
        <button
          type="button"
          disabled={disconnectPending}
          onClick={onDisconnect}
          className="flex h-9 shrink-0 items-center justify-center rounded-lg border border-outline-variant/50 px-4 text-sm font-semibold text-on-surface-variant hover:bg-surface-container-high hover:text-error disabled:cursor-not-allowed disabled:opacity-50"
        >
          {disconnectPending
            ? t("adPlatform.cardDisconnecting")
            : t("adPlatform.cardDisconnect")}
        </button>
      );
    }
    return (
      <button
        type="button"
        disabled={connectPending}
        onClick={onConnect}
        className="flex h-9 shrink-0 items-center justify-center rounded-lg bg-primary-container px-4 text-sm font-semibold text-on-primary-container hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {connectPending
          ? t("adPlatform.cardConnecting")
          : reconnectRequired
            ? t("cloudStorage.reconnect")
            : t("cloudStorage.connect")}
      </button>
    );
  }
}
