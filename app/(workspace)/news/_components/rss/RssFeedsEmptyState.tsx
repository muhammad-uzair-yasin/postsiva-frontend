"use client";

interface RssFeedsEmptyStateProps {
  onAdd: () => void;
  hasFeeds: boolean;
}

function ExploreIllustration(): React.ReactElement {
  return (
    <div
      className="relative mb-6 flex h-48 w-48 items-center justify-center"
      aria-hidden
    >
      <div className="absolute inset-4 rounded-full bg-gradient-to-b from-surface-container-highest to-surface-container-low" />
      <svg viewBox="0 0 160 160" className="relative z-10 h-40 w-40">
        <circle cx="80" cy="80" r="54" fill="currentColor" className="text-surface-container-high" />
        <path
          d="M48 78c0-14 11-26 26-26s26 12 26 26-11 26-26 26-26-12-26-26z"
          fill="#5eead4"
          opacity="0.9"
        />
        <path
          d="M86 78c0-14 11-26 26-26s26 12 26 26-11 26-26 26-26-12-26-26z"
          fill="#67e8f9"
          opacity="0.95"
        />
        <circle cx="74" cy="78" r="10" fill="#0f172a" />
        <circle cx="112" cy="78" r="10" fill="#0f172a" />
        <circle cx="77" cy="75" r="3" fill="#e2e8f0" />
        <circle cx="115" cy="75" r="3" fill="#e2e8f0" />
        <rect x="72" y="74" width="16" height="8" rx="2" fill="#2dd4bf" />
        <path
          d="M64 104c8 10 24 14 32 14s24-4 32-14"
          fill="none"
          stroke="#86efac"
          strokeWidth="6"
          strokeLinecap="round"
        />
        <circle cx="42" cy="48" r="2" fill="#fde047" />
        <circle cx="118" cy="44" r="1.5" fill="#fde047" />
        <circle cx="128" cy="62" r="1.5" fill="#a5f3fc" />
      </svg>
    </div>
  );
}

export function RssFeedsEmptyState({
  onAdd,
  hasFeeds,
}: RssFeedsEmptyStateProps): React.ReactElement {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
      <ExploreIllustration />
      <h2 className="text-lg font-semibold text-on-surface">
        There are no articles to display
      </h2>
      {!hasFeeds ? (
        <p className="mt-1.5 max-w-sm text-sm text-on-surface-variant">
          Add an RSS feed to start collecting articles for your workspace.
        </p>
      ) : (
        <p className="mt-1.5 max-w-sm text-sm text-on-surface-variant">
          Articles will appear here once feed fetching is connected.
        </p>
      )}
      <button
        type="button"
        onClick={onAdd}
        className="mt-5 inline-flex items-center rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-on-primary transition hover:brightness-110"
      >
        Add RSS Feed
      </button>
    </div>
  );
}
