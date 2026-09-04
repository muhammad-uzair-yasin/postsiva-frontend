"use client";

import { useEffect, useMemo, useState } from "react";
import { Info, MoreVertical, ChevronLeft, ChevronRight, TrendingUp, TrendingDown } from "lucide-react";

import { useWorkspaceHeaderAccounts } from "@/app/(workspace)/_components/WorkspaceHeaderAccountsProvider";
import { MetricsChartSection } from "./MetricsChartSection";
import {
  fetchUnifiedPostInsights,
  fetchUnifiedProfileInsights,
  type UnifiedPostsResponse,
  type UnifiedProfileResponse,
} from "@/lib/api/unifiedInsightsClient";

interface BufferInsightsDashboardProps {
  workspaceId?: string;
  accountId?: string;
}

type DateRangeKey = "7 days" | "30 days" | "Month to date" | "Custom";

/** Clean label formatter for raw DB / API metric keys */
function formatMetricLabel(key: string): string {
  const customMap: Record<string, string> = {
    followers_count: "Total Followers",
    follower_count: "Total Followers",
    follows_count: "Following",
    following_count: "Following",
    subscriber_count: "Subscribers",
    media_count: "Posts",
    statuses_count: "Posts",
    video_count: "Videos",
    pin_count: "Pins",
    boards_count: "Boards",
    monthly_views: "Monthly Views",
    impressions: "Impressions",
    reach: "Reach",
    views_count: "Views",
    page_likes: "Page Likes",
    page_views: "Page Views",
    engagement_rate: "Eng. Rate",
    eng_rate: "Eng. Rate",
    pin_clicks: "Pin Clicks",
    outbound_clicks: "Outbound Clicks",
    saves: "Saves",
    reactions: "Reactions",
    likes_count: "Likes",
    like_count: "Likes",
    likes: "Likes",
    comment_count: "Comments",
    comments_count: "Comments",
    comments: "Comments",
    share_count: "Shares",
    shares_count: "Shares",
    shares: "Shares",
    reposts_count: "Reposts",
    reposts: "Reposts",
    quotes_count: "Quotes",
    views: "Views",
    view_count: "Views",
    clicks: "Clicks",
    click_count: "Clicks",
  };
  const lower = key.toLowerCase();
  if (customMap[lower]) return customMap[lower];
  return key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

/** Format raw values — percentages stay as %, numbers are localized */
function formatValue(value: unknown): string {
  if (value === null || value === undefined) return "0";
  if (typeof value === "number") {
    if (!isFinite(value)) return "0";
    // treat floats < 1 as percentages (e.g. engagement_rate = 0.0043)
    if (!Number.isInteger(value) && Math.abs(value) <= 1) {
      return `${(value * 100).toFixed(2)}%`;
    }
    return value.toLocaleString();
  }
  const n = Number(value);
  if (!isNaN(n)) return n.toLocaleString();
  return String(value);
}

/** Build a human-readable date range label */
function buildDateLabel(dateRange: DateRangeKey): { period: string; compare: string } {
  const now = new Date();
  const end = new Date(now);
  end.setDate(end.getDate() - 1); // up to yesterday

  let start = new Date(end);
  if (dateRange === "7 days") {
    start.setDate(start.getDate() - 6);
  } else if (dateRange === "30 days") {
    start.setDate(start.getDate() - 29);
  } else if (dateRange === "Month to date") {
    start = new Date(now.getFullYear(), now.getMonth(), 1);
  } else {
    start.setDate(start.getDate() - 29);
  }

  const fmt = (d: Date) =>
    d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  const compareEnd = new Date(start);
  compareEnd.setDate(compareEnd.getDate() - 1);
  const compareStart = new Date(compareEnd);
  compareStart.setDate(compareStart.getDate() - (end.getTime() - start.getTime()) / 86400000);

  return {
    period: `${fmt(start)} – ${fmt(end)}`,
    compare: `Compared to ${fmt(compareStart)} – ${fmt(compareEnd)}`,
  };
}

const DATE_TABS: DateRangeKey[] = ["7 days", "30 days", "Month to date", "Custom"];

const EXCLUDED_SUMMARY_KEYS = new Set([
  "username", "profile_image", "name", "picture_url", "id",
  "avatar_url", "title", "custom_url", "channel_id", "country",
  "description", "published_at", "vanity_name", "headline",
  // Exclude period metrics so only lifetime totals show in summary
  "period_views", "period_likes", "period_comments", "period_shares",
  "subscribers_gained", "subscribers_lost", "estimated_minutes_watched",
  "average_view_duration_seconds"
]);

export function BufferInsightsDashboard({ workspaceId, accountId }: BufferInsightsDashboardProps) {
  const { selectedAccount } = useWorkspaceHeaderAccounts();

  const activePlatform = useMemo(() => {
    if (!selectedAccount) return "instagram";
    const p = (selectedAccount.iconId || "").toLowerCase();
    if (["all", "all_platforms", ""].includes(p)) return "instagram";
    return p;
  }, [selectedAccount]);

  const [dateRange, setDateRange] = useState<DateRangeKey>("7 days");
  const [profileData, setProfileData] = useState<UnifiedProfileResponse | null>(null);
  const [postsData, setPostsData] = useState<UnifiedPostsResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadInsights = async () => {
    setLoading(true);
    setError(null);
    try {
      const days = dateRange === "7 days" ? 7 : 30;
      const [prof, posts] = await Promise.all([
        fetchUnifiedProfileInsights(activePlatform, workspaceId, days, accountId),
        fetchUnifiedPostInsights(activePlatform, workspaceId, 25, accountId),
      ]);
      setProfileData(prof);
      setPostsData(posts);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load insights");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadInsights();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activePlatform, dateRange, workspaceId]);

  /** All numeric/non-null metric entries from the backend profile response */
  const summaryMetrics = useMemo(() => {
    if (!profileData?.metrics) return [];
    return Object.entries(profileData.metrics).filter(([key, val]) => {
      if (EXCLUDED_SUMMARY_KEYS.has(key.toLowerCase())) return false;
      if (val === null || val === undefined) return false;
      if (typeof val === "number") return true;
      if (typeof val === "string" && val !== "" && !isNaN(Number(val))) return true;
      return false;
    });
  }, [profileData]);

  // Derive real date range from history data returned by API
  const { period, compare } = useMemo(() => {
    const history = profileData?.history;
    if (history && history.length > 0) {
      const fmt = (d: string) =>
        new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
      const periodStart = fmt(history[0].date);
      const periodEnd   = fmt(history[history.length - 1].date);
      // Compare = same-length window before periodStart
      const { compare: fallbackCompare } = buildDateLabel(dateRange);
      return { period: `${periodStart} – ${periodEnd}`, compare: fallbackCompare };
    }
    return buildDateLabel(dateRange);
  }, [profileData, dateRange]);

  return (
    <div className="w-full min-h-[600px]">
      {/* ── Page Header ── */}
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-lg font-bold text-slate-900 dark:text-white">All Insights</h1>
      </div>

      {/* ── Date Range Tabs ── */}
      <div className="mb-5 flex items-center gap-1.5">
        {DATE_TABS.map((tab) => {
          const isActive = dateRange === tab;
          const isCustom = tab === "Custom";
          return (
            <button
              key={tab}
              type="button"
              onClick={() => {
                if (!isCustom) setDateRange(tab);
              }}
              className={[
                "rounded px-3 py-1.5 text-xs font-medium transition-colors select-none",
                isActive
                  ? "bg-emerald-500 text-white"
                  : isCustom
                  ? "border border-dashed border-slate-300 text-slate-500 hover:border-slate-400 dark:border-slate-700 dark:text-slate-400 flex items-center gap-1"
                  : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800",
              ].join(" ")}
            >
              {tab}
              {isCustom && <span className="text-emerald-500 font-bold">+</span>}
            </button>
          );
        })}
      </div>

      {/* ── Error banner ── */}
      {error && (
        <div className="mb-4 rounded border border-red-200 bg-red-50 px-4 py-2.5 text-xs text-red-700 dark:border-red-800/50 dark:bg-red-950/20 dark:text-red-300">
          {error}
        </div>
      )}

      {/* ── Summary Card ── */}
      <div className="rounded-md border border-slate-200 bg-[#f8f8f6] dark:border-slate-800 dark:bg-slate-900/60">
        {/* Card Header */}
        <div className="flex items-start justify-between px-5 pt-4 pb-3">
          <div>
            <span className="text-sm font-semibold text-slate-800 dark:text-white">Summary</span>
            <p className="mt-0.5 text-[11px] text-slate-400 dark:text-slate-500">
              {period}&nbsp;·&nbsp;{compare}
            </p>
          </div>
        
        </div>

        {/* ── Dynamic Metric Tiles ── */}
        <div className="px-5 pb-5">
          {loading ? (
            /* Skeleton shimmer */
            <div className="flex flex-wrap gap-0">
              {Array.from({ length: 7 }).map((_, i) => (
                <div
                  key={i}
                  className="w-[160px] flex-shrink-0 rounded bg-white border border-slate-200 dark:border-slate-700 dark:bg-slate-800 p-4 m-0.5 animate-pulse"
                >
                  <div className="h-2.5 w-20 rounded bg-slate-200 dark:bg-slate-700 mb-3" />
                  <div className="h-5 w-10 rounded bg-slate-200 dark:bg-slate-700" />
                </div>
              ))}
            </div>
          ) : summaryMetrics.length === 0 ? (
            <p className="py-6 text-center text-xs text-slate-400">
              No summary metrics available for this channel.
            </p>
          ) : (
            <div className="flex flex-wrap gap-0">
              {summaryMetrics.map(([key, value]) => {
                let growthIndicator = null;
                const history = profileData?.history;
                if (history && history.length >= 2) {
                  const latest = Number(history[history.length - 1][key]) || 0;
                  const oldest = Number(history[0][key]) || 0;
                  const diff = latest - oldest;
                  if (diff !== 0) {
                    const pct = oldest > 0 ? (diff / oldest) * 100 : 100;
                    const isUp = diff > 0;
                    growthIndicator = (
                      <div className={`flex items-center gap-0.5 text-[11px] font-bold ${isUp ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}>
                        {isUp ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                        {pct === 100 ? `+${diff.toLocaleString()}` : `${Math.abs(pct).toFixed(1)}%`}
                      </div>
                    );
                  }
                }

                return (
                <div
                  key={key}
                  className="flex-shrink-0 min-w-[160px] rounded border border-slate-200 bg-white dark:border-slate-700/60 dark:bg-slate-800/60 p-4 m-0.5"
                >
                  {/* Label row */}
                  <div className="flex items-center justify-between gap-1 mb-1.5">
                    <span
                      className="text-[11px] font-medium text-slate-500 dark:text-slate-400 truncate"
                      title={formatMetricLabel(key)}
                    >
                      {formatMetricLabel(key)}
                    </span>
                    <Info className="h-3 w-3 flex-shrink-0 text-slate-400 opacity-60" />
                  </div>
                  {/* Value */}
                  <div className="flex items-center gap-2.5 mt-2">
                    <div className="text-xl font-bold text-slate-900 dark:text-white leading-none">
                      {formatValue(value)}
                    </div>
                    {growthIndicator}
                  </div>
                </div>
              )})}
            </div>
          )}
        </div>
      </div>

      {/* ── Dynamic Metrics Chart ── */}
      <MetricsChartSection
        history={profileData?.history ?? []}
        period={period}
        compare={compare}
        summaryMetrics={summaryMetrics}
      />

      {/* ── Performance per Post ── */}
      <PerformancePerPostTable
        platform={activePlatform}
        postsData={postsData}
        loading={loading}
        period={period}
        daysFilter={dateRange === "7 days" ? 7 : dateRange === "30 days" ? 30 : undefined}
      />
    </div>
  );
}

// ─── Platform column config ───────────────────────────────────────────────────
interface PostColumn {
  key: string;
  label: string;
}

function getPostColumns(platform: string, posts: Array<Record<string, unknown>>): PostColumn[] {
  // Prefer hardcoded meaningful columns per platform
  const PLATFORM_COLS: Record<string, PostColumn[]> = {
    youtube:   [{ key: "views", label: "Views" }, { key: "likes", label: "Likes" }, { key: "comments", label: "Comments" }, { key: "favorites", label: "Favorites" }, { key: "engagement_rate", label: "Eng. Rate" }],
    facebook:  [{ key: "reactions_count", label: "Reactions" }, { key: "comments_count", label: "Comments" }, { key: "shares_count", label: "Shares" }],
    instagram: [{ key: "likes_count", label: "Likes" }, { key: "comments_count", label: "Comments" }, { key: "engagement_rate", label: "Eng. Rate" }],
    tiktok:    [{ key: "views", label: "Views" }, { key: "likes", label: "Likes" }, { key: "comments", label: "Comments" }, { key: "shares", label: "Shares" }],
    linkedin:  [{ key: "likes", label: "Likes" }, { key: "comments", label: "Comments" }, { key: "shares", label: "Shares" }, { key: "clicks", label: "Clicks" }],
    pinterest: [{ key: "impressions", label: "Impressions" }, { key: "saves", label: "Saves" }, { key: "clicks", label: "Clicks" }],
    threads:   [{ key: "likes", label: "Likes" }, { key: "replies", label: "Replies" }, { key: "reposts", label: "Reposts" }],
    bluesky:   [{ key: "likes", label: "Likes" }, { key: "replies", label: "Replies" }, { key: "reposts", label: "Reposts" }],
  };

  if (PLATFORM_COLS[platform]) return PLATFORM_COLS[platform];

  // Fallback: auto-detect numeric keys from first post
  if (!posts.length) return [];
  const SKIP = new Set(["id", "created_at", "published_at", "snapshot_date", "thumbnail_url", "permalink_url", "video_id", "post_id"]);
  return Object.entries(posts[0])
    .filter(([k, v]) => !SKIP.has(k) && (typeof v === "number" || (typeof v === "string" && !isNaN(Number(v)))))
    .slice(0, 5)
    .map(([k]) => ({ key: k, label: formatMetricLabel(k) }));
}

function formatPostValue(val: unknown): string {
  if (val === null || val === undefined) return "0";
  const n = Number(val);
  if (isNaN(n)) return String(val);
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  if (n % 1 !== 0) return n.toFixed(2) + "%";
  return n.toLocaleString();
}

const PAGE_SIZE = 10;

interface PerformancePerPostTableProps {
  platform: string;
  postsData: UnifiedPostsResponse | null;
  loading: boolean;
  period: string;
  daysFilter?: number;
}

function PerformancePerPostTable({ platform, postsData, loading, period, daysFilter }: PerformancePerPostTableProps) {
  const [page, setPage] = useState(1);

  const posts = useMemo(() => {
    const allPosts = postsData?.posts ?? [];
    if (!daysFilter) return allPosts;
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - daysFilter - 1); // Extra day buffer for timezones
    return allPosts.filter((p: any) => {
      const dateStr = p.created_at || p.published_at || p.snapshot_date;
      if (!dateStr) return true;
      return new Date(dateStr) >= cutoff;
    });
  }, [postsData, daysFilter]);
  const columns = useMemo(() => getPostColumns(platform, posts), [platform, posts]);

  const totalPages = Math.max(1, Math.ceil(posts.length / PAGE_SIZE));
  const paginated = posts.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const fmt = (d: string) => {
    try { return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }); }
    catch { return d; }
  };

  return (
    <div className="mt-4 rounded-md border border-slate-200 bg-[#f8f8f6] dark:border-slate-800 dark:bg-slate-900/60">
      {/* Header */}
      <div className="flex items-start justify-between px-5 pt-4 pb-3">
        <div>
          <span className="text-sm font-semibold text-slate-800 dark:text-white">Performance per Post</span>
          <p className="mt-0.5 text-[11px] text-slate-400 dark:text-slate-500">{period}</p>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-t border-slate-200 dark:border-slate-700/60">
              <th className="px-5 py-3 text-left font-medium text-slate-500 dark:text-slate-400 w-12">#</th>
              <th className="px-3 py-3 text-left font-medium text-slate-500 dark:text-slate-400">
                Posts · {posts.length}
              </th>
              {columns.map((col) => (
                <th key={col.key} className="px-4 py-3 text-right font-medium text-slate-500 dark:text-slate-400 whitespace-nowrap">
                  {col.label}
                </th>
              ))}
              <th className="px-4 py-3 w-8" />
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="border-t border-slate-100 dark:border-slate-800 animate-pulse">
                  <td className="px-5 py-4"><div className="h-3 w-4 rounded bg-slate-200 dark:bg-slate-700" /></td>
                  <td className="px-3 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded bg-slate-200 dark:bg-slate-700 flex-shrink-0" />
                      <div className="space-y-1.5">
                        <div className="h-3 w-32 rounded bg-slate-200 dark:bg-slate-700" />
                        <div className="h-2.5 w-20 rounded bg-slate-200 dark:bg-slate-700" />
                      </div>
                    </div>
                  </td>
                  {columns.map((c) => (
                    <td key={c.key} className="px-4 py-4 text-right"><div className="h-3 w-8 rounded bg-slate-200 dark:bg-slate-700 ml-auto" /></td>
                  ))}
                  <td className="px-4 py-4" />
                </tr>
              ))
            ) : paginated.length === 0 ? (
              <tr>
                <td colSpan={columns.length + 3} className="py-10 text-center text-xs text-slate-400">
                  No posts available for this period.
                </td>
              </tr>
            ) : (
              paginated.map((post, idx) => {
                const rank = (page - 1) * PAGE_SIZE + idx + 1;
                const title = (post.title ?? post.message ?? post.text ?? `Post #${rank}`) as string;
                const thumb = post.thumbnail_url as string | undefined;
                const date  = (post.created_at ?? post.published_at ?? post.snapshot_date ?? "") as string;
                return (
                  <tr key={String(post.id ?? idx)} className="border-t border-slate-100 dark:border-slate-800 hover:bg-white/60 dark:hover:bg-slate-800/40 transition-colors">
                    {/* Rank */}
                    <td className="px-5 py-3 text-slate-400 font-medium">#{rank}</td>
                    {/* Post info */}
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-3 min-w-0">
                        {thumb ? (
                          <img src={thumb} alt="" className="h-10 w-10 rounded object-cover flex-shrink-0 bg-slate-200" />
                        ) : (
                          <div className="h-10 w-10 rounded bg-slate-200 dark:bg-slate-700 flex-shrink-0 flex items-center justify-center text-slate-400 text-[10px]">No img</div>
                        )}
                        <div className="min-w-0">
                          <p className="line-clamp-2 font-medium text-slate-800 dark:text-slate-100 leading-snug" title={title}>{title}</p>
                          {date && <p className="mt-0.5 text-[10px] text-slate-400">{fmt(date)}</p>}
                        </div>
                      </div>
                    </td>
                    {/* Dynamic metric cols */}
                    {columns.map((col) => (
                      <td key={col.key} className="px-4 py-3 text-right font-medium text-slate-700 dark:text-slate-300 whitespace-nowrap">
                        {formatPostValue(post[col.key])}
                      </td>
                    ))}
                    {/* Menu */}
                    <td className="px-3 py-3">
                      <button className="rounded p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-600">
                        <MoreVertical className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-1 px-5 py-4 border-t border-slate-200 dark:border-slate-700/60">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="rounded p-1 text-slate-400 hover:text-slate-600 disabled:opacity-30"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          {Array.from({ length: totalPages }).map((_, i) => (
            <button
              key={i}
              onClick={() => setPage(i + 1)}
              className={[
                "h-7 w-7 rounded text-xs font-medium transition-colors",
                page === i + 1
                  ? "bg-emerald-500 text-white"
                  : "text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800",
              ].join(" ")}
            >
              {i + 1}
            </button>
          ))}
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="rounded p-1 text-slate-400 hover:text-slate-600 disabled:opacity-30"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}
