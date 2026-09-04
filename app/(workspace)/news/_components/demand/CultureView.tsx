"use client";

import { useState } from "react";

import { formatViews, type CultureItem } from "@/lib/news/demandApi";
import {
  DemandCreatePostModal,
  type DemandCreatePayload,
} from "./DemandCreatePostModal";

function CopyBtn({ text }: { text: string }): React.ReactElement {
  const [done, setDone] = useState(false);
  return (
    <button
      type="button"
      onClick={() => {
        void navigator.clipboard?.writeText(text).then(() => {
          setDone(true);
          window.setTimeout(() => setDone(false), 1200);
        });
      }}
      className="flex items-center gap-1 rounded-lg border border-outline-variant/20 px-2.5 py-1 text-xs text-on-surface-variant hover:bg-surface-container-highest hover:text-on-surface"
    >
      <span className="material-symbols-outlined text-base">
        {done ? "check" : "content_copy"}
      </span>
      {done ? "Copied" : "Copy"}
    </button>
  );
}

interface CultureViewProps {
  items: CultureItem[];
  date: string;
  isLoading: boolean;
  error: string | null;
  total: number;
}

export function CultureView({
  items,
  date,
  isLoading,
  error,
  total,
}: CultureViewProps): React.ReactElement {
  const [createPayload, setCreatePayload] = useState<DemandCreatePayload | null>(
    null,
  );

  if (isLoading && items.length === 0) {
    return (
      <div className="flex flex-col gap-2">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="h-12 animate-pulse rounded-xl bg-surface-container-high" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-20 text-center text-sm text-on-surface-variant">{error}</div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="py-20 text-center text-sm text-on-surface-variant">
        No culture pulse data available
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="text-xs text-on-surface-variant">
        {total.toLocaleString()} most-read Wikipedia articles
        {date ? ` · ${date}` : ""}
      </p>
      <ol className="flex flex-col gap-2">
        {items.map((item) => (
          <li
            key={item.article}
            className="flex items-center gap-3 rounded-xl border border-outline-variant/10 bg-surface-container px-3 py-2.5 shadow-sm"
          >
            <span className="w-8 shrink-0 text-center text-sm font-bold text-on-surface-variant">
              {item.rank}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-on-surface">{item.title}</p>
              <p className="text-[11px] text-on-surface-variant">
                {formatViews(item.views)} views
              </p>
            </div>
            <button
              type="button"
              onClick={() =>
                setCreatePayload({
                  source_type: "culture",
                  topic: item.title,
                  source_url: item.url,
                  article: item.article,
                  views: item.views,
                  rank: item.rank,
                })
              }
              className="flex items-center gap-1 rounded-lg bg-primary px-2.5 py-1 text-xs font-semibold text-on-primary hover:opacity-90"
            >
              <span className="material-symbols-outlined text-base">auto_awesome</span>
              Create post
            </button>
            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 rounded-lg border border-outline-variant/20 px-2.5 py-1 text-xs text-on-surface-variant hover:bg-surface-container-highest hover:text-on-surface"
            >
              <span className="material-symbols-outlined text-base">open_in_new</span>
              Open
            </a>
            <CopyBtn text={item.title} />
          </li>
        ))}
      </ol>

      {createPayload ? (
        <DemandCreatePostModal
          payload={createPayload}
          onClose={() => setCreatePayload(null)}
        />
      ) : null}
    </div>
  );
}
