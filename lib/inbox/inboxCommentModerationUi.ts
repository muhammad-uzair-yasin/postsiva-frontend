import type { UnifiedInboxMessage } from "@/lib/inbox/unifiedInboxTypes";

/** Facebook-only: hide/delete/block/spam + page reactions. Other platforms: reply only (no action bar). */
export function inboxCommentModerationUiEnabled(
  platform: UnifiedInboxMessage["platform"],
): boolean {
  return platform === "facebook";
}
