import { getApiBaseUrl } from "@/lib/api/config";
import { fetchWithAccessTokenRetry } from "@/lib/api/fetchWithAccessTokenRetry";
import { adminGet, adminSend } from "@/lib/admin/adminFetch";

export interface CommentCategoryItem {
  category_key: string;
  label: string;
  prompt: string;
  enabled: boolean;
  version: number;
}

export interface CommentCategoriesResponse {
  success: boolean;
  categories: CommentCategoryItem[];
}

export interface CommentCategorySaveInput {
  categoryKey: string;
  label: string;
  prompt: string;
  enabled: boolean;
}

function workspaceHeaders(accessToken: string, workspaceId: string): HeadersInit {
  return {
    Authorization: `Bearer ${accessToken}`,
    "X-Workspace-Id": workspaceId,
    Accept: "application/json",
  };
}

export async function fetchWorkspaceCommentCategories(
  accessToken: string,
  workspaceId: string,
): Promise<CommentCategoriesResponse> {
  const res = await fetchWithAccessTokenRetry(
    `${getApiBaseUrl()}/unified/comments/categories`,
    accessToken,
    (t) => workspaceHeaders(t, workspaceId),
    { method: "GET" },
  );
  return (await res.json()) as CommentCategoriesResponse;
}

export async function saveWorkspaceCommentCategory(
  accessToken: string,
  workspaceId: string,
  input: CommentCategorySaveInput,
): Promise<CommentCategoriesResponse> {
  const res = await fetchWithAccessTokenRetry(
    `${getApiBaseUrl()}/unified/comments/categories`,
    accessToken,
    (t) => ({
      ...workspaceHeaders(t, workspaceId),
      "Content-Type": "application/json",
    }),
    {
      method: "PUT",
      body: JSON.stringify({
        category_key: input.categoryKey,
        label: input.label,
        prompt: input.prompt,
        enabled: input.enabled,
      }),
    },
  );
  return (await res.json()) as CommentCategoriesResponse;
}

export async function deleteWorkspaceCommentCategory(
  accessToken: string,
  workspaceId: string,
  categoryKey: string,
): Promise<CommentCategoriesResponse> {
  const res = await fetchWithAccessTokenRetry(
    `${getApiBaseUrl()}/unified/comments/categories/${encodeURIComponent(categoryKey)}`,
    accessToken,
    (t) => workspaceHeaders(t, workspaceId),
    { method: "DELETE" },
  );
  return (await res.json()) as CommentCategoriesResponse;
}

export async function reclassifyWorkspaceCommentCategories(
  accessToken: string,
  workspaceId: string,
  options: {
    targets?: readonly { platform: string; postId: string; commentId: string }[];
    includeManual?: boolean;
  } = {},
): Promise<{ success: boolean; stale_count: number; message?: string }> {
  const res = await fetchWithAccessTokenRetry(
    `${getApiBaseUrl()}/unified/comments/categories/reclassify`,
    accessToken,
    (t) => ({
      ...workspaceHeaders(t, workspaceId),
      "Content-Type": "application/json",
    }),
    {
      method: "POST",
      body: JSON.stringify({
        confirm_credit_cost: true,
        include_manual: options.includeManual ?? false,
        targets: (options.targets ?? []).map((target) => ({
          platform: target.platform,
          post_id: target.postId,
          comment_id: target.commentId,
        })),
      }),
    },
  );
  return (await res.json()) as {
    success: boolean;
    stale_count: number;
    message?: string;
  };
}

export function fetchAdminCommentCategories(): Promise<CommentCategoriesResponse> {
  return adminGet<CommentCategoriesResponse>("/admin/api/comment-categories");
}

export function saveAdminCommentCategory(
  input: CommentCategorySaveInput,
): Promise<CommentCategoriesResponse> {
  return adminSend<CommentCategoriesResponse>(
    "PUT",
    "/admin/api/comment-categories",
    {
      category_key: input.categoryKey,
      label: input.label,
      prompt: input.prompt,
      enabled: input.enabled,
    },
  );
}
