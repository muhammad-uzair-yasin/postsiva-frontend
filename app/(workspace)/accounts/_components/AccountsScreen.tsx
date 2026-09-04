"use client";

import Image from "next/image";
import { useMemo, useState, type ReactElement } from "react";

import { AdPlatformDisconnectConfirmModal } from "../../ad-platform/_components/AdPlatformDisconnectConfirmModal";
import { WorkspacePageDocumentHead } from "../../_components/WorkspacePageDocumentHead";
import { WorkspacePageScaffold } from "../../_components/WorkspacePageScaffold";
import { WORKSPACE_SIDEBAR_SUBPAGE_TITLE_CLASS } from "../../_components/shell/WorkspaceAccountRailPageLayout";
import { useWorkspaceHeaderAccounts } from "../../_components/WorkspaceHeaderAccountsProvider";
import { useWorkspacePlatformsModal } from "../../_components/WorkspacePlatformsModalProvider";
import { getStoredAccessToken, getStoredActiveWorkspaceId } from "@/lib/auth/session";
import { formatUserFacingApiError } from "@/lib/api/formatUserFacingApiError";
import { useTranslations } from "@/lib/i18n/WorkspaceLocaleProvider";
import { disconnectWorkspaceHeaderAccount } from "@/lib/social/disconnectWorkspaceHeaderAccount";
import { SocialPlatformIcon } from "@/lib/social/SocialPlatformIcon";
import { isSocialPlatformIconId } from "@/lib/social/socialPlatformIconSrc";
import {
  filterHeaderAccountsForSection,
  isBlogHeaderAccount,
} from "@/lib/post-composer/composerChannelSections";
import { groupWorkspaceHeaderAccounts } from "@/lib/workspace/headerAccountGrouping";
import type { WorkspaceHeaderAccountRow } from "@/lib/workspace/headerAccountsTypes";
import { isWorkspaceHeaderAllPlatformsId } from "@/lib/workspace/workspaceHeaderAllPlatforms";

import { AccountsCloudStorageSection } from "./AccountsCloudStorageSection";
import { AccountsDesigningSection } from "./AccountsDesigningSection";
import { AccountsSocialPlatformsSection } from "./AccountsSocialPlatformsSection";

const PLATFORM_LABELS: Partial<Record<WorkspaceHeaderAccountRow["iconId"], string>> = {
  linkedin: "LinkedIn",
  facebook: "Facebook",
  youtube: "YouTube",
  pinterest: "Pinterest boards",
  tiktok: "TikTok",
  instagram: "Instagram",
  threads: "Threads",
  bluesky: "Bluesky",
  mastodon: "Mastodon",
  wordpress: "WordPress",
};

interface AccountSection {
  readonly platform: WorkspaceHeaderAccountRow["iconId"];
  readonly label: string;
  readonly accounts: WorkspaceHeaderAccountRow[];
}

function matchesSearch(account: WorkspaceHeaderAccountRow, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return [account.label, account.hint, account.targetResourceId]
    .filter(Boolean)
    .some((value) => String(value).toLowerCase().includes(q));
}

function accountSlug(account: WorkspaceHeaderAccountRow): string {
  const raw = account.targetResourceId ?? account.label;
  return raw
    .toLowerCase()
    .replace(/^@/, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function accountDisplayLabel(account: WorkspaceHeaderAccountRow): string {
  if (account.id.startsWith("pinterest:board:")) {
    return `${account.label} board`;
  }
  return account.label;
}

function AccountAvatar({ account }: { readonly account: WorkspaceHeaderAccountRow }): ReactElement {
  const platform = isSocialPlatformIconId(account.iconId) ? account.iconId : "instagram";
  const [imageFailed, setImageFailed] = useState(false);
  const showImage = Boolean(account.avatarUrl?.trim()) && !imageFailed;
  return (
    <div className="relative flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-surface-container-high">
      {showImage ? (
        <Image
          src={account.avatarUrl!}
          alt=""
          width={64}
          height={64}
          unoptimized
          className="h-full w-full object-cover"
          onError={() => setImageFailed(true)}
        />
      ) : (
        <SocialPlatformIcon platform={platform} className="h-11 w-11" alt="" />
      )}
      <span className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full border-2 border-surface bg-surface-container-high">
        <SocialPlatformIcon platform={platform} className="h-5 w-5" alt="" />
      </span>
    </div>
  );
}

interface AccountMegaSection {
  readonly kind: "social" | "blog";
  readonly sections: AccountSection[];
}

function buildAccountMegaSections(
  accounts: readonly WorkspaceHeaderAccountRow[],
): AccountMegaSection[] {
  const socialAccounts = accounts.filter((account) => !isBlogHeaderAccount(account));
  const blogAccounts = accounts.filter(isBlogHeaderAccount);
  const out: AccountMegaSection[] = [];
  if (socialAccounts.length > 0) {
    out.push({
      kind: "social",
      sections: buildAccountSections(socialAccounts),
    });
  }
  if (blogAccounts.length > 0) {
    out.push({
      kind: "blog",
      sections: buildAccountSections(blogAccounts),
    });
  }
  return out;
}

function buildAccountSections(accounts: readonly WorkspaceHeaderAccountRow[]): AccountSection[] {
  const sections: AccountSection[] = [];
  for (const account of accounts) {
    if (isWorkspaceHeaderAllPlatformsId(account.id)) {
      continue;
    }
    const platform = account.iconId;
    const last = sections[sections.length - 1];
    if (last?.platform === platform) {
      last.accounts.push(account);
      continue;
    }
    sections.push({
      platform,
      label: PLATFORM_LABELS[platform] ?? platform,
      accounts: [account],
    });
  }
  return sections;
}

function renderLinkedInRows(
  accounts: readonly WorkspaceHeaderAccountRow[],
  disconnectingId: string | null,
  onDisconnect: (account: WorkspaceHeaderAccountRow) => void,
): ReactElement[] {
  const groups = groupWorkspaceHeaderAccounts(accounts);
  const rows: ReactElement[] = [];

  for (const group of groups) {
    rows.push(
      <AccountRow
        key={group.parent.id}
        account={group.parent}
        disconnectingId={disconnectingId}
        onDisconnect={onDisconnect}
        isChild={false}
      />,
    );
    for (const child of group.children) {
      rows.push(
        <AccountRow
          key={child.id}
          account={child}
          disconnectingId={disconnectingId}
          onDisconnect={onDisconnect}
          isChild
        />,
      );
    }
  }

  return rows;
}

function AccountRow({
  account,
  disconnectingId,
  onDisconnect,
  isChild,
}: {
  readonly account: WorkspaceHeaderAccountRow;
  readonly disconnectingId: string | null;
  readonly onDisconnect: (account: WorkspaceHeaderAccountRow) => void;
  readonly isChild: boolean;
}): ReactElement {
  return (
    <article
      className={`flex min-h-[92px] items-center gap-5 rounded-lg border border-outline-variant/35 bg-surface-container-low px-4 py-3 ${
        isChild ? "ml-6 border-l-2 border-l-secondary/35" : ""
      }`}
    >
      <AccountAvatar account={account} />
      <div className="min-w-0 flex-1">
        <h3 className="truncate text-sm font-bold">{accountDisplayLabel(account)}</h3>
        <p className="mt-1 truncate text-sm text-secondary">{account.hint ?? accountSlug(account)}</p>
      </div>
      <button
        type="button"
        onClick={() => onDisconnect(account)}
        disabled={disconnectingId !== null}
        className="flex h-9 shrink-0 items-center justify-center rounded-lg border border-outline-variant/50 px-4 text-sm font-semibold text-on-surface-variant hover:bg-surface-container-high hover:text-error"
      >
        {disconnectingId === account.id ? "Disconnecting" : "Disconnect"}
      </button>
    </article>
  );
}

export function AccountsScreen(): ReactElement {
  const { t } = useTranslations();
  const {
    accounts,
    isLoadingProfiles,
    profilesError,
    refreshAllUnifiedProfiles,
  } = useWorkspaceHeaderAccounts();
  const { openPlatformsForConnect } = useWorkspacePlatformsModal();
  const [query, setQuery] = useState("");
  const [disconnectingId, setDisconnectingId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [pendingDisconnect, setPendingDisconnect] = useState<WorkspaceHeaderAccountRow | null>(null);

  const disconnectAccount = async (account: WorkspaceHeaderAccountRow): Promise<void> => {
    const token = getStoredAccessToken();
    const workspaceId = getStoredActiveWorkspaceId();
    if (!token?.trim() || !workspaceId?.trim()) {
      setActionError("Sign in and select a workspace to disconnect.");
      return;
    }
    setActionError(null);
    setDisconnectingId(account.id);
    try {
      await disconnectWorkspaceHeaderAccount(token, workspaceId, account);
      await refreshAllUnifiedProfiles();
      setPendingDisconnect(null);
    } catch (error) {
      setActionError(
        formatUserFacingApiError(
          error instanceof Error ? error.message : "Could not disconnect account.",
        ),
      );
    } finally {
      setDisconnectingId(null);
    }
  };

  const accountMegaSections = useMemo(
    () => buildAccountMegaSections(accounts.filter((account) => matchesSearch(account, query))),
    [accounts, query],
  );
  const visibleAccountCount = accountMegaSections.reduce(
    (count, mega) => count + mega.sections.reduce((n, section) => n + section.accounts.length, 0),
    0,
  );

  return (
    <>
      <WorkspacePageDocumentHead titleKey="shell.socialAccounts" />
      <WorkspacePageScaffold>
        <div className="w-full space-y-6">
          <h1 className={WORKSPACE_SIDEBAR_SUBPAGE_TITLE_CLASS}>{t("shell.socialAccounts")}</h1>

        <div className="flex gap-3">
          <label className="relative min-w-0 flex-1">
            <span className="sr-only">Search accounts</span>
            <span className="material-symbols-outlined pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[20px] text-on-surface-variant">
              search
            </span>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search..."
              className="h-10 w-full rounded-lg border border-outline-variant/40 bg-surface px-12 text-sm text-on-surface outline-none transition-colors placeholder:text-on-surface-variant/70 focus:border-secondary"
            />
          </label>
          <button
            type="button"
            onClick={openPlatformsForConnect}
            className="flex h-10 shrink-0 items-center gap-2 rounded-lg bg-on-surface px-4 text-sm font-semibold text-surface shadow-sm hover:opacity-90"
          >
            Add
            <span className="material-symbols-outlined text-[20px]">add</span>
          </button>
        </div>

        {profilesError ? (
          <div className="rounded-lg border border-error/30 bg-error/10 px-4 py-3 text-sm text-error">
            {profilesError}
          </div>
        ) : null}
        {actionError && !pendingDisconnect ? (
          <div className="rounded-lg border border-error/30 bg-error/10 px-4 py-3 text-sm text-error">
            {actionError}
          </div>
        ) : null}

        <div className="flex flex-col gap-2">
          {isLoadingProfiles && accounts.length === 0 ? (
            <div className="rounded-lg border border-outline-variant/35 px-4 py-8 text-center text-sm text-on-surface-variant">
              Loading accounts...
            </div>
          ) : null}
          {!isLoadingProfiles && visibleAccountCount === 0 && query.trim() && !profilesError ? (
            <div className="rounded-lg border border-outline-variant/35 px-4 py-8 text-center text-sm text-on-surface-variant">
              No accounts found.
            </div>
          ) : null}
          {accountMegaSections.map((mega) => (
            <div key={mega.kind} className="flex flex-col gap-2">
              {accountMegaSections.length > 1 ? (
                <h2 className="mt-4 text-xs font-bold uppercase tracking-[0.12em] text-on-surface-variant first:mt-0">
                  {mega.kind === "social"
                    ? t("settings.accountsSocialSection")
                    : t("settings.accountsBlogSection")}
                </h2>
              ) : null}
              {mega.sections.map((section) => (
            <section key={`${mega.kind}-${section.platform}`} className="flex flex-col gap-2">
              <div className="mt-3 flex items-center gap-3 first:mt-0">
                <SocialPlatformIcon platform={section.platform} className="h-5 w-5" alt="" />
                <h2 className="text-xs font-bold uppercase text-on-surface-variant">
                  {section.label}
                </h2>
                <span className="text-xs text-on-surface-variant/70">
                  {section.accounts.length}
                </span>
              </div>
              {section.platform === "linkedin"
                ? renderLinkedInRows(section.accounts, disconnectingId, (account) => {
                    setActionError(null);
                    setPendingDisconnect(account);
                  })
                : section.accounts.map((account) => (
                    <AccountRow
                      key={account.id}
                      account={account}
                      disconnectingId={disconnectingId}
                      onDisconnect={(row) => {
                        setActionError(null);
                        setPendingDisconnect(row);
                      }}
                      isChild={false}
                    />
                  ))}
            </section>
              ))}
            </div>
          ))}
          <AccountsSocialPlatformsSection />
          <AccountsDesigningSection />
          <AccountsCloudStorageSection />
        </div>
      </div>
      </WorkspacePageScaffold>
      <AdPlatformDisconnectConfirmModal
        open={pendingDisconnect !== null}
        platformName={pendingDisconnect ? accountDisplayLabel(pendingDisconnect) : "account"}
        busy={disconnectingId !== null}
        error={actionError}
        onClose={() => {
          if (disconnectingId !== null) {
            return;
          }
          setPendingDisconnect(null);
          setActionError(null);
        }}
        onConfirm={() => {
          if (!pendingDisconnect) {
            return;
          }
          return disconnectAccount(pendingDisconnect);
        }}
      />
    </>
  );
}
