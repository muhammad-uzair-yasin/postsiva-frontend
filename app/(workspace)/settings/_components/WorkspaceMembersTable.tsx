"use client";

import type { ReactElement } from "react";

import { SocialPlatformIcon } from "@/lib/social/SocialPlatformIcon";
import { isSocialPlatformIconId } from "@/lib/social/socialPlatformIconSrc";
import type { WorkspaceMemberRow } from "@/lib/workspaces/workspaceMembersApi";
import { isWorkspaceHeaderAllPlatformsId } from "@/lib/workspace/workspaceHeaderAllPlatforms";
import type { WorkspaceHeaderAccountRow } from "@/lib/workspace/headerAccountsTypes";
import { useTranslations } from "@/lib/i18n/WorkspaceLocaleProvider";

import { useStoredAuthUser } from "../../_hooks/useStoredAuthUser";
import {
  formatMemberRole,
  memberDisplayName,
  memberInitials,
} from "../_utils/memberDisplay";

interface WorkspaceMembersTableProps {
  readonly loading: boolean;
  readonly listError: string | null;
  readonly members: WorkspaceMemberRow[];
  readonly socialAccounts: readonly WorkspaceHeaderAccountRow[];
}

function SocialAccountIcons({
  accounts,
}: {
  accounts: readonly WorkspaceHeaderAccountRow[];
}): ReactElement {
  const connected = accounts.filter((a) => !isWorkspaceHeaderAllPlatformsId(a.id));

  if (connected.length === 0) {
    return <span className="text-xs text-on-surface-variant">—</span>;
  }

  return (
    <div className="flex items-center -space-x-1.5">
      {connected.slice(0, 6).map((account) => {
        const icon = isSocialPlatformIconId(account.iconId) ? account.iconId : "instagram";
        return (
          <span
            key={account.id}
            title={account.label}
            className="inline-flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-surface-container-high bg-surface-container"
          >
            <SocialPlatformIcon platform={icon} className="h-full w-full" alt="" />
          </span>
        );
      })}
      {connected.length > 6 ? (
        <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 border-surface-container-high bg-surface-container text-[10px] font-bold text-on-surface-variant">
          +{connected.length - 6}
        </span>
      ) : null}
    </div>
  );
}

export function WorkspaceMembersTable({
  loading,
  listError,
  members,
  socialAccounts,
}: WorkspaceMembersTableProps): ReactElement {
  const { t } = useTranslations();
  const { user } = useStoredAuthUser();

  if (listError) {
    return (
      <p className="rounded-xl border border-error/30 bg-error/10 px-4 py-3 text-sm text-error" role="alert">
        {listError}
      </p>
    );
  }

  if (loading) {
    return (
      <p className="py-8 text-center text-sm text-on-surface-variant">
        {t("workspaces.teamMembersLoading")}
      </p>
    );
  }

  if (members.length === 0) {
    return (
      <p className="rounded-xl border border-outline-variant/20 bg-surface-container-low px-4 py-8 text-center text-sm text-on-surface-variant">
        {t("workspaces.teamMembersEmpty")}
      </p>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-outline-variant/20 bg-surface-container-low">
      <div className="app-hscroll overflow-x-auto">
        <table className="w-full min-w-[640px] border-collapse text-left">
          <thead>
            <tr className="border-b border-outline-variant/15 bg-surface-container/40">
              <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">
                {t("workspaces.membersColName")}
              </th>
              <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">
                {t("workspaces.membersColRole")}
              </th>
              <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">
                {t("workspaces.membersColSocialAccounts")}
              </th>
              <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">
                {t("workspaces.membersColActions")}
              </th>
            </tr>
          </thead>
          <tbody>
            {members.map((member) => {
              const name = memberDisplayName(member, user);
              return (
                <tr
                  key={member.user_id}
                  className="border-b border-outline-variant/10 last:border-b-0"
                >
                  <td className="px-4 py-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-container text-xs font-bold text-on-primary-container">
                        {memberInitials(name)}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-on-surface">{name}</p>
                        <p className="truncate text-xs text-on-surface-variant">{member.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-on-surface-variant">
                    {formatMemberRole(member.role_name)}
                  </td>
                  <td className="px-4 py-3">
                    <SocialAccountIcons accounts={socialAccounts} />
                  </td>
                  <td className="px-4 py-3 text-sm text-on-surface-variant">—</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
