"use client";

import { useState } from "react";

import {
  formatCount,
  platformLabel,
  type TrendingPostItem,
} from "@/lib/news/trendingApi";
import { formatDate } from "./NewsCard";
import { TrendingCreatePostModal } from "./TrendingCreatePostModal";

interface TrendingCardProps {
  post: TrendingPostItem;
}

export function TrendingCard({ post }: TrendingCardProps): React.ReactElement {
  const [imgError, setImgError] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const dateStr = formatDate(post.published_at);
  const showImage = Boolean(post.image && !imgError);
  const isVideo = post.platform === "youtube";
  const label = platformLabel(post.platform);

  return (
    <article className="group overflow-hidden rounded-2xl border border-outline-variant/10 bg-surface-container shadow-md ring-1 ring-white/5 transition-all hover:border-outline-variant/25 hover:shadow-lg">
      {showImage ? (
        <div className="relative w-full overflow-hidden bg-surface-container-high">
          {/* eslint-disable-next-line @next/next/no-img-element -- external CDN thumbs */}
          <img
            src={post.image!}
            alt=""
            loading="lazy"
            onError={() => setImgError(true)}
            className="block h-auto w-full transition-transform duration-300 group-hover:scale-[1.02]"
          />

          <span className="absolute left-2 top-2 rounded-md bg-black/65 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white backdrop-blur-sm">
            {label}
          </span>

          <a
            href={post.url}
            target="_blank"
            rel="noopener noreferrer"
            className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition-all group-hover:bg-black/35 group-hover:opacity-100"
            aria-label={`Open ${post.title}`}
          >
            <span className="material-symbols-outlined text-5xl text-white drop-shadow">
              {isVideo ? "play_circle" : "open_in_new"}
            </span>
          </a>
        </div>
      ) : null}

      <div className="flex flex-col gap-2 p-3">
        <div className="flex items-center gap-1.5">
          {!showImage ? (
            <span className="rounded-md bg-surface-container-highest px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-on-surface-variant">
              {label}
            </span>
          ) : null}
          <span className="truncate text-xs font-semibold text-primary">
            {post.source ?? label}
          </span>
          {dateStr ? (
            <>
              <span className="text-on-surface/20">·</span>
              <span className="shrink-0 text-xs text-on-surface-variant">{dateStr}</span>
            </>
          ) : null}
        </div>

        <p className="line-clamp-3 text-sm font-semibold leading-snug text-on-surface">
          {post.title}
        </p>

        {post.snippet ? (
          <p className="line-clamp-3 text-xs leading-relaxed text-on-surface-variant">
            {post.snippet}
          </p>
        ) : null}

        <div className="flex flex-wrap items-center gap-2 pt-0.5 text-[11px] text-on-surface-variant">
          {isVideo ? (
            <span className="inline-flex items-center gap-0.5" title="Views">
              <span className="material-symbols-outlined text-[14px]">visibility</span>
              {formatCount(post.view_count)}
            </span>
          ) : (
            <span className="inline-flex items-center gap-0.5" title="Shares / reposts">
              <span className="material-symbols-outlined text-[14px]">repeat</span>
              {formatCount(post.share_count)}
            </span>
          )}
          <span className="inline-flex items-center gap-0.5" title="Likes">
            <span className="material-symbols-outlined text-[14px]">thumb_up</span>
            {formatCount(post.like_count)}
          </span>
          <span className="inline-flex items-center gap-0.5" title="Comments">
            <span className="material-symbols-outlined text-[14px]">chat_bubble</span>
            {formatCount(post.comment_count)}
          </span>
        </div>

        <div className="flex items-center justify-end gap-1.5 pt-1">
          <button
            type="button"
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-1 rounded-lg bg-primary px-2.5 py-1 text-xs font-semibold text-on-primary transition-opacity hover:opacity-90"
          >
            <span className="material-symbols-outlined text-base">auto_awesome</span>
            Create post
          </button>
          <a
            href={post.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 rounded-lg border border-outline-variant/20 px-2.5 py-1 text-xs text-on-surface-variant transition-colors hover:bg-surface-container-highest hover:text-on-surface"
          >
            <span className="material-symbols-outlined text-base">open_in_new</span>
            {isVideo ? "Watch" : "Open"}
          </a>
        </div>
      </div>

      {showCreate ? (
        <TrendingCreatePostModal post={post} onClose={() => setShowCreate(false)} />
      ) : null}
    </article>
  );
}
