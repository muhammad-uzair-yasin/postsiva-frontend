import { fetchWorkspaceDrafts } from "@/lib/social/fetchWorkspaceDrafts";
import type { WorkspaceHeaderAccountRow } from "@/lib/workspace/headerAccountsTypes";

import type { ContentManagerPost } from "../_types/contentManagerTypes";
import { headerAccountRowToUnifiedDraftsQuery } from "./headerAccountToUnifiedDraftsQuery";
import { mapUnifiedDraftJsonToContentManagerPost } from "./mapUnifiedDraftJsonToContentManagerPost";

export async function fetchContentManagerDraftPostsForAccount(
  token: string,
  workspaceId: string,
  selected: WorkspaceHeaderAccountRow,
  signal: AbortSignal,
): Promise<ContentManagerPost[]> {
  const query = headerAccountRowToUnifiedDraftsQuery(selected);
  const res = await fetchWorkspaceDrafts(token, workspaceId, {
    platform: query.platform,
    platformUserId: query.platformUserId,
    linkedinPageIds: query.linkedinPageIds,
    facebookPageIds: query.facebookPageIds,
    signal,
  });
  if (!res.success) {
    throw new Error("Could not load drafts.");
  }
  return res.data?.map(mapUnifiedDraftJsonToContentManagerPost) ?? [];
}
