"use client";

import type { ReactElement } from "react";

import type { WordPressBlogPost } from "@/lib/social/wordpressPostsApi";
import { enrichBlogImageUrl } from "@/lib/social/wordpressBlogMedia";

interface WordPressBlogReaderProps {
  post: WordPressBlogPost;
  imageUrl?: string | null;
  onBack: () => void;
}

function stripHtml(value: string | null | undefined): string {
  return (value ?? "").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function titleOf(post: WordPressBlogPost): string {
  return stripHtml(post.title_raw) || stripHtml(post.title_rendered) || "Untitled blog post";
}

function htmlOf(post: WordPressBlogPost): string {
  const html = post.content_rendered || post.content_raw || "";
  if (html.trim()) return html;
  return `<p>${stripHtml(post.excerpt_rendered ?? post.excerpt_raw)}</p>`;
}

function dateLabel(value: string | null | undefined): string {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat(undefined, {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function liveUrl(post: WordPressBlogPost): string | null {
  const link = post.link?.trim();
  return link ? link : null;
}

export function WordPressBlogReader({
  post,
  imageUrl,
  onBack,
}: WordPressBlogReaderProps): ReactElement {
  const heroImageUrl = imageUrl ? enrichBlogImageUrl(imageUrl) : null;
  const postLiveUrl = liveUrl(post);

  return (
    <article className="overflow-hidden rounded-lg border border-outline-variant/20 bg-surface-container-low">
      <div className="flex items-center justify-between gap-3 border-b border-outline-variant/15 bg-surface px-5 py-3">
        <button
          type="button"
          onClick={onBack}
          className="flex h-9 items-center gap-2 text-sm font-semibold text-secondary hover:underline"
        >
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          All Blogs
        </button>
        {postLiveUrl ? (
          <a
            href={postLiveUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-9 items-center gap-2 rounded-lg border border-secondary/45 px-3 text-sm font-semibold text-secondary transition hover:bg-secondary/10"
          >
            <span className="material-symbols-outlined text-[18px]">open_in_new</span>
            View live
          </a>
        ) : null}
      </div>

      <div className="mx-auto max-w-4xl px-5 py-10 sm:px-8">
        <h1 className="mx-auto max-w-3xl text-center text-3xl font-bold leading-tight text-on-surface sm:text-4xl">
          {titleOf(post)}
        </h1>
        {heroImageUrl ? (
          <div
            className="mt-10 aspect-[16/6.5] rounded-lg bg-cover bg-center shadow-sm ring-1 ring-outline-variant/20"
            style={{ backgroundImage: `url(${heroImageUrl})` }}
          />
        ) : null}
        <div
          className="mt-8 text-base leading-8 text-on-surface [&_h2]:mb-5 [&_h2]:mt-8 [&_h2]:text-2xl [&_h2]:font-bold [&_h3]:mb-4 [&_h3]:mt-7 [&_h3]:text-xl [&_h3]:font-bold [&_p]:mb-5"
          dangerouslySetInnerHTML={{ __html: htmlOf(post) }}
        />
        <div className="mt-12 border-t border-outline-variant/30 pt-6 text-sm text-on-surface-variant">
          {dateLabel(post.wordpress_date ?? post.wordpress_modified)}
        </div>
      </div>
    </article>
  );
}
