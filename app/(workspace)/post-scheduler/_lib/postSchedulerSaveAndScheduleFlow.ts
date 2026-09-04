import type { ComposerPostJob } from "@/lib/post-composer/buildComposerPostJobs";
import { extractDraftIdsFromUnifiedPostResponse } from "@/lib/post-composer/extractDraftIdsFromUnifiedPostResponse";
import {
  postUnifiedSaveDraft,
  postUnifiedScheduled,
  summarizeUnifiedPostResponse,
  unifiedPostResponseAllSucceeded,
} from "@/lib/social/unifiedPostingApi";
import {
  postUnifiedBlogSaveDraft,
  postUnifiedBlogScheduled,
} from "@/lib/social/unifiedBlogPostingApi";

function dedupeIds(ids: readonly string[]): string[] {
  return [...new Set(ids.map((x) => x.trim()).filter(Boolean))];
}

export async function saveUnifiedComposerAsDrafts(input: {
  readonly accessToken: string;
  readonly workspaceId: string;
  readonly jobs: readonly ComposerPostJob[];
}): Promise<
  | {
      readonly ok: true;
      readonly draftCount: number;
      readonly partialFailure: boolean;
    }
  | { readonly ok: false; readonly message: string }
> {
  const settled = await Promise.allSettled(
    input.jobs.map((job) =>
      job.blogApi
        ? postUnifiedBlogSaveDraft(
            input.accessToken,
            input.workspaceId,
            job.body,
          )
        : postUnifiedSaveDraft(input.accessToken, input.workspaceId, job.endpoint, job.body),
    ),
  );

  const draftIds: string[] = [];
  let rejections = 0;
  for (const row of settled) {
    if (row.status === "fulfilled") {
      draftIds.push(...extractDraftIdsFromUnifiedPostResponse(row.value));
    } else {
      rejections += 1;
    }
  }

  const unique = dedupeIds(draftIds);
  if (unique.length === 0) {
    const first = settled.find((r) => r.status === "rejected") as
      | PromiseRejectedResult
      | undefined;
    const msg =
      first?.reason instanceof Error
        ? first.reason.message
        : "Could not save drafts.";
    return { ok: false, message: msg };
  }

  return {
    ok: true,
    draftCount: unique.length,
    partialFailure: rejections > 0,
  };
}

/**
 * Schedule posts in one step: POST /unified/scheduled-posts (no draft rows).
 * The unified backend persists to `scheduled_posts` per platform.
 */
export async function scheduleUnifiedComposer(input: {
  readonly accessToken: string;
  readonly workspaceId: string;
  readonly jobs: readonly ComposerPostJob[];
  readonly scheduledTimeIso: string;
}): Promise<
  | { readonly ok: true }
  | { readonly ok: false; readonly message: string }
> {
  const settled = await Promise.allSettled(
    input.jobs.map((job) =>
      job.blogApi
        ? postUnifiedBlogScheduled(
            input.accessToken,
            input.workspaceId,
            job.body,
            input.scheduledTimeIso,
          )
        : postUnifiedScheduled(
            input.accessToken,
            input.workspaceId,
            job.endpoint,
            job.body,
            input.scheduledTimeIso,
          ),
    ),
  );

  let failed = 0;
  const apiHints: string[] = [];
  for (const row of settled) {
    if (row.status === "rejected") {
      failed += 1;
      continue;
    }
    if (!unifiedPostResponseAllSucceeded(row.value)) {
      failed += 1;
      apiHints.push(summarizeUnifiedPostResponse(row.value));
    }
  }

  if (failed === input.jobs.length) {
    const firstRejected = settled.find(
      (r): r is PromiseRejectedResult => r.status === "rejected",
    );
    const msg =
      firstRejected?.reason instanceof Error
        ? firstRejected.reason.message
        : (apiHints[0] ?? "Scheduling failed.");
    return { ok: false, message: msg };
  }
  if (failed > 0) {
    return {
      ok: false,
      message: `${input.jobs.length - failed} scheduled, ${failed} failed. Open Scheduled to confirm.`,
    };
  }
  return { ok: true };
}

/** @deprecated Use scheduleUnifiedComposer — scheduling no longer creates drafts first. */
export const scheduleUnifiedComposerViaDrafts = scheduleUnifiedComposer;

export function isDateInFuture(d: Date): boolean {
  const t = d.getTime();
  return Number.isFinite(t) && t > Date.now();
}
