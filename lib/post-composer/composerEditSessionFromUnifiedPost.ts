import type { ComposerAttachedMedia } from "./composerAttachedMediaTypes";
import {
  emptyComposerSessionCacheSnapshot,
  type ComposerSessionCacheSnapshot,
} from "./composerSessionCache";
import {
  composerSessionSnapshotFromWordPressHydrated,
  hydrateWordPressComposerFromDraft,
  hydrateWordPressComposerFromScheduled,
  wordpressHeaderAccountId,
} from "./hydrateWordPressComposerFromPostData";
import type { UnifiedDraftResponseJson } from "@/lib/social/unifiedDraftsApi";
import type { UnifiedScheduledPostItemJson } from "@/lib/social/unifiedScheduledPostsApi";
import type { WorkspaceHeaderAccountRow } from "@/lib/workspace/headerAccountsTypes";
import {
  parseWordPressFromScheduledPostData,
  wordpressScheduledCaption,
  wordpressScheduledFeaturedImageUrl,
} from "./parseWordPressScheduledPostData";

function syntheticDraftFromScheduled(
  item: UnifiedScheduledPostItemJson,
): UnifiedDraftResponseJson {
  const pd = item.post_data ?? {};
  const isWordPress = item.platform?.trim().toLowerCase() === "wordpress";
  const text = isWordPress
    ? wordpressScheduledCaption(pd)
    : (() => {
        const textRaw = pd.default_text ?? pd.text ?? pd.caption;
        return typeof textRaw === "string" ? textRaw : "";
      })();
  const wp = isWordPress ? parseWordPressFromScheduledPostData(pd) : null;
  const featuredUrl = isWordPress
    ? wordpressScheduledFeaturedImageUrl(pd)
    : typeof pd.default_image_url === "string"
      ? pd.default_image_url
      : null;

  return {
    id: item.scheduled_post_id,
    platform: item.platform,
    platform_user_id: item.platform_user_id,
    post_type: item.post_type,
    status: item.status,
    default_text: text,
    default_image_id:
      typeof pd.default_image_id === "string" ? pd.default_image_id : null,
    default_image_url: featuredUrl,
    image_ids: Array.isArray(pd.image_ids) ? (pd.image_ids as string[]) : null,
    image_urls: Array.isArray(pd.image_urls) ? (pd.image_urls as string[]) : null,
    video_id: typeof pd.video_id === "string" ? pd.video_id : null,
    video_url: typeof pd.video_url === "string" ? pd.video_url : null,
    wordpress: wp
      ? {
          wordpress_title: wp.wordpress_title ?? null,
          wordpress_content: wp.wordpress_content ?? null,
          wordpress_excerpt: wp.wordpress_excerpt ?? null,
          wordpress_slug: wp.wordpress_slug ?? null,
          categories: wp.categories ? [...wp.categories] : null,
          tags: wp.tags ? [...wp.tags] : null,
          suggested_category_names: wp.suggested_category_names
            ? [...wp.suggested_category_names]
            : null,
          suggested_tag_names: wp.suggested_tag_names
            ? [...wp.suggested_tag_names]
            : null,
          featured_media_id: wp.featured_media_id ?? null,
          featured_image_url: wp.featured_image_url ?? null,
          connection_id: wp.connection_id ?? null,
          media_placement: wp.media_placement ?? null,
        }
      : null,
  };
}

function asMedia(
  mediaId: string | null | undefined,
  publicUrl: string | null | undefined,
  mediaType: "image" | "video",
  filename: string,
): ComposerAttachedMedia | null {
  const id = mediaId?.trim() ?? "";
  const url = publicUrl?.trim() ?? "";
  if (!id && !url) {
    return null;
  }
  return {
    mediaId: id,
    publicUrl: url,
    mediaType,
    filename,
  };
}

function attachedMediaFromDraftFields(input: {
  readonly default_image_id?: string | null;
  readonly default_image_url?: string | null;
  readonly image_ids?: readonly string[] | null;
  readonly image_urls?: readonly string[] | null;
  readonly video_id?: string | null;
  readonly video_url?: string | null;
  readonly featured_media_id?: string | null;
  readonly featured_image_url?: string | null;
}): ComposerAttachedMedia[] {
  const out: ComposerAttachedMedia[] = [];

  const video = asMedia(
    input.video_id,
    input.video_url,
    "video",
    "draft-video",
  );
  if (video) {
    out.push(video);
    return out;
  }

  const imageIds = input.image_ids ?? [];
  const imageUrls = input.image_urls ?? [];
  if (imageIds.length >= 2 || imageUrls.length >= 2) {
    const count = Math.max(imageIds.length, imageUrls.length);
    for (let i = 0; i < count; i += 1) {
      const img = asMedia(
        imageIds[i] ?? null,
        imageUrls[i] ?? null,
        "image",
        `draft-image-${i + 1}`,
      );
      if (img) {
        out.push(img);
      }
    }
    return out;
  }

  const defaultImg = asMedia(
    input.default_image_id,
    input.default_image_url,
    "image",
    "draft-image",
  );
  if (defaultImg) {
    out.push(defaultImg);
    return out;
  }

  const featured = asMedia(
    input.featured_media_id,
    input.featured_image_url,
    "image",
    "draft-featured",
  );
  if (featured) {
    out.push(featured);
  }

  return out;
}

function normalizePlatform(raw: string): string {
  const p = raw.trim().toLowerCase();
  return p === "twitter" ? "x" : p;
}

function iconPlatformForDraft(platform: string): WorkspaceHeaderAccountRow["iconId"] {
  const p = normalizePlatform(platform);
  if (p === "x") {
    return "x";
  }
  return p as WorkspaceHeaderAccountRow["iconId"];
}

/** Pick header account row id for a unified draft / scheduled row. */
export function resolveLockedHeaderAccountIdForUnifiedPost(
  platform: string,
  platformUserId: string | undefined,
  draft: UnifiedDraftResponseJson,
  accounts: readonly WorkspaceHeaderAccountRow[],
): string {
  const plat = normalizePlatform(platform);
  const selectable = accounts.filter((a) => !a.disabled);

  if (plat === "wordpress") {
    const connectionId =
      platformUserId?.trim() ??
      draft.wordpress?.connection_id?.trim() ??
      "";
    const id = wordpressHeaderAccountId(connectionId);
    return selectable.find((a) => a.id === id)?.id ?? id;
  }

  const resourceIds = new Set<string>();
  const uid = platformUserId?.trim();
  if (uid) {
    resourceIds.add(uid);
  }
  if (plat === "facebook") {
    for (const pageId of draft.facebook_page_ids ?? []) {
      const pid = pageId?.trim();
      if (pid) {
        resourceIds.add(pid);
      }
    }
  }
  if (plat === "linkedin") {
    for (const orgId of draft.linkedin_page_ids ?? []) {
      const oid = orgId?.trim();
      if (oid) {
        resourceIds.add(oid);
      }
    }
  }

  for (const account of selectable) {
    if (account.iconId !== iconPlatformForDraft(plat)) {
      continue;
    }
    const target = account.targetResourceId?.trim();
    if (target && resourceIds.has(target)) {
      return account.id;
    }
  }

  for (const account of selectable) {
    if (account.iconId !== iconPlatformForDraft(plat)) {
      continue;
    }
    if (uid && account.id.includes(uid)) {
      return account.id;
    }
  }

  if (plat === "facebook" && draft.facebook_page_ids?.[0]?.trim()) {
    const pid = draft.facebook_page_ids[0].trim();
    const candidate = selectable.find((a) => a.id.includes(pid));
    if (candidate) {
      return candidate.id;
    }
  }

  return (
    selectable.find((a) => a.iconId === iconPlatformForDraft(plat))?.id ?? ""
  );
}

export function composerSessionSnapshotFromSocialUnifiedDraft(
  draft: UnifiedDraftResponseJson,
  lockedAccountId: string,
): ComposerSessionCacheSnapshot {
  const empty = emptyComposerSessionCacheSnapshot();
  const body =
    typeof draft.default_text === "string" ? draft.default_text.trim() : "";
  const media = attachedMediaFromDraftFields({
    default_image_id: draft.default_image_id,
    default_image_url: draft.default_image_url,
    image_ids: draft.image_ids,
    image_urls: draft.image_urls,
    video_id: draft.video_id,
    video_url: draft.video_url,
  });
  return {
    ...empty,
    unifiedBody: body,
    unifiedMedia: media,
    selectedIds: lockedAccountId.trim() ? [lockedAccountId.trim()] : [],
    livePreviewEnabled: true,
  };
}

export function composerSessionSnapshotForUnifiedDraft(
  draft: UnifiedDraftResponseJson,
  lockedAccountId: string,
): ComposerSessionCacheSnapshot {
  const plat = normalizePlatform(draft.platform ?? "");
  if (plat === "wordpress") {
    const hydrated = hydrateWordPressComposerFromDraft(draft);
    return composerSessionSnapshotFromWordPressHydrated(hydrated);
  }
  return composerSessionSnapshotFromSocialUnifiedDraft(draft, lockedAccountId);
}

export function composerSessionSnapshotForUnifiedScheduled(
  scheduled: UnifiedScheduledPostItemJson,
  lockedAccountId: string,
): ComposerSessionCacheSnapshot {
  const plat = normalizePlatform(scheduled.platform ?? "");
  if (plat === "wordpress") {
    const hydrated = hydrateWordPressComposerFromScheduled({
      platform_user_id: scheduled.platform_user_id,
      post_data: scheduled.post_data,
    });
    return composerSessionSnapshotFromWordPressHydrated(hydrated);
  }
  const synthetic = syntheticDraftFromScheduled(scheduled);
  return composerSessionSnapshotFromSocialUnifiedDraft(synthetic, lockedAccountId);
}

export type WorkspaceComposerEditKind = "draft" | "scheduled";

export interface WorkspaceComposerEditSessionBase {
  readonly lockedAccountId: string;
  readonly sessionBootstrap: ComposerSessionCacheSnapshot;
  readonly platform: string;
}

export interface WorkspaceComposerEditDraftSession
  extends WorkspaceComposerEditSessionBase {
  readonly kind: "draft";
  readonly draftId: string;
  readonly draft: UnifiedDraftResponseJson;
}

export interface WorkspaceComposerEditScheduledSession
  extends WorkspaceComposerEditSessionBase {
  readonly kind: "scheduled";
  readonly scheduledPostId: string;
  readonly scheduled: UnifiedScheduledPostItemJson;
}

export type WorkspaceComposerEditSession =
  | WorkspaceComposerEditDraftSession
  | WorkspaceComposerEditScheduledSession;

export function buildComposerEditSessionFromDraft(
  draft: UnifiedDraftResponseJson,
  accounts: readonly WorkspaceHeaderAccountRow[],
): WorkspaceComposerEditSession | null {
  const lockedAccountId = resolveLockedHeaderAccountIdForUnifiedPost(
    draft.platform,
    draft.platform_user_id,
    draft,
    accounts,
  );
  if (!lockedAccountId.trim()) {
    return null;
  }
  return {
    kind: "draft",
    draftId: draft.id,
    draft,
    platform: draft.platform,
    lockedAccountId,
    sessionBootstrap: composerSessionSnapshotForUnifiedDraft(
      draft,
      lockedAccountId,
    ),
  };
}

export function buildComposerEditSessionFromScheduled(
  scheduled: UnifiedScheduledPostItemJson,
  accounts: readonly WorkspaceHeaderAccountRow[],
): WorkspaceComposerEditSession | null {
  const synthetic = syntheticDraftFromScheduled(scheduled);
  const lockedAccountId = resolveLockedHeaderAccountIdForUnifiedPost(
    scheduled.platform,
    scheduled.platform_user_id,
    synthetic,
    accounts,
  );
  if (!lockedAccountId.trim()) {
    return null;
  }
  return {
    kind: "scheduled",
    scheduledPostId: scheduled.scheduled_post_id,
    scheduled,
    platform: scheduled.platform,
    lockedAccountId,
    sessionBootstrap: composerSessionSnapshotForUnifiedScheduled(
      scheduled,
      lockedAccountId,
    ),
  };
}
