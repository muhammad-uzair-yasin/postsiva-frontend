"use client";

import { useEffect, useId, useRef, useState } from "react";

import type { RssFeed } from "../../_hooks/useRssFeeds";

interface RssFeedsToolbarProps {
  feeds: RssFeed[];
  search: string;
  feedFilterId: string | "all";
  onSearch: (value: string) => void;
  onFeedFilter: (id: string | "all") => void;
  onOpenAvailable: () => void;
  onAdd: () => void;
  onRemoveFeed?: (id: string) => void;
}

type MenuKind = "feed" | null;

function MenuButton({
  label,
  open,
  onToggle,
  menuId,
  children,
}: {
  label: string;
  open: boolean;
  onToggle: () => void;
  menuId: string;
  children: React.ReactNode;
}): React.ReactElement {
  return (
    <div className="relative">
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={menuId}
        onClick={onToggle}
        className="inline-flex max-w-[12rem] items-center gap-1 rounded-lg border border-outline-variant/20 bg-surface-container-low px-2.5 py-1.5 text-xs font-medium text-on-surface transition hover:bg-surface-container-high"
      >
        <span className="truncate">{label}</span>
        <span className="material-symbols-outlined text-[16px] text-on-surface-variant">
          {open ? "expand_less" : "expand_more"}
        </span>
      </button>
      {open ? children : null}
    </div>
  );
}

export function RssFeedsToolbar({
  feeds,
  search,
  feedFilterId,
  onSearch,
  onFeedFilter,
  onOpenAvailable,
  onAdd,
  onRemoveFeed,
}: RssFeedsToolbarProps): React.ReactElement {
  const [menu, setMenu] = useState<MenuKind>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const feedMenuId = useId();

  const feedLabel =
    feedFilterId === "all"
      ? "All RSS Feeds"
      : (feeds.find((f) => f.id === feedFilterId)?.name ?? "All RSS Feeds");
  const selectedFeed =
    feedFilterId === "all" ? null : (feeds.find((f) => f.id === feedFilterId) ?? null);

  useEffect(() => {
    if (!menu) return;
    const onDoc = (e: MouseEvent): void => {
      if (!rootRef.current?.contains(e.target as Node)) setMenu(null);
    };
    const onKey = (e: KeyboardEvent): void => {
      if (e.key === "Escape") setMenu(null);
    };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [menu]);

  const menuListClass =
    "absolute right-0 top-[calc(100%+6px)] z-50 max-h-64 min-w-[11rem] overflow-y-auto rounded-xl border border-outline-variant/20 bg-surface-container-high py-1 shadow-xl workspace-dashboard-scroll";

  return (
    <div ref={rootRef} className="flex flex-wrap items-center justify-end gap-2">
      <label className="relative min-w-[10rem] flex-1 sm:max-w-[14rem] sm:flex-none">
        <span className="material-symbols-outlined pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-[18px] text-on-surface-variant">
          search
        </span>
        <input
          type="search"
          value={search}
          onChange={(e) => onSearch(e.target.value)}
          placeholder="Search articles"
          className="h-8 w-full rounded-lg border border-outline-variant/20 bg-surface-container-low py-1.5 pl-8 pr-2.5 text-xs text-on-surface outline-none placeholder:text-on-surface-variant/70 focus:border-primary/40 focus:ring-2 focus:ring-primary/20"
        />
      </label>

      <MenuButton
        label={feedLabel}
        open={menu === "feed"}
        onToggle={() => setMenu((m) => (m === "feed" ? null : "feed"))}
        menuId={feedMenuId}
      >
        <ul id={feedMenuId} role="listbox" className={menuListClass}>
          <li role="option" aria-selected={feedFilterId === "all"}>
            <button
              type="button"
              onClick={() => {
                onFeedFilter("all");
                setMenu(null);
              }}
              className={`flex w-full px-3 py-2 text-left text-xs ${
                feedFilterId === "all"
                  ? "bg-primary/15 font-semibold text-primary"
                  : "text-on-surface hover:bg-surface-container-highest"
              }`}
            >
              All RSS Feeds
            </button>
          </li>
          {feeds.map((feed) => (
            <li key={feed.id} role="option" aria-selected={feedFilterId === feed.id}>
              <div
                className={`flex w-full items-center gap-1 ${
                  feedFilterId === feed.id ? "bg-primary/15" : ""
                }`}
              >
                <button
                  type="button"
                  onClick={() => {
                    onFeedFilter(feed.id);
                    setMenu(null);
                  }}
                  className={`min-w-0 flex-1 truncate px-3 py-2 text-left text-xs ${
                    feedFilterId === feed.id
                      ? "font-semibold text-primary"
                      : "text-on-surface hover:bg-surface-container-highest"
                  }`}
                >
                  {feed.name}
                </button>
                {onRemoveFeed ? (
                  <button
                    type="button"
                    aria-label={`Remove ${feed.name}`}
                    title="Remove feed"
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemoveFeed(feed.id);
                      setMenu(null);
                    }}
                    className="mr-1 shrink-0 rounded-md p-1 text-on-surface-variant transition hover:bg-surface-container-highest hover:text-error"
                  >
                    <span className="material-symbols-outlined text-[16px]">delete</span>
                  </button>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      </MenuButton>

      {selectedFeed && onRemoveFeed ? (
        <button
          type="button"
          onClick={() => onRemoveFeed(selectedFeed.id)}
          title={`Delete ${selectedFeed.name}`}
          aria-label={`Delete ${selectedFeed.name}`}
          className="inline-flex h-8 items-center gap-1 rounded-lg border border-outline-variant/25 px-2.5 text-xs font-medium text-on-surface-variant transition hover:border-error/40 hover:bg-error/10 hover:text-error"
        >
          <span className="material-symbols-outlined text-[16px]">delete</span>
          Delete
        </button>
      ) : null}

      <button
        type="button"
        onClick={onOpenAvailable}
        className="inline-flex h-8 items-center gap-1 rounded-lg border border-outline-variant/25 bg-surface-container-low px-3 text-xs font-semibold text-on-surface transition hover:bg-surface-container-high"
      >
        <span className="material-symbols-outlined text-[16px]">rss_feed</span>
        Available Feeds
      </button>

      <button
        type="button"
        onClick={onAdd}
        className="inline-flex h-8 items-center gap-1 rounded-lg bg-primary px-3 text-xs font-semibold text-on-primary transition hover:brightness-110"
      >
        Add RSS Feed
      </button>
    </div>
  );
}
