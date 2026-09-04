import { getApiBaseUrl } from "@/lib/api/config";
import { fetchWithAccessTokenRetry } from "@/lib/api/fetchWithAccessTokenRetry";
import { createUnifiedBlogDraft } from "@/lib/social/unifiedBlogDraftsApi";
import { postUnifiedBlogScheduled as createBlogScheduledPost } from "@/lib/social/unifiedBlogScheduledPostsApi";

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

function stripBlogPostFlags(body: Record<string, unknown>): Record<string, unknown> {
  const payload = { ...body };
  delete payload.draft;
  delete payload.scheduled_time;
  return payload;
}

/** POST /unified/blog/post — WordPress-only blog publish now. */
export async function postUnifiedBlog(
  accessToken: string,
  workspaceId: string,
  body: Record<string, unknown>,
): Promise<unknown> {
  const url = `${getApiBaseUrl()}/unified/blog/post`;
  const res = await fetchWithAccessTokenRetry(
    url,
    accessToken,
    (t) => workspaceHeaders(t, workspaceId),
    { method: "POST", body: JSON.stringify(stripBlogPostFlags(body)) },
  );
  return (await res.json()) as unknown;
}

export async function postUnifiedBlogPublishNow(
  accessToken: string,
  workspaceId: string,
  body: Record<string, unknown>,
): Promise<unknown> {
  return postUnifiedBlog(accessToken, workspaceId, body);
}

/** POST /unified/blog/drafts — save a WordPress draft row. */
export async function postUnifiedBlogSaveDraft(
  accessToken: string,
  workspaceId: string,
  body: Record<string, unknown>,
): Promise<unknown> {
  return createUnifiedBlogDraft(
    accessToken,
    workspaceId,
    stripBlogPostFlags(body),
  );
}

/** POST /unified/blog/scheduled-posts — schedule a WordPress blog post. */
export async function postUnifiedBlogScheduled(
  accessToken: string,
  workspaceId: string,
  body: Record<string, unknown>,
  scheduledTimeIso: string,
): Promise<unknown> {
  return createBlogScheduledPost(
    accessToken,
    workspaceId,
    stripBlogPostFlags(body),
    scheduledTimeIso,
  );
}
