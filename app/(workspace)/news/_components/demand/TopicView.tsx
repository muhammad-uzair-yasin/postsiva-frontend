"use client";

import { useState } from "react";

import type { TopicGroup } from "@/lib/news/demandApi";
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
      className="rounded-md p-1 text-on-surface-variant hover:bg-surface-container-highest hover:text-on-surface"
      title="Copy"
    >
      <span className="material-symbols-outlined text-base">
        {done ? "check" : "content_copy"}
      </span>
    </button>
  );
}

interface TopicViewProps {
  groups: TopicGroup[];
  isLoading: boolean;
  error: string | null;
  total: number;
  hasSeed: boolean;
  seedQ: string;
  country: string | null;
}

export function TopicView({
  groups,
  isLoading,
  error,
  total,
  hasSeed,
  seedQ,
  country,
}: TopicViewProps): React.ReactElement {
  const [createPayload, setCreatePayload] = useState<DemandCreatePayload | null>(
    null,
  );

  if (!hasSeed) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-outline-variant/25 bg-surface-container-low/40 px-6 py-20 text-center">
        <span className="material-symbols-outlined mb-3 text-5xl text-primary/40">
          search
        </span>
        <p className="text-base font-semibold text-on-surface">Search a topic</p>
        <p className="mt-1 max-w-sm text-sm text-on-surface-variant">
          Enter a seed keyword to see question and suggestion clusters people search for.
        </p>
      </div>
    );
  }

  if (isLoading && groups.length === 0) {
    return (
      <div className="flex flex-col gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-24 animate-pulse rounded-2xl bg-surface-container-high" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-20 text-center text-sm text-on-surface-variant">{error}</div>
    );
  }

  if (groups.length === 0) {
    return (
      <div className="py-20 text-center text-sm text-on-surface-variant">
        No suggestions found — try another seed
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <p className="text-xs text-on-surface-variant">
        {total.toLocaleString()} suggestions
      </p>
      {groups.map((g) => (
        <section
          key={g.prefix}
          className="rounded-2xl border border-outline-variant/10 bg-surface-container p-3 shadow-sm"
        >
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-primary">
            {g.prefix === "related" ? "Related" : g.prefix}
          </h3>
          <ul className="flex flex-col gap-0.5">
            {g.suggestions.map((s) => (
              <li
                key={s.text}
                className="flex items-center justify-between gap-2 rounded-lg px-2 py-1.5 hover:bg-surface-container-high"
              >
                <span className="min-w-0 flex-1 text-sm text-on-surface">{s.text}</span>
                <div className="flex shrink-0 items-center gap-0.5">
                  <button
                    type="button"
                    onClick={() =>
                      setCreatePayload({
                        source_type: "topic",
                        topic: s.text,
                        seed_q: seedQ,
                        prefix: g.prefix,
                        country,
                      })
                    }
                    className="rounded-md p-1 text-primary hover:bg-primary/10"
                    title="Create post"
                  >
                    <span className="material-symbols-outlined text-base">auto_awesome</span>
                  </button>
                  <CopyBtn text={s.text} />
                </div>
              </li>
            ))}
          </ul>
        </section>
      ))}

      {createPayload ? (
        <DemandCreatePostModal
          payload={createPayload}
          onClose={() => setCreatePayload(null)}
        />
      ) : null}
    </div>
  );
}
