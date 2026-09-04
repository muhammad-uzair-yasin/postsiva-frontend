"use client";

import {
  MediaMasonryGrid,
  MediaMasonryItem,
} from "@/components/media/MediaMasonryGrid";
import type { ArticleItem } from "@/lib/news/newsApi";

import { NewsCard } from "./NewsCard";

interface NewsGridProps {
  articles: ArticleItem[];
  isLoading: boolean;
  isLoadingMore: boolean;
  hasMore: boolean;
  total: number;
  error: string | null;
  onLoadMore: () => void;
}

const SKELETON_ASPECTS = [
  "aspect-[4/3]",
  "aspect-[3/4]",
  "aspect-[16/10]",
  "aspect-square",
  "aspect-[5/4]",
  "aspect-[3/2]",
] as const;

function SkeletonCard({ aspect }: { aspect: string }): React.ReactElement {
  return (
    <div className="overflow-hidden rounded-2xl border border-outline-variant/10 bg-surface-container shadow-md">
      <div className={`w-full animate-pulse bg-surface-container-high ${aspect}`} />
      <div className="flex flex-col gap-2 p-3">
        <div className="h-3 w-24 animate-pulse rounded bg-surface-container-highest" />
        <div className="h-4 w-full animate-pulse rounded bg-surface-container-highest" />
        <div className="h-4 w-4/5 animate-pulse rounded bg-surface-container-highest" />
        <div className="h-3 w-full animate-pulse rounded bg-surface-container-high" />
      </div>
    </div>
  );
}

export function NewsGrid({
  articles,
  isLoading,
  isLoadingMore,
  hasMore,
  total,
  error,
  onLoadMore,
}: NewsGridProps): React.ReactElement {
  if (isLoading && articles.length === 0) {
    return (
      <MediaMasonryGrid>
        {Array.from({ length: 20 }).map((_, i) => (
          <MediaMasonryItem key={i}>
            <SkeletonCard aspect={SKELETON_ASPECTS[i % SKELETON_ASPECTS.length]} />
          </MediaMasonryItem>
        ))}
      </MediaMasonryGrid>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <span className="material-symbols-outlined mb-3 text-5xl text-red-400/60">
          error_outline
        </span>
        <p className="text-sm text-white/50">{error}</p>
        <p className="mt-1 text-xs text-white/30">Check your connection and try again</p>
      </div>
    );
  }

  if (articles.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <span className="material-symbols-outlined mb-3 text-5xl text-white/20">
          newspaper
        </span>
        <p className="text-sm text-white/50">No articles found</p>
        <p className="mt-1 text-xs text-white/30">Try a different country or time period</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <p className="text-xs text-on-surface-variant">
        {total.toLocaleString()} articles found
      </p>

      <MediaMasonryGrid>
        {articles.map((article, i) => (
          <MediaMasonryItem key={`${article.url}-${i}`}>
            <NewsCard article={article} />
          </MediaMasonryItem>
        ))}
      </MediaMasonryGrid>

      <div className="flex justify-center py-4">
        {hasMore ? (
          <button
            type="button"
            onClick={onLoadMore}
            disabled={isLoadingMore}
            className="flex items-center gap-2 rounded-lg border border-white/[0.08] bg-white/[0.04] px-5 py-2 text-sm text-white/60 transition hover:bg-white/[0.07] hover:text-white/90 disabled:opacity-40"
          >
            {isLoadingMore ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-white/60" />
                Loading…
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-base">expand_more</span>
                Load more articles
              </>
            )}
          </button>
        ) : (
          articles.length > 0 && (
            <p className="text-xs text-white/20">That&apos;s all folks</p>
          )
        )}
      </div>
    </div>
  );
}
