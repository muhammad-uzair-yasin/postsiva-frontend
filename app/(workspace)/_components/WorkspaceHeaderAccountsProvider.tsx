"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { usePathname } from "next/navigation";

import { useTranslations } from "@/lib/i18n/WorkspaceLocaleProvider";
import {
  getStoredAccessToken,
  getStoredActiveWorkspaceId,
  POSTSIVA_SESSION_EXPIRED,
} from "@/lib/auth/session";
import { resolveInlineApiErrorMessage } from "@/lib/auth/sessionExpiryUi";
import {
  getStoredHeaderAccountId,
  setStoredHeaderAccountId,
} from "@/lib/workspace/headerAccountSelection";
import {
  fetchUnifiedUserProfiles,
  peekUnifiedUserProfilesCache,
  replaceUnifiedUserProfilesCache,
} from "@/lib/dashboard/channelProfileApi";
import { profileRefreshTargetForChannelKey } from "@/lib/dashboard/workspaceChannelSnapshot";
import {
  mergePartialUnifiedProfilesCache,
  notifyUnifiedProfilesMerged,
  UNIFIED_PROFILES_MERGED_EVENT,
  type UnifiedProfilesMergedDetail,
} from "@/lib/dashboard/unifiedProfilesPartialMerge";
import {
  fetchSocialOAuthTokenStatus,
  oauthTokenStatusHasAnyConnection,
  peekSocialOAuthTokenStatusCache,
  SOCIAL_OAUTH_STATUS_UPDATED_EVENT,
  type SocialOAuthStatusUpdatedDetail,
  type SocialOAuthTokenStatusMap,
} from "@/lib/social/unifiedOAuthApi";
import type { WorkspaceHeaderAccountRow } from "@/lib/workspace/headerAccountsTypes";
import { useActiveWorkspaceId } from "../_hooks/useActiveWorkspaceId";
import { unifiedProfilesToHeaderAccounts } from "@/lib/workspace/unifiedProfilesToHeaderAccounts";
import {
  isWorkspaceHeaderAllPlatformsId,
  WORKSPACE_HEADER_ALL_PLATFORMS_ID,
} from "@/lib/workspace/workspaceHeaderAllPlatforms";

interface WorkspaceHeaderAccountsContextValue {
  readonly unifiedProfiles: Record<string, unknown> | null;
  readonly accounts: WorkspaceHeaderAccountRow[];
  readonly selectedAccountId: string | null;
  readonly setSelectedAccountId: (id: string) => void;
  readonly selectedAccount: WorkspaceHeaderAccountRow | null;
  readonly isLoadingProfiles: boolean;
  readonly profilesError: string | null;
  /** OAuth connection flags (same source as Link platforms). */
  readonly oauthTokenStatus: SocialOAuthTokenStatusMap | null;
  readonly isLoadingOAuthStatus: boolean;
  /** Unified profile rows or any OAuth platform connected (avoid false empty-state). */
  readonly hasAnySocialConnection: boolean;
  readonly isConnectGateLoading: boolean;
  /**
   * GET /unified/user-profiles/?force_refresh=true for the header-selected account’s platform
   * (or all platforms when the row has no unified refresh target), then merge into cache.
   */
  readonly refreshUnifiedProfilesForSelectedAccount: () => Promise<void>;
  /**
   * GET /unified/user-profiles/?force_refresh=true for ALL platforms, then notify subscribers.
   * Used by the dropdown refresh button to sync the account list after a disconnect.
   */
  readonly refreshAllUnifiedProfiles: () => Promise<void>;
}

const WorkspaceHeaderAccountsContext =
  createContext<WorkspaceHeaderAccountsContextValue | null>(null);

export function useWorkspaceHeaderAccounts(): WorkspaceHeaderAccountsContextValue {
  const ctx = useContext(WorkspaceHeaderAccountsContext);
  if (!ctx) {
    throw new Error(
      "useWorkspaceHeaderAccounts must be used within WorkspaceHeaderAccountsProvider",
    );
  }
  return ctx;
}

export function WorkspaceHeaderAccountsProvider({
  children,
}: {
  children: ReactNode;
}): React.ReactElement {
  const pathname = usePathname();
  const activeWorkspaceId = useActiveWorkspaceId();
  const { t } = useTranslations();
  /** Only this route skips unified profiles; do not depend on full pathname or every nav refetches GET /unified/user-profiles/. */
  const isWorkspacesPickerRoute = pathname === "/workspaces";
  const [unifiedProfiles, setUnifiedProfiles] = useState<Record<
    string,
    unknown
  > | null>(null);
  const [isLoadingProfiles, setIsLoadingProfiles] = useState(true);
  const [isLoadingOAuthStatus, setIsLoadingOAuthStatus] = useState(true);
  const [profilesError, setProfilesError] = useState<string | null>(null);
  const [oauthTokenStatus, setOauthTokenStatus] =
    useState<SocialOAuthTokenStatusMap | null>(null);
  const [selectedAccountId, setSelectedAccountIdState] = useState<string | null>(
    () => {
      if (typeof window === "undefined") {
        return null;
      }
      return getStoredHeaderAccountId(getStoredActiveWorkspaceId());
    },
  );

  const setSelectedAccountId = useCallback((id: string): void => {
    setSelectedAccountIdState(id);
    const workspaceId = getStoredActiveWorkspaceId();
    if (workspaceId) {
      setStoredHeaderAccountId(workspaceId, id);
    }
  }, []);
  /**
   * When a platform is just connected, store it here so the next accounts
   * rebuild can auto-select the first matching row.
   */
  const pendingAutoSelectPlatformRef = useRef<string | null>(null);

  const load = useCallback(async (): Promise<void> => {
    // Workspace selection: only GET /workspaces runs (see useStoredWorkspaces); no unified profiles here.
    if (isWorkspacesPickerRoute) {
      setIsLoadingProfiles(false);
      setIsLoadingOAuthStatus(false);
      setProfilesError(null);
      setUnifiedProfiles(null);
      setOauthTokenStatus(null);
      return;
    }

    const token = getStoredAccessToken();
    const workspaceId = getStoredActiveWorkspaceId();
    if (!token || !workspaceId) {
      setIsLoadingProfiles(false);
      setIsLoadingOAuthStatus(false);
      setProfilesError(null);
      setUnifiedProfiles(null);
      setOauthTokenStatus(null);
      return;
    }

    setIsLoadingProfiles(true);
    setIsLoadingOAuthStatus(true);
    setProfilesError(null);

    const loadProfiles = async (): Promise<Record<string, unknown>> => {
      const cached = peekUnifiedUserProfilesCache(workspaceId);
      if (cached) {
        return cached;
      }
      const profiles = await fetchUnifiedUserProfiles(token, workspaceId, {
        platforms: [],
        forceRefresh: false,
      });
      replaceUnifiedUserProfilesCache(workspaceId, profiles);
      return profiles;
    };

    const loadOAuth = (): Promise<SocialOAuthTokenStatusMap> =>
      fetchSocialOAuthTokenStatus(token, workspaceId, { preferCache: true });

    const [profilesSettled, oauthSettled] = await Promise.allSettled([
      loadProfiles(),
      loadOAuth(),
    ]);

    if (profilesSettled.status === "fulfilled") {
      setUnifiedProfiles(profilesSettled.value);
      setProfilesError(null);
    } else {
      const message =
        profilesSettled.reason instanceof Error
          ? profilesSettled.reason.message
          : "Failed to load unified profiles";
      setProfilesError(resolveInlineApiErrorMessage(message));
      setUnifiedProfiles(null);
    }

    if (oauthSettled.status === "fulfilled") {
      setOauthTokenStatus(oauthSettled.value);
    } else {
      setOauthTokenStatus(peekSocialOAuthTokenStatusCache(workspaceId));
    }

    setIsLoadingProfiles(false);
    setIsLoadingOAuthStatus(false);
  }, [isWorkspacesPickerRoute]);

  useEffect(() => {
    if (isWorkspacesPickerRoute) {
      return;
    }
    setUnifiedProfiles(null);
    setOauthTokenStatus(null);
    setProfilesError(null);
    setIsLoadingProfiles(true);
    setIsLoadingOAuthStatus(true);
    setSelectedAccountIdState(getStoredHeaderAccountId(activeWorkspaceId));
    void load();
  }, [load, activeWorkspaceId, isWorkspacesPickerRoute]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    const onSessionExpired = (): void => {
      setProfilesError(null);
    };
    window.addEventListener(POSTSIVA_SESSION_EXPIRED, onSessionExpired);
    return () => {
      window.removeEventListener(POSTSIVA_SESSION_EXPIRED, onSessionExpired);
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined" || isWorkspacesPickerRoute) {
      return;
    }
    const onMerged = (ev: Event): void => {
      const detail = (ev as CustomEvent<UnifiedProfilesMergedDetail>).detail;
      if (!detail) {
        return;
      }
      const ws = getStoredActiveWorkspaceId();
      if (ws && detail.workspaceId === ws) {
        if (detail.autoSelectPlatform) {
          pendingAutoSelectPlatformRef.current = detail.autoSelectPlatform;
        }
        setUnifiedProfiles(detail.profiles);
        setProfilesError(null);
      }
    };
    window.addEventListener(UNIFIED_PROFILES_MERGED_EVENT, onMerged);
    return () => {
      window.removeEventListener(UNIFIED_PROFILES_MERGED_EVENT, onMerged);
    };
  }, [isWorkspacesPickerRoute]);

  useEffect(() => {
    if (typeof window === "undefined" || isWorkspacesPickerRoute) {
      return;
    }
    const onOauthUpdated = (ev: Event): void => {
      const detail = (ev as CustomEvent<SocialOAuthStatusUpdatedDetail>)
        .detail;
      if (!detail) {
        return;
      }
      const ws = getStoredActiveWorkspaceId();
      if (ws && detail.workspaceId === ws) {
        setOauthTokenStatus(detail.status);
      }
    };
    window.addEventListener(
      SOCIAL_OAUTH_STATUS_UPDATED_EVENT,
      onOauthUpdated,
    );
    return () => {
      window.removeEventListener(
        SOCIAL_OAUTH_STATUS_UPDATED_EVENT,
        onOauthUpdated,
      );
    };
  }, [isWorkspacesPickerRoute]);

  const accounts = useMemo(() => {
    const rows = unifiedProfilesToHeaderAccounts(unifiedProfiles);
    if (rows.length === 0) {
      return rows;
    }
    const allRow: WorkspaceHeaderAccountRow = {
      id: WORKSPACE_HEADER_ALL_PLATFORMS_ID,
      iconId: "instagram",
      label: t("nav.allPlatforms"),
      hint: t("nav.allPlatformsHint"),
    };
    return [allRow, ...rows];
  }, [unifiedProfiles, t]);

  useEffect(() => {
    if (accounts.length === 0) {
      setSelectedAccountIdState(null);
      return;
    }
    setSelectedAccountIdState((prev) => {
      // If a platform was just connected, auto-select the first matching account row.
      const autoSelectPlatform = pendingAutoSelectPlatformRef.current;
      if (autoSelectPlatform) {
        pendingAutoSelectPlatformRef.current = null;
        const match = accounts.find(
          (a) =>
            !a.disabled &&
            !isWorkspaceHeaderAllPlatformsId(a.id) &&
            a.id.startsWith(autoSelectPlatform),
        );
        if (match) {
          const workspaceId = getStoredActiveWorkspaceId();
          if (workspaceId) {
            setStoredHeaderAccountId(workspaceId, match.id);
          }
          return match.id;
        }
      }
      if (prev) {
        const cur = accounts.find((a) => a.id === prev);
        if (cur && !cur.disabled) {
          return prev;
        }
      }
      const workspaceId = getStoredActiveWorkspaceId();
      const storedId = workspaceId
        ? getStoredHeaderAccountId(workspaceId)
        : null;
      if (storedId) {
        const stored = accounts.find((a) => a.id === storedId);
        if (stored && !stored.disabled) {
          return storedId;
        }
      }
      const firstSpecific = accounts.find(
        (a) => !a.disabled && !isWorkspaceHeaderAllPlatformsId(a.id),
      );
      if (firstSpecific) {
        if (workspaceId) {
          setStoredHeaderAccountId(workspaceId, firstSpecific.id);
        }
        return firstSpecific.id;
      }
      const firstSelectable = accounts.find((a) => !a.disabled);
      const fallbackId = firstSelectable?.id ?? null;
      if (fallbackId && workspaceId) {
        setStoredHeaderAccountId(workspaceId, fallbackId);
      }
      return fallbackId;
    });
  }, [accounts]);

  const selectedAccount = useMemo((): WorkspaceHeaderAccountRow | null => {
    if (!selectedAccountId) {
      return null;
    }
    return accounts.find((a) => a.id === selectedAccountId) ?? null;
  }, [accounts, selectedAccountId]);

  const hasAnySocialConnection = useMemo(
    (): boolean =>
      accounts.length > 0 ||
      oauthTokenStatusHasAnyConnection(oauthTokenStatus),
    [accounts, oauthTokenStatus],
  );

  const isConnectGateLoading = useMemo(
    (): boolean =>
      !isWorkspacesPickerRoute &&
      (isLoadingProfiles || isLoadingOAuthStatus),
    [isWorkspacesPickerRoute, isLoadingProfiles, isLoadingOAuthStatus],
  );

  const refreshUnifiedProfilesForSelectedAccount =
    useCallback(async (): Promise<void> => {
      if (isWorkspacesPickerRoute) {
        return;
      }
      const token = getStoredAccessToken();
      const workspaceId = getStoredActiveWorkspaceId();
      if (!token || !workspaceId) {
        return;
      }
      const acc = selectedAccount;
      if (!acc) {
        return;
      }
      const target = profileRefreshTargetForChannelKey(acc.id);
      const platforms = target ? [target.platform] : [];
      setProfilesError(null);
      try {
        const partial = await fetchUnifiedUserProfiles(token, workspaceId, {
          platforms,
          forceRefresh: true,
          facebookPageId: target?.facebookPageId,
        });
        const previous =
          peekUnifiedUserProfilesCache(workspaceId) ?? unifiedProfiles;
        const next =
          target !== null
            ? mergePartialUnifiedProfilesCache(
                previous,
                partial,
                target.platform,
              )
            : partial;
        notifyUnifiedProfilesMerged(workspaceId, next);
      } catch (e) {
        const message =
          e instanceof Error ? e.message : t("common.profilesRefreshFailed");
        setProfilesError(message);
      }
    }, [isWorkspacesPickerRoute, selectedAccount, unifiedProfiles, t]);

  const refreshAllUnifiedProfiles = useCallback(async (): Promise<void> => {
    if (isWorkspacesPickerRoute) {
      return;
    }
    const token = getStoredAccessToken();
    const workspaceId = getStoredActiveWorkspaceId();
    if (!token || !workspaceId) {
      return;
    }
    try {
      const fresh = await fetchUnifiedUserProfiles(token, workspaceId, {
        platforms: [],
        forceRefresh: true,
      });
      notifyUnifiedProfilesMerged(workspaceId, fresh);
    } catch {
      // Best-effort — silently ignore errors.
    }
  }, [isWorkspacesPickerRoute]);

  const value = useMemo(
    (): WorkspaceHeaderAccountsContextValue => ({
      unifiedProfiles,
      accounts,
      selectedAccountId,
      setSelectedAccountId,
      selectedAccount,
      isLoadingProfiles,
      profilesError,
      oauthTokenStatus,
      isLoadingOAuthStatus,
      hasAnySocialConnection,
      isConnectGateLoading,
      refreshUnifiedProfilesForSelectedAccount,
      refreshAllUnifiedProfiles,
    }),
    [
      unifiedProfiles,
      accounts,
      selectedAccountId,
      selectedAccount,
      isLoadingProfiles,
      profilesError,
      oauthTokenStatus,
      isLoadingOAuthStatus,
      hasAnySocialConnection,
      isConnectGateLoading,
      refreshUnifiedProfilesForSelectedAccount,
      refreshAllUnifiedProfiles,
    ],
  );

  return (
    <WorkspaceHeaderAccountsContext.Provider value={value}>
      {children}
    </WorkspaceHeaderAccountsContext.Provider>
  );
}
