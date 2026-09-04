"use client";

import { useState } from "react";

import type { RisingItem } from "@/lib/news/demandApi";
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
      className="flex items-center gap-1 rounded-lg border border-outline-variant/20 px-2.5 py-1 text-xs text-on-surface-variant transition-colors hover:bg-surface-container-highest hover:text-on-surface"
    >
      <span className="material-symbols-outlined text-base">
        {done ? "check" : "content_copy"}
      </span>
      {done ? "Copied" : "Copy"}
    </button>
  );
}

interface RisingViewProps {
  items: RisingItem[];
  isLoading: boolean;
  error: string | null;
  total: number;
  country: string | null;
}

export function RisingView({
  items,
  isLoading,
  error,
  total,
  country,
}: RisingViewProps): React.ReactElement {
  const [createPayload, setCreatePayload] = useState<DemandCreatePayload | null>(
    null,
  );

  if (isLoading && items.length === 0) {
    return (
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 9 }).map((_, i) => (
          <div
            key={i}
            className="h-28 animate-pulse rounded-2xl bg-surface-container-high"
          />
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
        No rising searches right now
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="text-xs text-on-surface-variant">
        {total.toLocaleString()} rising searches
      </p>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item, i) => (
          <article
            key={`${item.title}-${i}`}
            className="flex flex-col overflow-hidden rounded-2xl border border-outline-variant/10 bg-surface-container shadow-md"
          >
            {item.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={item.image}
                alt=""
                className="h-28 w-full object-cover"
                loading="lazy"
              />
            ) : (
              <div className="flex h-20 items-center justify-center bg-surface-container-highest">
                <span className="material-symbols-outlined text-3xl text-on-surface/15">
                  trending_up
                </span>
              </div>
            )}
            <div className="flex flex-1 flex-col gap-2 p-3">
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm font-semibold leading-snug text-on-surface">
                  {item.title}
                </p>
                {item.traffic ? (
                  <span className="shrink-0 rounded-md bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold text-primary">
                    {item.traffic}
                  </span>
                ) : null}
              </div>
              {item.image_source ? (
                <p className="text-[11px] text-on-surface-variant">{item.image_source}</p>
              ) : null}
              <div className="mt-auto flex flex-wrap justify-end gap-1.5 pt-1">
                <button
                  type="button"
                  onClick={() =>
                    setCreatePayload({
                      source_type: "rising",
                      topic: item.title,
                      source_url: item.url,
                      image_url: item.image,
                      traffic: item.traffic,
                      image_source: item.image_source,
                      country: item.country ?? country,
                    })
                  }
                  className="flex items-center gap-1 rounded-lg bg-primary px-2.5 py-1 text-xs font-semibold text-on-primary hover:opacity-90"
                >
                  <span className="material-symbols-outlined text-base">auto_awesome</span>
                  Create post
                </button>
                {item.url ? (
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 rounded-lg border border-outline-variant/20 px-2.5 py-1 text-xs text-on-surface-variant hover:bg-surface-container-highest hover:text-on-surface"
                  >
                    <span className="material-symbols-outlined text-base">open_in_new</span>
                    Open
                  </a>
                ) : null}
                <CopyBtn text={item.title} />
              </div>
            </div>
          </article>
        ))}
      </div>

      {createPayload ? (
        <DemandCreatePostModal
          payload={createPayload}
          onClose={() => setCreatePayload(null)}
        />
      ) : null}
    </div>
  );
}
