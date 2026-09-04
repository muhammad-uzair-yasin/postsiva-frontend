import { getApiBaseUrl } from "@/lib/api/config";
import { fetchWithAccessTokenRetry } from "@/lib/api/fetchWithAccessTokenRetry";

export type UnifiedPostingEndpoint =
  | "text"
  | "image"
  | "video"
  | "carousel"
  | "document"
  | "reel"
  | "story"
  | "link";

function workspaceHeaders(
  accessToken: string,
  workspaceId: string,
): Record<string, string> {
  return {
    Authorization: `Bearer ${accessToken}`,
    Accept: "application/json",
    "Content-Type": "application/json",
    "X-Workspace-Id": workspaceId,
  };
}

export function summarizeUnifiedPostResponse(data: unknown): string {
  if (data === null || typeof data !== "object") {
    return "Unexpected response";
  }
  const o = data as Record<string, unknown>;
  if (Array.isArray(o.results)) {
    return (o.results as Record<string, unknown>[])
      .map((r) => {
        const plat = typeof r.platform === "string" ? r.platform : "?";
        const ok = r.success === true;
        const msg = typeof r.message === "string" ? r.message : ok ? "OK" : "Failed";
        const err = typeof r.error === "string" ? r.error : "";
        return `${plat}: ${ok ? msg : err || msg}`;
      })
      .join("\n");
  }
  if (Array.isArray(o.drafts) && Array.isArray(o.results)) {
    const draftLine =
      (o.drafts as unknown[]).length > 0
        ? `Drafts: ${(o.drafts as unknown[]).length}. `
        : "";
    return `${draftLine}${summarizeUnifiedPostResponse({ results: o.results })}`;
  }
  if (typeof o.message === "string" && o.message.trim()) {
    return o.message;
  }
  return o.success === true ? "Done" : "Something went wrong";
}

/** True when every entry in `results` succeeded, or single-post `success` is true. */
export function unifiedPostResponseAllSucceeded(data: unknown): boolean {
  if (data === null || typeof data !== "object") {
    return false;
  }
  const o = data as Record<string, unknown>;
  if (Array.isArray(o.results)) {
    const rows = o.results as Record<string, unknown>[];
    if (rows.length === 0) {
      return false;
    }
    return rows.every((r) => r.success === true);
  }
  return o.success === true;
}

function collectHttpUrlsFromObject(
  obj: Record<string, unknown>,
  out: Set<string>,
  depth: number,
): void {
  if (depth > 6) {
    return;
  }
  for (const v of Object.values(obj)) {
    if (typeof v === "string") {
      const t = v.trim();
      if (/^https?:\/\//i.test(t)) {
        out.add(t);
      }
    } else if (v !== null && typeof v === "object" && !Array.isArray(v)) {
      collectHttpUrlsFromObject(v as Record<string, unknown>, out, depth + 1);
    } else if (Array.isArray(v)) {
      for (const item of v) {
        if (item !== null && typeof item === "object" && !Array.isArray(item)) {
          collectHttpUrlsFromObject(item as Record<string, unknown>, out, depth + 1);
        }
      }
    }
  }
}

function livePostUrlsFromPostBlob(post: unknown): string[] {
  if (post === null || typeof post !== "object" || Array.isArray(post)) {
    return [];
  }
  const urls = new Set<string>();
  const add = (value: unknown): void => {
    if (typeof value === "string" && /^https?:\/\//i.test(value.trim())) {
      urls.add(value.trim());
    }
  };
  const readMapping = (obj: Record<string, unknown>): void => {
    add(obj.permalink);
    add(obj.post_url);
    add(obj.published_url);
    add(obj.link);
  };
  const root = post as Record<string, unknown>;
  readMapping(root);
  const postDetails = root.post_details;
  if (postDetails !== null && typeof postDetails === "object" && !Array.isArray(postDetails)) {
    readMapping(postDetails as Record<string, unknown>);
  }
  const storyDetails = root.story_details;
  if (storyDetails !== null && typeof storyDetails === "object" && !Array.isArray(storyDetails)) {
    readMapping(storyDetails as Record<string, unknown>);
  }
  return [...urls];
}

function urlsFromPostBlob(post: unknown): string[] {
  const live = livePostUrlsFromPostBlob(post);
  if (live.length > 0) {
    return live;
  }
  const out = new Set<string>();
  if (post !== null && typeof post === "object" && !Array.isArray(post)) {
    collectHttpUrlsFromObject(post as Record<string, unknown>, out, 0);
  }
  return [...out];
}

/** One row per destination after a unified post (for UI). */
export interface UnifiedPostResultRowParsed {
  readonly platformKey: string;
  readonly success: boolean;
  readonly message: string;
  readonly error: string | null;
  readonly urls: string[];
}

export function parseUnifiedPostResultsForUi(
  data: unknown,
): UnifiedPostResultRowParsed[] {
  if (data === null || typeof data !== "object") {
    return [];
  }
  const o = data as Record<string, unknown>;

  if (Array.isArray(o.results) && o.results.length > 0) {
    return (o.results as Record<string, unknown>[]).map((r) => ({
      platformKey: typeof r.platform === "string" ? r.platform : "unknown",
      success: r.success === true,
      message: typeof r.message === "string" ? r.message : "",
      error: typeof r.error === "string" ? r.error : null,
      urls: urlsFromPostBlob(r.post),
    }));
  }

  return [
    {
      platformKey: typeof o.platform === "string" ? o.platform : "post",
      success: o.success === true,
      message: typeof o.message === "string" ? o.message : "",
      error: typeof o.error === "string" ? o.error : null,
      urls: urlsFromPostBlob(o.post),
    },
  ];
}

export function flattenUnifiedPostResponsesForUi(
  responses: readonly unknown[],
): UnifiedPostResultRowParsed[] {
  const out: UnifiedPostResultRowParsed[] = [];
  for (const r of responses) {
    out.push(...parseUnifiedPostResultsForUi(r));
  }
  return out;
}

/**
 * POST /unified/post/{text|image|video|carousel} — Bearer + X-Workspace-Id.
 * Prefer {@link postUnifiedPublishNow} or {@link postUnifiedSaveDraft} for clearer call sites.
 */
export async function postUnifiedSocial(
  accessToken: string,
  workspaceId: string,
  endpoint: UnifiedPostingEndpoint,
  body: Record<string, unknown>,
): Promise<unknown> {
  const url = `${getApiBaseUrl()}/unified/post/${endpoint}`;
  const res = await fetchWithAccessTokenRetry(
    url,
    accessToken,
    (t) => workspaceHeaders(t, workspaceId),
    { method: "POST", body: JSON.stringify(body) },
  );
  return (await res.json()) as unknown;
}

/**
 * Publish now — POST /unified/post/{endpoint} (immediate publish; no `scheduled_time`).
 */
export async function postUnifiedPublishNow(
  accessToken: string,
  workspaceId: string,
  endpoint: UnifiedPostingEndpoint,
  body: Record<string, unknown>,
): Promise<unknown> {
  return postUnifiedSocial(accessToken, workspaceId, endpoint, body);
}

/**
 * Save draft — POST /unified/post/{endpoint} with `draft: true`.
 */
export async function postUnifiedSaveDraft(
  accessToken: string,
  workspaceId: string,
  endpoint: UnifiedPostingEndpoint,
  body: Record<string, unknown>,
): Promise<unknown> {
  return postUnifiedSocial(accessToken, workspaceId, endpoint, {
    ...body,
    draft: true,
  });
}

/**
 * POST /unified/scheduled-posts — schedule-only (requires `scheduled_time`).
 * Same fields as `POST /unified/post/{endpoint}` plus `post_type`; drafts / `draft_platforms` are not allowed server-side.
 */
export async function postUnifiedScheduled(
  accessToken: string,
  workspaceId: string,
  postType: UnifiedPostingEndpoint,
  body: Record<string, unknown>,
  scheduledTimeIso: string,
): Promise<unknown> {
  const url = `${getApiBaseUrl()}/unified/scheduled-posts`;
  const payload: Record<string, unknown> = {
    ...body,
    post_type: postType,
    draft: false,
    scheduled_time: scheduledTimeIso,
  };
  delete payload.draft_platforms;
  const res = await fetchWithAccessTokenRetry(
    url,
    accessToken,
    (t) => workspaceHeaders(t, workspaceId),
    { method: "POST", body: JSON.stringify(payload) },
  );
  return (await res.json()) as unknown;
}
