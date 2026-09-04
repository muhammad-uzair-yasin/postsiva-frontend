import type {
  UnifiedInboxMessage,
  UnifiedInboxPlatform,
} from "@/lib/inbox/unifiedInboxTypes";
import { isInboxCommentFromPostOwner } from "@/lib/inbox/inboxCommentFromPostOwner";

const GENERATOR_PLATFORMS = new Set<UnifiedInboxPlatform>([
  "linkedin",
  "facebook",
  "instagram",
  "youtube",
  "threads",
  "tiktok",
  "bluesky",
  "mastodon",
  "wordpress",
]);

export interface InboxAiGenerateOptions {
  readonly unifiedProfiles?: Record<string, unknown> | null;
}

export function inboxMessageSupportsAiGenerate(
  message: UnifiedInboxMessage,
  options?: InboxAiGenerateOptions,
): boolean {
  if (!GENERATOR_PLATFORMS.has(message.platform)) {
    return false;
  }
  if (!message.sourcePostId?.trim()) {
    return false;
  }
  if (message.platform === "facebook" && !message.sourcePageId?.trim()) {
    return false;
  }
  // Never AI-reply to the post owner's own comments (LinkedIn Author badge case).
  if (isInboxCommentFromPostOwner(message, options?.unifiedProfiles ?? null)) {
    return false;
  }
  return true;
}

export function pageIdForUnifiedCommentGenerate(
  message: UnifiedInboxMessage,
): string | undefined {
  if (message.platform === "facebook") {
    return message.sourcePageId?.trim();
  }
  if (message.platform === "linkedin") {
    const org = message.sourceOrganizationId?.trim();
    return org && org.length > 0 ? org : undefined;
  }
  return undefined;
}
