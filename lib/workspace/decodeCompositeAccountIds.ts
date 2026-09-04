const PREFIX_LINKEDIN_ORG = "linkedin:org:";
const PREFIX_FACEBOOK_PAGE = "facebook:page:";
const PREFIX_YOUTUBE_CHANNEL = "youtube:";

/**
 * Restore org / page id from header row id (`linkedin:org:…`, `facebook:page:…`).
 */
export function decodeCompositeEntitySegment(segment: string): string {
  const trimmed = segment.trim();
  if (/^\d+$/.test(trimmed)) {
    return trimmed;
  }
  try {
    const decoded = decodeURIComponent(trimmed);
    if (decoded !== trimmed) {
      return decoded;
    }
  } catch {
    // fall through
  }
  return trimmed.replace(/_/g, ":");
}

export function linkedinOrganizationIdsFromSelectedIds(
  ids: readonly string[],
): string[] {
  return ids
    .filter((id) => id.startsWith(PREFIX_LINKEDIN_ORG))
    .map((id) => decodeCompositeEntityId(id.slice(PREFIX_LINKEDIN_ORG.length)))
    .filter((x) => x.length > 0);
}

export function facebookPageIdsFromSelectedIds(ids: readonly string[]): string[] {
  return ids
    .filter((id) => id.startsWith(PREFIX_FACEBOOK_PAGE))
    .map((id) => decodeCompositeEntityId(id.slice(PREFIX_FACEBOOK_PAGE.length)))
    .filter((x) => x.length > 0);
}

/** YouTube channel ids use underscores natively — do not map `_` → `:`. */
function decodeYoutubeChannelSegment(segment: string): string {
  const trimmed = segment.trim();
  if (!trimmed) {
    return "";
  }
  try {
    return decodeURIComponent(trimmed);
  } catch {
    return trimmed;
  }
}

export function youtubeChannelIdFromSelectedIds(
  ids: readonly string[],
): string | undefined {
  const value = ids.find((id) => id.startsWith(PREFIX_YOUTUBE_CHANNEL));
  if (!value) {
    return undefined;
  }
  const channelId = decodeYoutubeChannelSegment(
    value.slice(PREFIX_YOUTUBE_CHANNEL.length),
  );
  return channelId || undefined;
}

function decodeCompositeEntityId(rest: string): string {
  return decodeCompositeEntitySegment(rest);
}
