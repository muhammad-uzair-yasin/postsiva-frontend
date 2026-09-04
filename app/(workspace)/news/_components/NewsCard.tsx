"use client";

import { useState } from "react";

import { getApiBaseUrl } from "@/lib/api/config";
import type { ArticleItem } from "@/lib/news/newsApi";
import { NewsArticleModal } from "./NewsArticleModal";
import { NewsCreatePostModal } from "./NewsCreatePostModal";

interface NewsCardProps {
  article: ArticleItem;
}

function proxyUrl(url: string): string {
  try {
    const base = getApiBaseUrl();
    return `${base}/news/image-proxy?url=${encodeURIComponent(url)}`;
  } catch {
    return url;
  }
}

export function formatDate(raw: string | null): string {
  if (!raw) return "";
  try {
    const d = new Date(raw);
    if (isNaN(d.getTime())) return "";
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffH = Math.floor(diffMs / 3_600_000);
    const diffD = Math.floor(diffMs / 86_400_000);
    if (diffH < 1) return "Just now";
    if (diffH < 24) return `${diffH}h ago`;
    if (diffD < 7) return `${diffD}d ago`;
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  } catch {
    return "";
  }
}

export function NewsCard({ article }: NewsCardProps): React.ReactElement {
  const [imgSrc, setImgSrc] = useState<string | null>(article.image);
  const [imgError, setImgError] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [createPostOpen, setCreatePostOpen] = useState(false);
  const dateStr = formatDate(article.published_at);
  const showImage = Boolean(imgSrc && !imgError);

  function handleImgError() {
    if (article.image && imgSrc === article.image) {
      setImgSrc(proxyUrl(article.image));
    } else {
      setImgError(true);
    }
  }

  return (
    <>
      <article className="group overflow-hidden rounded-2xl border border-outline-variant/10 bg-surface-container shadow-md ring-1 ring-white/5 transition-all hover:border-outline-variant/25 hover:shadow-lg">
        {showImage ? (
          <div className="relative w-full overflow-hidden bg-surface-container-high">
            {/* eslint-disable-next-line @next/next/no-img-element -- external news CDN / proxy */}
            <img
              src={imgSrc!}
              alt=""
              loading="lazy"
              onError={handleImgError}
              className="block h-auto w-full transition-transform duration-300 group-hover:scale-[1.02]"
            />
            <button
              type="button"
              onClick={() => setModalOpen(true)}
              className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full border border-white/20 bg-black/50 text-white opacity-0 backdrop-blur-sm transition-all group-hover:opacity-100 hover:bg-black/70"
              title="Quick view"
            >
              <span className="material-symbols-outlined text-base">visibility</span>
            </button>
          </div>
        ) : null}

        <div className="flex flex-col gap-2 p-3">
          <div className="flex items-center gap-1.5">
            <span className="truncate text-xs font-semibold text-primary">
              {article.source ?? "News"}
            </span>
            {dateStr ? (
              <>
                <span className="text-on-surface/20">·</span>
                <span className="shrink-0 text-xs text-on-surface-variant">{dateStr}</span>
              </>
            ) : null}
            {!showImage ? (
              <button
                type="button"
                onClick={() => setModalOpen(true)}
                className="ml-auto flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-on-surface-variant opacity-0 transition group-hover:opacity-100 hover:bg-surface-container-highest hover:text-on-surface"
                title="Quick view"
              >
                <span className="material-symbols-outlined text-base">visibility</span>
              </button>
            ) : null}
          </div>

          <p className="text-sm font-semibold leading-snug text-on-surface">
            {article.title}
          </p>

          {article.snippet ? (
            <p className="line-clamp-5 text-xs leading-relaxed text-on-surface-variant">
              {article.snippet}
            </p>
          ) : null}

          <div className="flex items-center justify-end gap-1.5 pt-1">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setCreatePostOpen(true);
              }}
              className="flex items-center gap-1 rounded-lg bg-primary px-2.5 py-1 text-xs font-semibold text-on-primary transition-opacity hover:opacity-90"
            >
              <span className="material-symbols-outlined text-base">auto_awesome</span>
              Create post
            </button>
            <a
              href={article.url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="flex items-center gap-1 rounded-lg border border-outline-variant/20 px-2.5 py-1 text-xs text-on-surface-variant transition-colors hover:bg-surface-container-highest hover:text-on-surface"
            >
              <span className="material-symbols-outlined text-base">open_in_new</span>
              Open
            </a>
          </div>
        </div>
      </article>

      {modalOpen ? (
        <NewsArticleModal article={article} onClose={() => setModalOpen(false)} />
      ) : null}

      {createPostOpen ? (
        <NewsCreatePostModal
          article={article}
          source={article.source_type === "rss" ? "rss" : "news"}
          onClose={() => setCreatePostOpen(false)}
        />
      ) : null}
    </>
  );
}
