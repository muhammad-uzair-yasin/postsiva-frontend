import { isWordPressUnifiedPlatform } from "@/lib/social/unifiedBlogPlatform";
import {
  deleteUnifiedBlogScheduledPostById,
  moveUnifiedBlogScheduledPostToDraftById,
  patchUnifiedBlogScheduledPostById,
  publishUnifiedBlogScheduledPostById,
  rescheduleUnifiedBlogScheduledPostById,
} from "@/lib/social/unifiedBlogScheduledPostsApi";
import {
  deleteUnifiedScheduledPostById,
  moveUnifiedScheduledPostToDraftById,
  patchUnifiedScheduledPostById,
  publishUnifiedScheduledPostById,
  rescheduleUnifiedScheduledPostById,
  type UnifiedScheduledPostsResponseJson,
  type UpdateUnifiedScheduledPostRequestJson,
} from "@/lib/social/unifiedScheduledPostsApi";

export function scheduledPostUsesBlogApi(
  platform: string | null | undefined,
): boolean {
  return isWordPressUnifiedPlatform(platform);
}

export async function patchWorkspaceScheduledPostById(
  accessToken: string,
  workspaceId: string,
  scheduledPostId: string,
  platform: string | null | undefined,
  body: UpdateUnifiedScheduledPostRequestJson,
): Promise<UnifiedScheduledPostsResponseJson> {
  if (scheduledPostUsesBlogApi(platform)) {
    return patchUnifiedBlogScheduledPostById(
      accessToken,
      workspaceId,
      scheduledPostId,
      body,
    );
  }
  return patchUnifiedScheduledPostById(
    accessToken,
    workspaceId,
    scheduledPostId,
    body,
  );
}

export async function rescheduleWorkspaceScheduledPostById(
  accessToken: string,
  workspaceId: string,
  scheduledPostId: string,
  platform: string | null | undefined,
  scheduledTimeIso: string,
): Promise<UnifiedScheduledPostsResponseJson> {
  if (scheduledPostUsesBlogApi(platform)) {
    return rescheduleUnifiedBlogScheduledPostById(
      accessToken,
      workspaceId,
      scheduledPostId,
      scheduledTimeIso,
    );
  }
  return rescheduleUnifiedScheduledPostById(
    accessToken,
    workspaceId,
    scheduledPostId,
    scheduledTimeIso,
  );
}

export async function deleteWorkspaceScheduledPostById(
  accessToken: string,
  workspaceId: string,
  scheduledPostId: string,
  platform: string | null | undefined,
): Promise<UnifiedScheduledPostsResponseJson> {
  if (scheduledPostUsesBlogApi(platform)) {
    return deleteUnifiedBlogScheduledPostById(
      accessToken,
      workspaceId,
      scheduledPostId,
    );
  }
  return deleteUnifiedScheduledPostById(
    accessToken,
    workspaceId,
    scheduledPostId,
  );
}

export async function publishWorkspaceScheduledPostById(
  accessToken: string,
  workspaceId: string,
  scheduledPostId: string,
  platform: string | null | undefined,
): Promise<UnifiedScheduledPostsResponseJson> {
  if (scheduledPostUsesBlogApi(platform)) {
    return publishUnifiedBlogScheduledPostById(
      accessToken,
      workspaceId,
      scheduledPostId,
    );
  }
  return publishUnifiedScheduledPostById(
    accessToken,
    workspaceId,
    scheduledPostId,
  );
}

export async function moveWorkspaceScheduledPostToDraftById(
  accessToken: string,
  workspaceId: string,
  scheduledPostId: string,
  platform: string | null | undefined,
): Promise<UnifiedScheduledPostsResponseJson> {
  if (scheduledPostUsesBlogApi(platform)) {
    return moveUnifiedBlogScheduledPostToDraftById(
      accessToken,
      workspaceId,
      scheduledPostId,
    );
  }
  return moveUnifiedScheduledPostToDraftById(
    accessToken,
    workspaceId,
    scheduledPostId,
  );
}
