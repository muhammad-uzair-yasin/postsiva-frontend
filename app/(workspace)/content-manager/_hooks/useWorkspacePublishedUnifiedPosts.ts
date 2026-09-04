"use client";

import { useEffect, useMemo } from "react";

import { getStoredActiveWorkspaceId } from "@/lib/auth/session";
import { setPublishedPostsWorkspaceCache } from "@/lib/contentManager/publishedPostsWorkspaceCache";

import { useWorkspaceHeaderAccounts } from "../../_components/WorkspaceHeaderAccountsProvider";
import { useContentManagerConnectedChannelLabels } from "./useContentManagerConnectedChannelLabels";
import { useContentManagerFilters } from "./useContentManagerFilters";
import { usePublishedAllPlatformsUnifiedPosts } from "./usePublishedAllPlatformsUnifiedPosts";
import { usePublishedBlueskyUnifiedPosts } from "./usePublishedBlueskyUnifiedPosts";
import { usePublishedFacebookUnifiedPosts } from "./usePublishedFacebookUnifiedPosts";
import { usePublishedInstagramUnifiedPosts } from "./usePublishedInstagramUnifiedPosts";
import { usePublishedLinkedinUnifiedPosts } from "./usePublishedLinkedinUnifiedPosts";
import { usePublishedMastodonUnifiedPosts } from "./usePublishedMastodonUnifiedPosts";
import { usePublishedPinterestUnifiedPosts } from "./usePublishedPinterestUnifiedPosts";
import { usePublishedThreadsUnifiedPosts } from "./usePublishedThreadsUnifiedPosts";
import { usePublishedTiktokUnifiedPosts } from "./usePublishedTiktokUnifiedPosts";
import { usePublishedWordpressUnifiedPosts } from "./usePublishedWordpressUnifiedPosts";
import { usePublishedYoutubeUnifiedPosts } from "./usePublishedYoutubeUnifiedPosts";
import type {
  ContentManagerChannelFilter,
  ContentManagerPost,
} from "../_types/contentManagerTypes";
import { contentManagerChannelFromHeaderAccount } from "../_utils/contentManagerChannelFromHeaderAccount";
import { isPublishedUnifiedLoadingForChannel } from "../_utils/isPublishedUnifiedLoadingForChannel";
import { skipPublishedSinglePlatformFetch } from "../_utils/skipPublishedSinglePlatformFetch";

/**
 * Same GET /unified/posts/ data as Content Manager → Published for the workspace
 * header account (per-channel hooks + merge).
 */
export function useWorkspacePublishedUnifiedPosts(): {
  channel: ContentManagerChannelFilter;
  publishedPosts: ContentManagerPost[];
  isLoading: boolean;
  error: string | null;
} {
  const { selectedAccount } = useWorkspaceHeaderAccounts();
  const channel = useMemo(
    () => contentManagerChannelFromHeaderAccount(selectedAccount),
    [selectedAccount],
  );
  const { labelsByFilter } = useContentManagerConnectedChannelLabels();

  const instagramLabel = labelsByFilter.instagram ?? "Instagram";
  const tiktokLabel = labelsByFilter.tiktok ?? "TikTok";
  const threadsLabel = labelsByFilter.threads ?? "Threads";
  const blueskyLabel = labelsByFilter.bluesky ?? "Bluesky";
  const mastodonLabel = labelsByFilter.mastodon ?? "Mastodon";
  const wordpressLabel = labelsByFilter.wordpress ?? "WordPress";
  const youtubeLabel = labelsByFilter.youtube ?? "YouTube";
  const selectedLinkedinOrganizationId = channel.startsWith("linkedin:")
    ? channel.slice("linkedin:".length).trim() || null
    : null;
  const linkedinLabel =
    (channel.startsWith("linkedin:") ? labelsByFilter[channel] : null) ??
    labelsByFilter.linkedin ??
    "LinkedIn";
  const selectedFacebookPageId = channel.startsWith("facebook:")
    ? channel.slice("facebook:".length).trim() || null
    : null;
  const facebookLabel =
    (channel.startsWith("facebook:") ? labelsByFilter[channel] : null) ??
    labelsByFilter.facebook ??
    "Facebook";

  const skip = (platform: Parameters<typeof skipPublishedSinglePlatformFetch>[2]) =>
    skipPublishedSinglePlatformFetch("published", channel, platform);

  const { posts: instagramPublishedPosts, isLoading: instagramLoading, error: instagramError } =
    usePublishedInstagramUnifiedPosts(instagramLabel, { skip: skip("instagram") });
  const { posts: tiktokPublishedPosts, isLoading: tiktokLoading, error: tiktokError } =
    usePublishedTiktokUnifiedPosts(tiktokLabel, { skip: skip("tiktok") });
  const { posts: threadsPublishedPosts, isLoading: threadsLoading, error: threadsError } =
    usePublishedThreadsUnifiedPosts(threadsLabel, { skip: skip("threads") });
  const { posts: blueskyPublishedPosts, isLoading: blueskyLoading, error: blueskyError } =
    usePublishedBlueskyUnifiedPosts(blueskyLabel, { skip: skip("bluesky") });
  const { posts: mastodonPublishedPosts, isLoading: mastodonLoading, error: mastodonError } =
    usePublishedMastodonUnifiedPosts(mastodonLabel, { skip: skip("mastodon") });
  const { posts: wordpressPublishedPosts, isLoading: wordpressLoading, error: wordpressError } =
    usePublishedWordpressUnifiedPosts(wordpressLabel, { skip: skip("wordpress") });
  const { posts: youtubePublishedPosts, isLoading: youtubeLoading, error: youtubeError } =
    usePublishedYoutubeUnifiedPosts(youtubeLabel, { skip: skip("youtube") });
  const { posts: linkedinPublishedPosts, isLoading: linkedinLoading, error: linkedinError } =
    usePublishedLinkedinUnifiedPosts(linkedinLabel, selectedLinkedinOrganizationId, {
      skip: skip("linkedin"),
    });
  const { posts: facebookPublishedPosts, isLoading: facebookLoading, error: facebookError } =
    usePublishedFacebookUnifiedPosts(facebookLabel, selectedFacebookPageId, {
      skip: skip("facebook"),
    });
  const { posts: pinterestPublishedPosts, isLoading: pinterestLoading, error: pinterestError } =
    usePublishedPinterestUnifiedPosts(labelsByFilter.pinterest ?? "Pinterest", {
      skip: skip("pinterest"),
    });

  const {
    posts: publishedAllCombined,
    isLoading: allPlatformsBulkLoading,
    error: allPlatformsBulkError,
  } = usePublishedAllPlatformsUnifiedPosts(channel === "all", labelsByFilter);

  const { filteredPosts: publishedPosts } = useContentManagerFilters(
    "published",
    channel,
    instagramPublishedPosts,
    facebookPublishedPosts,
    youtubePublishedPosts,
    linkedinPublishedPosts,
    pinterestPublishedPosts,
    tiktokPublishedPosts,
    threadsPublishedPosts,
    blueskyPublishedPosts,
    mastodonPublishedPosts,
    wordpressPublishedPosts,
    publishedAllCombined,
    false,
    [],
    false,
    [],
  );

  const isLoading = isPublishedUnifiedLoadingForChannel("published", channel, {
    instagram: instagramLoading,
    facebook: facebookLoading,
    youtube: youtubeLoading,
    linkedin: linkedinLoading,
    pinterest: pinterestLoading,
    tiktok: tiktokLoading,
    threads: threadsLoading,
    bluesky: blueskyLoading,
    mastodon: mastodonLoading,
    wordpress: wordpressLoading,
    allPlatformsBulk:
      channel === "all" ? allPlatformsBulkLoading : undefined,
  });

  const error =
    channel === "all"
      ? allPlatformsBulkError
      : instagramError ??
        facebookError ??
        tiktokError ??
        threadsError ??
        blueskyError ??
        mastodonError ??
        wordpressError ??
        youtubeError ??
        linkedinError ??
        pinterestError ??
        null;

  useEffect(() => {
    if (isLoading) {
      return;
    }
    const ws = getStoredActiveWorkspaceId();
    const accountId = selectedAccount?.id;
    if (!ws?.trim() || !accountId?.trim()) {
      return;
    }
    // Only seed shared cache when we have posts — empty UI must not block Calendar/Inbox.
    if (publishedPosts.length === 0) {
      return;
    }
    setPublishedPostsWorkspaceCache(ws, accountId, publishedPosts);
  }, [isLoading, publishedPosts, selectedAccount?.id]);

  return { channel, publishedPosts, isLoading, error };
}
