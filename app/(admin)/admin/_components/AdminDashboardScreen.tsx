"use client";

import { useCallback, useEffect, useState } from "react";
import type { LucideIcon } from "lucide-react";
import {
  BadgeCheck,
  RefreshCw,
  ShieldCheck,
  TrendingUp,
  UserCheck,
  Users,
} from "lucide-react";

import { adminGet } from "@/lib/admin/adminFetch";
import {
  buildOverviewTiles,
  OVERVIEW_PATH,
  type AdminOverview,
  type OverviewTile,
} from "@/lib/admin/overviewApi";

const TILE_ICONS: Record<OverviewTile["key"], LucideIcon> = {
  total_users: Users,
  active_users: UserCheck,
  admins: ShieldCheck,
  verified_users: BadgeCheck,
  recent_signups_7d: TrendingUp,
};

/** Admin dashboard — KPI row from GET /admin/api/overview. */
export function AdminDashboardScreen() {
  const [overview, setOverview] = useState<AdminOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    adminGet<AdminOverview>(OVERVIEW_PATH, controller.signal)
      .then((data) => {
        setOverview(data);
        setLoading(false);
      })
      .catch((err: unknown) => {
        if (controller.signal.aborted) return;
        setError(err instanceof Error ? err.message : "Failed to load stats");
        setLoading(false);
      });
    return () => controller.abort();
  }, [tick]);

  const reload = useCallback(() => {
    setLoading(true);
    setError(null);
    setTick((t) => t + 1);
  }, []);

  return (
    <div className="w-full min-w-0">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-on-surface">Dashboard</h1>
          <p className="mt-1 text-sm text-on-surface-variant">
            Postsiva admin control center
          </p>
        </div>
        <button
          type="button"
          onClick={reload}
          disabled={loading}
          className="inline-flex items-center gap-1.5 rounded-xl border border-outline-variant/25 bg-surface-container px-3.5 py-2 text-sm font-semibold text-on-surface transition-colors hover:bg-surface-container-high disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {error ? (
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-error-container px-4 py-3 text-sm text-on-error-container">
          <span>Failed to load overview stats: {error}</span>
          <button
            type="button"
            onClick={reload}
            className="rounded-lg px-2 py-1 font-semibold underline underline-offset-2"
          >
            Retry
          </button>
        </div>
      ) : null}

      <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
        {loading && !overview
          ? Array.from({ length: 5 }, (_, i) => (
              <div
                key={i}
                className="h-[6.5rem] animate-pulse rounded-2xl border border-outline-variant/20 bg-surface-container-low"
                aria-hidden
              />
            ))
          : overview
            ? buildOverviewTiles(overview).map((tile) => {
                const Icon = TILE_ICONS[tile.key];
                return (
                  <div
                    key={tile.key}
                    className="rounded-2xl border border-outline-variant/20 bg-surface-container-low p-4"
                  >
                    <div className="flex items-center gap-2">
                      <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <Icon className="h-4 w-4" />
                      </span>
                      <p className="text-xs font-medium text-on-surface-variant">
                        {tile.label}
                      </p>
                    </div>
                    <p className="mt-3 text-2xl font-semibold text-on-surface">
                      {tile.value}
                    </p>
                    <p className="mt-0.5 min-h-4 text-[11px] text-on-surface-variant">
                      {tile.hint ?? ""}
                    </p>
                  </div>
                );
              })
            : null}
      </div>
    </div>
  );
}
