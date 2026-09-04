"use client";

import type { ReactElement } from "react";

import { useTranslations } from "@/lib/i18n/WorkspaceLocaleProvider";
import {
  STOCK_ASPECT_RATIO_PRESETS,
  formatStockAspectRatioLabel,
  type StockAspectRatioPresetId,
} from "@/lib/social/stockAspectRatioPresets";
import type { StockMediaType, StockProvider } from "@/lib/social/stockMediaApi";

import type { StockFilters } from "../_hooks/useStockMediaSearch";

/** Sent to providers as-is (English works best for both stock APIs). */
const SUGGESTED_SEARCHES = [
  "Nature",
  "Business",
  "People",
  "Technology",
  "Food",
  "Travel",
  "City",
  "Abstract",
];

export function StockMediaFiltersBar({
  query,
  setQuery,
  applySearch,
  mediaType,
  setMediaType,
  filters,
  setFilters,
}: {
  query: string;
  setQuery: (next: string) => void;
  applySearch: (next?: string) => void;
  mediaType: StockMediaType;
  setMediaType: (next: StockMediaType) => void;
  filters: StockFilters;
  setFilters: (next: StockFilters) => void;
}): ReactElement {
  const { t } = useTranslations();

  // Videos are Pixabay-only (Pexels video feed is excluded server-side; Unsplash has no video API).
  const providers: { key: StockProvider; label: string }[] =
    mediaType === "video"
      ? [{ key: "pixabay", label: "Pixabay" }]
      : [
          { key: "unsplash", label: "Unsplash" },
          { key: "pexels", label: "Pexels" },
          { key: "pixabay", label: "Pixabay" },
        ];

  const selectClass =
    "h-10 min-w-0 cursor-pointer appearance-none rounded-xl border border-outline-variant/25 bg-surface-container pl-9 pr-8 text-xs font-bold text-on-surface transition-colors hover:border-secondary/40 focus:border-secondary/50 focus:outline-none";
  const selectWrapClass = "relative inline-flex items-center";
  const selectIconClass =
    "material-symbols-outlined pointer-events-none absolute left-2.5 text-lg text-on-surface-variant/70";
  const selectChevronClass =
    "material-symbols-outlined pointer-events-none absolute right-2 text-lg text-on-surface-variant/70";

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2.5">
        <form
          className="flex min-w-0 flex-1 basis-64 items-center gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            applySearch();
          }}
        >
          <label className="relative min-w-0 flex-1">
            <span
              className="material-symbols-outlined pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-lg text-on-surface-variant/70"
              aria-hidden
            >
              search
            </span>
            <input
              type="search"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
              }}
              placeholder={t("postScheduler.mediaLibrary.stockSearchPlaceholder")}
              className="h-10 w-full rounded-xl border border-outline-variant/25 bg-surface-container pl-10 pr-3 text-sm text-on-surface placeholder:text-on-surface-variant/60 focus:border-secondary/50 focus:outline-none"
            />
          </label>
          <button
            type="submit"
            className="h-10 shrink-0 rounded-xl bg-primary px-4 text-sm font-bold text-on-primary transition-colors hover:bg-primary/90"
          >
            {t("common.apply")}
          </button>
        </form>
        <div className="inline-flex items-center gap-1 rounded-2xl border border-outline-variant/20 bg-surface-container p-1">
          {(
            [
              { key: "image", label: t("postScheduler.mediaLibrary.filterPhotos"), icon: "image" },
              { key: "video", label: t("postScheduler.mediaLibrary.filterVideos"), icon: "movie" },
            ] as const
          ).map((option) => (
            <button
              key={option.key}
              type="button"
              aria-pressed={mediaType === option.key}
              onClick={() => {
                setMediaType(option.key);
                if (option.key === "video" && filters.provider !== "pixabay") {
                  setFilters({ ...filters, provider: "pixabay" });
                }
              }}
              className={`inline-flex h-8 items-center gap-1.5 rounded-xl px-3.5 text-xs font-bold transition-colors ${
                mediaType === option.key
                  ? "bg-secondary text-on-secondary shadow-sm"
                  : "text-on-surface-variant hover:bg-surface-container-highest hover:text-on-surface"
              }`}
            >
              <span className="material-symbols-outlined text-base leading-none" aria-hidden>
                {option.icon}
              </span>
              {option.label}
            </button>
          ))}
        </div>
        <div className={selectWrapClass}>
          <span className={selectIconClass} aria-hidden>
            aspect_ratio
          </span>
          <select
            aria-label={t("postScheduler.mediaLibrary.stockAspectRatio")}
            value={filters.aspectRatioPreset}
            onChange={(e) => {
              setFilters({
                ...filters,
                aspectRatioPreset: e.target.value as StockAspectRatioPresetId,
              });
            }}
            className={selectClass}
          >
            {STOCK_ASPECT_RATIO_PRESETS.map((preset) => (
              <option key={preset.id} value={preset.id}>
                {formatStockAspectRatioLabel(preset)}
              </option>
            ))}
          </select>
          <span className={selectChevronClass} aria-hidden>
            expand_more
          </span>
        </div>
        <div className={selectWrapClass}>
          <span className={selectIconClass} aria-hidden>
            cloud
          </span>
          <select
            aria-label="Source"
            value={filters.provider}
            onChange={(e) => {
              setFilters({ ...filters, provider: e.target.value as StockProvider });
            }}
            className={selectClass}
          >
            {providers.map((p) => (
              <option key={p.key} value={p.key}>
                {p.label}
              </option>
            ))}
          </select>
          <span className={selectChevronClass} aria-hidden>
            expand_more
          </span>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-1.5">
        {SUGGESTED_SEARCHES.map((term) => {
          const active = query.trim().toLowerCase() === term.toLowerCase();
          return (
            <button
              key={term}
              type="button"
              aria-pressed={active}
              onClick={() => {
                applySearch(active ? "" : term);
              }}
              className={`inline-flex h-7 items-center rounded-full border px-3 text-[11px] font-bold transition-colors ${
                active
                  ? "border-secondary/50 bg-secondary/15 text-secondary"
                  : "border-outline-variant/25 bg-surface-container-low text-on-surface-variant hover:border-secondary/40 hover:text-secondary"
              }`}
            >
              {term}
            </button>
          );
        })}
      </div>
    </div>
  );
}
