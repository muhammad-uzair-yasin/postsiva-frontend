import type {
  ContentManagerChannelFilter,
  ContentManagerPost,
} from "../_types/contentManagerTypes";

function normalizeResourceId(value: string): string {
  return value.trim().replace(/_/g, ":").toLowerCase();
}

function collectFacebookPageIds(post: ContentManagerPost): Set<string> {
  const ids = new Set<string>();
  const add = (raw: string | null | undefined): void => {
    const trimmed = raw?.trim();
    if (trimmed) {
      ids.add(normalizeResourceId(trimmed));
    }
  };

  add(post.handle);
  add(post.pageId);
  add(post.scheduledPayload?.platform_user_id);

  const payload = post.scheduledPayload?.post_data;
  if (payload && typeof payload === "object") {
    const pageIds = payload.facebook_page_ids;
    if (Array.isArray(pageIds)) {
      for (const id of pageIds) {
        if (typeof id === "string") {
          add(id);
        }
      }
    }
  }

  return ids;
}

function linkedInScheduledPostIsPersonal(post: ContentManagerPost): boolean {
  const payload = post.scheduledPayload?.post_data;
  if (payload && typeof payload === "object") {
    const pageIds = payload.linkedin_page_ids;
    if (Array.isArray(pageIds) && pageIds.some((id) => typeof id === "string" && id.trim())) {
      return false;
    }
    if (payload.post_to_personal === false) {
      return false;
    }
  }
  return true;
}

function collectLinkedInOrgIds(post: ContentManagerPost): Set<string> {
  const ids = new Set<string>();
  const add = (raw: string | null | undefined): void => {
    const trimmed = raw?.trim();
    if (trimmed) {
      ids.add(normalizeResourceId(trimmed));
    }
  };

  add(post.handle);
  add(post.organizationId);
  add(post.scheduledPayload?.platform_user_id);

  const payload = post.scheduledPayload?.post_data;
  if (payload && typeof payload === "object") {
    const pageIds = payload.linkedin_page_ids;
    if (Array.isArray(pageIds)) {
      for (const id of pageIds) {
        if (typeof id === "string") {
          add(id);
        }
      }
    }
  }

  return ids;
}

/** Client-side guard after API fetch (esp. when header filter is a FB page / LinkedIn org). */
export function contentManagerScheduledPostMatchesChannelFilter(
  post: ContentManagerPost,
  channelFilter: ContentManagerChannelFilter,
): boolean {
  if (channelFilter === "all") {
    return true;
  }

  if (channelFilter.startsWith("facebook:")) {
    const want = channelFilter.slice("facebook:".length).trim();
    if (!want || post.channel !== "facebook") {
      return false;
    }
    return collectFacebookPageIds(post).has(normalizeResourceId(want));
  }

  if (channelFilter.startsWith("linkedin:")) {
    const want = channelFilter.slice("linkedin:".length).trim();
    if (!want || post.channel !== "linkedin") {
      return false;
    }
    return collectLinkedInOrgIds(post).has(normalizeResourceId(want));
  }

  if (channelFilter === "linkedin") {
    return post.channel === "linkedin" && linkedInScheduledPostIsPersonal(post);
  }

  return post.channel === channelFilter;
}
