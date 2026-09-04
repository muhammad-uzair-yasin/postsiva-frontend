import { clearPublishedPostsWorkspaceCache } from "@/lib/contentManager/publishedPostsWorkspaceCache";
import { clearInboxCommentsWorkspaceCache } from "@/lib/inbox/inboxCommentsWorkspaceCache";
import { invalidateUnifiedMediaListCache } from "@/lib/social/unifiedMediaApi";
import { clearWordPressBlogsWorkspaceCache } from "@/lib/wordpress/wordpressBlogsWorkspaceCache";

/** Drop in-memory page caches so UI refetches for the newly active workspace. */
export function clearWorkspaceSwitchCaches(): void {
  clearPublishedPostsWorkspaceCache();
  clearInboxCommentsWorkspaceCache();
  clearWordPressBlogsWorkspaceCache();
  invalidateUnifiedMediaListCache();
}
