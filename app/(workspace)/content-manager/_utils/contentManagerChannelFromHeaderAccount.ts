import type { WorkspaceHeaderAccountRow } from "@/lib/workspace/headerAccountsTypes";
import { isWorkspaceHeaderAllPlatformsId } from "@/lib/workspace/workspaceHeaderAllPlatforms";

import type { ContentManagerChannelFilter } from "../_types/contentManagerTypes";

const SIMPLE_HEADER_IDS: readonly string[] = [
  "instagram",
  "linkedin",
  "facebook",
  "threads",
  "tiktok",
  "youtube",
  "pinterest",
  "bluesky",
  "mastodon",
  "wordpress",
  "x",
];

/**
 * Maps the workspace header account picker selection to the same channel filter
 * shape used by Content Manager (draft filter, published merge, unified posts hooks).
 */
export function contentManagerChannelFromHeaderAccount(
  account: WorkspaceHeaderAccountRow | null,
): ContentManagerChannelFilter {
  if (!account) {
    return "all";
  }
  if (isWorkspaceHeaderAllPlatformsId(account.id)) {
    return "all";
  }
  const { id } = account;
  if (id.startsWith("linkedin:org:")) {
    const stable = id.slice("linkedin:org:".length);
    const orgId = stable.replace(/_/g, ":");
    return `linkedin:${orgId}` as ContentManagerChannelFilter;
  }
  if (id.startsWith("facebook:page:")) {
    const stable = id.slice("facebook:page:".length);
    const pageId = stable.replace(/_/g, ":");
    return `facebook:${pageId}` as ContentManagerChannelFilter;
  }
  if (id.startsWith("pinterest:board:")) {
    return "pinterest";
  }
  if (id.startsWith("youtube:")) {
    return "youtube";
  }
  if (id.startsWith("wordpress:")) {
    return "wordpress";
  }
  if (SIMPLE_HEADER_IDS.includes(id)) {
    return id as ContentManagerChannelFilter;
  }
  return "all";
}
