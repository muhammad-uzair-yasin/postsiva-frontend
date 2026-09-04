import { accountIdToOAuthPlatform } from "@/lib/workspace/accountIdToOAuthPlatform";
import {
  facebookPageIdsFromSelectedIds,
  linkedinOrganizationIdsFromSelectedIds,
  youtubeChannelIdFromSelectedIds,
} from "@/lib/workspace/decodeCompositeAccountIds";
import { fetchUnifiedComments } from "@/lib/social/unifiedCommentsApi";
import type {
  UnifiedCommentsPostBucket,
  UnifiedCommentsPlatformSlice,
  UnifiedCommentsResponseJson,
} from "@/lib/inbox/unifiedCommentsTypes";
import type { CommentsOAuthPlatform } from "@/lib/workspace/accountIdToOAuthPlatform";

function emptyResponse(): UnifiedCommentsResponseJson {
  return {
    success: true,
    linkedin: null,
    facebook: null,
    instagram: null,
    youtube: null,
    threads: null,
    tiktok: null,
    bluesky: null,
    mastodon: null,
    wordpress: null,
  };
}

function copyCommentSlices(
  target: UnifiedCommentsResponseJson,
  src: UnifiedCommentsResponseJson,
): void {
  if (src.linkedin != null) {
    target.linkedin = src.linkedin;
  }
  if (src.facebook != null) {
    target.facebook = src.facebook;
  }
  if (src.instagram != null) {
    target.instagram = src.instagram;
  }
  if (src.youtube != null) {
    target.youtube = src.youtube;
  }
  if (src.threads != null) {
    target.threads = src.threads;
  }
  if (src.tiktok != null) {
    target.tiktok = src.tiktok;
  }
  if (src.bluesky != null) {
    target.bluesky = src.bluesky;
  }
  if (src.mastodon != null) {
    target.mastodon = src.mastodon;
  }
  if (src.wordpress != null) {
    target.wordpress = src.wordpress;
  }
  if (src.message != null) {
    target.message = src.message;
  }
  if (src.classification_status != null) {
    const current = target.classification_status;
    target.classification_status = {
      state:
        src.classification_status.state === "running" ||
        current?.state === "running"
          ? "running"
          : (src.classification_status.state ?? current?.state),
      pending_count:
        (current?.pending_count ?? 0) +
        (src.classification_status.pending_count ?? 0),
      estimated_seconds: Math.max(
        current?.estimated_seconds ?? 0,
        src.classification_status.estimated_seconds ?? 0,
      ),
    };
  }
}

function dedupeLinkedinBuckets(
  posts: UnifiedCommentsPostBucket[],
): UnifiedCommentsPostBucket[] {
  const map = new Map<string, UnifiedCommentsPostBucket>();
  for (const b of posts) {
    const pid = (b.post_id ?? "").trim();
    if (pid.length === 0) {
      continue;
    }
    const page = (b.linkedin_page_id ?? "").trim();
    const key = `${pid}\u0000${page}`;
    map.set(key, b);
  }
  return [...map.values()];
}

/** Default max posts per platform when loading the inbox bulk comments feed. */
const DEFAULT_POST_LIMIT = 50;
const DEFAULT_COMMENTS_PER_POST = 50;

export interface FetchInboxUnifiedCommentsOptions {
  readonly forceRefresh?: boolean;
  /** `limit` query on GET /unified/comments/ (recent posts with comments). */
  readonly postLimit?: number;
  readonly commentsPerPost?: number;
}

/**
 * Loads GET /unified/comments/ for header account selection (same strategy as mobile
 * {@link fetchInboxUnifiedComments}).
 */
export async function fetchInboxUnifiedComments(
  accessToken: string,
  workspaceId: string,
  selectedAccountIds: readonly string[],
  options: FetchInboxUnifiedCommentsOptions = {},
): Promise<UnifiedCommentsResponseJson> {
  const forceRefresh = options.forceRefresh ?? false;
  const limit = options.postLimit ?? DEFAULT_POST_LIMIT;
  const commentsPerPost = options.commentsPerPost ?? DEFAULT_COMMENTS_PER_POST;
  const platformsSet = new Set<CommentsOAuthPlatform>();
  for (const id of selectedAccountIds) {
    const p = accountIdToOAuthPlatform(id);
    if (p) {
      platformsSet.add(p);
    }
  }
  const platforms = [...platformsSet];
  if (platforms.length === 0) {
    if (selectedAccountIds.some((id) => id.trim().length > 0)) {
      return {
        ...emptyResponse(),
        success: false,
        message:
          "Comments are not available for this account. Pick another channel in the header (e.g. not Pinterest).",
      };
    }
    return emptyResponse();
  }

  const merged: UnifiedCommentsResponseJson = emptyResponse();
  const linkedinPersonalSelected = selectedAccountIds.includes("linkedin");
  const linkedinOrgIds =
    linkedinOrganizationIdsFromSelectedIds(selectedAccountIds);
  const facebookPageIds = facebookPageIdsFromSelectedIds(selectedAccountIds);
  const youtubeChannelId = youtubeChannelIdFromSelectedIds(selectedAccountIds);

  const nonLinkedin = platforms.filter((p) => p !== "linkedin");
  if (nonLinkedin.length > 0) {
    const fbPagesForQuery =
      nonLinkedin.includes("facebook") && facebookPageIds.length > 0
        ? facebookPageIds
        : undefined;
    const partial = await fetchUnifiedComments(accessToken, workspaceId, {
      limit,
      commentsPerPost,
      forceRefresh,
      platforms: nonLinkedin,
      facebookPageIds: fbPagesForQuery,
      youtubeChannelId,
    });
    copyCommentSlices(merged, partial);
    if (partial.success === false) {
      merged.success = false;
    }
  }

  if (!platformsSet.has("linkedin")) {
    return merged;
  }

  const liBuckets: UnifiedCommentsPostBucket[] = [];
  let liTemplate: UnifiedCommentsPlatformSlice | null = null;

  if (linkedinPersonalSelected) {
    const r = await fetchUnifiedComments(accessToken, workspaceId, {
      limit,
      commentsPerPost,
      forceRefresh,
      platforms: ["linkedin"],
    });
    copyCommentSlices(merged, r);
    liTemplate = r.linkedin ?? liTemplate;
    const posts = r.linkedin?.posts ?? [];
    for (const b of posts) {
      if (b && typeof b.post_id === "string") {
        liBuckets.push(b);
      }
    }
    if (r.success === false) {
      merged.success = false;
    }
  }

  if (linkedinOrgIds.length > 0) {
    const r = await fetchUnifiedComments(accessToken, workspaceId, {
      limit,
      commentsPerPost,
      forceRefresh,
      platforms: ["linkedin"],
      linkedinOrganizationIds: linkedinOrgIds,
    });
    copyCommentSlices(merged, r);
    liTemplate = r.linkedin ?? liTemplate;
    const posts = r.linkedin?.posts ?? [];
    for (const b of posts) {
      if (b && typeof b.post_id === "string") {
        liBuckets.push(b);
      }
    }
    if (r.success === false) {
      merged.success = false;
    }
  }

  if (linkedinPersonalSelected || linkedinOrgIds.length > 0) {
    merged.linkedin = {
      posts: dedupeLinkedinBuckets(liBuckets),
      last_updated: liTemplate?.last_updated ?? null,
      message: liTemplate?.message ?? null,
      error: liTemplate?.error ?? null,
    };
  }

  return merged;
}
