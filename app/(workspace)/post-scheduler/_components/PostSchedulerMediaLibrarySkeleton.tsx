import type { ReactElement } from "react";

import {
  MediaMasonryGrid,
  MediaMasonryItem,
} from "@/components/media/MediaMasonryGrid";

interface PostSchedulerMediaLibrarySkeletonProps {
  readonly embedded?: boolean;
  readonly masonry?: boolean;
}

const MASONRY_ASPECTS = ["16 / 9", "4 / 5", "1 / 1", "3 / 4", "16 / 10"] as const;

/** Shimmer placeholders while GET /media/ is in flight. */
export function PostSchedulerMediaLibrarySkeleton({
  embedded = false,
  masonry = false,
}: PostSchedulerMediaLibrarySkeletonProps): ReactElement {
  if (embedded && !masonry) {
    return (
      <div className="grid w-full grid-cols-2 gap-2.5 sm:gap-3" aria-hidden>
        {Array.from({ length: 6 }, (_, i) => (
          <div
            key={i}
            className="relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-surface-container-low ring-1 ring-outline-variant/10"
          >
            <div className="inbox-reply-generating-shimmer pointer-events-none absolute inset-0 opacity-90" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <MediaMasonryGrid>
      {Array.from({ length: 10 }, (_, i) => (
        <MediaMasonryItem key={i}>
          <div
            className="relative w-full overflow-hidden rounded-xl bg-surface-container-low ring-1 ring-outline-variant/10"
            style={{ aspectRatio: MASONRY_ASPECTS[i % MASONRY_ASPECTS.length] }}
            aria-hidden
          >
            <div className="inbox-reply-generating-shimmer pointer-events-none absolute inset-0 opacity-90" />
          </div>
        </MediaMasonryItem>
      ))}
    </MediaMasonryGrid>
  );
}
