import type { ComposerPostJob } from "./buildComposerPostJobs";
import { postUnifiedPublishNow } from "@/lib/social/unifiedPostingApi";
import { postUnifiedBlogPublishNow } from "@/lib/social/unifiedBlogPostingApi";

export async function runUnifiedPostJobs(input: {
  readonly accessToken: string;
  readonly workspaceId: string;
  readonly jobs: readonly ComposerPostJob[];
  readonly onEachSettled: (
    jobIndex: number,
    result: { readonly ok: true; readonly data: unknown } | { readonly ok: false; readonly message: string },
  ) => void;
}): Promise<void> {
  await Promise.all(
    input.jobs.map(async (job, jobIndex) => {
      try {
        const data = job.blogApi
          ? await postUnifiedBlogPublishNow(
              input.accessToken,
              input.workspaceId,
              job.body,
            )
          : await postUnifiedPublishNow(
              input.accessToken,
              input.workspaceId,
              job.endpoint,
              job.body,
            );
        input.onEachSettled(jobIndex, { ok: true, data });
      } catch (err) {
        const message = err instanceof Error ? err.message : "Unknown error";
        input.onEachSettled(jobIndex, { ok: false, message });
      }
    }),
  );
}
