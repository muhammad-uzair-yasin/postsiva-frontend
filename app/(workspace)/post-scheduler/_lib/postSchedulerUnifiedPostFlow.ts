import type { Dispatch, SetStateAction } from "react";

import {
  getStoredAccessToken,
  getStoredActiveWorkspaceId,
} from "@/lib/auth/session";
import { type WordPressComposerFields, buildComposerPostJobs, type ComposerPostJob } from "@/lib/post-composer/buildComposerPostJobs";
import { buildBlogPostJobs } from "@/lib/post-composer/buildBlogPostBody";
import type { ComposerPostingAccount } from "@/lib/post-composer/composerPostingAccount";
import type { ComposerAttachedMedia } from "@/lib/post-composer/composerAttachedMediaTypes";
import type { ComposerContentMode } from "@/lib/post-composer/composerContentModeTypes";
import type {
  ComposerDraftScope,
  PerChannelDraftSnapshot,
} from "@/lib/post-composer/composerDraftScopeTypes";
import {
  applyJobResponseToRows,
  buildPostingProgressRowsFromPostTargets,
} from "@/lib/post-composer/composerPublishProgressRows";
import { runUnifiedPostJobs } from "@/lib/post-composer/runUnifiedPostJobs";
import { unifiedPostResponseAllSucceeded } from "@/lib/social/unifiedPostingApi";

import type { ComposerChannelAccount } from "../_data/postSchedulerComposerChannelAccounts";
import type { ComposerPublishOverlayState } from "../_types/postSchedulerUnifiedPostTypes";
import type { ComposerPostFormat } from "@/lib/post-composer/composerPostFormat";
import {
  describeVideoDurationViolationsForSelectedAccounts,
  videoDurationFromMedia,
  videoFileSizeFromMedia,
} from "@/lib/post-composer/composerVideoDurationLimits";

export type PendingUnifiedPostBundle = {
  readonly jobs: ComposerPostJob[];
  readonly warnings: string[];
  readonly postTargetIds: readonly string[];
  readonly accounts: readonly ComposerPostingAccount[];
};

export function toPostingAccounts(
  accounts: readonly ComposerChannelAccount[],
): ComposerPostingAccount[] {
  return accounts.map((a) => ({
    id: a.id,
    displayName: a.displayName,
    platform: a.platform,
    targetResourceId: a.targetResourceId,
  }));
}

export type QueueUnifiedPostResult =
  | { readonly ok: true; readonly pending: PendingUnifiedPostBundle }
  | { readonly ok: false; readonly title: string; readonly message: string };

export type ComposerQueueIntent = "publish" | "draft" | "schedule";

function cannotBuildTitle(intent: ComposerQueueIntent): string {
  if (intent === "draft") {
    return "Cannot save draft";
  }
  if (intent === "schedule") {
    return "Cannot schedule";
  }
  return "Cannot post";
}

function chooseChannelsTitle(intent: ComposerQueueIntent): string {
  if (intent === "draft") {
    return "Choose where to save";
  }
  if (intent === "schedule") {
    return "Choose where to schedule";
  }
  return "Choose where to post";
}

function countFilledCarouselSlots(body: Record<string, unknown>): number {
  const ids = Array.isArray(body.image_ids) ? body.image_ids : [];
  const urls = Array.isArray(body.image_urls) ? body.image_urls : [];
  if (ids.length === 0 && urls.length > 0) {
    return urls.filter((u) => typeof u === "string" && u.trim().length > 0).length;
  }
  if (urls.length === 0 && ids.length > 0) {
    return ids.filter((id) => typeof id === "string" && id.trim().length > 0).length;
  }
  const slots = Math.max(ids.length, urls.length);
  let count = 0;
  for (let i = 0; i < slots; i += 1) {
    const id = typeof ids[i] === "string" ? ids[i].trim() : "";
    const url = typeof urls[i] === "string" ? urls[i].trim() : "";
    if (id.length > 0 || url.length > 0) {
      count += 1;
    }
  }
  return count;
}

export function tryQueueUnifiedPost(input: {
  readonly postNowDisabled: boolean;
  readonly accounts: readonly ComposerChannelAccount[];
  readonly postTargetIds: readonly string[];
  readonly draftScope: ComposerDraftScope;
  readonly contentMode: ComposerContentMode;
  readonly unifiedBody: string;
  readonly unifiedMedia: readonly ComposerAttachedMedia[];
  readonly perChannelDrafts: Readonly<Record<string, PerChannelDraftSnapshot>>;
  readonly youtubeTitle: string | null;
  readonly youtubePlaylistId: string | null;
  readonly youtubeThumbnailMediaId: string | null;
  readonly youtubeGenerateThumbnail: boolean;
  readonly youtubeMadeForKids: boolean;
  readonly linkedinThumbnailMediaId: string | null;
  readonly linkedinGenerateThumbnail: boolean;
  readonly pinterestTitle: string | null;
  readonly tiktokTitle: string | null;
  /** WordPress composer fields; omitted means the blog post publishes untitled. */
  readonly wordpress?: WordPressComposerFields | null;
  readonly postFormat?: ComposerPostFormat;
  readonly facebookLinkUrl?: string;
  readonly facebookLinkPublishBlockMessage?: string | null;
  /** Error dialog titles (default: publish / Post Now). */
  readonly intent?: ComposerQueueIntent;
}): QueueUnifiedPostResult {
  const intent: ComposerQueueIntent = input.intent ?? "publish";
  if (input.postNowDisabled) {
    return {
      ok: false,
      title: chooseChannelsTitle(intent),
      message:
        input.accounts.length === 0
          ? "Connect a channel in Settings first."
          : "Open Channels and turn on at least one account.",
    };
  }
  const postingAccounts = toPostingAccounts(input.accounts);

  if (
    (input.postFormat ?? "standard") === "link" &&
    input.facebookLinkPublishBlockMessage
  ) {
    return {
      ok: false,
      title: cannotBuildTitle(intent),
      message: input.facebookLinkPublishBlockMessage,
    };
  }

  const videoLimitAccounts = postingAccounts.filter((a) =>
    input.postTargetIds.includes(a.id),
  );
  const mediaForVideoCheck =
    input.draftScope === "per_channel" && input.postTargetIds.length === 1
      ? (input.perChannelDrafts[input.postTargetIds[0] ?? ""]?.media ??
        input.unifiedMedia)
      : input.unifiedMedia;
  const hasVideo = mediaForVideoCheck.some((m) => m.mediaType === "video");
  if (hasVideo && videoLimitAccounts.length > 0) {
    const videoLimitMsg = describeVideoDurationViolationsForSelectedAccounts({
      accounts: videoLimitAccounts,
      durationSeconds: videoDurationFromMedia(mediaForVideoCheck),
      fileSizeBytes: videoFileSizeFromMedia(mediaForVideoCheck),
      postFormat: input.postFormat ?? "standard",
    });
    if (videoLimitMsg) {
      return {
        ok: false,
        title: cannotBuildTitle(intent),
        message: videoLimitMsg,
      };
    }
  }

  if (input.contentMode === "blog") {
    const wpTargets = input.postTargetIds.filter((id) => {
      const account = input.accounts.find((a) => a.id === id);
      return account?.platform === "wordpress";
    });
    if (wpTargets.length !== input.postTargetIds.length) {
      return {
        ok: false,
        title: chooseChannelsTitle(intent),
        message: "Blog posts can only be published to WordPress sites.",
      };
    }
    const blogBuilt = buildBlogPostJobs({
      postTargetIds: input.postTargetIds,
      accounts: postingAccounts,
      rawBody: input.unifiedBody,
      media: input.unifiedMedia,
      wordpress: input.wordpress ?? null,
    });
    if (!blogBuilt.ok) {
      return { ok: false, title: cannotBuildTitle(intent), message: blogBuilt.message };
    }
    const jobs: ComposerPostJob[] = blogBuilt.jobs.map((job) => ({
      label: job.label,
      endpoint: "image",
      body: job.body,
      targetAccountId: job.targetAccountId,
      blogApi: true,
    }));
    return {
      ok: true,
      pending: {
        jobs,
        warnings: [],
        postTargetIds: input.postTargetIds,
        accounts: postingAccounts,
      },
    };
  }

  const built = buildComposerPostJobs({
    draftScope: input.draftScope,
    postTargetIds: input.postTargetIds,
    accounts: postingAccounts,
    unifiedBody: input.unifiedBody,
    unifiedMedia: input.unifiedMedia,
    perChannelDrafts: input.perChannelDrafts,
    youtubeTitle: input.youtubeTitle,
    youtubePlaylistId: input.youtubePlaylistId,
    youtubeThumbnailMediaId: input.youtubeThumbnailMediaId,
    youtubeGenerateThumbnail: input.youtubeGenerateThumbnail,
    youtubeMadeForKids: input.youtubeMadeForKids,
    linkedinThumbnailMediaId: input.linkedinThumbnailMediaId,
    linkedinGenerateThumbnail: input.linkedinGenerateThumbnail,
    pinterestTitle: input.pinterestTitle,
    tiktokTitle: input.tiktokTitle,
    wordpress: null,
    postFormat: input.postFormat ?? "standard",
    facebookLinkUrl: input.facebookLinkUrl,
  });
  if (!built.ok) {
    return { ok: false, title: cannotBuildTitle(intent), message: built.message };
  }
  for (const job of built.jobs) {
    if (job.endpoint === "image") {
      const hasImageId =
        typeof job.body.default_image_id === "string" &&
        job.body.default_image_id.trim().length > 0;
      const hasImageUrl =
        typeof job.body.default_image_url === "string" &&
        job.body.default_image_url.trim().length > 0;
      if (!hasImageId && !hasImageUrl) {
        return {
          ok: false,
          title: cannotBuildTitle(intent),
          message: "Image missing. Attach an image from your library, stock, or device.",
        };
      }
    }
    if (job.endpoint === "carousel") {
      if (countFilledCarouselSlots(job.body) < 2) {
        return {
          ok: false,
          title: cannotBuildTitle(intent),
          message:
            "Carousel needs at least 2 images. Attach images from your library, stock, or device.",
        };
      }
    }
    if (job.endpoint === "document") {
      const hasDocId =
        typeof job.body.document_id === "string" &&
        job.body.document_id.trim().length > 0;
      const hasDocUrl =
        typeof job.body.document_url === "string" &&
        job.body.document_url.trim().length > 0;
      if (!hasDocId && !hasDocUrl) {
        return {
          ok: false,
          title: cannotBuildTitle(intent),
          message: "Document missing. Attach a PDF or document file.",
        };
      }
    }
    if (job.endpoint === "story") {
      const hasImageId =
        typeof job.body.default_image_id === "string" &&
        job.body.default_image_id.trim().length > 0;
      const hasImageUrl =
        typeof job.body.default_image_url === "string" &&
        job.body.default_image_url.trim().length > 0;
      const hasVideoId =
        typeof job.body.video_id === "string" &&
        job.body.video_id.trim().length > 0;
      const hasVideoUrl =
        typeof job.body.video_url === "string" &&
        job.body.video_url.trim().length > 0;
      if (!hasImageId && !hasImageUrl && !hasVideoId && !hasVideoUrl) {
        return {
          ok: false,
          title: cannotBuildTitle(intent),
          message: "Story media missing. Attach an image or video.",
        };
      }
    }
    if (job.endpoint === "link") {
      const linkUrl =
        typeof job.body.link_url === "string" ? job.body.link_url.trim() : "";
      if (!linkUrl) {
        return {
          ok: false,
          title: cannotBuildTitle(intent),
          message: "Enter the link URL for your Facebook link post.",
        };
      }
    }
    if (
      (job.endpoint === "video" || job.endpoint === "reel") &&
      !(
        (typeof job.body.video_id === "string" &&
          job.body.video_id.trim().length > 0) ||
        (typeof job.body.video_url === "string" &&
          job.body.video_url.trim().length > 0)
      )
    ) {
      return {
        ok: false,
        title: cannotBuildTitle(intent),
        message: "Video id or URL missing. Re-attach the video.",
      };
    }
  }
  return {
    ok: true,
    pending: {
      jobs: built.jobs,
      warnings: built.warnings,
      postTargetIds: input.postTargetIds,
      accounts: postingAccounts,
    },
  };
}

export async function runUnifiedPostSession(input: {
  readonly pending: PendingUnifiedPostBundle;
  readonly onBlockingMessage: (title: string, message: string) => void;
  readonly setPublishOverlay: Dispatch<
    SetStateAction<ComposerPublishOverlayState | null>
  >;
  readonly setPosting: (v: boolean) => void;
  /**
   * After all jobs succeed (before feed refresh). Use to align workspace UI — e.g. mobile calls
   * `setTabHeaderSelectedIds(postTargetIds)`; web sets single `selectedAccountId` to the first target.
   */
  readonly onPublishFullySucceeded?: (
    pending: PendingUnifiedPostBundle,
  ) => void;
}): Promise<boolean> {
  const token = getStoredAccessToken();
  const ws = getStoredActiveWorkspaceId();
  if (!token?.trim() || !ws?.trim()) {
    input.onBlockingMessage(
      "Sign in required",
      "Log in and open a workspace to post.",
    );
    return false;
  }

  const { pending } = input;
  const initialRows = buildPostingProgressRowsFromPostTargets(
    pending.postTargetIds,
    pending.accounts,
    pending.jobs,
  );
  input.setPublishOverlay({
    mode: "progress",
    warnings: [...pending.warnings],
    rows: initialRows.map((row) =>
      row.jobIndex >= 0 && row.jobIndex < pending.jobs.length
        ? { ...row, phase: "posting" as const }
        : row,
    ),
    variant: "success",
  });
  input.setPosting(true);

  const responses: unknown[] = new Array(pending.jobs.length);

  try {
    await runUnifiedPostJobs({
      accessToken: token,
      workspaceId: ws,
      jobs: pending.jobs,
      onEachSettled: (jobIndex, result) => {
        if (result.ok) {
          responses[jobIndex] = result.data;
          input.setPublishOverlay((prev) => {
            if (!prev) {
              return prev;
            }
            return {
              ...prev,
              rows: applyJobResponseToRows(prev.rows, jobIndex, result.data),
            };
          });
        } else {
          const msg = result.message;
          responses[jobIndex] = {
            success: false,
            message: msg,
            error: "request_failed",
            results: [],
          };
          input.setPublishOverlay((prev) => {
            if (!prev) {
              return prev;
            }
            const nextRows = prev.rows.map((row) =>
              row.jobIndex === jobIndex
                ? {
                    ...row,
                    phase: "done" as const,
                    success: false,
                    message: msg,
                    error: "request_failed",
                    urls: [],
                  }
                : row,
            );
            return { ...prev, rows: nextRows };
          });
        }
      },
    });

    const filled = responses.filter((r) => r !== undefined);
    const everyOk =
      filled.length > 0 &&
      filled.every((r) => unifiedPostResponseAllSucceeded(r));
    input.setPublishOverlay((prev) => {
      if (!prev) {
        return prev;
      }
      return {
        ...prev,
        mode: "summary",
        variant: everyOk ? "success" : "partial",
      };
    });

    if (everyOk) {
      input.onPublishFullySucceeded?.(pending);
    }

    return everyOk;
  } catch (e) {
    input.onBlockingMessage(
      "Post failed",
      e instanceof Error ? e.message : "Unknown error",
    );
    input.setPublishOverlay(null);
    return false;
  } finally {
    input.setPosting(false);
  }
}
