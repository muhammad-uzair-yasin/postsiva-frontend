import { useCallback, useEffect, useState } from "react";
import { getStoredAccessToken } from "@/lib/auth/session";
import {
  listWorkspaceMembers,
  listWorkspacePendingInvites,
  type PendingWorkspaceInviteRow,
  type WorkspaceMemberRow,
} from "@/lib/workspaces/workspaceMembersApi";

export function useWorkspaceMembersLoader(
  workspaceId: string | null,
  isReady: boolean,
): {
  members: WorkspaceMemberRow[];
  pendingInvites: PendingWorkspaceInviteRow[];
  loading: boolean;
  error: string | null;
  reload: () => Promise<void>;
} {
  const [members, setMembers] = useState<WorkspaceMemberRow[]>([]);
  const [pendingInvites, setPendingInvites] = useState<
    PendingWorkspaceInviteRow[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async (): Promise<void> => {
    if (!workspaceId) {
      return;
    }
    const token = getStoredAccessToken();
    if (!token) {
      setError("Not signed in");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const [m, p] = await Promise.all([
        listWorkspaceMembers(token, workspaceId),
        listWorkspacePendingInvites(token, workspaceId),
      ]);
      setMembers(m);
      setPendingInvites(p);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load members");
      setMembers([]);
      setPendingInvites([]);
    } finally {
      setLoading(false);
    }
  }, [workspaceId]);

  useEffect(() => {
    if (!isReady || !workspaceId) {
      return;
    }
    void reload();
  }, [isReady, workspaceId, reload]);

  return { members, pendingInvites, loading, error, reload };
}
