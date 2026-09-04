"use client";

import { useMemo } from "react";
import type { ReactElement } from "react";

import { useStoredAuthUser } from "@/app/(workspace)/_hooks/useStoredAuthUser";
import { useTranslations } from "@/lib/i18n/WorkspaceLocaleProvider";
import type { AuthWorkspaceLoginItem } from "@/lib/auth/types";

import { useWorkspaceHeaderAccounts } from "../../_components/WorkspaceHeaderAccountsProvider";
import { useUpgradePlanLimit } from "@/lib/billing/UpgradePlanLimitProvider";
import { useBilling } from "@/lib/billing/BillingContext";
import { useWorkspaceMemberInvite } from "../../workspaces/edit/_hooks/useWorkspaceMemberInvite";
import { useWorkspaceMembersLoader } from "../../workspaces/edit/_hooks/useWorkspaceMembersLoader";
import { useResendWorkspaceInvite } from "../../workspaces/edit/_hooks/useResendWorkspaceInvite";
import { EditWorkspacePendingInvitesList } from "../../workspaces/edit/_components/EditWorkspacePendingInvitesList";
import { InviteMemberModal } from "../../workspaces/edit/_components/InviteMemberModal";
import { WORKSPACE_SIDEBAR_SUBPAGE_TITLE_CLASS } from "../../_components/shell/WorkspaceAccountRailPageLayout";
import { WorkspaceMembersTable } from "./WorkspaceMembersTable";

interface WorkspaceMembersPageContentProps {
  readonly workspace: AuthWorkspaceLoginItem | null;
  readonly isReady: boolean;
  readonly isOwner: boolean;
}

export function WorkspaceMembersPageContent({
  workspace,
  isReady,
  isOwner,
}: WorkspaceMembersPageContentProps): ReactElement | null {
  const { t } = useTranslations();
  const { user } = useStoredAuthUser();
  const { accounts } = useWorkspaceHeaderAccounts();
  const { promptUpgradeIfNeeded } = useUpgradePlanLimit();
  const { refresh } = useBilling();
  const workspaceId = workspace?.id ?? null;

  const { members, pendingInvites, loading, error: membersError, reload } =
    useWorkspaceMembersLoader(workspaceId, isReady);

  const ownerFromMemberRow =
    Boolean(user?.email?.trim()) &&
    members.some((m) => {
      const em = user?.email?.trim().toLowerCase() ?? "";
      return (
        m.email.trim().toLowerCase() === em &&
        m.role_name.trim().toLowerCase() === "owner"
      );
    });

  const effectiveOwner = isOwner || ownerFromMemberRow;

  const {
    resend: resendInviteEmail,
    busyInviteId,
    error: resendError,
    clearError: clearResendError,
  } = useResendWorkspaceInvite(workspaceId, reload);

  const {
    open: inviteOpen,
    busy: inviteBusy,
    error: inviteError,
    successMessage: inviteSuccess,
    openModal,
    closeModal,
    submit: onInviteSubmit,
  } = useWorkspaceMemberInvite(workspaceId, reload);

  const memberCountLabel = useMemo(() => {
    const count = members.length;
    if (count === 1) return t("workspaces.membersCountOne");
    return t("workspaces.membersCountMany", { count: String(count) });
  }, [members.length, t]);

  if (!isReady || !workspace) {
    return null;
  }

  return (
    <div className="w-full">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className={WORKSPACE_SIDEBAR_SUBPAGE_TITLE_CLASS}>
              {t("workspaces.membersPageTitle")}
            </h1>
            <button
              type="button"
              onClick={() => void reload()}
              disabled={loading}
              aria-label={t("workspaces.membersRefresh")}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-on-surface-variant transition-colors hover:bg-surface-container-high disabled:opacity-50"
            >
              <span className={`material-symbols-outlined text-xl ${loading ? "animate-spin" : ""}`}>
                refresh
              </span>
            </button>
          </div>
          <p className="mt-0.5 text-sm text-on-surface-variant">{memberCountLabel}</p>
        </div>
        <button
          type="button"
          disabled={!effectiveOwner}
          onClick={() => {
            clearResendError();
            void (async () => {
              const snapshot = await refresh();
              if (
                promptUpgradeIfNeeded("team_members", {
                  teamSlotsUsed: members.length + pendingInvites.length,
                  usageSnapshot: snapshot,
                })
              ) {
                return;
              }
              openModal();
            })();
          }}
          title={effectiveOwner ? undefined : t("workspaces.teamInviteOwnerOnly")}
          className="inline-flex shrink-0 items-center justify-center rounded-lg bg-secondary px-4 py-2.5 text-sm font-bold text-on-secondary transition-opacity hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {t("workspaces.teamInviteMember")}
        </button>
      </div>

      {inviteSuccess ? (
        <p className="mb-4 rounded-xl border border-primary/30 bg-primary/10 px-3 py-2 text-sm text-on-surface">
          {inviteSuccess}
        </p>
      ) : null}

      {resendError ? (
        <p
          className="mb-4 rounded-xl border border-error/40 bg-error/10 px-3 py-2 text-sm text-error"
          role="alert"
        >
          {resendError}
          <button type="button" className="ml-2 underline" onClick={() => clearResendError()}>
            {t("workspaces.dismiss")}
          </button>
        </p>
      ) : null}

      <InviteMemberModal
        open={inviteOpen}
        busy={inviteBusy}
        error={inviteError}
        onClose={closeModal}
        onSubmit={onInviteSubmit}
      />

      <WorkspaceMembersTable
        loading={loading}
        listError={membersError}
        members={members}
        socialAccounts={accounts}
      />

      {effectiveOwner ? (
        <div className="mt-8">
          <EditWorkspacePendingInvitesList
            loading={loading}
            pendingInvites={pendingInvites}
            busyInviteId={busyInviteId}
            onResend={(id) => {
              clearResendError();
              void resendInviteEmail(id);
            }}
          />
        </div>
      ) : (
        <p className="mt-6 text-xs text-on-surface-variant">{t("workspaces.teamPendingOwnerOnly")}</p>
      )}
    </div>
  );
}
