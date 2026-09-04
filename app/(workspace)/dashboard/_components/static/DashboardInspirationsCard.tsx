"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState, type ReactElement } from "react";

import type { NewsMode, NewsNiche } from "@/lib/news/newsApi";
import { useTranslations } from "@/lib/i18n/WorkspaceLocaleProvider";
import { cn } from "@/lib/cn";

import { useDashboardInspirationFeed } from "../../_hooks/useDashboardInspirationFeed";
import { DashboardInspirationsFilters } from "./DashboardInspirationsFilters";
import { DashboardInspirationsRow } from "./DashboardInspirationsRow";
import {
  INSPIRATION_SOURCES,
  type InspirationSource,
} from "./inspirationsTypes";

interface DashboardInspirationsCardProps {
  readonly initialSource: InspirationSource;
}

export function DashboardInspirationsCard({
  initialSource,
}: DashboardInspirationsCardProps): ReactElement {
  const { t } = useTranslations();
  const [source, setSource] = useState<InspirationSource>(initialSource);
  const [niche, setNiche] = useState<NewsNiche>("general");
  const [mode, setMode] = useState<NewsMode>("global");
  const [country, setCountry] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const showScopeFilters = source === "news" || source === "trending";
  const { rows, isLoading, error } = useDashboardInspirationFeed(source, {
    niche,
    mode,
    country,
  });

  const meta = INSPIRATION_SOURCES.find((s) => s.id === source) ?? INSPIRATION_SOURCES[0];

  useEffect(() => {
    if (!menuOpen) return;
    const onDoc = (e: MouseEvent): void => {
      if (!rootRef.current?.contains(e.target as Node)) setMenuOpen(false);
    };
    const onKey = (e: KeyboardEvent): void => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  return (
    <div className="flex min-h-[22rem] flex-col rounded-xl border border-outline-variant/15 bg-surface-container-low/80 p-4 sm:p-5">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <div ref={rootRef} className="relative">
            <button
              type="button"
              aria-haspopup="listbox"
              aria-expanded={menuOpen}
              aria-controls={menuId}
              onClick={() => setMenuOpen((v) => !v)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-outline-variant/20 bg-surface-container px-3 py-1.5 text-sm font-semibold text-on-surface hover:border-outline-variant/40"
            >
              {t(meta.labelKey)}
              <span className="material-symbols-outlined text-base text-on-surface-variant" aria-hidden>
                expand_more
              </span>
            </button>
            {menuOpen ? (
              <ul
                id={menuId}
                role="listbox"
                className="absolute left-0 top-[calc(100%+0.35rem)] z-20 min-w-[11rem] overflow-hidden rounded-lg border border-outline-variant/20 bg-surface-container py-1 shadow-xl shadow-black/40"
              >
                {INSPIRATION_SOURCES.map((opt) => (
                  <li key={opt.id} role="option" aria-selected={opt.id === source}>
                    <button
                      type="button"
                      className={cn(
                        "flex w-full px-3 py-2 text-left text-sm transition-colors",
                        opt.id === source
                          ? "bg-primary/15 font-semibold text-primary"
                          : "text-on-surface hover:bg-surface-container-high",
                      )}
                      onClick={() => {
                        setSource(opt.id);
                        setMenuOpen(false);
                      }}
                    >
                      {t(opt.labelKey)}
                    </button>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
          {showScopeFilters ? (
            <DashboardInspirationsFilters
              niche={niche}
              mode={mode}
              country={country}
              onNiche={setNiche}
              onSelectGlobal={() => {
                setMode("global");
                setCountry(null);
              }}
              onSelectCountry={(code) => {
                setMode("country");
                setCountry(code);
              }}
            />
          ) : null}
        </div>
        <Link
          href={meta.viewAllHref}
          className="inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-primary hover:underline"
        >
          {t("dashboard.inspirationsViewAll")}
          <span className="material-symbols-outlined text-sm" aria-hidden>
            arrow_forward
          </span>
        </Link>
      </div>

      <div className="min-h-0 flex-1">
        {isLoading ? (
          <div className="space-y-3 py-2">
            {Array.from({ length: 4 }, (_, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="h-11 w-14 shrink-0 rounded-md inbox-skeleton-shimmer" />
                <div className="min-w-0 flex-1 space-y-2">
                  <div className="h-3.5 w-4/5 rounded inbox-skeleton-shimmer" />
                  <div className="h-3 w-1/3 rounded inbox-skeleton-shimmer" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <p className="rounded-lg border border-error/30 bg-error/5 px-3 py-2 text-sm text-error">
            {error}
          </p>
        ) : rows.length === 0 ? (
          <div className="flex h-full min-h-[12rem] items-center justify-center">
            <div className="inline-flex items-center gap-2 rounded-lg border border-amber-700/40 bg-amber-950/40 px-4 py-2.5 text-sm text-amber-100/90">
              <span className="material-symbols-outlined text-base" aria-hidden>
                browse_gallery
              </span>
              {t("dashboard.inspirationsEmpty")}
            </div>
          </div>
        ) : (
          <div>
            {rows.map((row) => (
              <DashboardInspirationsRow key={row.id} row={row} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
