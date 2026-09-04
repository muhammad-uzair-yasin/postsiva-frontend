import { useCallback, useState } from "react";
import { getStoredAccessToken } from "@/lib/auth/session";
import { refreshStoredWorkspacesFromApi } from "@/lib/social/unifiedOAuthApi";
import {
  addWorkspaceMemberByEmail,
  WORKSPACE_ROLE_EDITOR,
  WORKSPACE_ROLE_PUBLISHER,
} from "@/lib/workspaces/workspaceMembersApi";
import { BillingPlanError } from "@/lib/billing/billingErrors";
import { useBilling } from "@/lib/billing/BillingContext";
import { useUpgradePlanLimit } from "@/lib/billing/UpgradePlanLimitProvider";

export function useWorkspaceMemberInvite(
  workspaceId: string | null,
  onInvited: () => Promise<void>,
): {
  open: boolean;
  busy: boolean;
  error: string | null;
  successMessage: string | null;
  openModal: () => void;
  closeModal: () => void;
  submit: (email: string, roleId: number) => Promise<void>;
} {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const { promptUpgradeForBillingError } = useUpgradePlanLimit();
  const { refresh } = useBilling();

  const closeModal = useCallback(() => {
    if (busy) {
      return;
    }
    setError(null);
    setOpen(false);
  }, [busy]);

  const openModal = useCallback(() => {
    setError(null);
    setSuccessMessage(null);
    setOpen(true);
  }, []);

  const submit = useCallback(
    async (email: string, roleId: number): Promise<void> => {
      if (!workspaceId || !email) {
        setError("Email is required");
        return;
      }
      const role =
        roleId === WORKSPACE_ROLE_PUBLISHER
          ? WORKSPACE_ROLE_PUBLISHER
          : WORKSPACE_ROLE_EDITOR;
      const token = getStoredAccessToken();
      if (!token) {
        setError("Not signed in");
        return;
      }
      setError(null);
      setBusy(true);
      try {
        const result = await addWorkspaceMemberByEmail(
          token,
          workspaceId,
          email,
          role,
        );
        if (result.outcome === "invite_sent") {
          setSuccessMessage(
            `Invitation email sent to ${result.invite_email}. They can join within ${result.expires_in_days} days.`,
          );
        } else {
          setSuccessMessage(
            `${result.member.email} was added to this workspace.`,
          );
        }
        await refreshStoredWorkspacesFromApi(token);
        await onInvited();
        await refresh();
        setOpen(false);
      } catch (e) {
        if (e instanceof BillingPlanError) {
          if (promptUpgradeForBillingError(e.detail)) {
            setOpen(false);
            return;
          }
        }
        setError(e instanceof Error ? e.message : "Could not add member");
      } finally {
        setBusy(false);
      }
    },
    [workspaceId, onInvited, promptUpgradeForBillingError, refresh],
  );

  return { open, busy, error, successMessage, openModal, closeModal, submit };
}
