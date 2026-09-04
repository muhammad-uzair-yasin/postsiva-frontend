import { deleteOAuthTokenForWorkspace } from "@/lib/social/unifiedOAuthApi";
import type { WorkspaceHeaderAccountRow } from "@/lib/workspace/headerAccountsTypes";

export function oauthPlatformForHeaderAccount(
  account: WorkspaceHeaderAccountRow,
): string | null {
  if (account.id.startsWith("linkedin")) return "linkedin";
  if (account.id.startsWith("facebook")) return "facebook";
  if (account.id.startsWith("youtube")) return "youtube";
  if (account.id.startsWith("pinterest")) return "pinterest";
  if (account.id.startsWith("wordpress")) return "wordpress";
  return account.iconId;
}

export async function disconnectWorkspaceHeaderAccount(
  accessToken: string,
  workspaceId: string,
  account: WorkspaceHeaderAccountRow,
): Promise<void> {
  const platform = oauthPlatformForHeaderAccount(account);
  if (!platform) {
    throw new Error("This account cannot be disconnected here.");
  }
  if (platform === "youtube") {
    const channelId = account.targetResourceId?.trim();
    if (!channelId) {
      throw new Error("YouTube channel id is missing.");
    }
    await deleteOAuthTokenForWorkspace(accessToken, workspaceId, platform, channelId);
    return;
  }
  if (platform === "wordpress") {
    const connectionId = account.targetResourceId?.trim();
    if (!connectionId) {
      throw new Error("WordPress connection id is missing.");
    }
    await deleteOAuthTokenForWorkspace(accessToken, workspaceId, platform, connectionId);
    return;
  }
  if (platform === "linkedin") {
    const targetId = account.targetResourceId?.trim();
    if (targetId) {
      await deleteOAuthTokenForWorkspace(accessToken, workspaceId, platform, targetId);
      return;
    }
  }
  await deleteOAuthTokenForWorkspace(accessToken, workspaceId, platform);
}
