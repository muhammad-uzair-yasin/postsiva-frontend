"use client";

import { useStoredAuthUser } from "@/app/(workspace)/_hooks/useStoredAuthUser";
import { useTranslations } from "@/lib/i18n/WorkspaceLocaleProvider";
import type { AuthWorkspaceLoginItem } from "@/lib/auth/types";

import { useWorkspaceMemberInvite } from "../_hooks/useWorkspaceMemberInvite";
import { useWorkspaceMembersLoader } from "../_hooks/useWorkspaceMembersLoader";
import { useResendWorkspaceInvite } from "../_hooks/useResendWorkspaceInvite";
import { useUpgradePlanLimit } from "@/lib/billing/UpgradePlanLimitProvider";
import { useBilling } from "@/lib/billing/BillingContext";
import { EditWorkspaceMemberList } from "./EditWorkspaceMemberList";
import { EditWorkspacePendingInvitesList } from "./EditWorkspacePendingInvitesList";
import { InviteMemberModal } from "./InviteMemberModal";

interface EditWorkspaceTeamSectionProps {
  workspace: AuthWorkspaceLoginItem | null;
  isReady: boolean;
  isOwner: boolean;
}

export function EditWorkspaceTeamSection({
  workspace,
  isReady,
  isOwner,
}: EditWorkspaceTeamSectionProps): React.ReactElement | null {
  const { t } = useTranslations();
  const workspaceId = workspace?.id ?? null;
  const { user } = useStoredAuthUser();
  const { promptUpgradeIfNeeded } = useUpgradePlanLimit();
  const { refresh } = useBilling();

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

  /** Parent ACL + member list role (covers stale/missing owner_id in workspace cache). */
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

  if (!isReady || !workspace) {
    return null;
  }

  return (
    <section className="space-y-4">
      {inviteSuccess ? (
        <p className="rounded-xl border border-primary/30 bg-primary/10 px-3 py-2 text-sm text-on-surface">
          {inviteSuccess}
        </p>
      ) : null}
      <InviteMemberModal
        open={inviteOpen}
        busy={inviteBusy}
        error={inviteError}
        onClose={closeModal}
        onSubmit={onInviteSubmit}
      />
      {resendError ? (
        <p className="rounded-xl border border-error/40 bg-error/10 px-3 py-2 text-sm text-error" role="alert">
          {resendError}
          <button
            type="button"
            className="ml-2 underline"
            onClick={() => clearResendError()}
          >
            {t("workspaces.dismiss")}
          </button>
        </p>
      ) : null}
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold uppercase tracking-widest text-primary">
          {t("workspaces.teamTitle")}
        </h2>
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
          title={
            effectiveOwner
              ? undefined
              : t("workspaces.teamInviteOwnerOnly")
          }
          className="flex items-center gap-1.5 text-xs font-bold text-secondary-fixed-dim transition-colors hover:text-secondary disabled:cursor-not-allowed disabled:opacity-40"
        >
          <span className="material-symbols-outlined text-sm">person_add</span>
          {t("workspaces.teamInviteMember")}
        </button>
      </div>
      <div className="space-y-4">
        <EditWorkspaceMemberList
          loading={loading}
          listError={membersError}
          members={members}
        />
        {effectiveOwner ? (
          <EditWorkspacePendingInvitesList
            loading={loading}
            pendingInvites={pendingInvites}
            busyInviteId={busyInviteId}
            onResend={(id) => {
              clearResendError();
              void resendInviteEmail(id);
            }}
          />
        ) : (
          <p className="text-xs text-on-surface-variant">
            {t("workspaces.teamPendingOwnerOnly")}
          </p>
        )}
      </div>
    </section>
  );
}
