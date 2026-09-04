"use client";

import type { ReactElement } from "react";
import { CANVA_ICON_SRC } from "@/lib/social/designProviderIconSrc";
import { useTranslations } from "@/lib/i18n/WorkspaceLocaleProvider";

interface CanvaConnectionCardProps {
  connected: boolean;
  accountLabel: string | null;
  isLoading: boolean;
  connectPending: boolean;
  disconnectPending: boolean;
  onConnect: () => void;
  onDisconnect: () => void;
}

/** Compact horizontal row — matches Social accounts AccountRow density. */
export function CanvaConnectionCard({
  connected,
  accountLabel,
  isLoading,
  connectPending,
  disconnectPending,
  onConnect,
  onDisconnect,
}: CanvaConnectionCardProps): ReactElement {
  const { t } = useTranslations();

  return (
    <article className="flex min-h-[72px] items-center gap-4 rounded-lg border border-outline-variant/35 bg-surface-container-low px-4 py-3">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-surface-container-high">
        {/* eslint-disable-next-line @next/next/no-img-element -- static brand asset */}
        <img
          src={CANVA_ICON_SRC}
          alt=""
          className="h-8 w-8 object-contain"
          loading="lazy"
          decoding="async"
        />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="truncate text-sm font-bold text-on-surface">
            {t("designing.canvaName")}
          </h3>
          {connected ? (
            <span className="rounded bg-secondary/12 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-secondary">
              {t("adPlatform.cardConnected")}
            </span>
          ) : null}
        </div>
        <p className="mt-0.5 truncate text-sm text-on-surface-variant">
          {connected && accountLabel
            ? accountLabel
            : t("designing.canvaDescription")}
        </p>
      </div>
      {renderAction()}
    </article>
  );

  function renderAction(): ReactElement {
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
        {connectPending ? t("adPlatform.cardConnecting") : t("designing.connectCanva")}
      </button>
    );
  }
}
