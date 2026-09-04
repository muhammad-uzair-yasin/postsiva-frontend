"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslations } from "@/lib/i18n/WorkspaceLocaleProvider";
import { formatUserFacingApiError } from "@/lib/api/formatUserFacingApiError";
import {
  getStoredAccessToken,
  getStoredActiveWorkspaceId,
  POSTSIVA_WORKSPACES_CHANGED,
} from "@/lib/auth/session";
import {
  deleteOAuthTokenForWorkspace,
  fetchSocialOAuthAuthorizeUrl,
  fetchSocialOAuthTokenStatus,
  notifySocialOAuthStatusUpdated,
  peekSocialOAuthTokenStatusCache,
  saveMastodonInstanceForWorkspace,
  type SocialOAuthTokenStatusMap,
  type SocialOAuthTokenStatusPlatform,
} from "@/lib/social/unifiedOAuthApi";
import { runPostOAuthConnectSync as executePostOAuthConnectSync } from "@/lib/social/runPostOAuthConnectSync";
import { renderOAuthConnectPopupLoadingPage } from "@/lib/social/renderOAuthConnectPopupLoadingPage";
import {
  connectWordPressSelfHostedManual,
  listWordPressConnections,
  startWordPressOAuth,
} from "@/lib/social/wordpressIntegrationApi";
import {
  getAdPlatformOAuthApiKey,
  isAdPlatformConnectedFromOAuthStatus,
} from "@/lib/workspaces/workspaceAdPlatformConnection";
import { peekUnifiedUserProfilesCache } from "@/lib/dashboard/channelProfileApi";
import {
  mergePartialUnifiedProfilesCache,
  notifyUnifiedProfilesMerged,
} from "@/lib/dashboard/unifiedProfilesPartialMerge";
import { useUpgradePlanLimit } from "@/lib/billing/UpgradePlanLimitProvider";
import { BillingPlanError } from "@/lib/billing/billingErrors";
import { useBilling } from "@/lib/billing/BillingContext";
import {
  type ConnectedAccountSnapshot,
} from "@/lib/billing/connectedAccountSnapshot";

import { AD_PLATFORM_ITEMS, type AdPlatformItem } from "../_data/adPlatforms";
import { AdPlatformBlueskyConnectModal } from "./AdPlatformBlueskyConnectModal";
import { AdPlatformConnectionCard } from "./AdPlatformConnectionCard";
import { CloudStorageConnectionsSection } from "../../settings/_components/CloudStorageConnectionsSection";
import { DesigningConnectionsSection } from "../../settings/_components/DesigningConnectionsSection";
import { AdPlatformDisconnectConfirmModal } from "./AdPlatformDisconnectConfirmModal";
import { AdPlatformMastodonInstanceModal } from "./AdPlatformMastodonInstanceModal";
import { AdPlatformWordPressConnectModal } from "./AdPlatformWordPressConnectModal";
import { SocialPlatformIcon } from "@/lib/social/SocialPlatformIcon";
import { isSocialPlatformIconId } from "@/lib/social/socialPlatformIconSrc";

const MODAL_ANIM_MS = 280;

const AD_PLATFORM_ORDER = new Map(
  AD_PLATFORM_ITEMS.map((p, index) => [p.id, index]),
);

function sortPlatformsByConnection(
  items: readonly AdPlatformItem[],
  oauthStatus: SocialOAuthTokenStatusMap | null,
): AdPlatformItem[] {
  if (!oauthStatus) {
    return [...items];
  }
  return [...items].sort((a, b) => {
    const ca = isAdPlatformConnectedFromOAuthStatus(oauthStatus, a.id);
    const cb = isAdPlatformConnectedFromOAuthStatus(oauthStatus, b.id);
    if (ca !== cb) {
      return ca ? -1 : 1;
    }
    return (
      (AD_PLATFORM_ORDER.get(a.id) ?? 0) - (AD_PLATFORM_ORDER.get(b.id) ?? 0)
    );
  });
}

interface AdPlatformsModalProps {
  onClose: () => void;
  /**
   * `embedded` — same UI as the modal, but as page content (no overlay, no body scroll lock).
   * Use on Settings → Connections.
   */
  variant?: "modal" | "embedded";
}

type ConnectSyncPhase = "idle" | "syncing" | "success";

export function AdPlatformsModal({
  onClose,
  variant = "modal",
}: AdPlatformsModalProps): React.ReactElement {
  const { t } = useTranslations();
  const { refresh } = useBilling();
  const { promptUpgradeIfNeeded, promptUpgradeForBillingError } = useUpgradePlanLimit();
  const embedded = variant === "embedded";
  const [entered, setEntered] = useState(embedded);
  const [leaving, setLeaving] = useState(false);
  const [oauthStatus, setOauthStatus] = useState<SocialOAuthTokenStatusMap | null>(
    null,
  );
  const [oauthStatusLoading, setOauthStatusLoading] = useState(true);
  const [disconnectingId, setDisconnectingId] = useState<string | null>(null);
  const [pendingDisconnectPlatformId, setPendingDisconnectPlatformId] = useState<
    string | null
  >(null);
  const [disconnectConfirmError, setDisconnectConfirmError] = useState<
    string | null
  >(null);
  const [connectingId, setConnectingId] = useState<string | null>(null);
  const [connectError, setConnectError] = useState<string | null>(null);
  const [connectSyncPhase, setConnectSyncPhase] =
    useState<ConnectSyncPhase>("idle");
  const [connectSyncPlatformId, setConnectSyncPlatformId] = useState<
    string | null
  >(null);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  /** Browser `setInterval` id (number); avoid `NodeJS.Timeout` mismatch with DOM typings. */
  const popupMonitorIntervalRef = useRef<number | null>(null);
  const [blueskyModalOpen, setBlueskyModalOpen] = useState(false);
  const [mastodonModalOpen, setMastodonModalOpen] = useState(false);
  const [wordpressModalOpen, setWordpressModalOpen] = useState(false);
  const [wordpressReconnectSites, setWordpressReconnectSites] = useState<string[]>([]);
  const [wordpressSelfHostedOpen, setWordpressSelfHostedOpen] = useState(false);

  // Load WordPress connection health whenever the chooser opens, so sites whose
  // token WordPress.com rejected are called out with a reconnect prompt.
  useEffect(() => {
    if (!wordpressModalOpen) {
      return;
    }
    const token = getStoredAccessToken();
    const workspaceId = getStoredActiveWorkspaceId();
    if (!token?.trim() || !workspaceId?.trim()) {
      return;
    }
    let cancelled = false;
    void listWordPressConnections(token, workspaceId)
      .then((rows) => {
        if (cancelled) return;
        setWordpressReconnectSites(
          rows
            .filter((row) => row.status === "reconnect_required")
            .map((row) => row.siteName ?? row.siteUrl),
        );
      })
      .catch(() => {
        if (!cancelled) setWordpressReconnectSites([]);
      });
    return () => {
      cancelled = true;
    };
  }, [wordpressModalOpen]);

  useEffect(() => {
    let cancelled = false;
    const loadOAuthStatus = (): void => {
      const token = getStoredAccessToken();
      const workspaceId = getStoredActiveWorkspaceId();
      if (!token?.trim() || !workspaceId?.trim()) {
        setOauthStatus(null);
        setOauthStatusLoading(false);
        return;
      }
      const cached = peekSocialOAuthTokenStatusCache(workspaceId);
      if (cached) {
        setOauthStatus(cached);
        setOauthStatusLoading(false);
        return;
      }
      setOauthStatusLoading(true);
      void fetchSocialOAuthTokenStatus(token, workspaceId)
        .then((map) => {
          if (!cancelled) {
            setOauthStatus(map);
          }
        })
        .catch(() => {
          if (!cancelled) {
            setOauthStatus(null);
          }
        })
        .finally(() => {
          if (!cancelled) {
            setOauthStatusLoading(false);
          }
        });
    };
    queueMicrotask(loadOAuthStatus);
    window.addEventListener(POSTSIVA_WORKSPACES_CHANGED, loadOAuthStatus);
    return () => {
      cancelled = true;
      window.removeEventListener(
        POSTSIVA_WORKSPACES_CHANGED,
        loadOAuthStatus,
      );
    };
  }, []);

  const runPostOAuthConnectSync = useCallback(
    async (
      token: string,
      workspaceId: string,
      _adPlatformId: string,
      oauthPlatform: string,
    ): Promise<void> => {
      try {
        const { oauthStatusMap, profilesPartial } =
          await executePostOAuthConnectSync(
            token,
            workspaceId,
            oauthPlatform as SocialOAuthTokenStatusPlatform,
          );
        setOauthStatus(oauthStatusMap);
        notifySocialOAuthStatusUpdated(workspaceId, oauthStatusMap);
        const previous = peekUnifiedUserProfilesCache(workspaceId);
        const merged = mergePartialUnifiedProfilesCache(
          previous,
          profilesPartial,
          oauthPlatform,
        );
        notifyUnifiedProfilesMerged(workspaceId, merged, oauthPlatform);
        setConnectSyncPhase("success");
      } catch (e) {
        setConnectSyncPhase("idle");
        setConnectSyncPlatformId(null);
        setConnectError(
          e instanceof Error
            ? e.message
            : t("adPlatform.errorSyncFailed"),
        );
      }
    },
    [t],
  );

  const clearPopupMonitor = useCallback((): void => {
    if (popupMonitorIntervalRef.current !== null) {
      clearInterval(popupMonitorIntervalRef.current);
      popupMonitorIntervalRef.current = null;
    }
  }, []);

  const armOAuthPopupCloseWatcher = useCallback(
    (
      popup: Window,
      token: string,
      workspaceId: string,
      adPlatformId: string,
      oauthPlatform: string,
    ): void => {
      clearPopupMonitor();
      popupMonitorIntervalRef.current = window.setInterval(() => {
        if (!popup.closed) {
          return;
        }
        clearPopupMonitor();
        setConnectingId(null);
        setConnectSyncPlatformId(adPlatformId);
        setConnectSyncPhase("syncing");
        void runPostOAuthConnectSync(
          token,
          workspaceId,
          adPlatformId,
          oauthPlatform,
        );
      }, 500);
    },
    [clearPopupMonitor, runPostOAuthConnectSync],
  );

  const onConnect = useCallback(
    async (adPlatformId: string): Promise<void> => {
      const latestUsage = await refresh();
      const workspaceId = getStoredActiveWorkspaceId();
      const connectedAccountSnapshot: ConnectedAccountSnapshot = {
        oauthTokenStatus: oauthStatus,
        unifiedProfiles: workspaceId
          ? peekUnifiedUserProfilesCache(workspaceId)
          : null,
      };
      if (
        !isAdPlatformConnectedFromOAuthStatus(oauthStatus, adPlatformId) &&
        promptUpgradeIfNeeded("connected_accounts", {
          usageSnapshot: latestUsage,
          connectedAccountSnapshot,
          connectingPlatformId: adPlatformId,
        })
      ) {
        return;
      }
      if (adPlatformId === "bluesky") {
        setConnectError(null);
        setBlueskyModalOpen(true);
        return;
      }
      if (adPlatformId === "mastodon") {
        setConnectError(null);
        setMastodonModalOpen(true);
        return;
      }
      if (adPlatformId === "wordpress") {
        setConnectError(null);
        setWordpressModalOpen(true);
        return;
      }
      const oauthPlatform = getAdPlatformOAuthApiKey(adPlatformId);
      if (!oauthPlatform) {
        setConnectError(t("adPlatform.errorPlatformUnavailable"));
        return;
      }
      const token = getStoredAccessToken();
      if (!token?.trim() || !workspaceId?.trim()) {
        setConnectError(t("adPlatform.errorSignInWorkspace"));
        return;
      }
      setConnectError(null);
      setConnectingId(adPlatformId);
      const popupWidth = 560;
      const popupHeight = 720;
      const left = Math.max(
        0,
        Math.round(window.screenX + (window.outerWidth - popupWidth) / 2),
      );
      const top = Math.max(
        0,
        Math.round(window.screenY + (window.outerHeight - popupHeight) / 2),
      );
      const features = [
        "popup=yes",
        `width=${popupWidth}`,
        `height=${popupHeight}`,
        `left=${left}`,
        `top=${top}`,
      ].join(",");
      clearPopupMonitor();
      const popup = window.open("", "postsiva-oauth-connect", features);
      if (!popup) {
        setConnectError(t("adPlatform.errorPopupBlocked"));
        setConnectingId(null);
        return;
      }
      renderOAuthConnectPopupLoadingPage(popup);
      try {
        const { authUrl } = await fetchSocialOAuthAuthorizeUrl(
          token,
          workspaceId,
          oauthPlatform,
        );
        if (!authUrl) {
          if (!popup.closed) {
            popup.close();
          }
          clearPopupMonitor();
          setConnectingId(null);
          setConnectSyncPlatformId(adPlatformId);
          setConnectSyncPhase("syncing");
          await runPostOAuthConnectSync(
            token,
            workspaceId,
            adPlatformId,
            oauthPlatform,
          );
          return;
        }
        popup.location.href = authUrl;
        armOAuthPopupCloseWatcher(
          popup,
          token,
          workspaceId,
          adPlatformId,
          oauthPlatform,
        );
      } catch (e) {
        if (e instanceof BillingPlanError && promptUpgradeForBillingError(e.detail)) {
          setConnectingId(null);
          if (!popup.closed) {
            popup.close();
          }
          clearPopupMonitor();
          return;
        }
        setConnectError(
          formatUserFacingApiError(
            e instanceof Error ? e.message : t("adPlatform.errorConnectFailed"),
          ),
        );
        setConnectingId(null);
        if (!popup.closed) {
          popup.close();
        }
        clearPopupMonitor();
      }
    },
    [
      armOAuthPopupCloseWatcher,
      clearPopupMonitor,
      oauthStatus,
      promptUpgradeForBillingError,
      promptUpgradeIfNeeded,
      refresh,
      runPostOAuthConnectSync,
      t,
    ],
  );

  const submitBlueskyConnect = useCallback(
    async (handle: string, appPassword: string): Promise<void> => {
      const token = getStoredAccessToken();
      const workspaceId = getStoredActiveWorkspaceId();
      if (!token?.trim() || !workspaceId?.trim()) {
        setConnectError(t("adPlatform.errorSignInWorkspace"));
        return;
      }
      setConnectError(null);
      setConnectingId("bluesky");
      const oauthPlatform = "bluesky";
      const adPlatformId = "bluesky";
      const popupWidth = 560;
      const popupHeight = 720;
      const left = Math.max(
        0,
        Math.round(window.screenX + (window.outerWidth - popupWidth) / 2),
      );
      const top = Math.max(
        0,
        Math.round(window.screenY + (window.outerHeight - popupHeight) / 2),
      );
      const features = [
        "popup=yes",
        `width=${popupWidth}`,
        `height=${popupHeight}`,
        `left=${left}`,
        `top=${top}`,
      ].join(",");
      clearPopupMonitor();
      try {
        const { authUrl } = await fetchSocialOAuthAuthorizeUrl(
          token,
          workspaceId,
          oauthPlatform,
          {
            bluesky: { handle, appPassword },
          },
        );
        if (authUrl) {
          const popup = window.open("", "postsiva-oauth-connect", features);
          if (!popup) {
            setConnectError(t("adPlatform.errorPopupBlocked"));
            setConnectingId(null);
            return;
          }
          setBlueskyModalOpen(false);
          renderOAuthConnectPopupLoadingPage(popup);
          popup.location.href = authUrl;
          armOAuthPopupCloseWatcher(
            popup,
            token,
            workspaceId,
            adPlatformId,
            oauthPlatform,
          );
          return;
        }
        setBlueskyModalOpen(false);
        setConnectingId(null);
        setConnectSyncPlatformId(adPlatformId);
        setConnectSyncPhase("syncing");
        await runPostOAuthConnectSync(
          token,
          workspaceId,
          adPlatformId,
          oauthPlatform,
        );
      } catch (e) {
        setConnectError(
          formatUserFacingApiError(
            e instanceof Error
              ? e.message
              : t("adPlatform.errorBlueskyFailed"),
          ),
        );
        setConnectingId(null);
        clearPopupMonitor();
      }
    },
    [armOAuthPopupCloseWatcher, clearPopupMonitor, runPostOAuthConnectSync, t],
  );

  const submitMastodonConnect = useCallback(
    async (instanceBase: string): Promise<void> => {
      const token = getStoredAccessToken();
      const workspaceId = getStoredActiveWorkspaceId();
      if (!token?.trim() || !workspaceId?.trim()) {
        setConnectError(t("adPlatform.errorSignInWorkspace"));
        return;
      }
      setConnectError(null);
      setConnectingId("mastodon");
      const oauthPlatform = "mastodon";
      const adPlatformId = "mastodon";
      const popupWidth = 560;
      const popupHeight = 720;
      const left = Math.max(
        0,
        Math.round(window.screenX + (window.outerWidth - popupWidth) / 2),
      );
      const top = Math.max(
        0,
        Math.round(window.screenY + (window.outerHeight - popupHeight) / 2),
      );
      const features = [
        "popup=yes",
        `width=${popupWidth}`,
        `height=${popupHeight}`,
        `left=${left}`,
        `top=${top}`,
      ].join(",");
      clearPopupMonitor();
      const popup = window.open("", "postsiva-oauth-connect", features);
      if (!popup) {
        setConnectError(t("adPlatform.errorPopupBlocked"));
        setConnectingId(null);
        return;
      }
      renderOAuthConnectPopupLoadingPage(popup);
      try {
        await saveMastodonInstanceForWorkspace(token, workspaceId, instanceBase);
        const { authUrl } = await fetchSocialOAuthAuthorizeUrl(
          token,
          workspaceId,
          oauthPlatform,
        );
        setMastodonModalOpen(false);
        if (!authUrl) {
          if (!popup.closed) {
            popup.close();
          }
          clearPopupMonitor();
          setConnectingId(null);
          setConnectSyncPlatformId(adPlatformId);
          setConnectSyncPhase("syncing");
          await runPostOAuthConnectSync(
            token,
            workspaceId,
            adPlatformId,
            oauthPlatform,
          );
          return;
        }
        popup.location.href = authUrl;
        armOAuthPopupCloseWatcher(
          popup,
          token,
          workspaceId,
          adPlatformId,
          oauthPlatform,
        );
      } catch (e) {
        setConnectError(
          e instanceof Error
            ? e.message
            : t("adPlatform.errorMastodonFailed"),
        );
        setConnectingId(null);
        if (!popup.closed) {
          popup.close();
        }
        clearPopupMonitor();
      }
    },
    [armOAuthPopupCloseWatcher, clearPopupMonitor, runPostOAuthConnectSync, t],
  );

  const submitWordPressConnect = useCallback(async (): Promise<void> => {
    const token = getStoredAccessToken();
    const workspaceId = getStoredActiveWorkspaceId();
    if (!token?.trim() || !workspaceId?.trim()) {
      setConnectError(t("adPlatform.errorSignInWorkspace"));
      return;
    }
    setConnectError(null);
    setConnectingId("wordpress");
    // Open the popup synchronously off the click, or Safari blocks it.
    const popupWidth = 600;
    const popupHeight = 760;
    const left = Math.max(
      0,
      Math.round(window.screenX + (window.outerWidth - popupWidth) / 2),
    );
    const top = Math.max(
      0,
      Math.round(window.screenY + (window.outerHeight - popupHeight) / 2),
    );
    const popup = window.open(
      "",
      "postsiva-oauth-connect",
      ["popup=yes", `width=${popupWidth}`, `height=${popupHeight}`, `left=${left}`, `top=${top}`].join(","),
    );
    if (!popup) {
      setConnectError(t("adPlatform.errorPopupBlocked"));
      setConnectingId(null);
      return;
    }
    renderOAuthConnectPopupLoadingPage(popup);
    try {
      const { authorizationUrl } = await startWordPressOAuth(token, workspaceId);
      setWordpressModalOpen(false);
      popup.location.href = authorizationUrl;
    } catch (e) {
      if (!popup.closed) {
        popup.close();
      }
      setConnectError(
        e instanceof Error ? e.message : t("adPlatform.errorWordpressFailed"),
      );
      setConnectingId(null);
    }
  }, [t]);

  const submitWordPressSelfHostedConnect = useCallback(
    async (payload: {
      siteUrl: string;
      userLogin: string;
      applicationPassword: string;
    }): Promise<void> => {
      const token = getStoredAccessToken();
      const workspaceId = getStoredActiveWorkspaceId();
      if (!token?.trim() || !workspaceId?.trim()) {
        setConnectError(t("adPlatform.errorSignInWorkspace"));
        return;
      }
      setConnectError(null);
      setConnectingId("wordpress");
      try {
        await connectWordPressSelfHostedManual(
          token,
          workspaceId,
          payload.siteUrl,
          payload.userLogin,
          payload.applicationPassword,
        );
        setWordpressModalOpen(false);
        setWordpressSelfHostedOpen(false);
        setConnectSyncPlatformId("wordpress");
        setConnectSyncPhase("syncing");
        void runPostOAuthConnectSync(token, workspaceId, "wordpress", "wordpress");
      } catch (e) {
        setConnectError(
          e instanceof Error ? e.message : t("adPlatform.errorWordpressFailed"),
        );
      } finally {
        setConnectingId(null);
      }
    },
    [t, runPostOAuthConnectSync],
  );

  // WordPress + LinkedIn select-accounts pickers post back when connections are created.
  useEffect(() => {
    const onMessage = (event: MessageEvent): void => {
      if (event.origin !== window.location.origin) {
        return;
      }
      const data = event.data as { type?: unknown } | null;
      if (
        !data ||
        (data.type !== "postsiva-wordpress-connect" &&
          data.type !== "postsiva-linkedin-connect")
      ) {
        return;
      }
      const token = getStoredAccessToken();
      const workspaceId = getStoredActiveWorkspaceId();
      if (!token?.trim() || !workspaceId?.trim()) {
        setConnectingId(null);
        return;
      }
      const isLinkedIn = data.type === "postsiva-linkedin-connect";
      const platformId = isLinkedIn ? "linkedin" : "wordpress";
      setConnectingId(null);
      setConnectSyncPlatformId(platformId);
      setConnectSyncPhase("syncing");
      void runPostOAuthConnectSync(token, workspaceId, platformId, platformId);
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [runPostOAuthConnectSync]);

  const openDisconnectConfirm = useCallback((adPlatformId: string): void => {
    if (!getAdPlatformOAuthApiKey(adPlatformId)) {
      return;
    }
    setDisconnectConfirmError(null);
    setPendingDisconnectPlatformId(adPlatformId);
  }, []);

  const closeDisconnectConfirm = useCallback((): void => {
    if (disconnectingId !== null) {
      return;
    }
    setPendingDisconnectPlatformId(null);
    setDisconnectConfirmError(null);
  }, [disconnectingId]);

  const confirmDisconnect = useCallback(async (): Promise<void> => {
    const adPlatformId = pendingDisconnectPlatformId;
    const oauthPlatform =
      adPlatformId !== null ? getAdPlatformOAuthApiKey(adPlatformId) : null;
    if (!adPlatformId || !oauthPlatform) {
      return;
    }
    const token = getStoredAccessToken();
    const workspaceId = getStoredActiveWorkspaceId();
    if (!token?.trim() || !workspaceId?.trim()) {
      setDisconnectConfirmError(t("adPlatform.errorDisconnectSignIn"));
      return;
    }
    setDisconnectConfirmError(null);
    setDisconnectingId(adPlatformId);
    try {
      await deleteOAuthTokenForWorkspace(token, workspaceId, oauthPlatform);
      const map = await fetchSocialOAuthTokenStatus(token, workspaceId, {
        preferCache: false,
      });
      setOauthStatus(map);
      notifySocialOAuthStatusUpdated(workspaceId, map);
      setPendingDisconnectPlatformId(null);
    } catch (e) {
      setDisconnectConfirmError(
        e instanceof Error ? e.message : t("adPlatform.errorDisconnectFailed"),
      );
    } finally {
      setDisconnectingId(null);
    }
  }, [pendingDisconnectPlatformId, t]);

  useEffect(() => {
    if (embedded) {
      setEntered(true);
      return;
    }
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (reduceMotion) {
      setEntered(true);
      return;
    }
    const id = requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setEntered(true);
      });
    });
    return () => {
      cancelAnimationFrame(id);
    };
  }, [embedded]);

  useEffect(() => {
    if (embedded) {
      return;
    }
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
      if (closeTimerRef.current !== null) {
        clearTimeout(closeTimerRef.current);
      }
      if (popupMonitorIntervalRef.current !== null) {
        clearInterval(popupMonitorIntervalRef.current);
        popupMonitorIntervalRef.current = null;
      }
    };
  }, [embedded]);

  const handleRequestClose = useCallback(() => {
    if (blueskyModalOpen) {
      setBlueskyModalOpen(false);
      return;
    }
    if (mastodonModalOpen) {
      setMastodonModalOpen(false);
      return;
    }
    if (wordpressModalOpen) {
      setWordpressModalOpen(false);
      return;
    }
    if (pendingDisconnectPlatformId !== null) {
      return;
    }
    if (connectingId !== null) {
      return;
    }
    if (connectSyncPhase === "syncing") {
      return;
    }
    if (leaving) {
      return;
    }
    if (embedded) {
      return;
    }
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (reduceMotion) {
      onClose();
      return;
    }
    setLeaving(true);
    closeTimerRef.current = setTimeout(() => {
      closeTimerRef.current = null;
      onClose();
    }, MODAL_ANIM_MS);
  }, [
    blueskyModalOpen,
    connectSyncPhase,
    connectingId,
    embedded,
    leaving,
    mastodonModalOpen,
    onClose,
    pendingDisconnectPlatformId,
    wordpressModalOpen,
  ]);

  useEffect(() => {
    if (embedded) {
      return;
    }
    if (connectSyncPhase !== "success") {
      return;
    }
    const id = window.setTimeout(() => {
      handleRequestClose();
    }, 2000);
    return () => {
      window.clearTimeout(id);
    };
  }, [connectSyncPhase, embedded, handleRequestClose]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent): void => {
      if (e.key !== "Escape") {
        return;
      }
      if (blueskyModalOpen) {
        setBlueskyModalOpen(false);
        return;
      }
      if (mastodonModalOpen) {
        setMastodonModalOpen(false);
        return;
      }
      if (wordpressModalOpen) {
        setWordpressModalOpen(false);
        return;
      }
      if (pendingDisconnectPlatformId !== null) {
        if (disconnectingId === null) {
          setPendingDisconnectPlatformId(null);
          setDisconnectConfirmError(null);
        }
        return;
      }
      handleRequestClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
    };
  }, [
    blueskyModalOpen,
    disconnectingId,
    handleRequestClose,
    mastodonModalOpen,
    pendingDisconnectPlatformId,
    wordpressModalOpen,
  ]);

  const panelOpen = embedded || (entered && !leaving);
  const activeSyncPlatform = useMemo(
    () =>
      AD_PLATFORM_ITEMS.find((p) => p.id === connectSyncPlatformId) ?? null,
    [connectSyncPlatformId],
  );

  const platformsToShow = useMemo(() => {
    if (oauthStatusLoading) {
      return [...AD_PLATFORM_ITEMS];
    }
    return sortPlatformsByConnection(AD_PLATFORM_ITEMS, oauthStatus);
  }, [oauthStatus, oauthStatusLoading]);

  const connectionSummary = useMemo(() => {
    if (!oauthStatus) {
      return null;
    }
    let connected = 0;
    for (const p of platformsToShow) {
      if (isAdPlatformConnectedFromOAuthStatus(oauthStatus, p.id)) {
        connected += 1;
      }
    }
    const total = platformsToShow.length;
    return { connected, notConnected: total - connected, total };
  }, [oauthStatus, platformsToShow]);

  const panelClassName =
    embedded
      ? "relative w-full flex-col rounded-3xl border border-outline-variant/20 bg-surface shadow-2xl"
      : [
          "relative z-[151] flex h-[min(92dvh,80dvh)] max-h-[92dvh] w-[min(95vw,80vw)] max-w-[95vw] flex-col overflow-hidden border border-outline-variant/20 bg-surface shadow-2xl transition-[opacity,transform] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] motion-reduce:transition-none motion-reduce:translate-y-0 motion-reduce:opacity-100 sm:h-[80dvh] sm:max-h-[80dvh] sm:w-[80vw] sm:max-w-[80vw]",
          panelOpen
            ? "translate-y-0 opacity-100 sm:scale-100"
            : "translate-y-8 opacity-0 sm:translate-y-4 sm:scale-[0.97]",
          "rounded-3xl",
        ].join(" ");

  const mainPanel = (
      <div
        role={embedded ? "region" : "dialog"}
        aria-modal={embedded ? undefined : true}
        aria-labelledby={
          embedded ? "settings-section-heading" : "ad-platforms-modal-title"
        }
        className={panelClassName}
      >
        <header className="flex shrink-0 items-center justify-between border-b border-outline-variant/15 px-4 py-3 sm:px-5">
          <div>
            {!embedded ? (
              <>
                <h2
                  id="ad-platforms-modal-title"
                  className="text-base font-bold text-on-surface sm:text-lg"
                >
                  {t("adPlatform.modalTitle")}
                </h2>
                <p className="mt-0.5 text-xs text-on-surface-variant sm:text-sm">
                  {oauthStatusLoading
                    ? t("adPlatform.modalSubtitleLoading")
                    : t("adPlatform.modalSubtitle")}
                </p>
              </>
            ) : null}
            {oauthStatusLoading ? (
              <div
                className="mt-2 flex flex-wrap items-center gap-2"
                aria-hidden
              >
                <div className="h-4 w-28 animate-pulse rounded-md bg-on-surface-variant/15 sm:h-4 sm:w-32" />
                <span className="text-on-surface-variant/30">·</span>
                <div className="h-4 w-36 animate-pulse rounded-md bg-on-surface-variant/15 sm:w-40" />
              </div>
            ) : connectionSummary ? (
              <p className="mt-2 text-xs font-medium tabular-nums text-on-surface-variant sm:text-sm">
                {t("adPlatform.connectedSummary", {
                  connected: String(connectionSummary.connected),
                })}
                <span className="text-on-surface-variant/50"> · </span>
                {t("adPlatform.notConnectedSummary", {
                  count: String(connectionSummary.notConnected),
                })}
              </p>
            ) : null}
            {connectError ? (
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <p className="text-xs font-medium text-error sm:text-sm">
                  {connectError}
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setConnectError(null);
                  }}
                  className="text-xs font-bold text-secondary underline-offset-4 hover:underline sm:text-sm"
                >
                  {t("common.dismiss")}
                </button>
              </div>
            ) : null}
          </div>
          {!embedded ? (
            <button
              type="button"
              onClick={handleRequestClose}
              className="flex h-10 w-10 items-center justify-center rounded-full text-on-surface-variant transition-colors hover:bg-surface-container-high hover:text-on-surface"
              aria-label={t("common.close")}
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          ) : (
            <span className="w-10 shrink-0" aria-hidden />
          )}
        </header>
        <div
          className="custom-scrollbar min-h-0 flex-1 overflow-y-auto px-4 py-5 sm:px-6 sm:py-6"
          aria-busy={oauthStatusLoading || connectSyncPhase === "syncing"}
        >
          {connectSyncPhase === "syncing" ? (
            <div className="flex min-h-[360px] flex-col items-center justify-center text-center">
              <div className="relative mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-primary-container/20">
                <span
                  className="absolute inset-0 animate-spin rounded-full border-2 border-secondary/35 border-t-secondary"
                  aria-hidden
                />
                {activeSyncPlatform && isSocialPlatformIconId(activeSyncPlatform.id) ? (
                  <span className="relative z-10">
                    <SocialPlatformIcon
                      platform={activeSyncPlatform.id}
                      className="h-10 w-10"
                    />
                  </span>
                ) : (
                  <span className="relative z-10 material-symbols-outlined text-4xl text-primary">
                    sync
                  </span>
                )}
              </div>
              <h3 className="text-2xl font-bold text-on-surface">
                {t("adPlatform.syncingTitle")}
              </h3>
              <p className="mt-3 max-w-md text-sm text-on-surface-variant">
                {t("adPlatform.syncingBody", {
                  platform: activeSyncPlatform?.name ?? t("adPlatform.defaultPlatformName"),
                })}
              </p>
            </div>
          ) : connectSyncPhase === "success" ? (
            <div className="flex min-h-[360px] flex-col items-center justify-center text-center">
              <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-secondary-container/25 shadow-[0_0_30px_rgba(84,220,191,0.25)]">
                <span
                  className="material-symbols-outlined text-5xl text-secondary"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  check_circle
                </span>
              </div>
              <h3 className="text-2xl font-extrabold text-on-surface">
                {t("adPlatform.successTitle")}
              </h3>
              <p className="mt-3 max-w-md text-sm text-on-surface-variant">
                {t("adPlatform.successBody", {
                  platform: activeSyncPlatform?.name ?? t("adPlatform.yourAccount"),
                })}
              </p>
              <div className="mt-8">
                <button
                  type="button"
                  onClick={() => {
                    setConnectSyncPhase("idle");
                    setConnectSyncPlatformId(null);
                  }}
                  className="rounded-xl bg-secondary-container px-6 py-3 text-sm font-bold text-on-secondary-container transition-opacity hover:opacity-90"
                >
                  {t("adPlatform.done")}
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
                {platformsToShow.map((platform) => {
                  const oauthKey = getAdPlatformOAuthApiKey(platform.id);
                  return (
                    <AdPlatformConnectionCard
                      key={platform.id}
                      platform={platform}
                      isLoading={oauthStatusLoading}
                      disconnectPending={disconnectingId === platform.id}
                      connectPending={connectingId === platform.id}
                      allowAdditionalConnection={platform.id === "youtube"}
                      connected={isAdPlatformConnectedFromOAuthStatus(
                        oauthStatus,
                        platform.id,
                      )}
                      onConnect={onConnect}
                      onDisconnect={
                        oauthKey && platform.id !== "youtube"
                          ? openDisconnectConfirm
                          : undefined
                      }
                    />
                  );
                })}
              </div>
              <div className="mt-8 border-t border-outline-variant/15 pt-6">
                <DesigningConnectionsSection />
              </div>
              <div className="mt-8 border-t border-outline-variant/15 pt-6">
                <CloudStorageConnectionsSection />
              </div>
            </>
          )}
        </div>
      </div>
  );

  const platformModals = (
    <>
      <AdPlatformDisconnectConfirmModal
        open={pendingDisconnectPlatformId !== null}
        platformName={
          AD_PLATFORM_ITEMS.find((p) => p.id === pendingDisconnectPlatformId)
            ?.name ?? t("adPlatform.defaultPlatformLabel")
        }
        busy={disconnectingId !== null}
        error={disconnectConfirmError}
        onClose={closeDisconnectConfirm}
        onConfirm={confirmDisconnect}
      />
      <AdPlatformBlueskyConnectModal
        open={blueskyModalOpen}
        error={connectError}
        isSubmitting={connectingId === "bluesky"}
        onClose={() => {
          setBlueskyModalOpen(false);
          setConnectError(null);
        }}
        onSubmit={submitBlueskyConnect}
      />
      <AdPlatformMastodonInstanceModal
        open={mastodonModalOpen}
        error={connectError}
        isSubmitting={connectingId === "mastodon"}
        onClose={() => {
          setMastodonModalOpen(false);
          setConnectError(null);
        }}
        onSubmit={submitMastodonConnect}
      />
      <AdPlatformWordPressConnectModal
        open={wordpressModalOpen}
        error={connectError}
        isSubmitting={connectingId === "wordpress"}
        reconnectSites={wordpressReconnectSites}
        selfHostedOpen={wordpressSelfHostedOpen}
        onOpenSelfHosted={() => {
          setConnectError(null);
          setWordpressSelfHostedOpen(true);
        }}
        onCloseSelfHosted={() => {
          setConnectError(null);
          setWordpressSelfHostedOpen(false);
        }}
        onConnectSelfHostedManual={submitWordPressSelfHostedConnect}
        onClose={() => {
          setWordpressModalOpen(false);
          setConnectError(null);
        }}
        onConnectHosted={submitWordPressConnect}
      />
    </>
  );

  if (embedded) {
    return (
      <div className="w-full">
        {mainPanel}
        {platformModals}
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
      <button
        type="button"
        aria-label={t("adPlatform.closeDialog")}
        className={`absolute inset-0 z-[150] bg-black/70 transition-opacity duration-300 ease-out motion-reduce:transition-none ${
          panelOpen ? "opacity-100" : "opacity-0"
        }`}
        onClick={handleRequestClose}
      />
      {mainPanel}
      {platformModals}
    </div>
  );
}
