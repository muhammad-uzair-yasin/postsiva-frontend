"use client";

import { useEffect, useState } from "react";

import { getApiBaseUrl } from "@/lib/api/config";
import type { ArticleItem } from "@/lib/news/newsApi";
import { formatDate } from "./NewsCard";
import { NewsCreatePostModal } from "./NewsCreatePostModal";

interface NewsArticleModalProps {
  article: ArticleItem;
  onClose: () => void;
}

function proxyUrl(url: string): string {
  try {
    const base = getApiBaseUrl();
    return `${base}/news/image-proxy?url=${encodeURIComponent(url)}`;
  } catch {
    return url;
  }
}

export function NewsArticleModal({ article, onClose }: NewsArticleModalProps): React.ReactElement {
  const [imgSrc, setImgSrc] = useState<string | null>(article.image);
  const [imgError, setImgError] = useState(false);
  const [createPostOpen, setCreatePostOpen] = useState(false);

  // Close on Escape
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  function handleImgError() {
    if (article.image && imgSrc === article.image) {
      setImgSrc(proxyUrl(article.image));
    } else {
      setImgError(true);
    }
  }

  const showImage = imgSrc && !imgError;
  const dateStr = formatDate(article.published_at);

  const SOURCE_TYPE_LABEL: Record<string, string> = {
    rss: "RSS Feed",
    searxng: "SearXNG",
    gnews: "Google News",
  };

  return (
    <>
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

      {/* Modal */}
      <div
        className="relative z-10 flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-outline-variant/20 bg-surface shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-3 top-3 z-20 flex h-8 w-8 items-center justify-center rounded-full border border-outline-variant/20 bg-surface/80 text-on-surface-variant backdrop-blur-sm transition hover:bg-surface-container hover:text-on-surface"
        >
          <span className="material-symbols-outlined text-base">close</span>
        </button>

        {/* Image */}
        {showImage && (
          <div className="relative h-64 w-full shrink-0 overflow-hidden bg-surface-container-high">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imgSrc!}
              alt={article.title}
              onError={handleImgError}
              className="h-full w-full object-cover"
            />
            {/* Gradient overlay at bottom */}
            <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-surface to-transparent" />
          </div>
        )}

        {/* Content — scrollable */}
        <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-5">
          {/* Meta row */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-primary/20 bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
              {article.source ?? "News"}
            </span>
            {dateStr && (
              <span className="text-xs text-on-surface-variant">{dateStr}</span>
            )}
            <span className="ml-auto rounded-full border border-outline-variant/20 bg-surface-container-low px-2 py-0.5 text-[10px] text-on-surface-variant">
              {SOURCE_TYPE_LABEL[article.source_type] ?? article.source_type}
            </span>
          </div>

          {/* Title */}
          <h2 className="text-lg font-bold leading-snug text-on-surface">
            {article.title}
          </h2>

          {/* Snippet */}
          {article.snippet && (
            <p className="text-sm leading-relaxed text-on-surface-variant">
              {article.snippet}
            </p>
          )}

          {/* Divider */}
          <div className="border-t border-outline-variant/10" />

          {/* URL preview */}
          <div className="flex items-center gap-2 rounded-xl border border-outline-variant/10 bg-surface-container-low px-3 py-2">
            <span className="material-symbols-outlined text-base text-on-surface-variant">link</span>
            <span className="flex-1 truncate text-xs text-on-surface-variant">
              {article.url}
            </span>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <a
              href={article.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-primary/25 bg-primary/10 px-4 py-2.5 text-sm font-semibold text-primary transition hover:bg-primary/20"
            >
              <span className="material-symbols-outlined text-base">open_in_new</span>
              Read Full Article
            </a>
            <button
              type="button"
              onClick={() => void navigator.clipboard?.writeText(article.url)}
              className="flex items-center gap-2 rounded-xl border border-outline-variant/20 bg-surface-container-low px-4 py-2.5 text-sm text-on-surface-variant transition hover:bg-surface-container hover:text-on-surface"
            >
              <span className="material-symbols-outlined text-base">content_copy</span>
              Copy Link
            </button>
          </div>

          {/* Create Post button */}
          <button
            type="button"
            onClick={() => setCreatePostOpen(true)}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-on-primary transition hover:opacity-90"
          >
            <span className="material-symbols-outlined text-base">auto_awesome</span>
            Create Post from this Article
          </button>
        </div>
      </div>
    </div>

    {/* Create Post Modal */}
    {createPostOpen && (
      <NewsCreatePostModal
        article={article}
        onClose={() => setCreatePostOpen(false)}
      />
    )}
  </>
  );
}
