import type { ComposerAttachedMedia } from "./composerAttachedMediaTypes";
import type { ComposerPostingAccount } from "./composerPostingAccount";
import type { WordPressComposerFields } from "./buildComposerPostJobs";
import { inferWordPressComposerPostKind } from "./inferWordPressComposerPostKind";
import { mergeWordPressAttachedMediaFields } from "./inferWordPressComposerPostKind";

function wordpressDefaultText(
  rawBody: string,
  wp: WordPressComposerFields | null,
): string {
  const fullContent = (wp?.content ?? "").trim() || rawBody.trim();
  const title = (wp?.title ?? "").trim();
  const excerpt = (wp?.excerpt ?? "").trim();
  const max = 3000;
  if (fullContent.length <= max) {
    return fullContent;
  }
  const short = excerpt || title || fullContent.slice(0, 500);
  return short.slice(0, max);
}

function buildWordPressBlock(
  account: ComposerPostingAccount,
  rawBody: string,
  wp: WordPressComposerFields | null,
): Record<string, unknown> {
  const connectionId = account.id.startsWith("wordpress:")
    ? account.id.replace(/^wordpress:/, "")
    : (account.targetResourceId ?? "").trim();
  const title = (wp?.title ?? "").trim();
  const content = (wp?.content ?? "").trim() || rawBody.trim();
  const block: Record<string, unknown> = {
    wordpress_title: title || rawBody.trim().slice(0, 500),
    media_placement: wp?.mediaPlacement ?? "after_headings",
  };
  if (connectionId) {
    block.connection_id = connectionId;
  }
  if (content) {
    block.wordpress_content = content;
  }
  const excerpt = (wp?.excerpt ?? "").trim();
  if (excerpt) {
    block.wordpress_excerpt = excerpt;
  }
  const slug = (wp?.slug ?? "").trim();
  if (slug) {
    block.wordpress_slug = slug;
  }
  if (wp?.categories?.length) {
    block.categories = [...wp.categories];
  }
  if (wp?.tags?.length) {
    block.tags = [...wp.tags];
  }
  const featured = (wp?.featuredMediaId ?? "").trim();
  if (featured) {
    block.featured_media_id = featured;
  }
  const featuredUrl = (wp?.featuredImageUrl ?? "").trim();
  if (featuredUrl) {
    block.featured_image_url = featuredUrl;
  }
  return block;
}

/** Build POST /unified/blog/post body for one WordPress site. */
export function buildBlogPostBody(input: {
  readonly account: ComposerPostingAccount;
  readonly rawBody: string;
  readonly media: readonly ComposerAttachedMedia[];
  readonly wordpress: WordPressComposerFields | null;
  readonly draft?: boolean;
  readonly scheduledTimeIso?: string | null;
}): Record<string, unknown> {
  const base: Record<string, unknown> = {
    wordpress: buildWordPressBlock(input.account, input.rawBody, input.wordpress),
    default_text: wordpressDefaultText(input.rawBody, input.wordpress),
  };
  if (input.draft) {
    base.draft = true;
  }
  if (input.scheduledTimeIso?.trim()) {
    base.scheduled_time = input.scheduledTimeIso.trim();
  }
  return mergeWordPressAttachedMediaFields(base, input.media);
}

export function buildBlogPostJobs(input: {
  readonly postTargetIds: readonly string[];
  readonly accounts: readonly ComposerPostingAccount[];
  readonly rawBody: string;
  readonly media: readonly ComposerAttachedMedia[];
  readonly wordpress: WordPressComposerFields | null;
}):
  | {
      readonly ok: true;
      readonly jobs: Array<{
        readonly label: string;
        readonly body: Record<string, unknown>;
        readonly targetAccountId: string;
        readonly blogApi: true;
      }>;
    }
  | { readonly ok: false; readonly message: string } {
  const byId = new Map(input.accounts.map((a) => [a.id, a]));
  const jobs: Array<{
    label: string;
    body: Record<string, unknown>;
    targetAccountId: string;
    blogApi: true;
  }> = [];

  for (const id of input.postTargetIds) {
    const account = byId.get(id);
    if (!account || account.platform !== "wordpress") {
      continue;
    }
    const inferred = inferWordPressComposerPostKind(input.media);
    if (!inferred.ok) {
      return { ok: false, message: inferred.message };
    }
    const title = (input.wordpress?.title ?? "").trim();
    const content =
      (input.wordpress?.content ?? "").trim() || input.rawBody.trim();
    if (!title && !content) {
      return {
        ok: false,
        message: "Add a WordPress title or article content before publishing.",
      };
    }
    jobs.push({
      label: account.displayName,
      targetAccountId: account.id,
      blogApi: true,
      body: buildBlogPostBody({
        account,
        rawBody: input.rawBody,
        media: input.media,
        wordpress: input.wordpress,
      }),
    });
  }

  if (jobs.length === 0) {
    return {
      ok: false,
      message: "Select a WordPress site to publish your blog post.",
    };
  }
  return { ok: true, jobs };
}
