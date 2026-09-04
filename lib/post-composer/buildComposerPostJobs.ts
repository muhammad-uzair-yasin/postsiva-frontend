import type { ComposerAttachedMedia } from "./composerAttachedMediaTypes";
import type { ComposerDraftScope, PerChannelDraftSnapshot } from "./composerDraftScopeTypes";
import type { ComposerPostingAccount } from "./composerPostingAccount";
import {
  type ComposerPostFormat,
  formatLinkPostUnsupportedChannelsMessage,
  validateMediaForPostFormat,
} from "./composerPostFormat";
import { inferComposerPostKind } from "./inferComposerPostKind";
import {
  inferWordPressComposerPostKind,
  mergeWordPressAttachedMediaFields,
} from "./inferWordPressComposerPostKind";
import {
  type UnifiedApiPlatform,
  filterPlatformsForComposerKind,
  iconPlatformToUnifiedApiPlatform,
} from "./unifiedPostingPlatforms";
import type { UnifiedPostingEndpoint } from "@/lib/social/unifiedPostingApi";
import {
  derivePinterestTitleAndDescriptionFromBody,
  deriveTiktokTitleAndCaptionFromBody,
  deriveYoutubeTitleAndDescriptionFromBody,
  validateComposerMainTextForJob,
} from "./composerMainTextCharLimits";
import { sanitizeYoutubeDescription } from "./validateYoutubeDescription";
import {
  validateComposerVideoDurationForJob,
  videoDurationFromMedia,
  videoFileSizeFromMedia,
} from "./composerVideoDurationLimits";
import { facebookLinkPostPublishBlockReasonHeuristic } from "@/lib/social/facebookLinkPostPublishBlock";
import { facebookLinkPublishBlockDisplayMessage } from "@/lib/social/facebookLinkPostPublishBlockMessage";
import {
  buildUnsupportedChannelsPostTypeMessage,
  getSupportedPostKindsForUnifiedPlatform,
  type UnsupportedChannelEntry,
} from "./postTypeChannelCompatibility";
import { validateBlueskyImageSize } from "./composerBlueskyImageLimits";

export interface ComposerPostJob {
  readonly label: string;
  readonly endpoint: UnifiedPostingEndpoint;
  readonly body: Record<string, unknown>;
  /** Maps this job to exactly one selected channel row (for progress + parallel posts). */
  readonly targetAccountId: string;
  /** When true, POST /unified/blog/post instead of /unified/post/{endpoint}. */
  readonly blogApi?: boolean;
}

function validateBlueskyImageSizeForJob(
  account: ComposerPostingAccount,
  kind: "text" | "image" | "video" | "carousel" | "document",
  media: readonly ComposerAttachedMedia[],
): string | null {
  if (
    account.platform !== "bluesky" ||
    (kind !== "image" && kind !== "carousel")
  ) {
    return null;
  }
  const message = validateBlueskyImageSize(media);
  return message ? `${account.displayName}: ${message}` : null;
}

function buildWordPressJobBody(
  kind: "text" | "image" | "video" | "carousel" | "document",
  platforms: UnifiedApiPlatform[],
  caption: string,
  media: readonly ComposerAttachedMedia[],
  wpBlock: Record<string, unknown>,
): Record<string, unknown> {
  const wpKind = kind === "document" ? "text" : kind;
  return mergeWordPressAttachedMediaFields(
    bodyForKind(wpKind, platforms, caption, media, wpBlock),
    media,
  );
}

function inferKindForAccount(
  media: readonly ComposerAttachedMedia[],
  account: ComposerPostingAccount,
): ReturnType<typeof inferComposerPostKind> {
  if (account.platform === "wordpress") {
    return inferWordPressComposerPostKind(media);
  }
  return inferComposerPostKind(media);
}

function buildNoChannelMessage(warnings: string[]): string {
  if (warnings.length === 0) {
    return "No channels left to post to. Try different media or destinations.";
  }
  if (warnings.length === 1) {
    return warnings[0];
  }
  return `No channels left to post to:\n- ${warnings.join("\n- ")}`;
}

function resolveTargets(
  postTargetIds: readonly string[],
  accounts: readonly ComposerPostingAccount[],
): ComposerPostingAccount[] {
  const byId = new Map(accounts.map((a) => [a.id, a]));
  const out: ComposerPostingAccount[] = [];
  for (const id of postTargetIds) {
    const a = byId.get(id);
    if (a) {
      out.push(a);
    }
  }
  return out;
}

function singleAccountOverrides(
  account: ComposerPostingAccount,
): Record<string, unknown> {
  if (account.platform === "linkedin") {
    if (account.id === "linkedin") {
      return { linkedin: { post_to_personal: true } };
    }
    if (account.id.startsWith("linkedin:org:")) {
      const pid = account.targetResourceId?.trim();
      if (pid) {
        return {
          linkedin: { linkedin_page_ids: [pid], post_to_personal: false },
        };
      }
    }
  }
  if (account.platform === "facebook") {
    const pid = account.targetResourceId?.trim();
    if (pid) {
      return { facebook: { facebook_page_ids: [pid] } };
    }
  }
  if (account.platform === "pinterest") {
    const bid = account.targetResourceId?.trim();
    if (bid) {
      return { pinterest: { board_id: bid } };
    }
  }
  return {};
}

function buildYoutubeVideoBlock(
  rawBody: string,
  youtubeTitle: string | null,
  youtubePlaylistId: string | null,
  youtubeThumbnailMediaId: string | null,
  youtubeGenerateThumbnail: boolean,
  youtubeMadeForKids: boolean,
): Record<string, unknown> | null {
  const { youtubeTitle: yt, youtubeDescription } =
    deriveYoutubeTitleAndDescriptionFromBody(rawBody, youtubeTitle);
  if (!yt) {
    return null;
  }
  const y: Record<string, unknown> = {
    youtube_title: yt,
    youtube_description: sanitizeYoutubeDescription(youtubeDescription),
    self_declared_made_for_kids: youtubeMadeForKids,
  };
  const pid = (youtubePlaylistId ?? "").trim();
  if (pid) {
    y.youtube_playlist_id = pid;
  }
  const tid = (youtubeThumbnailMediaId ?? "").trim();
  if (tid) {
    y.thumbnail_image_id = tid;
  } else if (youtubeGenerateThumbnail) {
    y.generate_thumbnail_from_content = true;
  }
  return { youtube: y };
}

function scopeYoutubeBlockToAccount(
  block: Record<string, unknown>,
  account: ComposerPostingAccount,
): Record<string, unknown> {
  const channelId = account.targetResourceId?.trim();
  const youtube = block.youtube;
  if (!channelId || !youtube || typeof youtube !== "object") return block;
  return {
    ...block,
    youtube: { ...(youtube as Record<string, unknown>), channel_id: channelId },
  };
}

export interface WordPressComposerFields {
  readonly title: string;
  readonly slug: string;
  readonly content: string;
  readonly excerpt: string;
  readonly categories: readonly number[];
  readonly tags: readonly number[];
  readonly suggestedCategoryNames?: readonly string[];
  readonly suggestedTagNames?: readonly string[];
  readonly featuredMediaId?: string | null;
  readonly featuredImageUrl?: string | null;
  readonly mediaPlacement?: "top" | "after_headings";
}

function buildWordPressBlock(
  account: ComposerPostingAccount,
  rawBody: string,
  wp: WordPressComposerFields | null,
): Record<string, unknown> {
  // Connection id is carried on the header account row as "wordpress:<id>".
  const connectionId = account.id.startsWith("wordpress:")
    ? account.id.replace(/^wordpress:/, "")
    : (account.targetResourceId ?? "").trim();
  const title = (wp?.title ?? "").trim();
  const content = (wp?.content ?? "").trim() || rawBody.trim();
  const block: Record<string, unknown> = {
    // Title falls back to the composer body, same convention as youtube_title.
    wordpress_title: title || rawBody.trim().slice(0, 500),
    media_placement: wp?.mediaPlacement ?? "after_headings",
  };
  if (connectionId) {
    block.connection_id = connectionId;
  }
  if (content) {
    block.wordpress_content = content;
  }
  const excerpt = (wp?.excerpt ?? "").trim();
  if (excerpt) {
    block.wordpress_excerpt = excerpt;
  }
  const slug = (wp?.slug ?? "").trim();
  if (slug) {
    block.wordpress_slug = slug;
  }
  if (wp?.categories?.length) {
    block.categories = [...wp.categories];
  }
  if (wp?.tags?.length) {
    block.tags = [...wp.tags];
  }
  const featured = (wp?.featuredMediaId ?? "").trim();
  if (featured) {
    block.featured_media_id = featured;
  }
  const featuredUrl = (wp?.featuredImageUrl ?? "").trim();
  if (featuredUrl) {
    block.featured_image_url = featuredUrl;
  }
  return { wordpress: block };
}

const WORDPRESS_DEFAULT_TEXT_MAX = 3000;

/** Full article lives in wordpress.wordpress_content; default_text must stay within API limits. */
function wordpressDefaultText(
  rawBody: string,
  wp: WordPressComposerFields | null,
): string {
  const fullContent = (wp?.content ?? "").trim() || rawBody.trim();
  const title = (wp?.title ?? "").trim();
  const excerpt = (wp?.excerpt ?? "").trim();
  if (fullContent.length <= WORDPRESS_DEFAULT_TEXT_MAX) {
    return fullContent;
  }
  const short = excerpt || title || fullContent.slice(0, 500);
  return short.slice(0, WORDPRESS_DEFAULT_TEXT_MAX);
}

function buildUnifiedDestinationOverrides(
  account: ComposerPostingAccount,
  kind: "text" | "image" | "video" | "carousel" | "document",
  rawBody: string,
  youtubeTitle: string | null,
  pinterestTitle: string | null,
  tiktokTitle: string | null,
  youtubePlaylistId: string | null,
  youtubeThumbnailMediaId: string | null,
  youtubeGenerateThumbnail: boolean,
  youtubeMadeForKids: boolean,
  linkedinThumbnailMediaId: string | null,
  linkedinGenerateThumbnail: boolean,
  wordpress: WordPressComposerFields | null,
): Record<string, unknown> {
  const accountOverrides = singleAccountOverrides(account);
  if (account.platform === "wordpress") {
    return buildWordPressBlock(account, rawBody, wordpress);
  }
  if (account.platform === "youtube" && kind === "video") {
    const block = buildYoutubeVideoBlock(
      rawBody,
      youtubeTitle,
      youtubePlaylistId,
      youtubeThumbnailMediaId,
      youtubeGenerateThumbnail,
      youtubeMadeForKids,
    );
    if (!block) {
      return {};
    }
    return scopeYoutubeBlockToAccount(block, account);
  }
  if (account.platform === "pinterest") {
    const bid = account.targetResourceId?.trim();
    if (!bid) {
      return {};
    }
    const { pinterestTitle: pinTitle, pinterestDescription } =
      derivePinterestTitleAndDescriptionFromBody(rawBody, pinterestTitle);
    return {
      pinterest: {
        board_id: bid,
        ...(pinTitle ? { pinterest_text: pinTitle } : {}),
        ...(pinterestDescription ? { pinterest_description: pinterestDescription } : {}),
      },
    };
  }
  if (account.platform === "linkedin" && kind === "video") {
    const thumbId = (linkedinThumbnailMediaId ?? "").trim();
    const baseLinkedIn = (accountOverrides.linkedin ?? {}) as Record<string, unknown>;
    if (thumbId) {
      return {
        ...accountOverrides,
        linkedin: { ...baseLinkedIn, thumbnail_image_id: thumbId },
      };
    }
    if (linkedinGenerateThumbnail) {
      return {
        ...accountOverrides,
        linkedin: { ...baseLinkedIn, generate_thumbnail_from_content: true },
      };
    }
  }
  if (
    account.platform === "tiktok" &&
    (kind === "image" || kind === "carousel")
  ) {
    const { tiktokTitle: tT, tiktokCaption } = deriveTiktokTitleAndCaptionFromBody(
      rawBody,
      tiktokTitle,
    );
    return {
      tiktok: {
        tiktok_text: tiktokCaption,
        ...(tT ? { tiktok_title: tT } : {}),
      },
    };
  }
  return accountOverrides;
}

function bodyForKind(
  kind: "text" | "image" | "video" | "carousel" | "document" | "reel" | "story" | "link",
  platforms: UnifiedApiPlatform[],
  caption: string,
  media: readonly ComposerAttachedMedia[],
  extra: Record<string, unknown>,
): Record<string, unknown> {
  const base: Record<string, unknown> = {
    platforms,
    visibility: "PUBLIC",
    ...extra,
  };
  if (kind === "text") {
    return { ...base, default_text: caption };
  }
  if (kind === "document") {
    const doc = media.find((m) => m.mediaType === "document");
    return {
      ...base,
      document_id: doc?.mediaId,
      ...(doc?.publicUrl && !doc?.mediaId
        ? { document_url: doc.publicUrl }
        : {}),
      ...(doc?.filename ? { document_title: doc.filename } : {}),
      ...(caption ? { default_text: caption } : {}),
    };
  }
  if (kind === "image") {
    const image = media.find((m) => m.mediaType === "image");
    return {
      ...base,
      default_image_id: image?.mediaId || undefined,
      ...(image?.publicUrl && !image.mediaId
        ? { default_image_url: image.publicUrl }
        : {}),
      ...(caption ? { default_text: caption } : {}),
    };
  }
  if (kind === "carousel") {
    const images = media.filter((m) => m.mediaType === "image");
    const ids = images.map((m) => m.mediaId?.trim() || "");
    const urls = images.map((m) =>
      !m.mediaId?.trim() && m.publicUrl?.trim() ? m.publicUrl.trim() : "",
    );
    const hasIds = ids.some((id) => id.length > 0);
    const hasUrls = urls.some((url) => url.length > 0);
    return {
      ...base,
      ...(hasIds ? { image_ids: ids } : {}),
      ...(hasUrls ? { image_urls: urls } : {}),
      ...(caption ? { default_text: caption } : {}),
    };
  }
  if (kind === "reel") {
    const v = media.find((m) => m.mediaType === "video");
    const reelBody: Record<string, unknown> = {
      ...base,
      ...(caption ? { default_text: caption } : {}),
    };
    if (v?.mediaId) {
      reelBody.video_id = v.mediaId;
    } else if (v?.publicUrl?.trim()) {
      reelBody.video_url = v.publicUrl.trim();
    }
    return reelBody;
  }
  if (kind === "link") {
    const cap = String(extra.default_text ?? "").trim();
    return {
      ...base,
      link_url: caption.trim(),
      ...(cap ? { default_text: cap } : {}),
    };
  }
  if (kind === "story") {
    const v = media.find((m) => m.mediaType === "video");
    const img = media.find((m) => m.mediaType === "image");
    if (v) {
      const storyVideo: Record<string, unknown> = { ...base };
      if (v.mediaId) {
        storyVideo.video_id = v.mediaId;
      } else if (v.publicUrl?.trim()) {
        storyVideo.video_url = v.publicUrl.trim();
      }
      return storyVideo;
    }
    return {
      ...base,
      default_image_id: img?.mediaId,
      ...(img?.publicUrl && !img.mediaId
        ? { default_image_url: img.publicUrl }
        : {}),
    };
  }
  const v = media.find((m) => m.mediaType === "video");
  const title = caption.trim().length > 0 ? caption : "Video";
  const videoBody: Record<string, unknown> = {
    ...base,
    default_text: title,
  };
  if (v?.mediaId) {
    videoBody.video_id = v.mediaId;
  } else if (v?.publicUrl?.trim()) {
    videoBody.video_url = v.publicUrl.trim();
  }
  return videoBody;
}

export function buildComposerPostJobs(input: {
  readonly draftScope: ComposerDraftScope;
  readonly postTargetIds: readonly string[];
  readonly accounts: readonly ComposerPostingAccount[];
  readonly unifiedBody: string;
  readonly unifiedMedia: readonly ComposerAttachedMedia[];
  readonly perChannelDrafts: Readonly<Record<string, PerChannelDraftSnapshot>>;
  readonly youtubeTitle: string | null;
  /** Optional YouTube playlist id (long-form video). */
  readonly youtubePlaylistId: string | null;
  readonly youtubeThumbnailMediaId: string | null;
  readonly youtubeGenerateThumbnail: boolean;
  readonly youtubeMadeForKids: boolean;
  readonly linkedinThumbnailMediaId: string | null;
  readonly linkedinGenerateThumbnail: boolean;
  readonly pinterestTitle: string | null;
  readonly tiktokTitle: string | null;
  /** WordPress composer fields; without these a blog post publishes untitled. */
  readonly wordpress?: WordPressComposerFields | null;
  /** Explicit format when FB/IG selected: standard | reel | story | link. */
  readonly postFormat?: ComposerPostFormat;
  /** Facebook link URL when postFormat is link. */
  readonly facebookLinkUrl?: string;
}):
  | { readonly ok: true; readonly jobs: ComposerPostJob[]; readonly warnings: string[] }
  | { readonly ok: false; readonly message: string } {
  const format: ComposerPostFormat = input.postFormat ?? "standard";
  if (format === "reel" || format === "story") {
    return buildMetaShortFormJobs(input, format);
  }
  if (format === "link") {
    return buildFacebookLinkJobs(input);
  }

  const targets = resolveTargets(input.postTargetIds, input.accounts);
  if (targets.length === 0) {
    return { ok: false, message: "Kindly select at least one platform before posting." };
  }

  const warnings: string[] = [];
  const unsupportedForPostKind: UnsupportedChannelEntry[] = [];

  if (input.draftScope === "per_channel") {
    const jobs: ComposerPostJob[] = [];
    for (const account of targets) {
      const apiPlat = iconPlatformToUnifiedApiPlatform(account.platform);
      if (!apiPlat) {
        continue;
      }
      const draft = input.perChannelDrafts[account.id] ?? { body: "", media: [] };
      const inferred = inferKindForAccount(draft.media, account);
      if (!inferred.ok) {
        return {
          ok: false,
          message: `${account.displayName}: ${inferred.message}`,
        };
      }
      const kind = inferred.kind;
      const rawBody = draft.body;
      const cap = rawBody.trim();
      if (kind === "text" && cap.length === 0) {
        return {
          ok: false,
          message: `Add text for ${account.displayName} (text posts need a caption).`,
        };
      }
      if (kind === "document" && !draft.media.some((m) => m.mediaType === "document")) {
        return {
          ok: false,
          message: `Attach a document for ${account.displayName}.`,
        };
      }
      const blueskyImageErr = validateBlueskyImageSizeForJob(
        account,
        kind,
        draft.media,
      );
      if (blueskyImageErr) {
        return { ok: false, message: blueskyImageErr };
      }
      if (
        (kind === "image" || kind === "carousel" || kind === "video") &&
        account.platform === "pinterest"
      ) {
        const bid = account.targetResourceId?.trim();
        if (!bid) {
          return {
            ok: false,
            message: `Pick a Pinterest board for ${account.displayName} (required for Pinterest posts).`,
          };
        }
      }
      const { allowed, skipped } = filterPlatformsForComposerKind([apiPlat], kind);
      if (skipped.length > 0) {
        unsupportedForPostKind.push({
          channelLabel: account.displayName,
          unifiedPlatform: apiPlat,
          postKind: kind,
          supportedKinds: getSupportedPostKindsForUnifiedPlatform(apiPlat),
        });
        continue;
      }
      if (allowed.length === 0) {
        continue;
      }
      const baseOverrides = singleAccountOverrides(account);
      if (account.platform === "wordpress") {
        const wpFields = input.wordpress ?? null;
        const body = buildWordPressJobBody(
          kind,
          allowed,
          wordpressDefaultText(rawBody, wpFields),
          draft.media,
          buildWordPressBlock(account, rawBody, wpFields),
        );
        jobs.push({
          label: account.displayName,
          endpoint: kind,
          body,
          targetAccountId: account.id,
        });
        continue;
      }
      if (kind === "video" && allowed.includes("youtube")) {
        const ytBlock = buildYoutubeVideoBlock(
          rawBody,
          input.youtubeTitle,
          input.youtubePlaylistId,
          input.youtubeThumbnailMediaId,
          input.youtubeGenerateThumbnail,
          input.youtubeMadeForKids,
        );
        if (!ytBlock) {
          return {
            ok: false,
            message:
              "YouTube requires a title. Add the YouTube video title above, or set it in the first line of your description.",
          };
        }
        const overrides: Record<string, unknown> = scopeYoutubeBlockToAccount({
          ...baseOverrides,
          ...ytBlock,
        }, account);

        const body = bodyForKind(kind, allowed, cap, draft.media, overrides);
        const textErr = validateComposerMainTextForJob({
          account,
          kind,
          rawBody,
          youtubeExplicitTitle: input.youtubeTitle,
          pinterestExplicitTitle: input.pinterestTitle,
          tiktokExplicitTitle: input.tiktokTitle,
        });
        if (textErr) {
          return { ok: false, message: textErr };
        }
        if (kind === "video") {
          const videoErr = validateComposerVideoDurationForJob({
            account,
            durationSeconds: videoDurationFromMedia(draft.media),
            fileSizeBytes: videoFileSizeFromMedia(draft.media),
            postFormat: format,
          });
          if (videoErr) {
            return { ok: false, message: videoErr };
          }
        }
        jobs.push({
          label: account.displayName,
          endpoint: kind,
          body,
          targetAccountId: account.id,
        });
        continue;
      }

      if (
        (kind === "image" || kind === "carousel") &&
        account.platform === "tiktok"
      ) {
        const { tiktokTitle: tT, tiktokCaption } =
          deriveTiktokTitleAndCaptionFromBody(rawBody, input.tiktokTitle);
        const tiktokOverrides: Record<string, unknown> = {
          ...baseOverrides,
          tiktok: {
            tiktok_text: tiktokCaption,
            ...(tT ? { tiktok_title: tT } : {}),
          },
        };
        const bodyTik = bodyForKind(kind, allowed, cap, draft.media, tiktokOverrides);
        const textErrTik = validateComposerMainTextForJob({
          account,
          kind,
          rawBody,
          youtubeExplicitTitle: input.youtubeTitle,
          pinterestExplicitTitle: input.pinterestTitle,
          tiktokExplicitTitle: input.tiktokTitle,
        });
        if (textErrTik) {
          return { ok: false, message: textErrTik };
        }
        jobs.push({
          label: account.displayName,
          endpoint: kind,
          body: bodyTik,
          targetAccountId: account.id,
        });
        continue;
      }

      const overrides: Record<string, unknown> = { ...baseOverrides };
      if (kind === "video" && account.platform === "linkedin") {
        const thumbId = (input.linkedinThumbnailMediaId ?? "").trim();
        const baseLinkedIn = (baseOverrides.linkedin ?? {}) as Record<string, unknown>;
        if (thumbId) {
          overrides.linkedin = {
            ...baseLinkedIn,
            thumbnail_image_id: thumbId,
          };
        } else if (input.linkedinGenerateThumbnail) {
          overrides.linkedin = {
            ...baseLinkedIn,
            generate_thumbnail_from_content: true,
          };
        }
      }
      if (typeof overrides !== "object" || overrides === null) {
        return {
          ok: false,
          message: "Failed to build YouTube overrides.",
        };
      }
      const body = bodyForKind(kind, allowed, cap, draft.media, overrides);
      const textErr2 = validateComposerMainTextForJob({
        account,
        kind,
        rawBody,
        youtubeExplicitTitle: input.youtubeTitle,
        pinterestExplicitTitle: input.pinterestTitle,
        tiktokExplicitTitle: input.tiktokTitle,
      });
      if (textErr2) {
        return { ok: false, message: textErr2 };
      }
      if (kind === "video") {
        const videoErr = validateComposerVideoDurationForJob({
          account,
          durationSeconds: videoDurationFromMedia(draft.media),
          fileSizeBytes: videoFileSizeFromMedia(draft.media),
          postFormat: format,
        });
        if (videoErr) {
          return { ok: false, message: videoErr };
        }
      }
      jobs.push({
        label: account.displayName,
        endpoint: kind,
        body,
        targetAccountId: account.id,
      });
    }
    if (unsupportedForPostKind.length > 0) {
      return {
        ok: false,
        message: buildUnsupportedChannelsPostTypeMessage(unsupportedForPostKind),
      };
    }
    if (jobs.length === 0) {
      return { ok: false, message: buildNoChannelMessage(warnings) };
    }
    return { ok: true, jobs, warnings };
  }

  const hasOnlyWordPress =
    targets.length > 0 &&
    targets.every((t) => t.platform === "wordpress");
  const inferred = hasOnlyWordPress
    ? inferWordPressComposerPostKind(input.unifiedMedia)
    : inferComposerPostKind(input.unifiedMedia);
  if (!inferred.ok) {
    return { ok: false, message: inferred.message };
  }
  const kind = inferred.kind;
  const rawBody = input.unifiedBody;
  const cap = rawBody.trim();
  if (kind === "text" && cap.length === 0) {
    return { ok: false, message: "Add text before posting." };
  }
  if (kind === "document" && !input.unifiedMedia.some((m) => m.mediaType === "document")) {
    return { ok: false, message: "Attach a PDF or document file before posting." };
  }

  const hasYoutubeTarget = targets.some(
    (t) => iconPlatformToUnifiedApiPlatform(t.platform) === "youtube",
  );
  if (kind === "video" && hasYoutubeTarget) {
    const { youtubeTitle: ytRequired } = deriveYoutubeTitleAndDescriptionFromBody(
      rawBody,
      input.youtubeTitle,
    );
    if (!ytRequired) {
      return {
        ok: false,
        message:
          "YouTube requires a title. Add the YouTube video title above, or set it in the first line of your description.",
      };
    }
  }

  const jobs: ComposerPostJob[] = [];
  const unifiedTextErrors: string[] = [];
  const unifiedVideoErrors: string[] = [];
  const unifiedImageErrors: string[] = [];
  const textGuidance =
    "Deselect that platform, or switch to Per platform specific mode to write different text per platform.";

  for (const account of targets) {
    if (account.platform === "pinterest") {
      if (kind === "text") {
        const apiPlat = iconPlatformToUnifiedApiPlatform(account.platform);
        if (apiPlat) {
          unsupportedForPostKind.push({
            channelLabel: account.displayName,
            unifiedPlatform: apiPlat,
            postKind: kind,
            supportedKinds: getSupportedPostKindsForUnifiedPlatform(apiPlat),
          });
        }
        continue;
      }
      const bid = account.targetResourceId?.trim();
      if (!bid) {
        return {
          ok: false,
          message:
            "Choose a Pinterest board (required for Pinterest image, carousel, or video posts).",
        };
      }
      const { allowed: pa, skipped: pSkipped } = filterPlatformsForComposerKind(
        ["pinterest"],
        kind,
      );
      if (pSkipped.length > 0 || pa.length === 0) {
        warnings.push(
          `${account.displayName}: Pinterest skipped for this post type.`,
        );
        continue;
      }
      const pinterestErr = validateComposerMainTextForJob({
        account,
        kind,
        rawBody,
        youtubeExplicitTitle: input.youtubeTitle,
        pinterestExplicitTitle: input.pinterestTitle,
        tiktokExplicitTitle: input.tiktokTitle,
      });
      if (pinterestErr) {
        return { ok: false, message: pinterestErr };
      }
      const { pinterestTitle, pinterestDescription } =
        derivePinterestTitleAndDescriptionFromBody(rawBody, input.pinterestTitle);
      jobs.push({
        label: `Pinterest · ${account.displayName}`,
        endpoint: kind,
        body: bodyForKind(kind, ["pinterest"], cap, input.unifiedMedia, {
          pinterest: {
            board_id: bid,
            ...(pinterestTitle ? { pinterest_text: pinterestTitle } : {}),
            ...(pinterestDescription
              ? { pinterest_description: pinterestDescription }
              : {}),
          },
        }),
        targetAccountId: account.id,
      });
      continue;
    }

    const apiPlat = iconPlatformToUnifiedApiPlatform(account.platform);
    if (!apiPlat) {
      continue;
    }

    const { allowed, skipped } = filterPlatformsForComposerKind([apiPlat], kind);
    if (skipped.length > 0) {
      unsupportedForPostKind.push({
        channelLabel: account.displayName,
        unifiedPlatform: apiPlat,
        postKind: kind,
        supportedKinds: getSupportedPostKindsForUnifiedPlatform(apiPlat),
      });
      continue;
    }
    if (allowed.length === 0) {
      continue;
    }

    if (account.platform === "linkedin" && account.id.startsWith("linkedin:org:")) {
      if (!account.targetResourceId?.trim()) {
        warnings.push(
          `${account.displayName}: missing LinkedIn page id, skipped.`,
        );
        continue;
      }
    }
    if (account.platform === "facebook" && !account.targetResourceId?.trim()) {
      warnings.push(`${account.displayName}: missing Facebook page id, skipped.`);
      continue;
    }

    const extra = buildUnifiedDestinationOverrides(
      account,
      kind,
      rawBody,
      input.youtubeTitle,
      input.pinterestTitle,
      input.tiktokTitle,
      input.youtubePlaylistId,
      input.youtubeThumbnailMediaId,
      input.youtubeGenerateThumbnail,
      input.youtubeMadeForKids,
      input.linkedinThumbnailMediaId,
      input.linkedinGenerateThumbnail,
      input.wordpress ?? null,
    );

    const unifiedErr = validateComposerMainTextForJob({
      account,
      kind,
      rawBody,
      youtubeExplicitTitle: input.youtubeTitle,
      pinterestExplicitTitle: input.pinterestTitle,
      tiktokExplicitTitle: input.tiktokTitle,
    });
    if (unifiedErr) {
      unifiedTextErrors.push(unifiedErr);
      continue;
    }
    if (kind === "video") {
      const videoErr = validateComposerVideoDurationForJob({
        account,
        durationSeconds: videoDurationFromMedia(input.unifiedMedia),
        fileSizeBytes: videoFileSizeFromMedia(input.unifiedMedia),
        postFormat: format,
      });
      if (videoErr) {
        unifiedVideoErrors.push(videoErr);
        continue;
      }
    }
    const blueskyImageErr = validateBlueskyImageSizeForJob(
      account,
      kind,
      input.unifiedMedia,
    );
    if (blueskyImageErr) {
      unifiedImageErrors.push(blueskyImageErr);
      continue;
    }
    const captionForDefault =
      account.platform === "wordpress"
        ? wordpressDefaultText(rawBody, input.wordpress ?? null)
        : cap;
    const jobBody =
      account.platform === "wordpress"
        ? buildWordPressJobBody(
            kind,
            allowed,
            captionForDefault,
            input.unifiedMedia,
            extra,
          )
        : bodyForKind(kind, allowed, captionForDefault, input.unifiedMedia, extra);
    jobs.push({
      label: account.displayName,
      endpoint: kind,
      body: jobBody,
      targetAccountId: account.id,
    });
  }

  if (unifiedTextErrors.length > 0) {
    const cleaned = unifiedTextErrors.map((m) =>
      m.replace(` ${textGuidance}`, "").trim(),
    );
    return {
      ok: false,
      message: `${cleaned.join("\n")}\n${textGuidance}`,
    };
  }

  if (unifiedVideoErrors.length > 0) {
    return {
      ok: false,
      message: unifiedVideoErrors.join("\n"),
    };
  }

  if (unifiedImageErrors.length > 0) {
    return {
      ok: false,
      message: unifiedImageErrors.join("\n"),
    };
  }

  if (unsupportedForPostKind.length > 0) {
    return {
      ok: false,
      message: buildUnsupportedChannelsPostTypeMessage(unsupportedForPostKind),
    };
  }
  if (jobs.length === 0) {
    return {
      ok: false,
      message: buildNoChannelMessage(warnings),
    };
  }

  return { ok: true, jobs, warnings };
}

function buildMetaShortFormJobs(
  input: {
    readonly draftScope: ComposerDraftScope;
    readonly postTargetIds: readonly string[];
    readonly accounts: readonly ComposerPostingAccount[];
    readonly unifiedBody: string;
    readonly unifiedMedia: readonly ComposerAttachedMedia[];
    readonly perChannelDrafts: Readonly<Record<string, PerChannelDraftSnapshot>>;
  },
  format: "reel" | "story",
):
  | { readonly ok: true; readonly jobs: ComposerPostJob[]; readonly warnings: string[] }
  | { readonly ok: false; readonly message: string } {
  const targets = resolveTargets(input.postTargetIds, input.accounts);
  if (targets.length === 0) {
    return { ok: false, message: "Kindly select at least one platform before posting." };
  }
  const endpoint: UnifiedPostingEndpoint = format;
  const jobs: ComposerPostJob[] = [];
  const unsupported: string[] = [];
  const warnings: string[] = [];

  for (const account of targets) {
    const apiPlat = iconPlatformToUnifiedApiPlatform(account.platform);
    if (!apiPlat) {
      continue;
    }
    const draft =
      input.draftScope === "per_channel"
        ? (input.perChannelDrafts[account.id] ?? { body: "", media: [] })
        : { body: input.unifiedBody, media: [...input.unifiedMedia] };
    const mediaCheck = validateMediaForPostFormat(format, draft.media);
    if (!mediaCheck.ok) {
      return { ok: false, message: `${account.displayName}: ${mediaCheck.message}` };
    }
    const videoErr = validateComposerVideoDurationForJob({
      account,
      durationSeconds: videoDurationFromMedia(draft.media),
      fileSizeBytes: videoFileSizeFromMedia(draft.media),
      postFormat: format,
    });
    if (videoErr) {
      return { ok: false, message: videoErr };
    }
    const { allowed, skipped } = filterPlatformsForComposerKind([apiPlat], format);
    if (skipped.length > 0 || allowed.length === 0) {
      unsupported.push(
        `${account.displayName}: ${format === "reel" ? "Reel" : "Story"} is only available on Facebook and Instagram.`,
      );
      continue;
    }
    if (account.platform === "facebook" && !account.targetResourceId?.trim()) {
      warnings.push(`${account.displayName}: missing Facebook page id, skipped.`);
      continue;
    }
    const overrides = singleAccountOverrides(account);
    if (account.platform === "instagram" && format === "reel") {
      overrides.instagram = {
        ...((overrides.instagram as Record<string, unknown> | undefined) ?? {}),
        share_to_feed: true,
      };
    }
    const caption = format === "reel" ? draft.body.trim() : "";
    jobs.push({
      label: account.displayName,
      endpoint,
      body: bodyForKind(format, allowed, caption, draft.media, overrides),
      targetAccountId: account.id,
    });
  }

  if (unsupported.length > 0) {
    return {
      ok: false,
      message: [
        "Some of your selected channels cannot receive this post format.",
        "",
        ...unsupported.map((u) => `- ${u}`),
        "",
        "Remove unsupported channels, or switch Post format back to Standard.",
      ].join("\n"),
    };
  }
  if (jobs.length === 0) {
    return { ok: false, message: buildNoChannelMessage(warnings) };
  }
  return { ok: true, jobs, warnings };
}

function buildFacebookLinkJobs(
  input: {
    readonly draftScope: ComposerDraftScope;
    readonly postTargetIds: readonly string[];
    readonly accounts: readonly ComposerPostingAccount[];
    readonly unifiedBody: string;
    readonly unifiedMedia: readonly ComposerAttachedMedia[];
    readonly perChannelDrafts: Readonly<Record<string, PerChannelDraftSnapshot>>;
    readonly facebookLinkUrl?: string;
  },
):
  | { readonly ok: true; readonly jobs: ComposerPostJob[]; readonly warnings: string[] }
  | { readonly ok: false; readonly message: string } {
  const targets = resolveTargets(input.postTargetIds, input.accounts);
  if (targets.length === 0) {
    return { ok: false, message: "Kindly select at least one platform before posting." };
  }
  const linkUrl = (input.facebookLinkUrl ?? "").trim();
  if (!linkUrl) {
    return { ok: false, message: "Enter the link URL for your Facebook link post." };
  }
  const linkBlock = facebookLinkPostPublishBlockReasonHeuristic(linkUrl);
  if (linkBlock) {
    const message = facebookLinkPublishBlockDisplayMessage(linkBlock);
    return { ok: false, message: message ?? linkBlock };
  }
  const jobs: ComposerPostJob[] = [];
  const warnings: string[] = [];
  const unsupportedAccounts: ComposerPostingAccount[] = [];

  for (const account of targets) {
    const apiPlat = iconPlatformToUnifiedApiPlatform(account.platform);
    if (!apiPlat) continue;
    const draft =
      input.draftScope === "per_channel"
        ? (input.perChannelDrafts[account.id] ?? { body: "", media: [] })
        : { body: input.unifiedBody, media: [...input.unifiedMedia] };
    const mediaCheck = validateMediaForPostFormat("link", draft.media);
    if (!mediaCheck.ok) {
      return { ok: false, message: `${account.displayName}: ${mediaCheck.message}` };
    }
    const { allowed, skipped } = filterPlatformsForComposerKind([apiPlat], "link");
    if (skipped.length > 0 || allowed.length === 0) {
      unsupportedAccounts.push(account);
      continue;
    }
    if (!account.targetResourceId?.trim()) {
      warnings.push(`${account.displayName}: missing Facebook page id, skipped.`);
      continue;
    }
    const caption = draft.body.trim();
    const overrides = singleAccountOverrides(account);
    jobs.push({
      label: account.displayName,
      endpoint: "link",
      body: bodyForKind("link", allowed, linkUrl, [], {
        ...overrides,
        default_text: caption,
      }),
      targetAccountId: account.id,
    });
  }

  if (unsupportedAccounts.length > 0) {
    return {
      ok: false,
      message: formatLinkPostUnsupportedChannelsMessage(unsupportedAccounts),
    };
  }
  if (jobs.length === 0) {
    return { ok: false, message: buildNoChannelMessage(warnings) };
  }
  return { ok: true, jobs, warnings };
}
