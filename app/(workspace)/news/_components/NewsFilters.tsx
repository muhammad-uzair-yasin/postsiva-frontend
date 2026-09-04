"use client";

import { useEffect, useId, useRef, useState } from "react";

import type { NewsMode, NewsNiche, NewsTimeRange } from "@/lib/news/newsApi";
import { COUNTRY_NAMES, NICHE_LABELS } from "@/lib/news/newsApi";
import {
  TRENDING_PLATFORMS,
  type TrendingPlatform,
} from "@/lib/news/trendingApi";

interface NewsFiltersProps {
  niche: NewsNiche;
  mode: NewsMode;
  country: string | null;
  timeRange: NewsTimeRange;
  countries: string[];
  onNiche: (n: NewsNiche) => void;
  onSelectGlobal: () => void;
  onSelectCountry: (code: string) => void;
  onTimeRange: (t: NewsTimeRange) => void;
  /** When set, show platform picker (Trending Posts tab). */
  platform?: TrendingPlatform;
  onPlatform?: (p: TrendingPlatform) => void;
}

const TIME_RANGES: { value: NewsTimeRange; label: string }[] = [
  { value: "today", label: "Today" },
  { value: "week", label: "This week" },
  { value: "month", label: "This month" },
];

/** Categories shown in the News tab (no search). */
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

type MenuKind = "time" | "country" | "niche" | "platform" | null;

function FilterMenuButton({
  label,
  open,
  onToggle,
  children,
  menuId,
}: {
  label: string;
  open: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  menuId: string;
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

export function NewsFilters({
  niche,
  mode,
  country,
  timeRange,
  countries,
  onNiche,
  onSelectGlobal,
  onSelectCountry,
  onTimeRange,
  platform,
  onPlatform,
}: NewsFiltersProps): React.ReactElement {
  const [menu, setMenu] = useState<MenuKind>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const timeMenuId = useId();
  const countryMenuId = useId();
  const nicheMenuId = useId();
  const platformMenuId = useId();
  const showPlatform = Boolean(platform && onPlatform);

  const codes = countries.length > 0 ? countries : ["US", "BA", "PK"];
  const sortedCountries = [...codes].sort((a, b) =>
    (COUNTRY_NAMES[a] ?? a).localeCompare(COUNTRY_NAMES[b] ?? b),
  );

  const isGlobal = mode === "global";
  const timeLabel = TIME_RANGES.find((t) => t.value === timeRange)?.label ?? "Today";
  const countryLabel = isGlobal
    ? "Global"
    : COUNTRY_NAMES[country ?? ""] ?? country ?? "Country";
  const nicheLabel = NICHE_LABELS[niche] ?? niche;
  const platformLabelText =
    TRENDING_PLATFORMS.find((p) => p.value === platform)?.label ?? "Platform";

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
    "absolute right-0 top-[calc(100%+6px)] z-50 max-h-64 min-w-[10rem] overflow-y-auto rounded-xl border border-outline-variant/20 bg-surface-container-high py-1 shadow-xl workspace-dashboard-scroll";

  return (
    <div ref={rootRef} className="flex flex-wrap items-center justify-end gap-2">
      {showPlatform ? (
        <FilterMenuButton
          label={platformLabelText}
          open={menu === "platform"}
          onToggle={() => setMenu((m) => (m === "platform" ? null : "platform"))}
          menuId={platformMenuId}
        >
          <ul id={platformMenuId} role="listbox" className={menuListClass}>
            {TRENDING_PLATFORMS.map((p) => (
              <li key={p.value} role="option" aria-selected={platform === p.value}>
                <button
                  type="button"
                  onClick={() => {
                    onPlatform?.(p.value);
                    setMenu(null);
                  }}
                  className={`flex w-full px-3 py-2 text-left text-xs ${
                    platform === p.value
                      ? "bg-primary/15 font-semibold text-primary"
                      : "text-on-surface hover:bg-surface-container-highest"
                  }`}
                >
                  {p.label}
                </button>
              </li>
            ))}
          </ul>
        </FilterMenuButton>
      ) : null}

      <FilterMenuButton
        label={timeLabel}
        open={menu === "time"}
        onToggle={() => setMenu((m) => (m === "time" ? null : "time"))}
        menuId={timeMenuId}
      >
        <ul id={timeMenuId} role="listbox" className={menuListClass}>
          {TIME_RANGES.map((tr) => (
            <li key={tr.value} role="option" aria-selected={timeRange === tr.value}>
              <button
                type="button"
                onClick={() => {
                  onTimeRange(tr.value);
                  setMenu(null);
                }}
                className={`flex w-full px-3 py-2 text-left text-xs ${
                  timeRange === tr.value
                    ? "bg-primary/15 font-semibold text-primary"
                    : "text-on-surface hover:bg-surface-container-highest"
                }`}
              >
                {tr.label}
              </button>
            </li>
          ))}
        </ul>
      </FilterMenuButton>

      <FilterMenuButton
        label={countryLabel}
        open={menu === "country"}
        onToggle={() => setMenu((m) => (m === "country" ? null : "country"))}
        menuId={countryMenuId}
      >
        <ul id={countryMenuId} role="listbox" className={menuListClass}>
          <li role="option" aria-selected={isGlobal}>
            <button
              type="button"
              onClick={() => {
                onSelectGlobal();
                setMenu(null);
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
          {sortedCountries.map((cc) => {
            const selected = !isGlobal && country === cc;
            return (
              <li key={cc} role="option" aria-selected={selected}>
                <button
                  type="button"
                  onClick={() => {
                    onSelectCountry(cc);
                    setMenu(null);
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
      </FilterMenuButton>

      <FilterMenuButton
        label={nicheLabel}
        open={menu === "niche"}
        onToggle={() => setMenu((m) => (m === "niche" ? null : "niche"))}
        menuId={nicheMenuId}
      >
        <ul id={nicheMenuId} role="listbox" className={menuListClass}>
          {NICHES.map((n) => (
            <li key={n} role="option" aria-selected={niche === n}>
              <button
                type="button"
                onClick={() => {
                  onNiche(n);
                  setMenu(null);
                }}
                className={`flex w-full px-3 py-2 text-left text-xs ${
                  niche === n
                    ? "bg-primary/15 font-semibold text-primary"
                    : "text-on-surface hover:bg-surface-container-highest"
                }`}
              >
                {NICHE_LABELS[n]}
              </button>
            </li>
          ))}
        </ul>
      </FilterMenuButton>
    </div>
  );
}
