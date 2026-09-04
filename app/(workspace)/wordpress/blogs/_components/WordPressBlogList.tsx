"use client";

import type { ReactElement } from "react";

import type { WordPressBlogPost } from "@/lib/social/wordpressPostsApi";
import type { WordPressMediaItem } from "@/lib/social/wordpressMediaApi";
import {
  buildWordPressMediaMap,
  enrichBlogImageUrl,
  featuredMediaUrlForPost,
} from "@/lib/social/wordpressBlogMedia";

interface WordPressBlogListProps {
  posts: WordPressBlogPost[];
  media: WordPressMediaItem[];
  loading: boolean;
  onOpen: (postId: string) => void;
}

function liveUrl(post: WordPressBlogPost): string | null {
  const link = post.link?.trim();
  return link ? link : null;
}

function stripHtml(value: string | null | undefined): string {
  return (value ?? "").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function titleOf(post: WordPressBlogPost): string {
  return stripHtml(post.title_raw) || stripHtml(post.title_rendered) || "(no title)";
}

function dateLabel(value: string | null | undefined): string {
  if (!value) return "No date";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "No date";
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function excerptOf(post: WordPressBlogPost): string {
  const text =
    stripHtml(post.excerpt_raw) ||
    stripHtml(post.excerpt_rendered) ||
    stripHtml(post.content_raw) ||
    stripHtml(post.content_rendered);
  if (text.length <= 150) return text;
  return `${text.slice(0, 150).trim()}...`;
}

export function WordPressBlogList({
  posts,
  media,
  loading,
  onOpen,
}: WordPressBlogListProps): ReactElement {
  const mediaById = buildWordPressMediaMap(media);

  if (loading && posts.length === 0) {
    return (
      <div className="rounded-lg border border-outline-variant/25 bg-surface-container-low p-8 text-sm text-on-surface-variant">
        Loading WordPress posts...
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="rounded-lg border border-outline-variant/25 bg-surface-container-low p-8 text-sm text-on-surface-variant">
        No WordPress posts found.
      </div>
    );
  }

  return (
    <div className="grid gap-x-7 gap-y-8 md:grid-cols-2">
      {posts.map((post) => {
        const imageUrl = featuredMediaUrlForPost(post, mediaById);
        const postLiveUrl = liveUrl(post);

        return (
        <article key={post.id} className="group">
          <button
            type="button"
            onClick={() => onOpen(post.id)}
            className="block w-full overflow-hidden rounded-lg bg-surface-container-low text-left shadow-sm ring-1 ring-outline-variant/20 transition hover:-translate-y-0.5 hover:ring-secondary/45"
          >
            {imageUrl ? (
              <div
                className="aspect-[16/7.8] bg-cover bg-center"
                style={{ backgroundImage: `url(${enrichBlogImageUrl(imageUrl)})` }}
              />
            ) : (
              <div
                className="flex aspect-[16/7.8] items-center justify-center bg-surface-container-high/80 text-on-surface-variant"
                aria-hidden
              >
                <span className="material-symbols-outlined text-[48px] opacity-40">article</span>
              </div>
            )}
          </button>
          <div className="mt-4">
            <button
              type="button"
              onClick={() => onOpen(post.id)}
              className="text-left text-lg font-bold leading-snug text-on-surface transition group-hover:text-secondary"
            >
              {titleOf(post)}
            </button>
            <p className="mt-3 max-w-prose text-sm leading-6 text-on-surface-variant">
              {excerptOf(post)}
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-on-surface-variant">
              <span>{dateLabel(post.wordpress_date ?? post.wordpress_modified)}</span>
              <span className="h-1 w-1 rounded-full bg-outline-variant" />
              <span className="rounded-full bg-secondary/10 px-2 py-0.5 text-xs font-bold uppercase text-secondary">
                {post.status}
              </span>
              {typeof post.comment_count === "number" && post.comment_count > 0 ? (
                <>
                  <span className="h-1 w-1 rounded-full bg-outline-variant" />
                  <span className="inline-flex items-center gap-1 font-semibold text-on-surface-variant">
                    <span className="material-symbols-outlined text-[14px]">chat_bubble</span>
                    {post.comment_count}
                  </span>
                </>
              ) : null}
              {postLiveUrl ? (
                <a
                  href={postLiveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(event) => event.stopPropagation()}
                  className="ml-auto inline-flex h-8 items-center gap-1.5 rounded-lg border border-secondary/45 px-2.5 text-xs font-semibold text-secondary transition hover:bg-secondary/10"
                >
                  <span className="material-symbols-outlined text-[16px]">open_in_new</span>
                  View live
                </a>
              ) : null}
            </div>
          </div>
        </article>
        );
      })}
    </div>
  );
}
