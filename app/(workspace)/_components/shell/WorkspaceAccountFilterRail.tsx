"use client";

import { useEffect, useMemo, useState, type ReactElement } from "react";

import { useTranslations } from "@/lib/i18n/WorkspaceLocaleProvider";
import { SocialPlatformIcon } from "@/lib/social/SocialPlatformIcon";
import { isSocialPlatformIconId } from "@/lib/social/socialPlatformIconSrc";
import {
  filterHeaderAccountsForSection,
} from "@/lib/post-composer/composerChannelSections";
import { groupWorkspaceHeaderAccounts } from "@/lib/workspace/headerAccountGrouping";
import type { WorkspaceHeaderAccountRow } from "@/lib/workspace/headerAccountsTypes";
import { isWorkspaceHeaderAllPlatformsId } from "@/lib/workspace/workspaceHeaderAllPlatforms";

import { useWorkspaceHeaderAccounts } from "../WorkspaceHeaderAccountsProvider";
import { useWorkspacePlatformsModal } from "../WorkspacePlatformsModalProvider";
import { WorkspaceAccountRailTopBar } from "./WorkspaceAccountRailWorkspaceHeader";

const ACCOUNT_RAIL_COLLAPSED_KEY = "workspace-account-rail-collapsed";

function accountMatchesQuery(row: WorkspaceHeaderAccountRow, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) {
    return true;
  }
  return (
    row.label.toLowerCase().includes(q) ||
    (row.hint?.toLowerCase().includes(q) ?? false)
  );
}

function RailRow({
  account,
  selected,
  disabled,
  indented,
  collapsed,
  onSelect,
}: {
  readonly account: WorkspaceHeaderAccountRow;
  readonly selected: boolean;
  readonly disabled: boolean;
  readonly indented?: boolean;
  readonly collapsed?: boolean;
  readonly onSelect: (id: string) => void;
}): ReactElement {
  const iconId = isSocialPlatformIconId(account.iconId) ? account.iconId : "instagram";
  const showAll = isWorkspaceHeaderAllPlatformsId(account.id);

  return (
    <button
      type="button"
      disabled={disabled}
      aria-current={selected ? "true" : undefined}
      title={account.label}
      onClick={() => {
        if (!disabled) {
          onSelect(account.id);
        }
      }}
      className={[
        "flex items-center rounded-lg text-left text-sm transition-colors",
        collapsed
          ? "w-full justify-center px-1 py-2"
          : ["w-full gap-2.5 px-2 py-2", indented ? "ml-3" : ""].join(" "),
        disabled
          ? "cursor-not-allowed opacity-50"
          : selected
            ? "bg-primary/12 font-medium text-on-surface"
            : "text-on-surface hover:bg-on-surface/[0.05]",
      ].join(" ")}
    >
      {showAll ? (
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-secondary/15 text-secondary">
          <span className="material-symbols-outlined text-[18px]">all_inclusive</span>
        </span>
      ) : (
        <SocialPlatformIcon platform={iconId} className="h-7 w-7 shrink-0 rounded-md" alt="" />
      )}
      {!collapsed ? (
        <>
          <span className="min-w-0 flex-1 truncate" title={account.label}>
            {account.label}
          </span>
          {selected && !disabled ? (
            <span
              className="material-symbols-outlined shrink-0 text-base text-secondary"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              check_circle
            </span>
          ) : null}
        </>
      ) : null}
    </button>
  );
}

export function WorkspaceAccountFilterRail(): ReactElement {
  const { t } = useTranslations();
  const { openPlatformsForConnect } = useWorkspacePlatformsModal();
  const {
    accounts,
    selectedAccountId,
    setSelectedAccountId,
    isLoadingProfiles,
    profilesError,
    refreshAllUnifiedProfiles,
  } = useWorkspaceHeaderAccounts();
  const [query, setQuery] = useState("");
  const [expandedParents, setExpandedParents] = useState<Record<string, boolean>>({});
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [railCollapsed, setRailCollapsed] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(ACCOUNT_RAIL_COLLAPSED_KEY);
    if (stored !== null) {
      setRailCollapsed(stored === "true");
    }
  }, []);

  const setCollapsed = (collapsed: boolean): void => {
    setRailCollapsed(collapsed);
    localStorage.setItem(ACCOUNT_RAIL_COLLAPSED_KEY, String(collapsed));
  };

  const handleRefresh = async (): Promise<void> => {
    if (isRefreshing) {
      return;
    }
    setIsRefreshing(true);
    try {
      await refreshAllUnifiedProfiles();
    } finally {
      setIsRefreshing(false);
    }
  };

  const sections = useMemo(
    () =>
      [
        {
          key: "social" as const,
          groups: groupWorkspaceHeaderAccounts(
            filterHeaderAccountsForSection(accounts, "social"),
          ),
        },
        {
          key: "blog" as const,
          groups: groupWorkspaceHeaderAccounts(
            filterHeaderAccountsForSection(accounts, "blog"),
          ),
        },
      ].filter((section) => section.groups.length > 0),
    [accounts],
  );

  const normalizedQuery = query.trim().toLowerCase();

  return (
    <aside
      className={[
        "account-filter-rail hidden min-h-0 shrink-0 grow-0 flex-col self-stretch overflow-hidden rounded-xl border border-outline-variant/30 bg-surface-container transition-[width,min-width,max-width] duration-300 ease-in-out lg:flex",
        railCollapsed
          ? "w-14 min-w-14 max-w-14"
          : "w-[14rem] min-w-[14rem] max-w-[14rem]",
      ].join(" ")}
      aria-label={t("shell.accountFilterLabel")}
    >
      <WorkspaceAccountRailTopBar
        collapsed={railCollapsed}
        isRefreshing={isRefreshing}
        onRefresh={() => void handleRefresh()}
        onToggleCollapse={() => setCollapsed(!railCollapsed)}
        search={
          <label className="block">
            <span className="sr-only">{t("shell.accountFilterSearch")}</span>
            <span className="relative flex items-center">
              <span className="material-symbols-outlined pointer-events-none absolute left-2.5 text-[18px] text-on-surface-variant">
                search
              </span>
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t("shell.accountFilterSearch")}
                className="w-full rounded-lg border border-outline-variant/20 bg-surface py-2 pl-9 pr-2 text-sm text-on-surface placeholder:text-on-surface-variant/70 focus:border-secondary/50 focus:outline-none focus:ring-1 focus:ring-secondary/30"
              />
            </span>
          </label>
        }
      />

      <div
        className={[
          "min-h-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-contain py-2",
          railCollapsed ? "px-1" : "px-2",
        ].join(" ")}
      >
        {profilesError && !railCollapsed ? (
          <p className="px-2 py-3 text-xs text-error">{profilesError}</p>
        ) : null}
        {isLoadingProfiles && accounts.length === 0 && !railCollapsed ? (
          <p className="px-2 py-3 text-xs text-on-surface-variant">{t("nav.loading")}</p>
        ) : null}
        {!isLoadingProfiles && accounts.length === 0 && !profilesError && !railCollapsed ? (
          <p className="px-2 py-3 text-xs text-on-surface-variant">
            {t("settings.channelModalEmpty")}
          </p>
        ) : null}

        {sections.map((section) => (
          <div key={section.key} className="pb-1">
            {sections.length > 1 && !railCollapsed ? (
              <p className="px-2 pb-1 pt-2 text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">
                {t(section.key === "social" ? "settings.accountsSocialSection" : "settings.accountsBlogSection")}
              </p>
            ) : null}
            {section.groups.map((group) => {
              const parent = group.parent;
              const parentDisabled = parent.disabled === true;
              const parentVisible = accountMatchesQuery(parent, normalizedQuery);
              const visibleChildren = group.children.filter((child) =>
                accountMatchesQuery(child, normalizedQuery),
              );
              const hasChildren = group.children.length > 0;
              const hasSelectedChild = group.children.some(
                (child) => child.id === selectedAccountId,
              );
              const isExpanded = railCollapsed
                ? hasSelectedChild
                : normalizedQuery
                  ? visibleChildren.length > 0
                  : hasSelectedChild || (expandedParents[parent.id] ?? false);

              if (normalizedQuery && !parentVisible && visibleChildren.length === 0) {
                return null;
              }

              if (!hasChildren) {
                if (!parentVisible && normalizedQuery) {
                  return null;
                }
                return (
                  <RailRow
                    key={parent.id}
                    account={parent}
                    selected={selectedAccountId === parent.id}
                    disabled={parentDisabled}
                    collapsed={railCollapsed}
                    onSelect={setSelectedAccountId}
                  />
                );
              }

              return (
                <div key={parent.id} className="mb-0.5 min-w-0 overflow-hidden">
                  <div className="flex min-w-0 items-stretch overflow-hidden">
                    {parentVisible || !normalizedQuery || railCollapsed ? (
                      <div className="min-w-0 flex-1">
                        <RailRow
                          account={parent}
                          selected={selectedAccountId === parent.id}
                          disabled={parentDisabled}
                          collapsed={railCollapsed}
                          onSelect={setSelectedAccountId}
                        />
                      </div>
                    ) : null}
                    {!normalizedQuery && !railCollapsed ? (
                      <button
                        type="button"
                        aria-expanded={isExpanded}
                        aria-label={
                          isExpanded
                            ? t("settings.channelModalCollapseChildren")
                            : t("settings.channelModalExpandChildren")
                        }
                        onClick={() => {
                          setExpandedParents((prev) => ({
                            ...prev,
                            [parent.id]: !(prev[parent.id] ?? false),
                          }));
                        }}
                        className="px-1 text-on-surface-variant hover:text-on-surface"
                      >
                        <span className="material-symbols-outlined text-[18px]">
                          {isExpanded ? "expand_less" : "expand_more"}
                        </span>
                      </button>
                    ) : null}
                  </div>
                  {isExpanded
                    ? visibleChildren.map((child) => (
                        <RailRow
                          key={child.id}
                          account={child}
                          selected={selectedAccountId === child.id}
                          disabled={child.disabled === true}
                          indented={!railCollapsed}
                          collapsed={railCollapsed}
                          onSelect={setSelectedAccountId}
                        />
                      ))
                    : null}
                </div>
              );
            })}
          </div>
        ))}

        <div className="mt-1 border-t border-outline-variant/10 px-0 pt-2">
          <button
            type="button"
            onClick={openPlatformsForConnect}
            title={t("settings.channelModalAddPlatforms")}
            className={[
              "flex items-center rounded-lg text-left text-sm font-medium text-on-surface hover:bg-on-surface/[0.05]",
              railCollapsed
                ? "w-full justify-center px-1 py-2"
                : "w-full gap-2 px-2 py-2.5",
            ].join(" ")}
          >
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-primary">
              <span className="material-symbols-outlined text-[20px]">add</span>
            </span>
            {!railCollapsed ? (
              <span className="min-w-0 flex-1 truncate">
                {t("settings.channelModalAddPlatforms")}
              </span>
            ) : null}
          </button>
        </div>
      </div>
    </aside>
  );
}
