"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

import { PostSchedulerMultiGenerateProgressOrb } from "../_components/PostSchedulerMultiGenerateProgressOrb";
import { getStoredAccessToken, getStoredActiveWorkspaceId } from "@/lib/auth/session";
import { createPostFromDemand } from "@/lib/news/demandApi";
import {
  setDemandComposerHandoff,
  takeDemandComposerHandoff,
} from "@/lib/news/demandComposerHandoff";
import { createPostFromNews } from "@/lib/news/newsApi";
import {
  mediaFromArticleImageUrl,
  setNewsArticleComposerHandoff,
  takeNewsArticleComposerHandoff,
} from "@/lib/news/newsArticleComposerHandoff";
import { createPostFromTrending } from "@/lib/news/trendingApi";
import {
  setTrendingComposerHandoff,
  takeTrendingComposerHandoff,
} from "@/lib/news/trendingComposerHandoff";
import { generateUnifiedContent } from "@/lib/social/unifiedContentGeneratorApi";
import { generateUnifiedImage } from "@/lib/social/unifiedContentToImageApi";
import { generateUnifiedEditImage } from "@/lib/social/unifiedEditImageApi";
import { generateUnifiedImageToContent } from "@/lib/social/unifiedImageToContentApi";
import { generateUnifiedVideoToContent } from "@/lib/social/unifiedVideoToContentApi";
import {
  generateWordPressArticleAgent,
  type WordPressArticleAgentOutput,
} from "@/lib/social/wordpressArticleAgentApi";
import type { StockMediaItem } from "@/lib/social/stockMediaApi";
import { DraftEditorSuccessToast } from "../../content-manager/draft/[id]/_components/DraftEditorSuccessToast";
import { useDraftActionSuccessToast } from "../../content-manager/draft/[id]/_hooks/useDraftActionSuccessToast";
import { userFacingAiErrorMessage } from "@/lib/ai/userFacingAiError";
import { useTranslations } from "@/lib/i18n/WorkspaceLocaleProvider";
import {
  composerIconToAiApiPlatform,
  resolvePostSchedulerAiPlatforms,
} from "../_utils/postSchedulerAiPlatformResolution";
import type { ComposerChannelAccount } from "../_data/postSchedulerComposerChannelAccounts";
import { usePostSchedulerComposerChannels } from "./PostSchedulerComposerChannelsContext";
import { usePostSchedulerComposerDraft } from "./PostSchedulerComposerDraftContext";
import { insertRecommendedAfterFirstHeading } from "../../wordpress/blogs/_components/wordpressArticleParts";
import {
  parseWordPressTermSuggestions,
} from "@/lib/post-composer/resolveWordPressTermIds";
import { parseBlogAiInput } from "../_utils/postSchedulerBlogAiInput";

function recommendedImageUrls(items: StockMediaItem[] | undefined): string[] {
  return (items ?? [])
    .map((item) => (item.full_url || item.preview_url || "").trim())
    .filter(Boolean);
}

function aiToolkitAlertMessage(
  error: unknown,
  t: (key: string) => string,
): string {
  return userFacingAiErrorMessage(error, {
    aiDown: t("postScheduler.aiToolkit.aiTemporarilyDown"),
    aiCredits: t("postScheduler.aiToolkit.aiCreditsRequired"),
    network: t("postScheduler.aiToolkit.aiConnectionIssue"),
    fallback: t("postScheduler.aiToolkit.aiTemporarilyDown"),
  });
}

export interface PostSchedulerAiToolkitAlert {
  title: string;
  message: string;
}

interface PostSchedulerAiToolkitContextValue {
  readonly isGeneratingIdeaDraft: boolean;
  readonly isGeneratingBlogDraft: boolean;
  readonly isGeneratingImage: boolean;
  readonly isGeneratingImageToContent: boolean;
  readonly isGeneratingVideoToContent: boolean;
  readonly isEditingImage: boolean;
  readonly captionShimmer: boolean;
  readonly mediaShimmer: boolean;
  readonly wordpressArticleGenerating: boolean;
  readonly alert: PostSchedulerAiToolkitAlert | null;
  dismissAlert: () => void;
  showAlert: (a: PostSchedulerAiToolkitAlert) => void;
  applyIdeaDraft: (ideaPrompt: string) => Promise<void>;
  applyBlogDraft: (ideaOrUrl: string) => Promise<void>;
  runGenerateImage: (requirements: string) => Promise<void>;
  runImageToContent: (requirements: string) => Promise<void>;
  runVideoToContent: (requirements: string) => Promise<void>;
  runEditImage: (requirements: string) => Promise<void>;
}

function asText(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function asStockImages(value: unknown): StockMediaItem[] {
  return Array.isArray(value) ? (value as StockMediaItem[]) : [];
}

const PostSchedulerAiToolkitContext =
  createContext<PostSchedulerAiToolkitContextValue | null>(null);

export function PostSchedulerAiToolkitProvider({
  children,
}: {
  children: ReactNode;
}): React.ReactElement {
  const { t } = useTranslations();
  const {
    draftScope,
    activeChannelId,
    editorBody,
    setEditorBody,
    editorMedia,
    setEditorMedia,
    perChannelDrafts,
    setPerChannelBody,
    setYoutubeVideoTitle,
    setPinterestPinTitle,
    setTiktokPhotoTitle,
    setWordpressTitle,
    setWordpressSlug,
    setWordpressContent,
    setWordpressExcerpt,
    setWordpressSuggestedCategoryNames,
    setWordpressSuggestedTagNames,
    setWordpressRecommendedImages,
  } = usePostSchedulerComposerDraft();
  const { selectedAccounts, selectedIds } = usePostSchedulerComposerChannels();

  const [isGeneratingIdeaDraft, setIsGeneratingIdeaDraft] = useState(false);
  const [isGeneratingBlogDraft, setIsGeneratingBlogDraft] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [isGeneratingImageToContent, setIsGeneratingImageToContent] =
    useState(false);
  const [isGeneratingVideoToContent, setIsGeneratingVideoToContent] =
    useState(false);
  const [isEditingImage, setIsEditingImage] = useState(false);
  const [alert, setAlert] = useState<PostSchedulerAiToolkitAlert | null>(null);
  const [multiChannelGenerateProgress, setMultiChannelGenerateProgress] =
    useState<{ total: number; completed: number } | null>(null);
  const [wordpressArticleGenerating, setWordpressArticleGenerating] =
    useState(false);
  const { toast, toastKey, dismissToast, showToast } =
    useDraftActionSuccessToast();

  const bumpMultiChannelGenerateProgress = useCallback((): void => {
    setMultiChannelGenerateProgress((prev) =>
      prev && prev.total > 1
        ? {
            total: prev.total,
            completed: Math.min(prev.total, prev.completed + 1),
          }
        : prev,
    );
  }, []);

  const dismissAlert = useCallback(() => {
    setAlert(null);
  }, []);

  const showAlert = useCallback((a: PostSchedulerAiToolkitAlert) => {
    setAlert(a);
  }, []);

  // News / RSS Create Post → composer drawer: shimmer + URL image + generate caption
  useEffect(() => {
    const handoff = takeNewsArticleComposerHandoff();
    if (!handoff) return;

    let cancelled = false;
    let settled = false;
    const run = async (): Promise<void> => {
      const media = mediaFromArticleImageUrl(handoff.article_image);
      if (media.length > 0) {
        setEditorMedia(media);
      }
      setIsGeneratingIdeaDraft(true);
      try {
        const token = getStoredAccessToken()?.trim() ?? "";
        const workspaceId = getStoredActiveWorkspaceId()?.trim() ?? "";
        if (!token || !workspaceId) {
          throw new Error(t("postScheduler.aiToolkit.loginWorkspace"));
        }
        const result = await createPostFromNews(
          {
            article_url: handoff.article_url,
            article_title: handoff.article_title,
            article_snippet: handoff.article_snippet,
            article_image: handoff.article_image,
            platform: handoff.platform,
            account_name: handoff.account_name,
            account_handle: null,
          },
          token,
          workspaceId,
        );
        if (cancelled) return;
        const content = result.content?.trim() ?? "";
        if (!content) {
          throw new Error(t("postScheduler.aiToolkit.contentEmpty"));
        }
        setEditorBody(content);
        if (result.article_image?.trim()) {
          setEditorMedia(mediaFromArticleImageUrl(result.article_image));
        }
        const platformTitle = (result.title ?? "").trim();
        const plat = (result.platform || handoff.platform || "").toLowerCase();
        if (platformTitle) {
          if (plat === "youtube") {
            setYoutubeVideoTitle(platformTitle);
          } else if (plat === "pinterest") {
            setPinterestPinTitle(platformTitle);
          } else if (plat === "tiktok") {
            setTiktokPhotoTitle(platformTitle);
          } else if (plat === "wordpress") {
            setWordpressTitle(platformTitle);
            setWordpressContent(content);
          }
        }
        settled = true;
      } catch (e) {
        if (cancelled) return;
        settled = true;
        showAlert({
          title: t("postScheduler.aiToolkit.alertGenerationFailed"),
          message: aiToolkitAlertMessage(e, t),
        });
      } finally {
        if (!cancelled) {
          setIsGeneratingIdeaDraft(false);
        }
      }
    };
    void run();
    return () => {
      cancelled = true;
      // React Strict Mode remounts: restore handoff so the second mount can run.
      if (!settled) {
        setNewsArticleComposerHandoff(handoff);
      }
    };
  }, [
    setEditorBody,
    setEditorMedia,
    setYoutubeVideoTitle,
    setPinterestPinTitle,
    setTiktokPhotoTitle,
    setWordpressTitle,
    setWordpressContent,
    showAlert,
    t,
  ]);

  // Trending Create Post → same composer flow (text-only AI; image URL; YT thumb only)
  useEffect(() => {
    const handoff = takeTrendingComposerHandoff();
    if (!handoff) return;

    let cancelled = false;
    let settled = false;
    const run = async (): Promise<void> => {
      const media = mediaFromArticleImageUrl(handoff.post_image);
      if (media.length > 0) {
        setEditorMedia(media);
      }
      setIsGeneratingIdeaDraft(true);
      try {
        const token = getStoredAccessToken()?.trim() ?? "";
        const workspaceId = getStoredActiveWorkspaceId()?.trim() ?? "";
        if (!token || !workspaceId) {
          throw new Error(t("postScheduler.aiToolkit.loginWorkspace"));
        }
        const result = await createPostFromTrending(
          {
            post_url: handoff.post_url,
            post_title: handoff.post_title,
            post_snippet: handoff.post_snippet,
            post_image: handoff.post_image,
            source_platform: handoff.source_platform,
            author: handoff.author,
            view_count: handoff.view_count,
            like_count: handoff.like_count,
            comment_count: handoff.comment_count,
            share_count: handoff.share_count,
            platform: handoff.platform,
            account_name: handoff.account_name,
            account_handle: null,
          },
          token,
          workspaceId,
        );
        if (cancelled) return;
        const content = result.content?.trim() ?? "";
        if (!content) {
          throw new Error(t("postScheduler.aiToolkit.contentEmpty"));
        }
        setEditorBody(content);
        if (result.article_image?.trim()) {
          setEditorMedia(mediaFromArticleImageUrl(result.article_image));
        }
        const platformTitle = (result.title ?? "").trim();
        const plat = (result.platform || handoff.platform || "").toLowerCase();
        if (platformTitle) {
          if (plat === "youtube") {
            setYoutubeVideoTitle(platformTitle);
          } else if (plat === "pinterest") {
            setPinterestPinTitle(platformTitle);
          } else if (plat === "tiktok") {
            setTiktokPhotoTitle(platformTitle);
          } else if (plat === "wordpress") {
            setWordpressTitle(platformTitle);
            setWordpressContent(content);
          }
        }
        settled = true;
      } catch (e) {
        if (cancelled) return;
        settled = true;
        showAlert({
          title: t("postScheduler.aiToolkit.alertGenerationFailed"),
          message: aiToolkitAlertMessage(e, t),
        });
      } finally {
        if (!cancelled) {
          setIsGeneratingIdeaDraft(false);
        }
      }
    };
    void run();
    return () => {
      cancelled = true;
      if (!settled) {
        setTrendingComposerHandoff(handoff);
      }
    };
  }, [
    setEditorBody,
    setEditorMedia,
    setYoutubeVideoTitle,
    setPinterestPinTitle,
    setTiktokPhotoTitle,
    setWordpressTitle,
    setWordpressContent,
    showAlert,
    t,
  ]);

  // Demand Create Post → idea/caption from rising / topic / culture
  useEffect(() => {
    const handoff = takeDemandComposerHandoff();
    if (!handoff) return;

    let cancelled = false;
    let settled = false;
    const run = async (): Promise<void> => {
      const media = mediaFromArticleImageUrl(handoff.image_url);
      if (media.length > 0) {
        setEditorMedia(media);
      }
      setIsGeneratingIdeaDraft(true);
      try {
        const token = getStoredAccessToken()?.trim() ?? "";
        const workspaceId = getStoredActiveWorkspaceId()?.trim() ?? "";
        if (!token || !workspaceId) {
          throw new Error(t("postScheduler.aiToolkit.loginWorkspace"));
        }
        const result = await createPostFromDemand(
          {
            source_type: handoff.source_type,
            topic: handoff.topic,
            source_url: handoff.source_url,
            image_url: handoff.image_url,
            traffic: handoff.traffic,
            image_source: handoff.image_source,
            country: handoff.country,
            seed_q: handoff.seed_q,
            prefix: handoff.prefix,
            article: handoff.article,
            views: handoff.views,
            rank: handoff.rank,
            platform: handoff.platform,
            account_name: handoff.account_name,
            account_handle: null,
          },
          token,
          workspaceId,
        );
        if (cancelled) return;
        const content = result.content?.trim() ?? "";
        if (!content) {
          throw new Error(t("postScheduler.aiToolkit.contentEmpty"));
        }
        setEditorBody(content);
        if (result.article_image?.trim()) {
          setEditorMedia(mediaFromArticleImageUrl(result.article_image));
        }
        const platformTitle = (result.title ?? "").trim();
        const plat = (result.platform || handoff.platform || "").toLowerCase();
        if (platformTitle) {
          if (plat === "youtube") {
            setYoutubeVideoTitle(platformTitle);
          } else if (plat === "pinterest") {
            setPinterestPinTitle(platformTitle);
          } else if (plat === "tiktok") {
            setTiktokPhotoTitle(platformTitle);
          } else if (plat === "wordpress") {
            setWordpressTitle(platformTitle);
            setWordpressContent(content);
          }
        }
        settled = true;
      } catch (e) {
        if (cancelled) return;
        settled = true;
        showAlert({
          title: t("postScheduler.aiToolkit.alertGenerationFailed"),
          message: aiToolkitAlertMessage(e, t),
        });
      } finally {
        if (!cancelled) {
          setIsGeneratingIdeaDraft(false);
        }
      }
    };
    void run();
    return () => {
      cancelled = true;
      if (!settled) {
        setDemandComposerHandoff(handoff);
      }
    };
  }, [
    setEditorBody,
    setEditorMedia,
    setYoutubeVideoTitle,
    setPinterestPinTitle,
    setTiktokPhotoTitle,
    setWordpressTitle,
    setWordpressContent,
    showAlert,
    t,
  ]);

  const rememberRecommendedImages = useCallback(
    (value: unknown): void => {
      const images = asStockImages(value);
      if (images.length > 0) {
        setWordpressRecommendedImages(images);
      }
    },
    [setWordpressRecommendedImages],
  );

  const applyWordPressArticleOutput = useCallback(
    (article: WordPressArticleAgentOutput): string => {
      const content = asText(article.content);
      if (!content) {
        throw new Error(t("postScheduler.aiToolkit.contentEmpty"));
      }
      setWordpressTitle(asText(article.wordpress_title));
      setWordpressSlug(asText(article.wordpress_slug));
      const baseContent = asText(article.wordpress_content) || content;
      const urls = recommendedImageUrls(article.recommended_images);
      const firstImageUrl = urls[0] ?? "";
      setWordpressContent(
        firstImageUrl
          ? insertRecommendedAfterFirstHeading(baseContent, firstImageUrl)
          : baseContent,
      );
      setWordpressExcerpt(
        asText(article.wordpress_excerpt) ||
          asText((article as { meta_description?: string }).meta_description),
      );
      setWordpressSuggestedCategoryNames(
        parseWordPressTermSuggestions(article.suggested_categories),
      );
      setWordpressSuggestedTagNames(
        parseWordPressTermSuggestions(article.suggested_tags),
      );
      rememberRecommendedImages(article.recommended_images);
      setEditorBody(content);
      return content;
    },
    [
      setEditorBody,
      setWordpressContent,
      setWordpressExcerpt,
      rememberRecommendedImages,
      setWordpressSlug,
      setWordpressSuggestedCategoryNames,
      setWordpressSuggestedTagNames,
      setWordpressTitle,
      t,
    ],
  );

  // Keep live-preview shimmer only for visual generation/edit operations.
  // Content generation (idea/image->content/video->content) should shimmer only the content area.
  const captionShimmer = false;
  const mediaShimmer = isGeneratingImage || isEditingImage;

  const applyIdeaDraft = useCallback(
    async (ideaPrompt: string): Promise<void> => {
      const idea = ideaPrompt.trim();
      if (!idea) {
        showAlert({
          title: t("postScheduler.aiToolkit.alertIdeasTitle"),
          message: t("postScheduler.aiToolkit.describeIdeaFirst"),
        });
        return;
      }
      setIsGeneratingIdeaDraft(true);
      try {
        const token = getStoredAccessToken()?.trim() ?? "";
        const ws = getStoredActiveWorkspaceId()?.trim() ?? "";
        if (!token || !ws) {
          throw new Error(t("postScheduler.aiToolkit.loginWorkspace"));
        }

        if (draftScope === "per_channel") {
          const byId = new Map<string, ComposerChannelAccount>(
            selectedAccounts.map((a) => [a.id, a]),
          );
          const jobs = selectedIds
            .map((channelId) => {
              const account = byId.get(channelId);
              const platform = account
                ? composerIconToAiApiPlatform(account.platform)
                : null;
              return { channelId, platform };
            })
            .filter(
              (job): job is { channelId: string; platform: string } =>
                Boolean(job.platform),
            );

          if (jobs.length === 0) {
            throw new Error(t("postScheduler.aiToolkit.selectChannels"));
          }

          if (jobs.length > 1) {
            setMultiChannelGenerateProgress({
              total: jobs.length,
              completed: 0,
            });
          }

          const settled = await Promise.allSettled(
            jobs.map((job) => {
              const pageId =
                job.platform === "linkedin"
                  ? byId.get(job.channelId)?.targetResourceId?.trim() ||
                    undefined
                  : undefined;
              return generateUnifiedContent(token, ws, {
                idea,
                platforms: [job.platform],
                ...(pageId ? { page_id: pageId } : {}),
              }).finally(() => {
                if (jobs.length > 1) {
                  bumpMultiChannelGenerateProgress();
                }
              });
            }),
          );

          let successCount = 0;
          let firstYoutubeTitle = "";
          let firstPinterestTitle = "";
          let firstTiktokTitle = "";
          for (let i = 0; i < settled.length; i += 1) {
            const result = settled[i];
            const job = jobs[i];
            if (!job || result.status !== "fulfilled") {
              continue;
            }
            const data = result.value.data?.[job.platform];
            const error =
              typeof data?.error === "string" ? data.error.trim() : "";
            const content =
              typeof data?.content === "string" ? data.content.trim() : "";
            if (error || !content) {
              continue;
            }
            rememberRecommendedImages(data?.recommended_images);
            if (job.platform === "wordpress") {
              setPerChannelBody(job.channelId, content);
              setWordpressTitle(asText(data?.wordpress_title));
              setWordpressSlug(asText(data?.wordpress_slug));
              setWordpressContent(asText(data?.wordpress_content) || content);
              setWordpressExcerpt(asText(data?.wordpress_excerpt));
              rememberRecommendedImages(data?.recommended_images);
            } else if (job.platform === "youtube") {
              const title =
                typeof data?.title === "string" ? data.title.trim() : "";
              const description =
                typeof data?.description === "string"
                  ? data.description.trim()
                  : content;
              setPerChannelBody(job.channelId, description);
              if (!firstYoutubeTitle && title) {
                firstYoutubeTitle = title;
              }
            } else if (job.platform === "pinterest") {
              const title =
                typeof data?.title === "string" ? data.title.trim() : "";
              const description =
                typeof data?.description === "string"
                  ? data.description.trim()
                  : content;
              setPerChannelBody(job.channelId, description);
              if (!firstPinterestTitle && title) {
                firstPinterestTitle = title;
              }
            } else if (job.platform === "tiktok") {
              const tiktokTitle =
                typeof data?.tiktok_title === "string"
                  ? data.tiktok_title.trim()
                  : "";
              setPerChannelBody(job.channelId, content);
              if (!firstTiktokTitle && tiktokTitle) {
                firstTiktokTitle = tiktokTitle;
              }
            } else {
              setPerChannelBody(job.channelId, content);
            }
            successCount += 1;
          }

          if (firstYoutubeTitle) {
            setYoutubeVideoTitle(firstYoutubeTitle);
          }
          if (firstPinterestTitle) {
            setPinterestPinTitle(firstPinterestTitle);
          }
          if (firstTiktokTitle) {
            setTiktokPhotoTitle(firstTiktokTitle);
          }

          if (successCount === 0) {
            throw new Error(t("postScheduler.aiToolkit.generateChannelsFailed"));
          }
          showToast(
            t("postScheduler.aiToolkit.toastPostGenerated"),
            t("postScheduler.aiToolkit.toastIdeaPerChannel"),
          );
          return;
        }

        const aiPlat = resolvePostSchedulerAiPlatforms({
          draftScope,
          activeChannelId,
          selectedAccounts,
        });
        if (!aiPlat.ok) {
          showAlert({
            title: t("postScheduler.aiToolkit.alertPerPostTitle"),
            message: aiPlat.message,
          });
          return;
        }
        const platformKey = aiPlat.contentPlatforms[0] ?? "all";
        const selectedTargetPlatforms = Array.from(
          new Set(
            selectedAccounts
              .map((account) => composerIconToAiApiPlatform(account.platform))
              .filter((platform) => platform.length > 0),
          ),
        );
        if (platformKey === "wordpress") {
          setWordpressArticleGenerating(true);
          const article = await generateWordPressArticleAgent(
            token,
            ws,
            {
              prompt: idea,
              source_type: "text",
              target_length: "long",
            },
          );
          applyWordPressArticleOutput(article);
          showToast(
            t("postScheduler.aiToolkit.toastPostGenerated"),
            t("postScheduler.aiToolkit.toastIdeaDraft"),
          );
          return;
        }
        const response = await generateUnifiedContent(token, ws, {
          idea,
          platforms: [...aiPlat.contentPlatforms],
          ...(platformKey === "all" ? { target_platforms: selectedTargetPlatforms } : {}),
          ...(aiPlat.pageId ? { page_id: aiPlat.pageId } : {}),
        });
        const result = response.data?.[platformKey];
        if (!result) {
          throw new Error(t("postScheduler.aiToolkit.noContentReturned"));
        }
        if (typeof result.error === "string" && result.error.trim()) {
          throw new Error(result.error.trim());
        }
        const content =
          typeof result.content === "string" ? result.content.trim() : "";
        if (!content) {
          throw new Error(t("postScheduler.aiToolkit.contentEmpty"));
        }
        rememberRecommendedImages(result.recommended_images);
        if (platformKey === "youtube") {
          const title = typeof result.title === "string" ? result.title.trim() : "";
          const description =
            typeof result.description === "string"
              ? result.description.trim()
              : content;
          if (title) {
            setYoutubeVideoTitle(title);
          }
          setEditorBody(description);
          showToast(
            t("postScheduler.aiToolkit.toastPostGenerated"),
            t("postScheduler.aiToolkit.toastYoutubeDraft"),
          );
          return;
        }
        if (platformKey === "all") {
          const ytTitle =
            typeof result.youtube_title === "string"
              ? result.youtube_title.trim()
              : "";
          const pinTitle =
            typeof result.pinterest_title === "string"
              ? result.pinterest_title.trim()
              : "";
          const ttTitle =
            typeof result.tiktok_title === "string"
              ? result.tiktok_title.trim()
              : "";
          if (ytTitle) {
            setYoutubeVideoTitle(ytTitle);
          }
          if (pinTitle) {
            setPinterestPinTitle(pinTitle);
          }
          if (ttTitle) {
            setTiktokPhotoTitle(ttTitle);
          }
        }
        if (platformKey === "pinterest") {
          const title = typeof result.title === "string" ? result.title.trim() : "";
          const description =
            typeof result.description === "string"
              ? result.description.trim()
              : content;
          if (title) {
            setPinterestPinTitle(title);
          }
          setEditorBody(description);
          showToast(
            t("postScheduler.aiToolkit.toastPostGenerated"),
            t("postScheduler.aiToolkit.toastPinterestDraft"),
          );
          return;
        }
        setEditorBody(content);
        showToast(
          t("postScheduler.aiToolkit.toastPostGenerated"),
          t("postScheduler.aiToolkit.toastIdeaDraft"),
        );
      } catch (e) {
        showAlert({
          title: t("postScheduler.aiToolkit.alertGenerationFailed"),
          message: aiToolkitAlertMessage(e, t),
        });
      } finally {
        setMultiChannelGenerateProgress(null);
        setIsGeneratingIdeaDraft(false);
        setWordpressArticleGenerating(false);
      }
    },
    [
      activeChannelId,
      applyWordPressArticleOutput,
      bumpMultiChannelGenerateProgress,
      draftScope,
      selectedAccounts,
      selectedIds,
      setEditorBody,
      setPerChannelBody,
      setPinterestPinTitle,
      setTiktokPhotoTitle,
      setWordpressContent,
      setWordpressExcerpt,
      rememberRecommendedImages,
      setWordpressSlug,
      setWordpressTitle,
      setYoutubeVideoTitle,
      showAlert,
      showToast,
      t,
    ],
  );

  const applyBlogDraft = useCallback(
    async (ideaOrUrl: string): Promise<void> => {
      const parsed = parseBlogAiInput(ideaOrUrl);
      const prompt = parsed.prompt.trim();
      if (!prompt && !parsed.source_url) {
        showAlert({
          title: t("postScheduler.aiToolkit.alertBlogTitle"),
          message: t("postScheduler.aiToolkit.describeBlogIdeaOrUrlFirst"),
        });
        return;
      }
      setIsGeneratingBlogDraft(true);
      setWordpressArticleGenerating(true);
      try {
        const token = getStoredAccessToken()?.trim() ?? "";
        const ws = getStoredActiveWorkspaceId()?.trim() ?? "";
        if (!token || !ws) {
          throw new Error(t("postScheduler.aiToolkit.loginWorkspace"));
        }
        const article = await generateWordPressArticleAgent(token, ws, {
          prompt,
          source_type: "text",
          target_length: "long",
          ...(parsed.source_url ? { source_url: parsed.source_url } : {}),
        });
        applyWordPressArticleOutput(article);
        showToast(
          t("postScheduler.aiToolkit.toastPostGenerated"),
          t("postScheduler.aiToolkit.toastIdeaDraft"),
        );
      } catch (e) {
        showAlert({
          title: t("postScheduler.aiToolkit.alertGenerationFailed"),
          message: aiToolkitAlertMessage(e, t),
        });
      } finally {
        setIsGeneratingBlogDraft(false);
        setWordpressArticleGenerating(false);
      }
    },
    [applyWordPressArticleOutput, showAlert, showToast, t],
  );

  const runGenerateImage = useCallback(
    async (requirements: string): Promise<void> => {
      const content = editorBody.trim();
      if (!content) {
        showAlert({
          title: t("postScheduler.aiToolkit.alertContentRequired"),
          message: t("postScheduler.aiToolkit.writeContentFirst"),
        });
        return;
      }
      setIsGeneratingImage(true);
      try {
        const token = getStoredAccessToken()?.trim() ?? "";
        const ws = getStoredActiveWorkspaceId()?.trim() ?? "";
        if (!token || !ws) {
          throw new Error(t("postScheduler.aiToolkit.loginWorkspace"));
        }
        const aiPlat = resolvePostSchedulerAiPlatforms({
          draftScope,
          activeChannelId,
          selectedAccounts,
        });
        if (!aiPlat.ok) {
          showAlert({
            title: t("postScheduler.aiToolkit.alertPerPostTitle"),
            message: aiPlat.message,
          });
          return;
        }
        const platformKey = aiPlat.contentPlatforms[0] ?? "all";
        const response = await generateUnifiedImage(token, ws, {
          content,
          platforms: [...aiPlat.contentPlatforms],
          ...(aiPlat.pageId ? { page_id: aiPlat.pageId } : {}),
          ...(requirements.trim()
            ? { user_requirements: requirements.trim() }
            : {}),
        });
        const result = response.data?.[platformKey];
        if (!result) {
          throw new Error(t("postScheduler.aiToolkit.noImageReturned"));
        }
        if (typeof result.error === "string" && result.error.trim()) {
          throw new Error(result.error.trim());
        }
        const mediaId =
          typeof result.media_id === "string" ? result.media_id.trim() : "";
        const imageUrl =
          typeof result.image_url === "string" ? result.image_url.trim() : "";
        if (!mediaId || !imageUrl) {
          throw new Error(t("postScheduler.aiToolkit.imageMissingId"));
        }
        setEditorMedia([
          {
            mediaId,
            publicUrl: imageUrl,
            mediaType: "image",
            filename: t("postScheduler.aiToolkit.aiGeneratedImage"),
          },
        ]);
        showToast(
          t("postScheduler.aiToolkit.toastImageGenerated"),
          t("postScheduler.aiToolkit.toastImageAttached"),
        );
      } catch (e) {
        showAlert({
          title: t("postScheduler.aiToolkit.alertGenerationFailed"),
          message: aiToolkitAlertMessage(e, t),
        });
      } finally {
        setIsGeneratingImage(false);
      }
    },
    [
      activeChannelId,
      draftScope,
      editorBody,
      selectedAccounts,
      setEditorMedia,
      showAlert,
      showToast,
      t,
    ],
  );

  const runImageToContent = useCallback(
    async (requirements: string): Promise<void> => {
      setIsGeneratingImageToContent(true);
      try {
        const token = getStoredAccessToken()?.trim() ?? "";
        const ws = getStoredActiveWorkspaceId()?.trim() ?? "";
        if (!token || !ws) {
          throw new Error(t("postScheduler.aiToolkit.loginWorkspace"));
        }

        if (draftScope === "per_channel") {
          const byId = new Map<string, ComposerChannelAccount>(
            selectedAccounts.map((a) => [a.id, a]),
          );
          const jobs = selectedIds
            .map((channelId) => {
              const account = byId.get(channelId);
              const platform = account
                ? composerIconToAiApiPlatform(account.platform)
                : null;
              const media = (
                perChannelDrafts[channelId]?.media ?? []
              ).find((item) => item.mediaType === "image");
              return {
                channelId,
                platform,
                imageUrl: media?.publicUrl?.trim() ?? "",
              };
            })
            .filter(
              (job): job is { channelId: string; platform: string; imageUrl: string } =>
                Boolean(job.platform && job.imageUrl),
            );

          if (jobs.length === 0) {
            showAlert({
              title: t("postScheduler.aiToolkit.alertImageRequired"),
              message: t("postScheduler.aiToolkit.selectImageFirst"),
            });
            return;
          }

          if (jobs.length > 1) {
            setMultiChannelGenerateProgress({
              total: jobs.length,
              completed: 0,
            });
          }

          const settled = await Promise.allSettled(
            jobs.map((job) =>
              generateUnifiedImageToContent(token, ws, {
                image_url: job.imageUrl,
                platform: job.platform,
                ...(requirements.trim()
                  ? { user_requirements: requirements.trim() }
                  : {}),
              }).finally(() => {
                if (jobs.length > 1) {
                  bumpMultiChannelGenerateProgress();
                }
              }),
            ),
          );

          let successCount = 0;
          let firstPinterestTitle = "";
          let firstTiktokTitleFromImage = "";
          for (let i = 0; i < settled.length; i += 1) {
            const result = settled[i];
            const job = jobs[i];
            if (!job || result.status !== "fulfilled") {
              continue;
            }
            const err =
              typeof result.value.data?.error === "string"
                ? result.value.data.error.trim()
                : "";
            const body =
              typeof result.value.data?.content === "string"
                ? result.value.data.content.trim()
                : "";
            if (!err && body) {
              rememberRecommendedImages(result.value.data?.recommended_images);
              setPerChannelBody(job.channelId, body);
              if (job.platform === "wordpress") {
                const data = result.value.data;
                setWordpressTitle(asText(data?.wordpress_title));
                setWordpressSlug(asText(data?.wordpress_slug));
                setWordpressContent(asText(data?.wordpress_content) || body);
                setWordpressExcerpt(asText(data?.wordpress_excerpt));
                rememberRecommendedImages(data?.recommended_images);
              }
              if (job.platform === "pinterest") {
                const title =
                  typeof result.value.data?.title === "string"
                    ? result.value.data.title.trim()
                    : "";
                if (!firstPinterestTitle && title) {
                  firstPinterestTitle = title;
                }
              }
              if (job.platform === "tiktok") {
                const tt =
                  typeof result.value.data?.tiktok_title === "string"
                    ? result.value.data.tiktok_title.trim()
                    : "";
                if (!firstTiktokTitleFromImage && tt) {
                  firstTiktokTitleFromImage = tt;
                }
              }
              successCount += 1;
            }
          }

          if (successCount === 0) {
            throw new Error(t("postScheduler.aiToolkit.generateChannelsFailed"));
          }
          showToast(
            t("postScheduler.aiToolkit.toastContentGenerated"),
            t("postScheduler.aiToolkit.toastCaptionsFromImages"),
          );
          if (firstPinterestTitle) {
            setPinterestPinTitle(firstPinterestTitle);
          }
          if (firstTiktokTitleFromImage) {
            setTiktokPhotoTitle(firstTiktokTitleFromImage);
          }
          return;
        }

        const image = editorMedia.find((m) => m.mediaType === "image");
        if (!image?.publicUrl?.trim()) {
          showAlert({
            title: t("postScheduler.aiToolkit.alertImageRequired"),
            message: t("postScheduler.aiToolkit.selectImageFirst"),
          });
          return;
        }
        const aiPlat = resolvePostSchedulerAiPlatforms({
          draftScope,
          activeChannelId,
          selectedAccounts,
        });
        if (!aiPlat.ok) {
          showAlert({
            title: t("postScheduler.aiToolkit.alertPerPostTitle"),
            message: aiPlat.message,
          });
          return;
        }
        if (aiPlat.singlePlatform === "wordpress") {
          setWordpressArticleGenerating(true);
          const article = await generateWordPressArticleAgent(
            token,
            ws,
            {
              prompt: `Create the article from this image: ${image.publicUrl}`,
              source_type: "image",
              user_requirements: requirements.trim() || undefined,
              target_length: "long",
            },
          );
          applyWordPressArticleOutput(article);
          showToast(
            t("postScheduler.aiToolkit.toastContentGenerated"),
            t("postScheduler.aiToolkit.toastCaptionFromImage"),
          );
          return;
        }
        const response = await generateUnifiedImageToContent(token, ws, {
          image_url: image.publicUrl,
          platform: aiPlat.singlePlatform,
          ...(aiPlat.singlePlatform === "all"
            ? {
                target_platforms: Array.from(
                  new Set(
                    selectedAccounts
                      .map((account) => composerIconToAiApiPlatform(account.platform))
                      .filter((platform) => platform.length > 0),
                  ),
                ),
              }
            : {}),
          ...(aiPlat.pageId ? { page_id: aiPlat.pageId } : {}),
          ...(requirements.trim()
            ? { user_requirements: requirements.trim() }
            : {}),
        });
        const body =
          typeof response.data?.content === "string"
            ? response.data.content.trim()
            : "";
        const title =
          typeof response.data?.title === "string"
            ? response.data.title.trim()
            : "";
        const description =
          typeof response.data?.description === "string"
            ? response.data.description.trim()
            : body;
        const err =
          typeof response.data?.error === "string"
            ? response.data.error.trim()
            : "";
        if (err) {
          throw new Error(err);
        }
        if (!body) {
          throw new Error(t("postScheduler.aiToolkit.contentEmpty"));
        }
        rememberRecommendedImages(response.data?.recommended_images);
        if (aiPlat.singlePlatform === "pinterest") {
          if (title) {
            setPinterestPinTitle(title);
          }
          setEditorBody(description);
        } else if (aiPlat.singlePlatform === "wordpress") {
          setWordpressTitle(asText(response.data?.wordpress_title));
          setWordpressSlug(asText(response.data?.wordpress_slug));
          setWordpressContent(asText(response.data?.wordpress_content) || body);
          setWordpressExcerpt(asText(response.data?.wordpress_excerpt));
          rememberRecommendedImages(response.data?.recommended_images);
          setEditorBody(body);
        } else if (aiPlat.singlePlatform === "all") {
          const ytTitle =
            typeof response.data?.youtube_title === "string"
              ? response.data.youtube_title.trim()
              : "";
          const pinTitle =
            typeof response.data?.pinterest_title === "string"
              ? response.data.pinterest_title.trim()
              : "";
          const ttTitle =
            typeof response.data?.tiktok_title === "string"
              ? response.data.tiktok_title.trim()
              : "";
          if (ytTitle) {
            setYoutubeVideoTitle(ytTitle);
          }
          if (pinTitle) {
            setPinterestPinTitle(pinTitle);
          }
          if (ttTitle) {
            setTiktokPhotoTitle(ttTitle);
          }
          setEditorBody(body);
        } else {
          setEditorBody(body);
        }
        showToast(
          t("postScheduler.aiToolkit.toastContentGenerated"),
          t("postScheduler.aiToolkit.toastCaptionFromImage"),
        );
      } catch (e) {
        showAlert({
          title: t("postScheduler.aiToolkit.alertGenerationFailed"),
          message: aiToolkitAlertMessage(e, t),
        });
      } finally {
        setMultiChannelGenerateProgress(null);
        setIsGeneratingImageToContent(false);
        setWordpressArticleGenerating(false);
      }
    },
    [
      activeChannelId,
      applyWordPressArticleOutput,
      bumpMultiChannelGenerateProgress,
      draftScope,
      editorMedia,
      perChannelDrafts,
      selectedAccounts,
      selectedIds,
      setEditorBody,
      setPerChannelBody,
      setPinterestPinTitle,
      setWordpressContent,
      setWordpressExcerpt,
      rememberRecommendedImages,
      setWordpressSlug,
      setWordpressTitle,
      setTiktokPhotoTitle,
      setYoutubeVideoTitle,
      showAlert,
      showToast,
      t,
    ],
  );

  const runVideoToContent = useCallback(
    async (requirements: string): Promise<void> => {
      setIsGeneratingVideoToContent(true);
      try {
        const token = getStoredAccessToken()?.trim() ?? "";
        const ws = getStoredActiveWorkspaceId()?.trim() ?? "";
        if (!token || !ws) {
          throw new Error(t("postScheduler.aiToolkit.loginWorkspace"));
        }

        if (draftScope === "per_channel") {
          const byId = new Map<string, ComposerChannelAccount>(
            selectedAccounts.map((a) => [a.id, a]),
          );
          const jobs = selectedIds
            .map((channelId) => {
              const account = byId.get(channelId);
              const platform = account
                ? composerIconToAiApiPlatform(account.platform)
                : null;
              const media = (
                perChannelDrafts[channelId]?.media ?? []
              ).find((item) => item.mediaType === "video");
              return {
                channelId,
                platform,
                videoUrl: media?.publicUrl?.trim() ?? "",
              };
            })
            .filter(
              (job): job is { channelId: string; platform: string; videoUrl: string } =>
                Boolean(job.platform && job.videoUrl),
            );

          if (jobs.length === 0) {
            showAlert({
              title: t("postScheduler.aiToolkit.alertVideoRequired"),
              message: t("postScheduler.aiToolkit.selectVideoFirst"),
            });
            return;
          }

          if (jobs.length > 1) {
            setMultiChannelGenerateProgress({
              total: jobs.length,
              completed: 0,
            });
          }

          const settled = await Promise.allSettled(
            jobs.map((job) =>
              generateUnifiedVideoToContent(token, ws, {
                video_url: job.videoUrl,
                platform: job.platform,
                ...(requirements.trim()
                  ? { user_requirements: requirements.trim() }
                  : {}),
              }).finally(() => {
                if (jobs.length > 1) {
                  bumpMultiChannelGenerateProgress();
                }
              }),
            ),
          );

          let successCount = 0;
          let firstPinterestTitle = "";
          let firstTiktokTitleFromVideo = "";
          for (let i = 0; i < settled.length; i += 1) {
            const result = settled[i];
            const job = jobs[i];
            if (!job || result.status !== "fulfilled") {
              continue;
            }
            const err =
              typeof result.value.data?.error === "string"
                ? result.value.data.error.trim()
                : "";
            const body =
              typeof result.value.data?.content === "string"
                ? result.value.data.content.trim()
                : "";
            if (!err && body) {
              rememberRecommendedImages(result.value.data?.recommended_images);
              setPerChannelBody(job.channelId, body);
              if (job.platform === "wordpress") {
                const data = result.value.data;
                setWordpressTitle(asText(data?.wordpress_title));
                setWordpressSlug(asText(data?.wordpress_slug));
                setWordpressContent(asText(data?.wordpress_content) || body);
                setWordpressExcerpt(asText(data?.wordpress_excerpt));
                rememberRecommendedImages(data?.recommended_images);
              }
              if (job.platform === "pinterest") {
                const title =
                  typeof result.value.data?.title === "string"
                    ? result.value.data.title.trim()
                    : "";
                if (!firstPinterestTitle && title) {
                  firstPinterestTitle = title;
                }
              }
              if (job.platform === "tiktok") {
                const tt =
                  typeof result.value.data?.tiktok_title === "string"
                    ? result.value.data.tiktok_title.trim()
                    : "";
                if (!firstTiktokTitleFromVideo && tt) {
                  firstTiktokTitleFromVideo = tt;
                }
              }
              successCount += 1;
            }
          }

          if (successCount === 0) {
            throw new Error(t("postScheduler.aiToolkit.generateChannelsFailed"));
          }
          showToast(
            t("postScheduler.aiToolkit.toastContentGenerated"),
            t("postScheduler.aiToolkit.toastCaptionsFromVideos"),
          );
          if (firstPinterestTitle) {
            setPinterestPinTitle(firstPinterestTitle);
          }
          if (firstTiktokTitleFromVideo) {
            setTiktokPhotoTitle(firstTiktokTitleFromVideo);
          }
          return;
        }

        const video = editorMedia.find((m) => m.mediaType === "video");
        if (!video?.publicUrl?.trim()) {
          showAlert({
            title: t("postScheduler.aiToolkit.alertVideoRequired"),
            message: t("postScheduler.aiToolkit.selectVideoFirst"),
          });
          return;
        }
        const aiPlat = resolvePostSchedulerAiPlatforms({
          draftScope,
          activeChannelId,
          selectedAccounts,
        });
        if (!aiPlat.ok) {
          showAlert({
            title: t("postScheduler.aiToolkit.alertPerPostTitle"),
            message: aiPlat.message,
          });
          return;
        }
        if (aiPlat.singlePlatform === "wordpress") {
          setWordpressArticleGenerating(true);
          const article = await generateWordPressArticleAgent(
            token,
            ws,
            {
              prompt: `Create the article from this video: ${video.publicUrl}`,
              source_type: "video",
              user_requirements: requirements.trim() || undefined,
              target_length: "long",
            },
          );
          applyWordPressArticleOutput(article);
          showToast(
            t("postScheduler.aiToolkit.toastContentGenerated"),
            t("postScheduler.aiToolkit.toastCaptionFromVideo"),
          );
          return;
        }
        const response = await generateUnifiedVideoToContent(token, ws, {
          video_url: video.publicUrl,
          platform: aiPlat.singlePlatform,
          ...(aiPlat.singlePlatform === "all"
            ? {
                target_platforms: Array.from(
                  new Set(
                    selectedAccounts
                      .map((account) => composerIconToAiApiPlatform(account.platform))
                      .filter((platform) => platform.length > 0),
                  ),
                ),
              }
            : {}),
          ...(aiPlat.pageId ? { page_id: aiPlat.pageId } : {}),
          ...(requirements.trim()
            ? { user_requirements: requirements.trim() }
            : {}),
        });
        const body =
          typeof response.data?.content === "string"
            ? response.data.content.trim()
            : "";
        const title =
          typeof response.data?.title === "string"
            ? response.data.title.trim()
            : "";
        const description =
          typeof response.data?.description === "string"
            ? response.data.description.trim()
            : body;
        const err =
          typeof response.data?.error === "string"
            ? response.data.error.trim()
            : "";
        if (err) {
          throw new Error(err);
        }
        if (!body) {
          throw new Error(t("postScheduler.aiToolkit.contentEmpty"));
        }
        rememberRecommendedImages(response.data?.recommended_images);
        if (aiPlat.singlePlatform === "pinterest") {
          if (title) {
            setPinterestPinTitle(title);
          }
          setEditorBody(description);
        } else if (aiPlat.singlePlatform === "wordpress") {
          setWordpressTitle(asText(response.data?.wordpress_title));
          setWordpressSlug(asText(response.data?.wordpress_slug));
          setWordpressContent(asText(response.data?.wordpress_content) || body);
          setWordpressExcerpt(asText(response.data?.wordpress_excerpt));
          rememberRecommendedImages(response.data?.recommended_images);
          setEditorBody(body);
        } else if (aiPlat.singlePlatform === "all") {
          const ytTitle =
            typeof response.data?.youtube_title === "string"
              ? response.data.youtube_title.trim()
              : "";
          const pinTitle =
            typeof response.data?.pinterest_title === "string"
              ? response.data.pinterest_title.trim()
              : "";
          const ttTitle =
            typeof response.data?.tiktok_title === "string"
              ? response.data.tiktok_title.trim()
              : "";
          if (ytTitle) {
            setYoutubeVideoTitle(ytTitle);
          }
          if (pinTitle) {
            setPinterestPinTitle(pinTitle);
          }
          if (ttTitle) {
            setTiktokPhotoTitle(ttTitle);
          }
          setEditorBody(body);
        } else {
          setEditorBody(body);
        }
        showToast(
          t("postScheduler.aiToolkit.toastContentGenerated"),
          t("postScheduler.aiToolkit.toastCaptionFromVideo"),
        );
      } catch (e) {
        showAlert({
          title: t("postScheduler.aiToolkit.alertGenerationFailed"),
          message: aiToolkitAlertMessage(e, t),
        });
      } finally {
        setMultiChannelGenerateProgress(null);
        setIsGeneratingVideoToContent(false);
        setWordpressArticleGenerating(false);
      }
    },
    [
      activeChannelId,
      applyWordPressArticleOutput,
      bumpMultiChannelGenerateProgress,
      draftScope,
      editorMedia,
      perChannelDrafts,
      selectedAccounts,
      selectedIds,
      setEditorBody,
      setPerChannelBody,
      setPinterestPinTitle,
      setWordpressContent,
      setWordpressExcerpt,
      rememberRecommendedImages,
      setWordpressSlug,
      setWordpressTitle,
      setTiktokPhotoTitle,
      setYoutubeVideoTitle,
      showAlert,
      showToast,
      t,
    ],
  );

  const runEditImage = useCallback(
    async (requirements: string): Promise<void> => {
      const image = editorMedia.find((m) => m.mediaType === "image");
      if (!image?.publicUrl?.trim()) {
        showAlert({
          title: "Image required",
          message: "Kindly generate or select image from storage first.",
        });
        return;
      }
      if (!requirements.trim()) {
        showAlert({
          title: t("postScheduler.aiToolkit.alertEditImageTitle"),
          message: t("postScheduler.aiToolkit.addEditRequirements"),
        });
        return;
      }
      setIsEditingImage(true);
      try {
        const token = getStoredAccessToken()?.trim() ?? "";
        const ws = getStoredActiveWorkspaceId()?.trim() ?? "";
        if (!token || !ws) {
          throw new Error(t("postScheduler.aiToolkit.loginWorkspace"));
        }
        const aiPlat = resolvePostSchedulerAiPlatforms({
          draftScope,
          activeChannelId,
          selectedAccounts,
        });
        if (!aiPlat.ok) {
          showAlert({
            title: t("postScheduler.aiToolkit.alertPerPostTitle"),
            message: aiPlat.message,
          });
          return;
        }
        const response = await generateUnifiedEditImage(token, ws, {
          image_url: image.publicUrl,
          user_requirements: requirements.trim(),
          platform: aiPlat.singlePlatform,
          ...(aiPlat.pageId ? { page_id: aiPlat.pageId } : {}),
        });
        const mediaId =
          typeof response.data?.media_id === "string"
            ? response.data.media_id.trim()
            : "";
        const imageUrl =
          typeof response.data?.image_url === "string"
            ? response.data.image_url.trim()
            : "";
        const err =
          typeof response.data?.error === "string"
            ? response.data.error.trim()
            : "";
        if (err) {
          throw new Error(err);
        }
        if (!mediaId || !imageUrl) {
          throw new Error(t("postScheduler.aiToolkit.editedImageMissingId"));
        }
        setEditorMedia((prev) => {
          const idx = prev.findIndex((m) => m.mediaId === image.mediaId);
          if (idx < 0) {
            return [
              {
                mediaId,
                publicUrl: imageUrl,
                mediaType: "image",
                filename: t("postScheduler.aiToolkit.aiEditedImage"),
              },
            ];
          }
          const next = [...prev];
          next[idx] = {
            mediaId,
            publicUrl: imageUrl,
            mediaType: "image",
            filename: t("postScheduler.aiToolkit.aiEditedImage"),
          };
          return next;
        });
        showToast(
          t("postScheduler.aiToolkit.toastImageUpdated"),
          t("postScheduler.aiToolkit.toastImageReady"),
        );
      } catch (e) {
        showAlert({
          title: t("postScheduler.aiToolkit.alertGenerationFailed"),
          message: aiToolkitAlertMessage(e, t),
        });
      } finally {
        setIsEditingImage(false);
      }
    },
    [
      activeChannelId,
      draftScope,
      editorMedia,
      selectedAccounts,
      setEditorMedia,
      showAlert,
      showToast,
      t,
    ],
  );

  const value = useMemo(
    (): PostSchedulerAiToolkitContextValue => ({
      isGeneratingIdeaDraft,
      isGeneratingBlogDraft,
      isGeneratingImage,
      isGeneratingImageToContent,
      isGeneratingVideoToContent,
      isEditingImage,
      captionShimmer,
      mediaShimmer,
      wordpressArticleGenerating,
      alert,
      dismissAlert,
      showAlert,
      applyIdeaDraft,
      applyBlogDraft,
      runGenerateImage,
      runImageToContent,
      runVideoToContent,
      runEditImage,
    }),
    [
      alert,
      applyBlogDraft,
      applyIdeaDraft,
      captionShimmer,
      dismissAlert,
      isEditingImage,
      isGeneratingBlogDraft,
      isGeneratingIdeaDraft,
      isGeneratingImage,
      isGeneratingImageToContent,
      isGeneratingVideoToContent,
      mediaShimmer,
      wordpressArticleGenerating,
      runEditImage,
      runGenerateImage,
      runImageToContent,
      runVideoToContent,
      showAlert,
    ],
  );

  return (
    <PostSchedulerAiToolkitContext.Provider value={value}>
      {children}
      <PostSchedulerMultiGenerateProgressOrb
        progress={multiChannelGenerateProgress}
      />
      {toast ? (
        <DraftEditorSuccessToast
          key={toastKey}
          title={toast.title}
          subtitle={toast.subtitle}
          onDismiss={dismissToast}
        />
      ) : null}
    </PostSchedulerAiToolkitContext.Provider>
  );
}

export function usePostSchedulerAiToolkit(): PostSchedulerAiToolkitContextValue {
  const ctx = useContext(PostSchedulerAiToolkitContext);
  if (!ctx) {
    throw new Error(
      "usePostSchedulerAiToolkit must be used within PostSchedulerAiToolkitProvider",
    );
  }
  return ctx;
}
