"use client";

import type { AdPlatformItem } from "../_data/adPlatforms";
import { SocialPlatformIcon } from "@/lib/social/SocialPlatformIcon";
import { isSocialPlatformIconId } from "@/lib/social/socialPlatformIconSrc";
import { useTranslations } from "@/lib/i18n/WorkspaceLocaleProvider";

interface AdPlatformConnectionCardProps {
  platform: AdPlatformItem;
  connected: boolean;
  /** When true, show skeleton UI until OAuth status is known. */
  isLoading?: boolean;
  /** When true, disconnect request is in flight for this card. */
  disconnectPending?: boolean;
  /** When true, connect URL request is in flight for this card. */
  connectPending?: boolean;
  /** Keep OAuth connect available when this platform supports multiple accounts. */
  allowAdditionalConnection?: boolean;
  onConnect: (id: string) => void;
  /** Omit when disconnect is not available for this card. */
  onDisconnect?: (id: string) => void;
}

export function AdPlatformConnectionCard({
  platform,
  connected,
  isLoading = false,
  disconnectPending = false,
  connectPending = false,
  allowAdditionalConnection = false,
  onConnect,
  onDisconnect,
}: AdPlatformConnectionCardProps): React.ReactElement {
  const { t } = useTranslations();
  const borderHover =
    platform.hoverAccent === "secondary"
      ? "hover:border-secondary/30"
      : "hover:border-primary/30";
  const glowHover =
    platform.hoverAccent === "secondary"
      ? "group-hover:bg-secondary/20"
      : "group-hover:bg-primary/20";

  if (isLoading) {
    return (
      <div
        className="relative overflow-hidden rounded-2xl border border-outline-variant/10 bg-surface-container p-4 shadow-[0_4px_16px_rgba(0,0,0,0.08)] sm:p-5"
        aria-busy="true"
        aria-label={t("adPlatform.cardLoadingAria", { platform: platform.name })}
      >
        <div className="absolute right-2 top-2 h-4 w-14 animate-pulse rounded-full bg-on-surface-variant/15 sm:right-3 sm:top-3" />
        <div className="flex flex-col items-center space-y-3 text-center sm:space-y-4">
          <div className="h-12 w-12 animate-pulse rounded-xl bg-on-surface-variant/15 sm:h-14 sm:w-14" />
          <div className="w-full space-y-1.5">
            <div className="mx-auto h-5 w-24 animate-pulse rounded-md bg-on-surface-variant/15" />
            <div className="mx-auto h-3 w-full max-w-[140px] animate-pulse rounded-md bg-on-surface-variant/10" />
          </div>
          <div className="h-8 w-full animate-pulse rounded-lg bg-on-surface-variant/15" />
        </div>
      </div>
    );
  }

  return (
    <div
      className={`group relative overflow-hidden rounded-2xl border border-outline-variant/10 bg-surface-container p-4 shadow-[0_4px_16px_rgba(0,0,0,0.08)] transition-all duration-500 hover:bg-surface-container-high sm:p-5 ${borderHover} ${connected ? "ring-1 ring-secondary/25" : ""}`}
    >
      <div className="absolute right-2 top-2 z-10 flex flex-col items-end gap-1 sm:right-3 sm:top-3">
        {platform.badge ? (
          <span className="rounded-full bg-primary/12 px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wide text-primary sm:px-2 sm:py-1 sm:text-[9px]">
            {platform.badge}
          </span>
        ) : null}
        {connected ? (
          <span className="rounded-full bg-secondary/12 px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wide text-secondary sm:px-2 sm:py-1 sm:text-[9px]">
            {t("adPlatform.cardConnected")}
          </span>
        ) : null}
      </div>
      <div
        className={`absolute -right-0 -top-0 -z-10 h-24 w-24 bg-primary/5 blur-2xl transition-all sm:h-28 sm:w-28 ${glowHover}`}
      />
      <div className="flex flex-col items-center space-y-3 text-center sm:space-y-4">
        <div
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl transition-transform duration-500 group-hover:scale-105 sm:h-14 sm:w-14 sm:rounded-2xl ${platform.iconWrapperClassName}`}
        >
          {isSocialPlatformIconId(platform.id) ? (
            <SocialPlatformIcon platform={platform.id} className="h-7 w-7 sm:h-8 sm:w-8" />
          ) : (
            <span
              className="material-symbols-outlined text-2xl text-white sm:text-3xl"
              style={{
                fontVariationSettings: platform.iconFilled
                  ? "'FILL' 1"
                  : "'FILL' 0",
              }}
            >
              {platform.icon}
            </span>
          )}
        </div>
        <div className="min-w-0 px-0.5">
          <h3 className="mb-0.5 text-sm font-bold leading-tight text-on-surface sm:text-base">
            {platform.name}
          </h3>
          <p className="line-clamp-2 text-[11px] leading-snug text-on-surface-variant sm:text-xs min-h-[2.25rem] sm:min-h-[2.5rem]">
            {platform.description}
          </p>
        </div>
        {connected && (onDisconnect || allowAdditionalConnection) ? (
          <div className="flex w-full flex-col gap-1.5">
            {allowAdditionalConnection ? (
              <button
                type="button"
                disabled={connectPending}
                onClick={() => { onConnect(platform.id); }}
                className="w-full rounded-lg bg-primary-container px-2 py-2 text-[11px] font-bold text-on-primary-container transition-all hover:shadow-[0_0_16px_rgba(107,73,216,0.35)] active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 sm:px-3 sm:text-xs"
              >
                {connectPending
                  ? t("adPlatform.cardConnecting")
                  : t("adPlatform.cardConnectAnotherChannel")}
              </button>
            ) : (
              <div className="w-full rounded-lg border border-outline-variant/25 bg-surface-container-high/80 px-2 py-2 text-center text-[11px] font-bold text-on-surface-variant sm:px-3 sm:text-xs">
                {t("adPlatform.cardConnected")}
              </div>
            )}
            {onDisconnect ? (
              <button
                type="button"
                disabled={disconnectPending}
                onClick={() => { onDisconnect(platform.id); }}
                className="w-full rounded-lg border border-error/35 bg-transparent px-2 py-2 text-[11px] font-bold text-error transition-colors hover:bg-error/10 disabled:cursor-not-allowed disabled:opacity-50 sm:px-3 sm:text-xs"
              >
                {disconnectPending
                  ? t("adPlatform.cardDisconnecting")
                  : t("adPlatform.cardDisconnect")}
              </button>
            ) : null}
          </div>
        ) : (
          <button
            type="button"
            disabled={connected || connectPending}
            onClick={() => {
              if (!connected && !connectPending) {
                onConnect(platform.id);
              }
            }}
            className={
              connected
                ? "w-full cursor-default rounded-lg border border-outline-variant/25 bg-surface-container-high/80 px-2 py-2 text-[11px] font-bold text-on-surface-variant sm:px-3 sm:text-xs"
                : "w-full rounded-lg bg-primary-container px-2 py-2 text-[11px] font-bold text-on-primary-container transition-all hover:shadow-[0_0_16px_rgba(107,73,216,0.35)] active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 sm:px-3 sm:text-xs"
            }
          >
            {connected
              ? t("adPlatform.cardConnected")
              : connectPending
                ? t("adPlatform.cardConnecting")
                : t("adPlatform.cardConnect")}
          </button>
        )}
      </div>
    </div>
  );
}
