import { contentManagerChannelFromHeaderAccount } from "@/app/(workspace)/content-manager/_utils/contentManagerChannelFromHeaderAccount";
import type { ContentManagerPost } from "@/app/(workspace)/content-manager/_types/contentManagerTypes";
import { mapUnifiedBlueskyToContentManagerPosts } from "@/app/(workspace)/content-manager/_utils/mapUnifiedBlueskyPosts";
import { mapUnifiedFacebookToContentManagerPosts } from "@/app/(workspace)/content-manager/_utils/mapUnifiedFacebookPosts";
import { mapUnifiedInstagramToContentManagerPosts } from "@/app/(workspace)/content-manager/_utils/mapUnifiedInstagramPosts";
import { mapUnifiedLinkedinToContentManagerPosts } from "@/app/(workspace)/content-manager/_utils/mapUnifiedLinkedinPosts";
import {
  mapFullUnifiedPostsResponseToPublishedPosts,
  type UnifiedPublishedLabels,
} from "@/app/(workspace)/content-manager/_utils/mapFullUnifiedPostsResponseToPublishedPosts";
import { mapUnifiedPinterestToContentManagerPosts } from "@/app/(workspace)/content-manager/_utils/mapUnifiedPinterestPosts";
import { mapUnifiedThreadsToContentManagerPosts } from "@/app/(workspace)/content-manager/_utils/mapUnifiedThreadsPosts";
import { mapUnifiedTiktokToContentManagerPosts } from "@/app/(workspace)/content-manager/_utils/mapUnifiedTiktokPosts";
import { mapUnifiedWordpressToContentManagerPosts } from "@/app/(workspace)/content-manager/_utils/mapUnifiedWordpressPosts";
import { mapUnifiedYoutubeToContentManagerPosts } from "@/app/(workspace)/content-manager/_utils/mapUnifiedYoutubePosts";
import { mergePublishedPostsById } from "@/app/(workspace)/content-manager/_utils/mergePublishedPostsById";
import { unifiedPostsParamsFromConnectedLabels } from "@/app/(workspace)/content-manager/_utils/unifiedPostsParamsFromConnectedLabels";
import { fetchUnifiedPosts } from "@/lib/contentManager/unifiedPostsApi";
import {
  getPublishedPostsWorkspaceCache,
  setPublishedPostsWorkspaceCache,
} from "@/lib/contentManager/publishedPostsWorkspaceCache";
import {
  facebookPageIdsFromSelectedIds,
  linkedinOrganizationIdsFromSelectedIds,
} from "@/lib/workspace/decodeCompositeAccountIds";
import type { WorkspaceHeaderAccountRow } from "@/lib/workspace/headerAccountsTypes";

const INBOX_PUBLISHED_REFRESH_LIMIT = 50;

export interface RefreshPublishedPostsForInboxInput {
  readonly accessToken: string;
  readonly workspaceId: string;
  readonly accountId: string;
  readonly selectedAccount: WorkspaceHeaderAccountRow | null;
  readonly labels: UnifiedPublishedLabels;
  /** When true, live Graph/API refresh. Default true (Inbox). Calendar uses false. */
  readonly forceRefresh?: boolean;
}

/**
 * GET /unified/posts/ for the header-selected channel, limit 50.
 * `forceRefresh` maps to refresh_posts/refresh_stats. Merges into
 * {@link setPublishedPostsWorkspaceCache}.
 */
export async function refreshPublishedPostsForInbox(
  input: RefreshPublishedPostsForInboxInput,
): Promise<{ ok: boolean; message?: string }> {
  const {
    accessToken,
    workspaceId,
    accountId,
    selectedAccount,
    labels,
    forceRefresh = true,
  } = input;
  if (!selectedAccount?.id?.trim()) {
    return { ok: true };
  }

  const channel = contentManagerChannelFromHeaderAccount(selectedAccount);
  const prev = getPublishedPostsWorkspaceCache(workspaceId, accountId) ?? [];
  const token = accessToken;
  const ws = workspaceId;
  const id = selectedAccount.id;
  const fbPages = facebookPageIdsFromSelectedIds([id]);
  const liOrgs = linkedinOrganizationIdsFromSelectedIds([id]);

  const base = {
    limit: INBOX_PUBLISHED_REFRESH_LIMIT,
    stats: true as const,
    forceRefresh,
  };

  const applyMerged = (next: readonly ContentManagerPost[]): void => {
    setPublishedPostsWorkspaceCache(
      workspaceId,
      accountId,
      [...next],
      INBOX_PUBLISHED_REFRESH_LIMIT,
      { allowEmpty: true },
    );
  };

  try {
    if (channel === "all") {
      const { platforms, linkedinOrganizationIds, facebookPageIds } =
        unifiedPostsParamsFromConnectedLabels(labels);
      if (platforms.length === 0) {
        return { ok: true };
      }
      const data = await fetchUnifiedPosts(token, ws, {
        ...base,
        platforms,
        linkedinOrganizationIds,
        facebookPageIds,
      });
      if (!data.success) {
        return { ok: false, message: data.message ?? "Could not refresh posts." };
      }
      const mapped = mapFullUnifiedPostsResponseToPublishedPosts(data, labels);
      applyMerged(mapped);
      return { ok: true };
    }

    if (channel === "instagram") {
      const data = await fetchUnifiedPosts(token, ws, {
        ...base,
        platforms: ["instagram"],
      });
      if (!data.success) {
        return { ok: false, message: data.message ?? "Could not refresh posts." };
      }
      const mapped = mapUnifiedInstagramToContentManagerPosts(
        data.instagram ?? null,
        labels.instagram ?? "Instagram",
      );
      applyMerged(mergePublishedPostsById(prev, mapped));
      return { ok: true };
    }

    if (channel === "youtube") {
      const data = await fetchUnifiedPosts(token, ws, {
        ...base,
        platforms: ["youtube"],
      });
      if (!data.success) {
        return { ok: false, message: data.message ?? "Could not refresh posts." };
      }
      const mapped = mapUnifiedYoutubeToContentManagerPosts(
        data.youtube ?? null,
        labels.youtube ?? "YouTube",
      );
      applyMerged(mergePublishedPostsById(prev, mapped));
      return { ok: true };
    }

    if (channel === "tiktok") {
      const data = await fetchUnifiedPosts(token, ws, {
        ...base,
        platforms: ["tiktok"],
      });
      if (!data.success) {
        return { ok: false, message: data.message ?? "Could not refresh posts." };
      }
      const mapped = mapUnifiedTiktokToContentManagerPosts(
        data.tiktok ?? null,
        labels.tiktok ?? "TikTok",
      );
      applyMerged(mergePublishedPostsById(prev, mapped));
      return { ok: true };
    }

    if (channel === "threads" || channel === "x") {
      const data = await fetchUnifiedPosts(token, ws, {
        ...base,
        platforms: ["threads"],
      });
      if (!data.success) {
        return { ok: false, message: data.message ?? "Could not refresh posts." };
      }
      const mapped = mapUnifiedThreadsToContentManagerPosts(
        data.threads ?? null,
        labels.threads ?? "Threads",
      );
      applyMerged(mergePublishedPostsById(prev, mapped));
      return { ok: true };
    }

    if (channel === "bluesky") {
      const data = await fetchUnifiedPosts(token, ws, {
        ...base,
        platforms: ["bluesky"],
      });
      if (!data.success) {
        return { ok: false, message: data.message ?? "Could not refresh posts." };
      }
      const mapped = mapUnifiedBlueskyToContentManagerPosts(
        data.bluesky ?? null,
        labels.bluesky ?? "Bluesky",
      );
      applyMerged(mergePublishedPostsById(prev, mapped));
      return { ok: true };
    }

    if (channel === "pinterest") {
      const board =
        selectedAccount.targetResourceId?.trim() ??
        (id.startsWith("pinterest:board:")
          ? id.slice("pinterest:board:".length).trim().replace(/_/g, ":")
          : "");
      const data = await fetchUnifiedPosts(token, ws, {
        ...base,
        platforms: ["pinterest"],
        ...(board.length > 0 ? { pinterestBoardId: board } : {}),
      });
      if (!data.success) {
        return { ok: false, message: data.message ?? "Could not refresh posts." };
      }
      const mapped = mapUnifiedPinterestToContentManagerPosts(
        data.pinterest ?? null,
        labels.pinterest ?? "Pinterest",
      );
      applyMerged(mergePublishedPostsById(prev, mapped));
      return { ok: true };
    }

    if (channel === "facebook" || channel.startsWith("facebook:")) {
      const pageLabelKey =
        fbPages[0] != null ? (`facebook:${fbPages[0]}` as const) : null;
      const facebookHandle =
        (pageLabelKey ? labels[pageLabelKey] : null) ??
        labels.facebook ??
        "Facebook";
      const data = await fetchUnifiedPosts(token, ws, {
        ...base,
        platforms: ["facebook"],
        facebookPageIds: fbPages,
      });
      if (!data.success) {
        return { ok: false, message: data.message ?? "Could not refresh posts." };
      }
      const mapped = mapUnifiedFacebookToContentManagerPosts(
        data.facebook ?? null,
        facebookHandle,
      );
      applyMerged(mergePublishedPostsById(prev, mapped));
      return { ok: true };
    }

    if (channel === "linkedin" || channel.startsWith("linkedin:")) {
      const data = await fetchUnifiedPosts(token, ws, {
        ...base,
        platforms: ["linkedin"],
        linkedinOrganizationIds: liOrgs,
      });
      if (!data.success) {
        return { ok: false, message: data.message ?? "Could not refresh posts." };
      }
      const mapped = mapUnifiedLinkedinToContentManagerPosts(
        data.linkedin ?? null,
        labels.linkedin ?? "LinkedIn",
      );
      applyMerged(mergePublishedPostsById(prev, mapped));
      return { ok: true };
    }

    if (channel === "wordpress") {
      const data = await fetchUnifiedPosts(token, ws, {
        ...base,
        platforms: ["wordpress"],
      });
      if (!data.success) {
        return { ok: false, message: data.message ?? "Could not refresh posts." };
      }
      const mapped = mapUnifiedWordpressToContentManagerPosts(
        data.wordpress ?? null,
        labels.wordpress ?? "WordPress",
      );
      applyMerged(mergePublishedPostsById(prev, mapped));
      return { ok: true };
    }

    return { ok: true };
  } catch (e) {
    return {
      ok: false,
      message: e instanceof Error ? e.message : "Could not refresh posts.",
    };
  }
}
