"use client";

import { useCallback, useState, type ReactElement } from "react";

import { getStoredAccessToken, getStoredActiveWorkspaceId } from "@/lib/auth/session";
import { useTranslations } from "@/lib/i18n/WorkspaceLocaleProvider";
import {
  deleteOAuthTokenForWorkspace,
  fetchSocialOAuthTokenStatus,
  notifySocialOAuthStatusUpdated,
} from "@/lib/social/unifiedOAuthApi";
import {
  getAdPlatformOAuthApiKey,
  isAdPlatformConnectedFromOAuthStatus,
} from "@/lib/workspaces/workspaceAdPlatformConnection";

import { AdPlatformDisconnectConfirmModal } from "../../ad-platform/_components/AdPlatformDisconnectConfirmModal";
import { AD_PLATFORM_ITEMS } from "../../ad-platform/_data/adPlatforms";
import { useWorkspaceHeaderAccounts } from "../../_components/WorkspaceHeaderAccountsProvider";
import { useWorkspacePlatformsModal } from "../../_components/WorkspacePlatformsModalProvider";

import { AccountsSocialPlatformRow } from "./AccountsSocialPlatformRow";

export function AccountsSocialPlatformsSection(): ReactElement {
  const { t } = useTranslations();
  const { oauthTokenStatus, isConnectGateLoading } = useWorkspaceHeaderAccounts();
  const { openPlatformsForConnect } = useWorkspacePlatformsModal();
  const [disconnectingId, setDisconnectingId] = useState<string | null>(null);
  const [pendingDisconnectId, setPendingDisconnectId] = useState<string | null>(null);
  const [disconnectError, setDisconnectError] = useState<string | null>(null);

  const confirmDisconnect = useCallback(async (): Promise<void> => {
    const adPlatformId = pendingDisconnectId;
    const oauthPlatform =
      adPlatformId !== null ? getAdPlatformOAuthApiKey(adPlatformId) : null;
    if (!adPlatformId || !oauthPlatform) {
      return;
    }
    const token = getStoredAccessToken();
    const workspaceId = getStoredActiveWorkspaceId();
    if (!token?.trim() || !workspaceId?.trim()) {
      setDisconnectError(t("adPlatform.errorDisconnectSignIn"));
      return;
    }
    setDisconnectError(null);
    setDisconnectingId(adPlatformId);
    try {
      await deleteOAuthTokenForWorkspace(token, workspaceId, oauthPlatform);
      const map = await fetchSocialOAuthTokenStatus(token, workspaceId, {
        preferCache: false,
      });
      notifySocialOAuthStatusUpdated(workspaceId, map);
      setPendingDisconnectId(null);
    } catch (error) {
      setDisconnectError(
        error instanceof Error ? error.message : t("adPlatform.errorDisconnectFailed"),
      );
    } finally {
      setDisconnectingId(null);
    }
  }, [pendingDisconnectId, t]);

  const pendingPlatform = AD_PLATFORM_ITEMS.find((item) => item.id === pendingDisconnectId);

  return (
    <section aria-labelledby="accounts-social-platforms-heading" className="flex flex-col gap-2">
      <div className="mt-3 flex items-center gap-3 first:mt-0">
        <span className="material-symbols-outlined text-[20px] text-on-surface-variant">
          hub
        </span>
        <h2
          id="accounts-social-platforms-heading"
          className="text-xs font-bold uppercase text-on-surface-variant"
        >
          {t("settings.accountsSocialSection")}
        </h2>
        <span className="text-xs text-on-surface-variant/70">{AD_PLATFORM_ITEMS.length}</span>
      </div>

      <div className="flex flex-col gap-2">
        {AD_PLATFORM_ITEMS.map((platform) => {
          const connected = isAdPlatformConnectedFromOAuthStatus(
            oauthTokenStatus,
            platform.id,
          );
          const oauthKey = getAdPlatformOAuthApiKey(platform.id);
          const canDisconnect = Boolean(oauthKey) && platform.id !== "youtube";

          return (
            <AccountsSocialPlatformRow
              key={platform.id}
              platform={platform}
              connected={connected}
              isLoading={isConnectGateLoading}
              connectPending={false}
              disconnectPending={disconnectingId === platform.id}
              allowAdditionalConnection={platform.id === "youtube"}
              onConnect={openPlatformsForConnect}
              onDisconnect={() => {
                if (!canDisconnect) {
                  return;
                }
                setDisconnectError(null);
                setPendingDisconnectId(platform.id);
              }}
            />
          );
        })}
      </div>

      <AdPlatformDisconnectConfirmModal
        open={pendingDisconnectId !== null}
        platformName={pendingPlatform?.name ?? t("adPlatform.defaultPlatformLabel")}
        busy={disconnectingId !== null}
        error={disconnectError}
        onClose={() => {
          if (disconnectingId === null) {
            setPendingDisconnectId(null);
            setDisconnectError(null);
          }
        }}
        onConfirm={() => confirmDisconnect()}
      />
    </section>
  );
}
