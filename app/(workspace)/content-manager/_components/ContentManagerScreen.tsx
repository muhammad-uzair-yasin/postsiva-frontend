"use client";

import { motion } from "framer-motion";
import { useCallback, useEffect, useMemo, useRef, useState, type ReactElement } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  dispatchContentManagerDraftRefresh,
} from "@/lib/contentManager/contentManagerDraftRefresh";
import {
  CONTENT_MANAGER_SCHEDULED_REFRESH_EVENT,
  dispatchContentManagerScheduledRefresh,
} from "@/lib/contentManager/contentManagerScheduledRefresh";
import {
  getStoredAccessToken,
  getStoredActiveWorkspaceId,
} from "@/lib/auth/session";
import { useTranslations } from "@/lib/i18n/WorkspaceLocaleProvider";
import { PUBLISHED_REFRESH_MERGE_LIMIT } from "../_utils/publishedUnifiedRefreshConstants";
import {
  setPublishedPostsWorkspaceCache,
} from "@/lib/contentManager/publishedPostsWorkspaceCache";
import { deleteUnifiedDraftById } from "@/lib/social/unifiedDraftsApi";
import { deleteUnifiedBlogDraftById } from "@/lib/social/unifiedBlogDraftsApi";
import { deleteWorkspaceScheduledPostById } from "@/lib/social/workspaceScheduledPostMutations";
import type { UnifiedDraftResponseJson } from "@/lib/social/unifiedDraftsApi";
import type { UnifiedScheduledPostItemJson } from "@/lib/social/unifiedScheduledPostsApi";
import {
  workspaceListContainer,
  workspaceListItem,
} from "@/lib/ui/workspaceMotionVariants";
import type { UnifiedPostsApiResponse } from "@/lib/contentManager/unifiedPostsApi";
import { WorkspacePageScaffold } from "../../_components/WorkspacePageScaffold";
import { useUnifiedPostsContext } from "@/app/(workspace)/_context/UnifiedPostsContext";
import { refreshSinglePost } from "@/lib/contentManager/refreshSinglePost";
import { useWorkspaceHeaderAccounts } from "../../_components/WorkspaceHeaderAccountsProvider";
import {
  MediaMasonryGrid,
  MediaMasonryItem,
} from "@/components/media/MediaMasonryGrid";
import { mapUnifiedSinglePostRefreshResponse } from "../_utils/mapUnifiedSinglePostRefreshResponse";
import { platformFromContentManagerPost } from "../_utils/platformFromContentManagerPost";
import { useContentManagerConnectedChannelLabels } from "../_hooks/useContentManagerConnectedChannelLabels";
import { useContentManagerFilters } from "../_hooks/useContentManagerFilters";
import { useContentManagerScheduledPosts } from "../_hooks/useContentManagerScheduledPosts";
import { useContentManagerUnifiedDrafts } from "../_hooks/useContentManagerUnifiedDrafts";
import { usePublishedAllPlatformsUnifiedPosts } from "../_hooks/usePublishedAllPlatformsUnifiedPosts";
import { usePublishedBlueskyUnifiedPosts } from "../_hooks/usePublishedBlueskyUnifiedPosts";
import { usePublishedFacebookUnifiedPosts } from "../_hooks/usePublishedFacebookUnifiedPosts";
import { usePublishedInstagramUnifiedPosts } from "../_hooks/usePublishedInstagramUnifiedPosts";
import { usePublishedLinkedinUnifiedPosts } from "../_hooks/usePublishedLinkedinUnifiedPosts";
import { usePublishedMastodonUnifiedPosts } from "../_hooks/usePublishedMastodonUnifiedPosts";
import { usePublishedPinterestUnifiedPosts } from "../_hooks/usePublishedPinterestUnifiedPosts";
import { usePublishedThreadsUnifiedPosts } from "../_hooks/usePublishedThreadsUnifiedPosts";
import { usePublishedTiktokUnifiedPosts } from "../_hooks/usePublishedTiktokUnifiedPosts";
import { usePublishedWordpressUnifiedPosts } from "../_hooks/usePublishedWordpressUnifiedPosts";
import { usePublishedYoutubeUnifiedPosts } from "../_hooks/usePublishedYoutubeUnifiedPosts";
import type {
  ContentManagerPost,
  ContentManagerTab,
} from "../_types/contentManagerTypes";
import { contentManagerChannelFromHeaderAccount } from "../_utils/contentManagerChannelFromHeaderAccount";
import { isPublishedUnifiedLoadingForChannel } from "../_utils/isPublishedUnifiedLoadingForChannel";
import { skipPublishedSinglePlatformFetch } from "../_utils/skipPublishedSinglePlatformFetch";
import { ContentManagerCard } from "./ContentManagerCard";
import { ContentManagerCardSkeleton } from "./ContentManagerCardSkeleton";
import { useDraftActionSuccessToast } from "../draft/[id]/_hooks/useDraftActionSuccessToast";
import { DraftEditorActionConfirmModal } from "../draft/[id]/_components/DraftEditorActionConfirmModal";
import { DraftEditorSuccessToast } from "../draft/[id]/_components/DraftEditorSuccessToast";
import { getDraftEditorConfirmCopy } from "../draft/[id]/_utils/draftEditorConfirmCopy";
import { ContentManagerFiltersBar } from "./ContentManagerFiltersBar";
import { usePlanFeature } from "@/lib/billing/BillingContext";
import { ContentManagerScheduledPipelineList } from "./ContentManagerScheduledPipelineList";
import { ContentManagerScheduledPipelineSkeleton } from "./ContentManagerScheduledPipelineSkeleton";
import dynamic from "next/dynamic";

const DraftEditorModal = dynamic(() =>
  import("./DraftEditorModal").then((m) => ({ default: m.DraftEditorModal })),
);
const ScheduledPostEditorModal = dynamic(() =>
  import("./ScheduledPostEditorModal").then((m) => ({
    default: m.ScheduledPostEditorModal,
  })),
);
const WordPressBlogsScreen = dynamic(() =>
  import("../../wordpress/blogs/_components/WordPressBlogsScreen").then((m) => ({
    default: m.WordPressBlogsScreen,
  })),
);

function parseTab(raw: string | null): ContentManagerTab {
  if (raw === "scheduled" || raw === "published" || raw === "draft") {
    return raw;
  }
  return "published";
}

const PUBLISHED_SKELETON_COUNT = 6;

type UnifiedContextPost = NonNullable<
  NonNullable<UnifiedPostsApiResponse["mastodon"]>["posts"]
>[number];

function parseMetricCount(value: string | undefined): number {
  const parsed = Number(value ?? 0);
  return Number.isFinite(parsed) ? parsed : 0;
}

function mapPostToUnifiedContextPost(
  post: ContentManagerPost,
  platform: string,
  extra?: Record<string, unknown>,
): UnifiedContextPost {
  return {
    post_id: post.id,
    id: post.id,
    images: post.imageUrl ? [{ url: post.imageUrl }] : [],
    videos: post.videoUrl
      ? { videoUrl: post.videoUrl, thumbnailUrl: post.imageUrl }
      : undefined,
    commentary: post.body,
    platform,
    like_count: parseMetricCount(post.metrics?.likes),
    comment_count: parseMetricCount(post.metrics?.comments),
    share_count: 0,
    impression_count: parseMetricCount(post.metrics?.reach),
    ai_watcher_enabled: Boolean(post.aiWatcherEnabled),
    ...extra,
  } as UnifiedContextPost;
}

export function ContentManagerScreen({
  fixedTab,
}: {
  fixedTab?: Extract<ContentManagerTab, "published" | "draft">;
} = {}): ReactElement {
  const { t } = useTranslations();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { enabled: draftsEnabled } = usePlanFeature("drafts_enabled");
  const rawTab = fixedTab ?? parseTab(searchParams.get("tab"));
  // Drafts tab is plan-gated; coerce to Published when the feature is off
  // (also covers a manual `?tab=draft` on a plan without drafts).
  const tab: ContentManagerTab =
    rawTab === "draft" && !draftsEnabled ? "published" : rawTab;
  const [publishedLimit, setPublishedLimit] = useState(() => {
    if (typeof window === "undefined") return 10;
    return Number(localStorage.getItem("postsiva_published_limit") ?? 10) || 10;
  });
  const [aiWatcherEnabledIds, setAiWatcherEnabledIds] = useState<Set<string>>(new Set());
  const [refreshingPostId, setRefreshingPostId] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("postsiva_access_token") ?? "";
    const workspaceId = localStorage.getItem("postsiva_workspace_id") ?? "";
    fetch(`${process.env.NEXT_PUBLIC_POSTSIVA_API_URL}/unified/ai-autoreplier/list`, {
      headers: { Authorization: `Bearer ${token}`, "X-Workspace-Id": workspaceId },
    })
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data?.enabled_posts) {
          const ids = new Set<string>((data.enabled_posts as { post_id: string }[]).map(p => p.post_id));
          setAiWatcherEnabledIds(ids);
        }
      })
      .catch(() => {});
  }, []);
  const { selectedAccount } = useWorkspaceHeaderAccounts();
  const channel = useMemo(
    () => contentManagerChannelFromHeaderAccount(selectedAccount),
    [selectedAccount],
  );
  const { toast, toastKey, dismissToast, showToast } =
    useDraftActionSuccessToast();
  const [draftsRefreshKey, setDraftsRefreshKey] = useState(0);
  const [draftEditorTarget, setDraftEditorTarget] =
    useState<UnifiedDraftResponseJson | null>(null);
  const [scheduledEditorTarget, setScheduledEditorTarget] =
    useState<UnifiedScheduledPostItemJson | null>(null);
  const openDraftEditor = useCallback(
    (post: ContentManagerPost) => {
      if (!post.draftPayload) {
        return;
      }
      setDraftEditorTarget(post.draftPayload);
    },
    [],
  );
  const openScheduledEditor = useCallback(
    (post: ContentManagerPost) => {
      if (!post.scheduledPayload) {
        return;
      }
      setScheduledEditorTarget(post.scheduledPayload);
    },
    [],
  );

  useEffect(() => {
    const onScheduledRefresh = (): void => {
      setDraftsRefreshKey((k) => k + 1);
    };
    window.addEventListener(
      CONTENT_MANAGER_SCHEDULED_REFRESH_EVENT,
      onScheduledRefresh,
    );
    return () => {
      window.removeEventListener(
        CONTENT_MANAGER_SCHEDULED_REFRESH_EVENT,
        onScheduledRefresh,
      );
    };
  }, []);
  const [draftDeleteTarget, setDraftDeleteTarget] =
    useState<ContentManagerPost | null>(null);
  const [draftDeleteBusy, setDraftDeleteBusy] = useState(false);
  const [scheduledDeleteTarget, setScheduledDeleteTarget] =
    useState<ContentManagerPost | null>(null);
  const [scheduledDeleteBusy, setScheduledDeleteBusy] = useState(false);
  const draftDeleteModalCopy = useMemo(
    () => getDraftEditorConfirmCopy(t, "delete", {}),
    [t],
  );
  const scheduledDeleteModalCopy = useMemo(
    () => getDraftEditorConfirmCopy(t, "deleteScheduled", {}),
    [t],
  );
  const requestDraftDelete = useCallback((post: ContentManagerPost) => {
    if (post.status !== "draft" || !post.sourceDraftId?.trim()) {
      return;
    }
    setDraftDeleteTarget(post);
  }, []);
  const requestScheduledDelete = useCallback((post: ContentManagerPost) => {
    if (post.status !== "scheduled") {
      return;
    }
    const id =
      post.sourceScheduledPostId?.trim() ??
      post.scheduledPayload?.scheduled_post_id?.trim();
    if (!id) {
      return;
    }
    setScheduledDeleteTarget(post);
  }, []);
  const cancelDraftDelete = useCallback(() => {
    if (draftDeleteBusy) {
      return;
    }
    setDraftDeleteTarget(null);
  }, [draftDeleteBusy]);
  const confirmDraftDelete = useCallback(async () => {
    const draftId = draftDeleteTarget?.sourceDraftId?.trim();
    if (!draftId) {
      return;
    }
    setDraftDeleteBusy(true);
    try {
      const token = getStoredAccessToken();
      const ws = getStoredActiveWorkspaceId();
      if (!token?.trim() || !ws?.trim()) {
        showToast(
          t("content.toastNotSignedIn"),
          t("content.toastSignInDeleteDraft"),
        );
        return;
      }
      const isWordPress = draftDeleteTarget?.channel === "wordpress";
      if (isWordPress) {
        await deleteUnifiedBlogDraftById(token, ws, draftId);
      } else {
        await deleteUnifiedDraftById(token, ws, draftId);
      }
      setDraftDeleteTarget(null);
      setDraftsRefreshKey((k) => k + 1);
      showToast(t("content.toastDeleted"), t("content.toastDraftRemoved"));
    } catch (e) {
      showToast(
        t("content.toastDeleteDraftFailed"),
        e instanceof Error ? e.message : t("content.toastGenericError"),
      );
    } finally {
      setDraftDeleteBusy(false);
    }
  }, [draftDeleteTarget, showToast, t]);
  const cancelScheduledDelete = useCallback(() => {
    if (scheduledDeleteBusy) {
      return;
    }
    setScheduledDeleteTarget(null);
  }, [scheduledDeleteBusy]);
  const confirmScheduledDelete = useCallback(async () => {
    const id =
      scheduledDeleteTarget?.sourceScheduledPostId?.trim() ??
      scheduledDeleteTarget?.scheduledPayload?.scheduled_post_id?.trim();
    if (!id) {
      return;
    }
    setScheduledDeleteBusy(true);
    try {
      const token = getStoredAccessToken();
      const ws = getStoredActiveWorkspaceId();
      if (!token?.trim() || !ws?.trim()) {
        showToast(
          t("content.toastNotSignedIn"),
          t("content.toastSignInDeleteScheduled"),
        );
        return;
      }
      const platform =
        scheduledDeleteTarget?.channel ??
        scheduledDeleteTarget?.scheduledPayload?.platform ??
        null;
      await deleteWorkspaceScheduledPostById(token, ws, id, platform);
      setScheduledDeleteTarget(null);
      setDraftsRefreshKey((k) => k + 1);
      showToast(t("content.toastDeleted"), t("content.toastScheduledRemoved"));
    } catch (e) {
      showToast(
        t("content.toastDeleteScheduledFailed"),
        e instanceof Error ? e.message : t("content.toastGenericError"),
      );
    } finally {
      setScheduledDeleteBusy(false);
    }
  }, [scheduledDeleteTarget, showToast, t]);
  const { labelsByFilter } = useContentManagerConnectedChannelLabels();
  const { setPostsData } = useUnifiedPostsContext();
  const {
    posts: publishedAllPlatformsPosts,
    isLoading: allPlatformsBulkLoading,
    error: allPlatformsBulkError,
    refresh: refreshAllPlatformsPublished,
    mergePosts: mergeAllPlatformsPosts,
  } = usePublishedAllPlatformsUnifiedPosts(
    tab === "published" && channel === "all",
    labelsByFilter,
    { limit: publishedLimit },
  );

  // Share posts data with watcher page via context (once per distinct post-id list).
  const lastSharedPostsIdsRef = useRef<string>("");
  useEffect(() => {
    if (publishedAllPlatformsPosts.length === 0) {
      return;
    }
    const idsKey = publishedAllPlatformsPosts.map((p) => p.id).join("\0");
    if (idsKey === lastSharedPostsIdsRef.current) {
      return;
    }
    lastSharedPostsIdsRef.current = idsKey;
    const postsData: UnifiedPostsApiResponse = {
      success: true,
      message: "",
      instagram: { posts: publishedAllPlatformsPosts.filter(p => p.channel === "instagram").map(p => mapPostToUnifiedContextPost(p, "instagram")) },
      facebook: { posts: publishedAllPlatformsPosts.filter(p => p.channel === "facebook").map(p => mapPostToUnifiedContextPost(p, "facebook", { page_id: p.pageId ?? null })) },
      tiktok: { posts: publishedAllPlatformsPosts.filter(p => p.channel === "tiktok").map(p => mapPostToUnifiedContextPost(p, "tiktok")) },
      threads: { posts: publishedAllPlatformsPosts.filter(p => p.channel === "threads").map(p => mapPostToUnifiedContextPost(p, "threads")) },
      youtube: { posts: publishedAllPlatformsPosts.filter(p => p.channel === "youtube").map(p => mapPostToUnifiedContextPost(p, "youtube")) },
      linkedin: { posts: publishedAllPlatformsPosts.filter(p => p.channel?.startsWith("linkedin")).map(p => mapPostToUnifiedContextPost(p, "linkedin", { organization_id: p.organizationId ?? null })) },
      bluesky: { posts: publishedAllPlatformsPosts.filter(p => p.channel === "bluesky").map(p => mapPostToUnifiedContextPost(p, "bluesky")) },
      mastodon: { posts: publishedAllPlatformsPosts.filter(p => p.channel === "mastodon").map(p => mapPostToUnifiedContextPost(p, "mastodon")) },
      wordpress: { posts: publishedAllPlatformsPosts.filter(p => p.channel === "wordpress").map(p => mapPostToUnifiedContextPost(p, "wordpress")) },
      pinterest: { posts: publishedAllPlatformsPosts.filter(p => p.channel === "pinterest").map(p => mapPostToUnifiedContextPost(p, "pinterest")) },
    };
    setPostsData(postsData);
  }, [publishedAllPlatformsPosts, setPostsData]);

  const {
    draftPosts: draftTabPosts,
    isLoading: draftTabLoading,
    error: draftTabError,
  } = useContentManagerUnifiedDrafts(tab === "draft", draftsRefreshKey);
  const {
    scheduledPosts: scheduledTabPosts,
    isLoading: scheduledTabLoading,
    error: scheduledTabError,
  } = useContentManagerScheduledPosts(tab === "scheduled", draftsRefreshKey);
  const instagramLabel = labelsByFilter.instagram ?? "Instagram";
  const tiktokLabel = labelsByFilter.tiktok ?? "TikTok";
  const threadsLabel = labelsByFilter.threads ?? "Threads";
  const blueskyLabel = labelsByFilter.bluesky ?? "Bluesky";
  const mastodonLabel = labelsByFilter.mastodon ?? "Mastodon";
  const wordpressLabel = labelsByFilter.wordpress ?? "WordPress";
  const youtubeLabel = labelsByFilter.youtube ?? "YouTube";
  const pinterestLabel = labelsByFilter.pinterest ?? "Pinterest";
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
  const {
    posts: instagramPublishedPosts,
    isLoading: instagramLoading,
    error: instagramError,
    refresh: refreshInstagramPosts,
    mergePosts: mergeInstagramPosts,
  } = usePublishedInstagramUnifiedPosts(instagramLabel, {
    skip: skipPublishedSinglePlatformFetch(tab, channel, "instagram"),
    limit: publishedLimit,
  });
  const {
    posts: tiktokPublishedPosts,
    isLoading: tiktokLoading,
    error: tiktokError,
    refresh: refreshTiktokPosts,
    mergePosts: mergeTiktokPosts,
  } = usePublishedTiktokUnifiedPosts(tiktokLabel, {
    skip: skipPublishedSinglePlatformFetch(tab, channel, "tiktok"),
    limit: publishedLimit,
  });
  const {
    posts: threadsPublishedPosts,
    isLoading: threadsLoading,
    error: threadsError,
    refresh: refreshThreadsPosts,
    mergePosts: mergeThreadsPosts,
  } = usePublishedThreadsUnifiedPosts(threadsLabel, {
    skip: skipPublishedSinglePlatformFetch(tab, channel, "threads"),
    limit: publishedLimit,
  });
  const {
    posts: blueskyPublishedPosts,
    isLoading: blueskyLoading,
    error: blueskyError,
    refresh: refreshBlueskyPosts,
    mergePosts: mergeBlueskyPosts,
  } = usePublishedBlueskyUnifiedPosts(blueskyLabel, {
    skip: skipPublishedSinglePlatformFetch(tab, channel, "bluesky"),
    limit: publishedLimit,
  });
  const {
    posts: mastodonPublishedPosts,
    isLoading: mastodonLoading,
    error: mastodonError,
    refresh: refreshMastodonPosts,
    mergePosts: mergeMastodonPosts,
  } = usePublishedMastodonUnifiedPosts(mastodonLabel, {
    skip: skipPublishedSinglePlatformFetch(tab, channel, "mastodon"),
    limit: publishedLimit,
  });
  const {
    posts: wordpressPublishedPosts,
    isLoading: wordpressLoading,
    error: wordpressError,
    refresh: refreshWordpressPosts,
    mergePosts: mergeWordpressPosts,
  } = usePublishedWordpressUnifiedPosts(wordpressLabel, {
    skip: skipPublishedSinglePlatformFetch(tab, channel, "wordpress"),
    limit: publishedLimit,
  });
  const {
    posts: youtubePublishedPosts,
    isLoading: youtubeLoading,
    error: youtubeError,
    refresh: refreshYoutubePosts,
    mergePosts: mergeYoutubePosts,
  } = usePublishedYoutubeUnifiedPosts(youtubeLabel, {
    skip: skipPublishedSinglePlatformFetch(tab, channel, "youtube"),
    limit: publishedLimit,
  });
  const {
    posts: linkedinPublishedPosts,
    isLoading: linkedinLoading,
    error: linkedinError,
    refresh: refreshLinkedinPosts,
    mergePosts: mergeLinkedinPosts,
  } = usePublishedLinkedinUnifiedPosts(
    linkedinLabel,
    selectedLinkedinOrganizationId,
    { skip: skipPublishedSinglePlatformFetch(tab, channel, "linkedin"), limit: publishedLimit },
  );
  const {
    posts: facebookPublishedPosts,
    isLoading: facebookLoading,
    error: facebookError,
    refresh: refreshFacebookPosts,
    mergePosts: mergeFacebookPosts,
  } = usePublishedFacebookUnifiedPosts(facebookLabel, selectedFacebookPageId, {
    skip: skipPublishedSinglePlatformFetch(tab, channel, "facebook"),
    limit: publishedLimit,
  });
  const {
    posts: pinterestPublishedPosts,
    isLoading: pinterestLoading,
    error: pinterestError,
    refresh: refreshPinterestPosts,
    mergePosts: mergePinterestPosts,
  } = usePublishedPinterestUnifiedPosts(pinterestLabel, {
    skip: skipPublishedSinglePlatformFetch(tab, channel, "pinterest"),
    limit: publishedLimit,
  });

  const handleRefreshPost = useCallback(
    async (post: ContentManagerPost) => {
      setRefreshingPostId(post.id);
      try {
        const token = localStorage.getItem("postsiva_access_token") ?? "";
        const workspaceId = localStorage.getItem("postsiva_workspace_id") ?? "";
        const platform = platformFromContentManagerPost(post);
        const data = await refreshSinglePost(
          token,
          workspaceId,
          post.id,
          platform,
          post.organizationId,
          post.pageId,
          true,
        );
        const mapped = mapUnifiedSinglePostRefreshResponse(
          data as UnifiedPostsApiResponse,
          platform,
          post.handle,
        );
        if (mapped.length === 0) {
          showToast(
            t("content.toastPostNotFound"),
            t("content.toastPostNotFoundHint"),
          );
          return;
        }
        const mergers: Record<string, (incoming: ContentManagerPost[]) => void> = {
          instagram: mergeInstagramPosts,
          facebook: mergeFacebookPosts,
          youtube: mergeYoutubePosts,
          linkedin: mergeLinkedinPosts,
          pinterest: mergePinterestPosts,
          tiktok: mergeTiktokPosts,
          threads: mergeThreadsPosts,
          bluesky: mergeBlueskyPosts,
          mastodon: mergeMastodonPosts,
          wordpress: mergeWordpressPosts,
        };
        if (channel === "all") {
          mergeAllPlatformsPosts(mapped);
        } else {
          mergers[platform]?.(mapped);
        }
        showToast(
          t("content.toastPostRefreshed"),
          t("content.toastPostRefreshedHint"),
        );
      } catch (e) {
        showToast(
          t("content.toastRefreshFailed"),
          e instanceof Error ? e.message : t("content.toastRefreshFailedHint"),
        );
      } finally {
        setRefreshingPostId(null);
      }
    },
    [
      channel,
      mergeAllPlatformsPosts,
      mergeBlueskyPosts,
      mergeFacebookPosts,
      mergeInstagramPosts,
      mergeLinkedinPosts,
      mergeMastodonPosts,
      mergePinterestPosts,
      mergeThreadsPosts,
      mergeTiktokPosts,
      mergeWordpressPosts,
      mergeYoutubePosts,
      showToast,
      t,
    ],
  );

  const { filteredPosts } = useContentManagerFilters(
    tab,
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
    tab === "published" && channel === "all"
      ? publishedAllPlatformsPosts
      : null,
    tab === "draft" ? draftTabLoading : false,
    draftTabPosts,
    tab === "scheduled" ? scheduledTabLoading : false,
    scheduledTabPosts,
  );

  const publishedPostsForWorkspaceCache = useMemo(() => {
    if (tab !== "published") {
      return [];
    }
    if (channel === "all" && publishedAllPlatformsPosts.length > 0) {
      return publishedAllPlatformsPosts;
    }
    return filteredPosts;
  }, [channel, filteredPosts, publishedAllPlatformsPosts, tab]);

  const refreshLoading =
    (tab === "published" && channel === "all" && allPlatformsBulkLoading) ||
    instagramLoading ||
    facebookLoading ||
    tiktokLoading ||
    threadsLoading ||
    blueskyLoading ||
    mastodonLoading ||
    wordpressLoading ||
    youtubeLoading ||
    linkedinLoading ||
    pinterestLoading;
  const refreshError =
    channel === "all" && tab === "published"
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
        pinterestError;

  const publishedUnifiedLoading = useMemo(
    () =>
      isPublishedUnifiedLoadingForChannel(tab, channel, {
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
      }),
    [
      allPlatformsBulkLoading,
      blueskyLoading,
      channel,
      facebookLoading,
      instagramLoading,
      linkedinLoading,
      mastodonLoading,
      wordpressLoading,
      pinterestLoading,
      tab,
      threadsLoading,
      tiktokLoading,
      youtubeLoading,
    ],
  );

  useEffect(() => {
    if (tab !== "published" || publishedUnifiedLoading) {
      return;
    }
    const ws = getStoredActiveWorkspaceId();
    const accountId = selectedAccount?.id;
    if (!ws?.trim() || !accountId?.trim()) {
      return;
    }
    // Never seed shared cache with [] — that blocked Calendar/Inbox from fetching.
    if (publishedPostsForWorkspaceCache.length === 0) {
      return;
    }
    // Equality guard is also inside setPublishedPostsWorkspaceCache; this keeps
    // deps from re-writing when only the array reference changed.
    setPublishedPostsWorkspaceCache(
      ws,
      accountId,
      publishedPostsForWorkspaceCache,
      PUBLISHED_REFRESH_MERGE_LIMIT,
    );
  }, [
    publishedPostsForWorkspaceCache,
    publishedUnifiedLoading,
    selectedAccount?.id,
    tab,
  ]);

  const canUnifiedRefresh =
    channel === "all" ||
    channel === "instagram" ||
    channel === "facebook" ||
    channel.startsWith("facebook:") ||
    channel === "youtube" ||
    channel === "tiktok" ||
    channel === "threads" ||
    channel === "bluesky" ||
    channel === "mastodon" ||
    channel === "wordpress" ||
    channel === "linkedin" ||
    channel.startsWith("linkedin:") ||
    channel === "pinterest";
  const showingWordPressPublished = tab === "published" && channel === "wordpress";

  const handleRefresh = (): void => {
    if (tab === "draft") {
      setDraftsRefreshKey((k) => k + 1);
      return;
    }
    if (tab === "scheduled") {
      setDraftsRefreshKey((k) => k + 1);
      return;
    }
    if (tab === "published" && channel === "all") {
      void refreshAllPlatformsPublished(true);
      return;
    }
    if (channel === "youtube") {
      void refreshYoutubePosts();
      return;
    }
    if (channel === "tiktok") {
      void refreshTiktokPosts();
      return;
    }
    if (channel === "threads") {
      void refreshThreadsPosts();
      return;
    }
    if (channel === "bluesky") {
      void refreshBlueskyPosts();
      return;
    }
    if (channel === "mastodon") {
      void refreshMastodonPosts();
      return;
    }
    if (channel === "wordpress") {
      void refreshWordpressPosts();
      return;
    }
    if (channel === "linkedin" || channel.startsWith("linkedin:")) {
      void refreshLinkedinPosts();
      return;
    }
    if (channel === "facebook" || channel.startsWith("facebook:")) {
      void refreshFacebookPosts();
      return;
    }
    if (channel === "instagram") {
      void refreshInstagramPosts();
      return;
    }
    if (channel === "pinterest") {
      void refreshPinterestPosts();
      return;
    }
  };

  const setTab = (next: ContentManagerTab): void => {
    const p = new URLSearchParams(searchParams.toString());
    p.set("tab", next);
    router.replace(`${pathname}?${p.toString()}`, { scroll: false });
  };

  return (
    <>
      <div
        className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
        aria-hidden
      >
        <div className="absolute left-1/4 top-0 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-primary-container/12 blur-[110px] inbox-blob-a" />
        <div className="absolute bottom-1/4 right-0 h-[360px] w-[360px] rounded-full bg-secondary/10 blur-[88px] inbox-blob-b" />
        <div className="absolute right-1/3 top-1/2 h-[240px] w-[240px] rounded-full bg-tertiary/8 blur-[64px] inbox-blob-a opacity-60" />
      </div>
      <WorkspacePageScaffold accountRail>
      <div className="mb-4 flex flex-col gap-3 sm:mb-6 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        {fixedTab ? null : (
          <ContentManagerFiltersBar
            tab={tab}
            onTabChange={setTab}
            showDraftTab={draftsEnabled}
          />
        )}
        {!showingWordPressPublished ? (
        <div className="flex flex-wrap items-center gap-2 sm:ml-auto">
        {tab === "published" && (
          <select
            value={publishedLimit}
            onChange={(e) => { const v = Number(e.target.value); setPublishedLimit(v); localStorage.setItem("postsiva_published_limit", String(v)); }}
            className="min-w-0 rounded-xl border border-outline-variant/30 bg-surface-container px-2.5 py-2 text-xs font-bold text-on-surface shadow-sm transition-colors hover:border-secondary/35 focus:outline-none sm:px-3 sm:py-2.5 sm:text-sm"
            aria-label={t("content.postsPerPage")}
          >
            {[10, 20, 50].map((n) => (
              <option key={n} value={n}>
                {t("content.postsPerPageOption", { count: n })}
              </option>
            ))}
          </select>
        )}
        <motion.button
          type="button"
          disabled={
            tab === "published"
              ? refreshLoading || !canUnifiedRefresh
              : false
          }
          whileHover={{
            scale:
              tab === "published" && (refreshLoading || !canUnifiedRefresh)
                ? 1
                : 1.03,
          }}
          whileTap={{ scale: 0.98 }}
          onClick={() => {
            handleRefresh();
          }}
          className="flex shrink-0 items-center gap-2 rounded-2xl border border-primary/25 bg-gradient-to-r from-surface-container-high to-surface-container px-3 py-2 text-sm font-bold text-primary shadow-sm transition-shadow hover:border-primary/40 hover:shadow-[0_8px_24px_-8px_rgba(107,73,216,0.35)] disabled:cursor-not-allowed disabled:opacity-60 motion-reduce:transform-none sm:px-4 sm:py-2.5"
        >
          <span
            className={`material-symbols-outlined text-secondary ${
              (tab === "published" && refreshLoading) ||
              (tab === "draft" && draftTabLoading) ||
              (tab === "scheduled" && scheduledTabLoading)
                ? "animate-spin"
                : ""
            }`}
          >
            refresh
          </span>
          <span className="hidden sm:inline">{t("content.refresh")}</span>
        </motion.button>
        </div>
        ) : null}
      </div>

      {showingWordPressPublished ? (
        <WordPressBlogsScreen embedded />
      ) : refreshError ? (
        <p
          className="mb-6 rounded-2xl border border-error/30 bg-error/10 px-4 py-3 text-sm text-error"
          role="alert"
        >
          {refreshError}
        </p>
      ) : null}

      {draftTabError && tab === "draft" && !showingWordPressPublished ? (
        <p
          className="mb-6 rounded-2xl border border-error/30 bg-error/10 px-4 py-3 text-sm text-error"
          role="alert"
        >
          {draftTabError}
        </p>
      ) : null}

      {scheduledTabError && tab === "scheduled" && !showingWordPressPublished ? (
        <p
          className="mb-6 rounded-2xl border border-error/30 bg-error/10 px-4 py-3 text-sm text-error"
          role="alert"
        >
          {scheduledTabError}
        </p>
      ) : null}

      {!showingWordPressPublished ? (
      (publishedUnifiedLoading && tab === "published" && filteredPosts.length === 0) ||
      (tab === "draft" && draftTabLoading && filteredPosts.length === 0) ||
      (tab === "scheduled" && scheduledTabLoading && filteredPosts.length === 0) ? (
        tab === "scheduled" ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.25 }}
          >
            <ContentManagerScheduledPipelineSkeleton />
          </motion.div>
        ) : (
          <motion.div
            aria-busy
            aria-label={t("content.loading")}
            variants={workspaceListContainer}
            initial="hidden"
            animate="show"
          >
            <MediaMasonryGrid>
              {Array.from({ length: PUBLISHED_SKELETON_COUNT }, (_, index) => (
                <MediaMasonryItem key={`skeleton-${index}`}>
                  <motion.div variants={workspaceListItem}>
                    <ContentManagerCardSkeleton />
                  </motion.div>
                </MediaMasonryItem>
              ))}
            </MediaMasonryGrid>
          </motion.div>
        )
      ) : tab === "scheduled" ? (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 28 }}
        >
          <ContentManagerScheduledPipelineList
            posts={filteredPosts}
            onOpenScheduledEditor={openScheduledEditor}
            onRequestDeleteScheduled={requestScheduledDelete}
          />
        </motion.div>
      ) : filteredPosts.length === 0 ? (
        <motion.p
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 28 }}
          className="rounded-3xl border border-dashed border-outline-variant/25 bg-surface-container-low/40 py-16 text-center text-sm text-on-surface-variant"
        >
          {t("content.empty")}
        </motion.p>
      ) : (
        <motion.div
          variants={workspaceListContainer}
          initial="hidden"
          animate="show"
        >
          <MediaMasonryGrid>
            {filteredPosts.map((post) => (
              <MediaMasonryItem key={post.id}>
                <motion.div variants={workspaceListItem}>
                  <ContentManagerCard
                    post={{ ...post, aiWatcherEnabled: aiWatcherEnabledIds.has(post.id) || post.aiWatcherEnabled }}
                    onOpenDraftEditor={openDraftEditor}
                    onOpenScheduledEditor={openScheduledEditor}
                    onRequestDeleteDraft={requestDraftDelete}
                    onAiWatcherEnabled={() =>
                      showToast(
                        t("content.toastAiWatcherEnabled"),
                        t("content.toastAiWatcherEnabledHint"),
                      )
                    }
                    onRefresh={
                      post.status === "published"
                        ? () => handleRefreshPost(post)
                        : undefined
                    }
                    isRefreshing={
                      post.status === "published" && refreshingPostId === post.id
                    }
                  />
                </motion.div>
              </MediaMasonryItem>
            ))}
          </MediaMasonryGrid>
        </motion.div>
      )
      ) : null}
      <DraftEditorActionConfirmModal
        open={draftDeleteTarget !== null}
        title={draftDeleteModalCopy.title}
        description={draftDeleteModalCopy.description}
        confirmLabel={draftDeleteModalCopy.confirmLabel}
        isDanger={draftDeleteModalCopy.isDanger}
        isBusy={draftDeleteBusy}
        onConfirm={() => {
          void confirmDraftDelete();
        }}
        onCancel={cancelDraftDelete}
      />
      <DraftEditorActionConfirmModal
        open={scheduledDeleteTarget !== null}
        title={scheduledDeleteModalCopy.title}
        description={scheduledDeleteModalCopy.description}
        confirmLabel={scheduledDeleteModalCopy.confirmLabel}
        isDanger={scheduledDeleteModalCopy.isDanger}
        isBusy={scheduledDeleteBusy}
        onConfirm={() => {
          void confirmScheduledDelete();
        }}
        onCancel={cancelScheduledDelete}
      />
      {draftEditorTarget ? (
        <DraftEditorModal
          initialDraft={draftEditorTarget}
          onClose={() => {
            setDraftEditorTarget(null);
          }}
          onUpdateSuccess={() => {
            setDraftEditorTarget(null);
            showToast(t("content.toastSaved"), t("content.toastSavedHint"));
            setDraftsRefreshKey((k) => k + 1);
          }}
          onScheduleComplete={() => {
            const draftId = draftEditorTarget?.id?.trim();
            setDraftEditorTarget(null);
            showToast(t("content.toastScheduled"), t("content.toastScheduledHint"));
            if (draftId) {
              dispatchContentManagerDraftRefresh(draftId);
            } else {
              dispatchContentManagerDraftRefresh();
            }
            dispatchContentManagerScheduledRefresh();
            setDraftsRefreshKey((k) => k + 1);
            router.replace("/post-scheduler/calendar");
          }}
          onPublishSuccess={() => {
            setDraftEditorTarget(null);
            setDraftsRefreshKey((k) => k + 1);
            showToast(t("content.toastPublished"), t("content.toastPublishedHint"));
          }}
          onDeleteSuccess={() => {
            setDraftEditorTarget(null);
            setDraftsRefreshKey((k) => k + 1);
            showToast(t("content.toastDeleted"), t("content.toastDraftRemoved"));
          }}
        />
      ) : null}
      {scheduledEditorTarget ? (
        <ScheduledPostEditorModal
          initialScheduled={scheduledEditorTarget}
          onClose={() => {
            setScheduledEditorTarget(null);
          }}
          onUpdateSuccess={() => {
            setScheduledEditorTarget(null);
            showToast(t("content.toastSaved"), t("content.toastScheduledUpdatedHint"));
            dispatchContentManagerScheduledRefresh();
            setDraftsRefreshKey((k) => k + 1);
          }}
          onRescheduleComplete={() => {
            setScheduledEditorTarget(null);
            showToast(
              t("content.toastRescheduled"),
              t("content.toastRescheduledHint"),
            );
            dispatchContentManagerScheduledRefresh();
            setDraftsRefreshKey((k) => k + 1);
          }}
          onPublishSuccess={() => {
            setScheduledEditorTarget(null);
            setDraftsRefreshKey((k) => k + 1);
            showToast(t("content.toastPublished"), t("content.toastPublishedHint"));
          }}
          onDeleteSuccess={() => {
            setScheduledEditorTarget(null);
            dispatchContentManagerScheduledRefresh();
            setDraftsRefreshKey((k) => k + 1);
            showToast(t("content.toastDeleted"), t("content.toastScheduledRemoved"));
          }}
          onMoveToDraftSuccess={() => {
            setScheduledEditorTarget(null);
            dispatchContentManagerScheduledRefresh();
            setDraftsRefreshKey((k) => k + 1);
            showToast(
              t("content.toastMovedToDrafts"),
              t("content.toastMovedToDraftsHint"),
            );
          }}
        />
      ) : null}
      {toast ? (
        <DraftEditorSuccessToast
          key={toastKey}
          title={toast.title}
          subtitle={toast.subtitle}
          onDismiss={dismissToast}
        />
      ) : null}
    </WorkspacePageScaffold>
    </>
  );
}
