import { getStoredAccessToken, getStoredActiveWorkspaceId } from "@/lib/auth/session";
import { exportCanvaDesign } from "@/lib/social/canvaApi";
import type { ComposerAttachedMedia } from "@/lib/post-composer/composerAttachedMediaTypes";
import type { PerChannelDraftSnapshot } from "@/lib/post-composer/composerDraftScopeTypes";

type ResolutionCache = Map<string, Promise<ComposerAttachedMedia>>;

function canvaDesignKey(media: ComposerAttachedMedia): string | null {
  const designId = media.canvaDesignId?.trim();
  if (!designId) {
    return null;
  }
  return designId;
}

async function resolveCanvaMediaItem(
  media: ComposerAttachedMedia,
  cache: ResolutionCache,
): Promise<ComposerAttachedMedia> {
  const designKey = canvaDesignKey(media);
  if (!designKey) {
    return media;
  }
  const existing = cache.get(designKey);
  if (existing) {
    return existing;
  }
  const token = getStoredAccessToken()?.trim();
  const workspaceId = getStoredActiveWorkspaceId()?.trim();
  if (!token || !workspaceId) {
    return media;
  }
  const promise = exportCanvaDesign(token, workspaceId, designKey).then((exported) => ({
    ...media,
    mediaId: exported.mediaId || exported.uploadId || media.mediaId,
    publicUrl: exported.mediaUrl,
    filename: exported.filename || media.filename,
  }));
  cache.set(designKey, promise);
  return promise;
}

export async function resolveCanvaMediaForPosting(input: {
  readonly unifiedMedia: readonly ComposerAttachedMedia[];
  readonly perChannelDrafts: Readonly<Record<string, PerChannelDraftSnapshot>>;
}): Promise<{
  readonly unifiedMedia: ComposerAttachedMedia[];
  readonly perChannelDrafts: Readonly<Record<string, PerChannelDraftSnapshot>>;
}> {
  const cache: ResolutionCache = new Map();
  const unifiedMedia = await Promise.all(
    input.unifiedMedia.map((media) => resolveCanvaMediaItem(media, cache)),
  );
  const perChannelDraftEntries = await Promise.all(
    Object.entries(input.perChannelDrafts).map(async ([channelId, draft]) => {
      const media = await Promise.all(draft.media.map((item) => resolveCanvaMediaItem(item, cache)));
      return [channelId, { ...draft, media }] as const;
    }),
  );
  const perChannelDrafts = Object.fromEntries(perChannelDraftEntries);
  return { unifiedMedia, perChannelDrafts };
}
