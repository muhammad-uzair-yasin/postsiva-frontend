import { fetchWorkspacesForSession } from "@/lib/auth/authApi";
import {
  getStoredActiveWorkspaceId,
  POSTSIVA_ACTIVE_WORKSPACE_CHANGED,
  setActiveWorkspaceId,
  setStoredWorkspaces,
  STORAGE_KEY_WORKSPACE_ID,
} from "@/lib/auth/session";
import {
  deleteWorkspace as deleteWorkspaceApi,
} from "@/lib/workspaces/workspaceApi";

/**
 * DELETE workspace, refresh cached workspace list, fix active workspace id, then navigate.
 */
export async function runDeleteWorkspaceFlow(
  workspaceId: string,
  accessToken: string,
  navigateToWorkspaces: () => void,
): Promise<void> {
  await deleteWorkspaceApi(accessToken, workspaceId);
  const next = await fetchWorkspacesForSession(accessToken);
  setStoredWorkspaces(next);
  const active = getStoredActiveWorkspaceId();
  if (active === workspaceId) {
    const first = next[0]?.id?.trim();
    if (first) {
      setActiveWorkspaceId(first);
    } else if (typeof window !== "undefined") {
      window.localStorage.removeItem(STORAGE_KEY_WORKSPACE_ID);
      window.dispatchEvent(new Event(POSTSIVA_ACTIVE_WORKSPACE_CHANGED));
    }
  }
  navigateToWorkspaces();
}
