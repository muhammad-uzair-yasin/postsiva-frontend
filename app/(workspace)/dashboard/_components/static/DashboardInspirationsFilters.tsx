"use client";

import { useEffect, useId, useRef, useState, type ReactElement } from "react";

import {
  COUNTRY_NAMES,
  NICHE_LABELS,
  type NewsMode,
  type NewsNiche,
} from "@/lib/news/newsApi";
import { cn } from "@/lib/cn";

const NICHES: NewsNiche[] = [
  "general",
  "technology",
  "business",
  "sports",
  "health",
  "science",
  "entertainment",
  "marketing",
  "finance",
  "politics",
  "lifestyle",
  "travel",
];

const COUNTRIES = ["US", "BA", "PK"] as const;

type MenuKind = "niche" | "country" | null;

interface DashboardInspirationsFiltersProps {
  readonly niche: NewsNiche;
  readonly mode: NewsMode;
  readonly country: string | null;
  readonly onNiche: (n: NewsNiche) => void;
  readonly onSelectGlobal: () => void;
  readonly onSelectCountry: (code: string) => void;
}

export function DashboardInspirationsFilters({
  niche,
  mode,
  country,
  onNiche,
  onSelectGlobal,
  onSelectCountry,
}: DashboardInspirationsFiltersProps): ReactElement {
  const [menu, setMenu] = useState<MenuKind>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const nicheMenuId = useId();
  const countryMenuId = useId();

  const isGlobal = mode === "global";
  const nicheLabel = NICHE_LABELS[niche] ?? niche;
  const countryLabel = isGlobal
    ? "Global"
    : COUNTRY_NAMES[country ?? ""] ?? country ?? "Country";

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
    "absolute left-0 top-[calc(100%+6px)] z-30 max-h-56 min-w-[10rem] overflow-y-auto rounded-lg border border-outline-variant/20 bg-surface-container py-1 shadow-xl workspace-dashboard-scroll";

  return (
    <div ref={rootRef} className="flex flex-wrap items-center gap-2">
      <div className="relative">
        <button
          type="button"
          aria-haspopup="listbox"
          aria-expanded={menu === "niche"}
          aria-controls={nicheMenuId}
          onClick={() => setMenu((m) => (m === "niche" ? null : "niche"))}
          className="inline-flex max-w-[10rem] items-center gap-1 rounded-lg border border-outline-variant/20 bg-surface-container px-2.5 py-1.5 text-xs font-medium text-on-surface hover:border-outline-variant/40"
        >
          <span className="truncate">{nicheLabel}</span>
          <span className="material-symbols-outlined text-[16px] text-on-surface-variant" aria-hidden>
            expand_more
          </span>
        </button>
        {menu === "niche" ? (
          <ul id={nicheMenuId} role="listbox" className={menuListClass}>
            {NICHES.map((n) => (
              <li key={n} role="option" aria-selected={niche === n}>
                <button
                  type="button"
                  onClick={() => {
                    onNiche(n);
                    setMenu(null);
                  }}
                  className={cn(
                    "flex w-full px-3 py-2 text-left text-xs",
                    niche === n
                      ? "bg-primary/15 font-semibold text-primary"
                      : "text-on-surface hover:bg-surface-container-high",
                  )}
                >
                  {NICHE_LABELS[n]}
                </button>
              </li>
            ))}
          </ul>
        ) : null}
      </div>

      <div className="relative">
        <button
          type="button"
          aria-haspopup="listbox"
          aria-expanded={menu === "country"}
          aria-controls={countryMenuId}
          onClick={() => setMenu((m) => (m === "country" ? null : "country"))}
          className="inline-flex max-w-[11rem] items-center gap-1 rounded-lg border border-outline-variant/20 bg-surface-container px-2.5 py-1.5 text-xs font-medium text-on-surface hover:border-outline-variant/40"
        >
          <span className="truncate">{countryLabel}</span>
          <span className="material-symbols-outlined text-[16px] text-on-surface-variant" aria-hidden>
            expand_more
          </span>
        </button>
        {menu === "country" ? (
          <ul id={countryMenuId} role="listbox" className={menuListClass}>
            <li role="option" aria-selected={isGlobal}>
              <button
                type="button"
                onClick={() => {
                  onSelectGlobal();
                  setMenu(null);
                }}
                className={cn(
                  "flex w-full px-3 py-2 text-left text-xs",
                  isGlobal
                    ? "bg-primary/15 font-semibold text-primary"
                    : "text-on-surface hover:bg-surface-container-high",
                )}
              >
                Global
              </button>
            </li>
            {COUNTRIES.map((cc) => {
              const selected = !isGlobal && country === cc;
              return (
                <li key={cc} role="option" aria-selected={selected}>
                  <button
                    type="button"
                    onClick={() => {
                      onSelectCountry(cc);
                      setMenu(null);
                    }}
                    className={cn(
                      "flex w-full px-3 py-2 text-left text-xs",
                      selected
                        ? "bg-primary/15 font-semibold text-primary"
                        : "text-on-surface hover:bg-surface-container-high",
                    )}
                  >
                    {COUNTRY_NAMES[cc] ?? cc}
                  </button>
                </li>
              );
            })}
          </ul>
        ) : null}
      </div>
    </div>
  );
}
