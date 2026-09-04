export function ContentManagerCardSkeleton(): React.ReactElement {
  return (
    <article
      className="overflow-hidden rounded-2xl border border-outline-variant/10 bg-surface-container shadow-md"
      aria-hidden
    >
      <div className="aspect-[4/3] w-full inbox-skeleton-shimmer bg-surface-container-high" />
      <div className="flex flex-col gap-2 p-3">
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 animate-pulse rounded-lg bg-on-surface-variant/15" />
          <div className="h-3 w-24 animate-pulse rounded bg-on-surface-variant/15" />
        </div>
        <div className="h-4 w-full animate-pulse rounded bg-on-surface-variant/10" />
        <div className="h-3 w-4/5 animate-pulse rounded bg-on-surface-variant/10" />
        <div className="h-3 w-full animate-pulse rounded bg-on-surface-variant/10" />
        <div className="mt-1 h-9 w-full animate-pulse rounded-xl bg-on-surface-variant/15" />
      </div>
    </article>
  );
}
