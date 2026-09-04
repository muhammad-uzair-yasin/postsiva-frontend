"use client";

import type { ReactElement } from "react";
import { useEffect, useMemo, useState } from "react";

import { useTranslations } from "@/lib/i18n/WorkspaceLocaleProvider";
import { formatUserFacingApiError } from "@/lib/api/formatUserFacingApiError";
import { getStoredAccessToken, getStoredActiveWorkspaceId } from "@/lib/auth/session";
import { disconnectWorkspaceHeaderAccount } from "@/lib/social/disconnectWorkspaceHeaderAccount";
import {
  deleteYouTubeConnection,
  setDefaultYouTubeConnection,
} from "@/lib/social/unifiedOAuthApi";
import { SocialPlatformIcon } from "@/lib/social/SocialPlatformIcon";
import { isSocialPlatformIconId } from "@/lib/social/socialPlatformIconSrc";
import {
  filterHeaderAccountsForSection,
} from "@/lib/post-composer/composerChannelSections";
import {
  groupWorkspaceHeaderAccounts,
  isPostingSelectableHeaderAccount,
} from "@/lib/workspace/headerAccountGrouping";
import type { WorkspaceHeaderAccountRow } from "@/lib/workspace/headerAccountsTypes";
import { isWorkspaceHeaderAllPlatformsId } from "@/lib/workspace/workspaceHeaderAllPlatforms";
import { AdPlatformDisconnectConfirmModal } from "../ad-platform/_components/AdPlatformDisconnectConfirmModal";

type WorkspaceAccountDropdownMenuProps =
  | {
      readonly variant?: "single";
      readonly accounts: readonly WorkspaceHeaderAccountRow[];
      readonly selectedAccount: WorkspaceHeaderAccountRow | null;
      readonly profilesError: string | null;
      readonly isLoadingProfiles: boolean;
      readonly onSelectAccount: (id: string) => void;
      readonly onOpenPlatformsModal: () => void;
      readonly onRefresh?: () => Promise<void>;
    }
  | {
      readonly variant: "multi";
      readonly accounts: readonly WorkspaceHeaderAccountRow[];
      readonly selectedAccountIds: readonly string[];
      readonly profilesError: string | null;
      readonly isLoadingProfiles: boolean;
      readonly onToggleAccount: (id: string) => void;
      readonly onOpenPlatformsModal: () => void;
      readonly onRefresh?: () => Promise<void>;
    };

export function WorkspaceAccountDropdownMenu(
  props: WorkspaceAccountDropdownMenuProps,
): ReactElement {
  const isMulti = props.variant === "multi";
  const { t } = useTranslations();
  const {
    accounts,
    profilesError,
    isLoadingProfiles,
    onOpenPlatformsModal,
    onRefresh,
  } = props;
  const accountSections = useMemo(
    () =>
      [
        {
          key: "social" as const,
          labelKey: "settings.accountsSocialSection" as const,
          groups: groupWorkspaceHeaderAccounts(
            filterHeaderAccountsForSection(accounts, "social"),
          ),
        },
        {
          key: "blog" as const,
          labelKey: "settings.accountsBlogSection" as const,
          groups: groupWorkspaceHeaderAccounts(
            filterHeaderAccountsForSection(accounts, "blog"),
          ),
        },
      ].filter((section) => section.groups.length > 0),
    [accounts],
  );
  const [expandedParents, setExpandedParents] = useState<Record<string, boolean>>(
    {},
  );
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [youtubeActionId, setYoutubeActionId] = useState<string | null>(null);
  const [disconnectTarget, setDisconnectTarget] =
    useState<WorkspaceHeaderAccountRow | null>(null);
  const [disconnectError, setDisconnectError] = useState<string | null>(null);

  useEffect(() => {
    setExpandedParents((prev) => {
      const next: Record<string, boolean> = {};
      for (const section of accountSections) {
        for (const g of section.groups) {
          if (g.children.length > 0) {
            next[g.parent.id] = prev[g.parent.id] ?? false;
          }
        }
      }
      return next;
    });
  }, [accountSections]);

  const openPlatformsAndDismiss = (): void => {
    onOpenPlatformsModal();
  };

  const handleRefresh = async (): Promise<void> => {
    if (!onRefresh || isRefreshing) {
      return;
    }
    setIsRefreshing(true);
    try {
      await onRefresh();
    } finally {
      setIsRefreshing(false);
    }
  };

  const footerAnimDelayMs = Math.min(accounts.length * 42, 360) + 90;
  const hasYouTubeConnection = accounts.some((account) =>
    account.id.startsWith("youtube:"),
  );

  const handleRowClick = (id: string): void => {
    if (props.variant === "multi") {
      props.onToggleAccount(id);
    } else {
      props.onSelectAccount(id);
    }
  };

  const runYouTubeAction = async (
    account: WorkspaceHeaderAccountRow,
    action: "default" | "delete",
  ): Promise<void> => {
    const channelId = account.targetResourceId?.trim();
    const token = getStoredAccessToken();
    const workspaceId = getStoredActiveWorkspaceId();
    if (!channelId || !token || !workspaceId || youtubeActionId) return;
    setYoutubeActionId(account.id);
    setDisconnectError(null);
    try {
      if (action === "default") {
        await setDefaultYouTubeConnection(token, workspaceId, channelId);
      } else {
        await deleteYouTubeConnection(token, workspaceId, channelId);
      }
      await onRefresh?.();
      if (action === "delete") {
        setDisconnectTarget(null);
      }
    } catch (error) {
      if (action === "delete") {
        setDisconnectError(
          formatUserFacingApiError(
            error instanceof Error ? error.message : "Unable to disconnect this channel.",
          ),
        );
      }
    } finally {
      setYoutubeActionId(null);
    }
  };

  const runDisconnect = async (
    account: WorkspaceHeaderAccountRow,
  ): Promise<void> => {
    const token = getStoredAccessToken();
    const workspaceId = getStoredActiveWorkspaceId();
    if (!token?.trim() || !workspaceId?.trim() || youtubeActionId) {
      return;
    }
    setYoutubeActionId(account.id);
    setDisconnectError(null);
    try {
      await disconnectWorkspaceHeaderAccount(token, workspaceId, account);
      await onRefresh?.();
      setDisconnectTarget(null);
    } catch (error) {
      setDisconnectError(
        formatUserFacingApiError(
          error instanceof Error ? error.message : "Unable to disconnect this channel.",
        ),
      );
    } finally {
      setYoutubeActionId(null);
    }
  };

  const isSelected = (id: string): boolean => {
    if (props.variant === "multi") {
      return props.selectedAccountIds.includes(id);
    }
    return props.selectedAccount?.id === id;
  };

  const isRowDisabled = (acc: WorkspaceHeaderAccountRow): boolean => {
    if (acc.disabled === true) {
      return true;
    }
    if (props.variant === "multi") {
      return !isPostingSelectableHeaderAccount(acc);
    }
    return false;
  };

  return (
    <div
      className="workspace-account-dropdown-panel-animate flex max-h-[min(28rem,calc(100vh-5rem))] w-full max-w-[440px] min-w-[280px] flex-col overflow-hidden rounded-2xl border border-outline-variant/35 bg-surface-container shadow-[0_24px_48px_-12px_rgba(0,0,0,0.2)] backdrop-blur-xl"
      role="listbox"
      aria-label={t("settings.channelModalConnectedAccounts")}
      aria-multiselectable={isMulti}
    >
      <div className="workspace-account-dropdown-header-animate border-b border-outline-variant/25 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-on-surface-variant">
              {t("settings.channelModalConnectedAccounts")}
            </p>
            <p className="mt-0.5 text-xs text-on-surface-variant/70">
              {t("settings.channelModalSelectOrConnect")}
            </p>
          </div>
          {onRefresh ? (
            <button
              type="button"
              onClick={() => { void handleRefresh(); }}
              disabled={isRefreshing}
              aria-label={t("settings.channelModalRefreshAccounts")}
              className="ml-2 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-on-surface-variant transition-colors hover:bg-on-surface/[0.06] hover:text-on-surface disabled:cursor-not-allowed disabled:opacity-50"
            >
              <span
                className={`material-symbols-outlined text-[20px] ${isRefreshing ? "animate-spin" : ""}`}
              >
                refresh
              </span>
            </button>
          ) : null}
        </div>
      </div>

      <div className="workspace-account-dropdown-scroll min-h-0 flex-1 overflow-y-auto overscroll-contain py-1 pr-0.5">
        {profilesError ? (
          <div className="px-4 py-4 text-sm text-error">{profilesError}</div>
        ) : null}
        {!isLoadingProfiles && accounts.length === 0 && !profilesError ? (
          <div className="px-4 py-6 text-center text-sm text-on-surface-variant">
            {t("settings.channelModalEmpty")}
          </div>
        ) : null}
        {isLoadingProfiles && accounts.length === 0 && !profilesError ? (
          <div className="px-4 py-6 text-center text-sm text-on-surface-variant">
            {t("settings.channelModalLoading")}
          </div>
        ) : null}
        {accountSections.map((section) => (
          <div key={section.key}>
            {accountSections.length > 1 ? (
              <p className="px-4 pb-1 pt-2 text-[10px] font-bold uppercase tracking-[0.15em] text-on-surface-variant first:pt-2">
                {t(section.labelKey)}
              </p>
            ) : null}
            {section.groups.map((group, groupIndex) => {
          const parent = group.parent;
          const parentDisabled = isRowDisabled(parent);
          const parentSelected = isSelected(parent.id);
          const parentIcon = isSocialPlatformIconId(parent.iconId)
            ? parent.iconId
            : "instagram";
          const isExpanded =
            group.children.some((child) => isSelected(child.id)) ||
            (expandedParents[parent.id] ?? false);
          const hasChildren = group.children.length > 0;
          return (
            <div key={parent.id}>
              <div className="flex items-stretch">
                <button
                  type="button"
                  role="option"
                  aria-selected={parentSelected}
                  aria-disabled={parentDisabled}
                  disabled={parentDisabled}
                  style={{ animationDelay: `${groupIndex * 42}ms` }}
                  onClick={() => {
                    if (parentDisabled) {
                      return;
                    }
                    handleRowClick(parent.id);
                  }}
                  className={`workspace-account-dropdown-row-animate group flex w-full items-start gap-3 border-l-2 border-transparent px-4 py-3 text-left transition-colors duration-200 active:scale-[0.995] ${
                    parentDisabled
                      ? "cursor-not-allowed opacity-60"
                      : parentSelected
                        ? "border-secondary bg-primary/10 text-on-surface"
                        : "text-on-surface hover:bg-on-surface/[0.04]"
                  }`}
                >
                  {isWorkspaceHeaderAllPlatformsId(parent.id) ? (
                    <span
                      className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-secondary/15 text-secondary transition-transform duration-200 ease-out group-hover:scale-110"
                      aria-hidden
                    >
                      <span className="material-symbols-outlined text-[22px]">
                        all_inclusive
                      </span>
                    </span>
                  ) : (
                    <SocialPlatformIcon
                      platform={parentIcon}
                      className="mt-0.5 h-6 w-6 shrink-0 rounded-md transition-transform duration-200 ease-out group-hover:scale-110"
                      alt=""
                    />
                  )}
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium leading-snug">
                      {parent.label}
                    </span>
                    {parent.hint ? (
                      <span className="mt-1 block truncate text-[11px] font-medium uppercase tracking-wide text-on-surface-variant">
                        {parent.hint}
                      </span>
                    ) : null}
                    {parent.disabledMessage ? (
                      <span className="mt-1.5 block text-[11px] font-normal normal-case leading-snug text-amber-400/95">
                        {parent.disabledMessage}
                      </span>
                    ) : null}
                  </span>
                  {parentSelected && !parentDisabled ? (
                    <span
                      className="material-symbols-outlined mt-0.5 shrink-0 text-xl text-secondary"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      check_circle
                    </span>
                  ) : null}
                </button>
                {hasChildren ? (
                  <button
                    type="button"
                    aria-label={isExpanded ? t("settings.channelModalCollapseChildren") : t("settings.channelModalExpandChildren")}
                    aria-expanded={isExpanded}
                    onClick={() => {
                      setExpandedParents((prev) => ({
                        ...prev,
                        [parent.id]: !(prev[parent.id] ?? false),
                      }));
                    }}
                    className="px-2 text-on-surface-variant transition-colors hover:text-on-surface"
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      {isExpanded ? "expand_less" : "expand_more"}
                    </span>
                  </button>
                ) : null}
                {!isWorkspaceHeaderAllPlatformsId(parent.id) ? (
                  <div className="flex items-center pr-2">
                    {parent.id.startsWith("youtube:") && !parent.hint?.includes("Default") ? (
                      <button
                        type="button"
                        title="Make default"
                        disabled={youtubeActionId !== null}
                        onClick={() => { void runYouTubeAction(parent, "default"); }}
                        className="p-1.5 text-on-surface-variant hover:text-secondary disabled:opacity-40"
                      >
                        <span className="material-symbols-outlined text-[18px]">star</span>
                      </button>
                    ) : null}
                    <button
                      type="button"
                      title="Disconnect channel"
                      disabled={youtubeActionId !== null}
                      onClick={() => {
                        setDisconnectError(null);
                        setDisconnectTarget(parent);
                      }}
                      className="p-1.5 text-on-surface-variant hover:text-error disabled:opacity-40"
                    >
                      <span className="material-symbols-outlined text-[18px]">link_off</span>
                    </button>
                  </div>
                ) : null}
              </div>
              {hasChildren && isExpanded ? (
                <div className="pb-1">
                  {group.children.map((child) => {
                    const childDisabled = isRowDisabled(child);
                    const childSelected = isSelected(child.id);
                    const childIcon = isSocialPlatformIconId(child.iconId)
                      ? child.iconId
                      : "instagram";
                    return (
                      <div key={child.id} className="ml-5 mr-2 mt-1 flex items-stretch">
                        <button
                          type="button"
                          role="option"
                          aria-selected={childSelected}
                          aria-disabled={childDisabled}
                          disabled={childDisabled}
                          onClick={() => {
                            if (childDisabled) {
                              return;
                            }
                            handleRowClick(child.id);
                          }}
                          className={`flex min-w-0 flex-1 items-start gap-3 rounded-lg border border-transparent px-3 py-2 text-left transition-colors duration-200 ${
                            childDisabled
                              ? "cursor-not-allowed opacity-60"
                              : childSelected
                                ? "border-secondary/40 bg-primary/10 text-on-surface"
                                : "text-on-surface hover:bg-on-surface/[0.04]"
                          }`}
                        >
                          <SocialPlatformIcon
                            platform={childIcon}
                            className="mt-0.5 h-5 w-5 shrink-0 rounded-sm"
                            alt=""
                          />
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-sm font-medium leading-snug">
                              {child.label}
                            </span>
                            {child.hint ? (
                              <span className="mt-1 block truncate text-[11px] font-medium uppercase tracking-wide text-on-surface-variant">
                                {child.hint}
                              </span>
                            ) : null}
                            {child.disabledMessage ? (
                              <span className="mt-1.5 block text-[11px] font-normal normal-case leading-snug text-amber-400/95">
                                {child.disabledMessage}
                              </span>
                            ) : null}
                          </span>
                          {childSelected && !childDisabled ? (
                            <span
                              className="material-symbols-outlined mt-0.5 shrink-0 text-lg text-secondary"
                              style={{ fontVariationSettings: "'FILL' 1" }}
                            >
                              check_circle
                            </span>
                          ) : null}
                        </button>
                        <button
                          type="button"
                          title="Disconnect channel"
                          disabled={youtubeActionId !== null}
                          onClick={() => {
                            setDisconnectError(null);
                            setDisconnectTarget(child);
                          }}
                          className="px-2 text-on-surface-variant transition-colors hover:text-error disabled:opacity-40"
                        >
                          <span className="material-symbols-outlined text-[18px]">
                            link_off
                          </span>
                        </button>
                      </div>
                    );
                  })}
                </div>
              ) : null}
            </div>
          );
        })}
          </div>
        ))}
      </div>

      <div
        className="workspace-account-dropdown-footer-animate border-t border-outline-variant/25 bg-surface-container-low"
        style={{ animationDelay: `${footerAnimDelayMs}ms` }}
      >
        <button
          type="button"
          onClick={openPlatformsAndDismiss}
          className="workspace-account-dropdown-add-btn flex w-full items-center gap-3 px-4 py-3 text-left text-sm font-medium text-on-surface hover:bg-on-surface/[0.04]"
        >
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-primary">
            <span className="material-symbols-outlined text-[22px]">add</span>
          </span>
          <span className="min-w-0 flex-1">
            <span className="block font-semibold">
              {hasYouTubeConnection
                ? t("adPlatform.cardConnectAnotherChannel")
                : t("settings.channelModalAddPlatforms")}
            </span>
            <span className="text-xs font-normal text-on-surface-variant">
              {t("settings.channelModalConnectAnother")}
            </span>
          </span>
          <span className="material-symbols-outlined shrink-0 text-on-surface-variant">
            chevron_right
          </span>
        </button>
      </div>
      <AdPlatformDisconnectConfirmModal
        open={disconnectTarget !== null}
        platformName={disconnectTarget?.label ?? "channel"}
        busy={youtubeActionId !== null}
        error={disconnectError}
        onClose={() => {
          if (youtubeActionId === null) {
            setDisconnectTarget(null);
            setDisconnectError(null);
          }
        }}
        onConfirm={() => {
          if (disconnectTarget) {
            return runDisconnect(disconnectTarget);
          }
        }}
      />
    </div>
  );
}

export type { WorkspaceAccountDropdownMenuProps };
