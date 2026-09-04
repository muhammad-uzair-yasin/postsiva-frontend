"use client";

import { useEffect, useId, useRef, useState } from "react";

import type { DemandMode } from "@/lib/news/demandApi";
import { COUNTRY_NAMES } from "@/lib/news/newsApi";

interface DemandFiltersProps {
  mode: DemandMode;
  country: string | null;
  countries: string[];
  showCountry: boolean;
  onSelectGlobal: () => void;
  onSelectCountry: (code: string) => void;
  /** Topic Search seed */
  topicSeed?: string;
  onTopicSeedChange?: (v: string) => void;
  onTopicSubmit?: () => void;
  showTopicSearch?: boolean;
}

export function DemandFilters({
  mode,
  country,
  countries,
  showCountry,
  onSelectGlobal,
  onSelectCountry,
  topicSeed = "",
  onTopicSeedChange,
  onTopicSubmit,
  showTopicSearch = false,
}: DemandFiltersProps): React.ReactElement {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const menuId = useId();

  const isGlobal = mode === "global";
  const countryLabel = isGlobal
    ? "Global"
    : COUNTRY_NAMES[country ?? ""] ?? country ?? "Country";

  const sorted = [...countries].sort((a, b) =>
    (COUNTRY_NAMES[a] ?? a).localeCompare(COUNTRY_NAMES[b] ?? b),
  );

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent): void => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent): void => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="flex flex-wrap items-center justify-end gap-2">
      {showTopicSearch ? (
        <form
          className="flex min-w-[12rem] max-w-xs flex-1 items-center gap-1 sm:flex-initial"
          onSubmit={(e) => {
            e.preventDefault();
            onTopicSubmit?.();
          }}
        >
          <input
            type="search"
            value={topicSeed}
            onChange={(e) => onTopicSeedChange?.(e.target.value)}
            placeholder="Topic seed…"
            maxLength={80}
            className="w-full rounded-lg border border-outline-variant/20 bg-surface-container-low px-2.5 py-1.5 text-xs text-on-surface placeholder:text-on-surface-variant/60 outline-none focus:border-primary/40"
          />
          <button
            type="submit"
            className="shrink-0 rounded-lg bg-primary/15 px-2.5 py-1.5 text-xs font-semibold text-primary hover:bg-primary/25"
          >
            Search
          </button>
        </form>
      ) : null}

      {showCountry ? (
        <div className="relative">
          <button
            type="button"
            aria-haspopup="listbox"
            aria-expanded={open}
            aria-controls={menuId}
            onClick={() => setOpen((v) => !v)}
            className="inline-flex max-w-[12rem] items-center gap-1 rounded-lg border border-outline-variant/20 bg-surface-container-low px-2.5 py-1.5 text-xs font-medium text-on-surface transition hover:bg-surface-container-high"
          >
            <span className="truncate">{countryLabel}</span>
            <span className="material-symbols-outlined text-[16px] text-on-surface-variant">
              {open ? "expand_less" : "expand_more"}
            </span>
          </button>
          {open ? (
            <ul
              id={menuId}
              role="listbox"
              className="absolute right-0 top-[calc(100%+6px)] z-50 max-h-64 min-w-[10rem] overflow-y-auto rounded-xl border border-outline-variant/20 bg-surface-container-high py-1 shadow-xl workspace-dashboard-scroll"
            >
              <li role="option" aria-selected={isGlobal}>
                <button
                  type="button"
                  onClick={() => {
                    onSelectGlobal();
                    setOpen(false);
                  }}
                  className={`flex w-full px-3 py-2 text-left text-xs ${
                    isGlobal
                      ? "bg-primary/15 font-semibold text-primary"
                      : "text-on-surface hover:bg-surface-container-highest"
                  }`}
                >
                  Global
                </button>
              </li>
              {sorted.map((cc) => {
                const selected = !isGlobal && country === cc;
                return (
                  <li key={cc} role="option" aria-selected={selected}>
                    <button
                      type="button"
                      onClick={() => {
                        onSelectCountry(cc);
                        setOpen(false);
                      }}
                      className={`flex w-full px-3 py-2 text-left text-xs ${
                        selected
                          ? "bg-primary/15 font-semibold text-primary"
                          : "text-on-surface hover:bg-surface-container-highest"
                      }`}
                    >
                      {COUNTRY_NAMES[cc] ?? cc}
                    </button>
                  </li>
                );
              })}
            </ul>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
