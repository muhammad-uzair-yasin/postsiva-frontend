import { useCallback, useState } from "react";
import { getStoredAccessToken } from "@/lib/auth/session";
import { resendWorkspaceInviteEmail } from "@/lib/workspaces/workspaceMembersApi";

export function useResendWorkspaceInvite(
  workspaceId: string | null,
  onSuccess: () => void | Promise<void>,
): {
  resend: (inviteId: string) => Promise<void>;
  busyInviteId: string | null;
  error: string | null;
  clearError: () => void;
} {
  const [busyInviteId, setBusyInviteId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const resend = useCallback(
    async (inviteId: string): Promise<void> => {
      if (!workspaceId) {
        return;
      }
      const token = getStoredAccessToken();
      if (!token) {
        setError("Not signed in");
        return;
      }
      setBusyInviteId(inviteId);
      setError(null);
      try {
        await resendWorkspaceInviteEmail(token, workspaceId, inviteId);
        await onSuccess();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Could not resend invite");
      } finally {
        setBusyInviteId(null);
      }
    },
    [workspaceId, onSuccess],
  );

  const clearError = useCallback((): void => {
    setError(null);
  }, []);

  return { resend, busyInviteId, error, clearError };
}
