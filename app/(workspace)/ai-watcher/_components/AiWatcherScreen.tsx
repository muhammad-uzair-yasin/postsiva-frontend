"use client";

import { useEffect, useState } from "react";
import { getApiBaseUrl } from "@/lib/api/config";
import { getStoredAccessToken, getStoredActiveWorkspaceId } from "@/lib/auth/session";
import { disableAiAutoreplier, listEnabledWatcherPosts } from "@/lib/social/aiAutoreplierApi";
import { fetchUnifiedBlogPosts } from "@/lib/social/unifiedBlogPostsApi";
import { useTranslations } from "@/lib/i18n/WorkspaceLocaleProvider";
import { WorkspacePageDocumentHead } from "../../_components/WorkspacePageDocumentHead";
import { WorkspacePageScaffold } from "../../_components/WorkspacePageScaffold";
import { useUnifiedPostsContext } from "@/app/(workspace)/_context/UnifiedPostsContext";
import { fetchUnifiedPosts } from "@/lib/contentManager/unifiedPostsApi";
import { refreshSinglePost } from "@/lib/contentManager/refreshSinglePost";
import { ContentManagerCard } from "../../content-manager/_components/ContentManagerCard";
import type { ContentManagerPost } from "../../content-manager/_types/contentManagerTypes";
import { DraftEditorSuccessToast } from "../../content-manager/draft/[id]/_components/DraftEditorSuccessToast";
import { useDraftActionSuccessToast } from "../../content-manager/draft/[id]/_hooks/useDraftActionSuccessToast";
import { LeadRulesEditor } from "./LeadRulesEditor";

interface Lead {
  id: number;
  post_id: string;
  comment_author: string;
  comment_text: string;
  is_lead: boolean;
  lead_confidence: number | null;
  ai_reply_text: string | null;
}

interface WatcherRun {
  id: number;
  ran_at: string;
  comments_fetched: number;
  comments_replied: number;
  leads_detected: number;
  errors: number;
  status: string;
}

interface WatcherPost {
  post_id: string;
  platform: string;
  channel_id: string | null;
  page_id: string | null;
  organization_id: string | null;
  last_checked: string | null;
  total_comments: number;
  ai_replies_posted: number;
  leads_count: number;
  lead_keywords: string | null;
  lead_custom_rule: string | null;
  leads?: Lead[];
  runs?: WatcherRun[];
  cardPost?: ContentManagerPost;
  disabling?: boolean;
}

function nextRunTime(
  lastChecked: string | null,
  t: (key: string, vars?: Record<string, string | number>) => string,
): string {
  if (!lastChecked) return t("aiWatcher.nextRunPending");
  const next = new Date(new Date(lastChecked).getTime() + 60 * 60 * 1000);
  const diff = next.getTime() - Date.now();
  if (diff <= 0) return t("aiWatcher.nextRunDueNow");
  const mins = Math.round(diff / 60000);
  return mins < 60
    ? t("aiWatcher.nextRunInMinutes", { count: mins })
    : t("aiWatcher.nextRunInHours", { count: Math.round(mins / 60) });
}

export function AiWatcherScreen(): React.ReactElement {
  const { t } = useTranslations();
  const [posts, setPosts] = useState<WatcherPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedPost, setExpandedPost] = useState<string | null>(null);
  const [expandedRuns, setExpandedRuns] = useState<string | null>(null);
  const [editingRulesPost, setEditingRulesPost] = useState<string | null>(null);
  const [runningPost, setRunningPost] = useState<string | null>(null);
  const [refreshingPost, setRefreshingPost] = useState<string | null>(null);
  const { toast, toastKey, dismissToast, showToast } = useDraftActionSuccessToast();
  const { postsData: contextPostsData } = useUnifiedPostsContext();

  useEffect(() => { fetchEnabledPosts(); }, []);

  const fetchEnabledPosts = async () => {
    try {
      const token = getStoredAccessToken() ?? "";
      const workspaceId = getStoredActiveWorkspaceId() ?? "";
      if (!token || !workspaceId) return;

      const enabledPosts: WatcherPost[] = (await listEnabledWatcherPosts(token, workspaceId)).map(
        (p) => ({
          post_id: p.post_id,
          platform: p.platform,
          channel_id: p.channel_id,
          page_id: p.page_id,
          organization_id: p.organization_id,
          last_checked: p.last_checked,
          total_comments: p.total_comments,
          ai_replies_posted: p.ai_replies_posted,
          leads_count: p.leads_count,
          lead_keywords: p.lead_keywords,
          lead_custom_rule: p.lead_custom_rule,
        }),
      );

      const shouldFetch = !contextPostsData;
      console.log("[AiWatcher] context data available:", !!contextPostsData, "will fetch:", shouldFetch);

      // Collect org IDs per platform for correct post fetching
      const linkedinOrgIds = [...new Set(enabledPosts.filter(p => p.platform === "linkedin" && p.organization_id).map(p => p.organization_id as string))];
      const fbPageIds = [...new Set(enabledPosts.filter(p => p.platform === "facebook" && p.page_id).map(p => p.page_id as string))];
      const platforms = [...new Set(enabledPosts.map(p => p.platform))];

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const detailMap: Record<string, any> = {};
      
      if (shouldFetch) {
        // No context data, fetch from API
        await Promise.all(platforms.map(async (platform) => {
          try {
            const postsData = await fetchUnifiedPosts(token, workspaceId, {
              platforms: [platform],
              limit: 50,
              linkedinOrganizationIds: platform === "linkedin" ? linkedinOrgIds : [],
              facebookPageIds: platform === "facebook" ? fbPageIds : [],
            });
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const slice = (postsData as any)[platform];
            (slice?.posts ?? []).forEach((rp: any) => {
              const id = rp.post_id ?? rp.id;
              if (id) {
                detailMap[id] = rp;
                detailMap[`urn:li:share:${id}`] = rp;
                detailMap[`urn:li:ugcPost:${id}`] = rp;
              }
            });
          } catch (e) { console.warn(`[AiWatcher] failed to fetch posts for ${platform}`, e); }
        }));
      } else {
        // Use context data
        platforms.forEach((platform) => {
          const slice = (contextPostsData as any)[platform];
          (slice?.posts ?? []).forEach((rp: any) => {
            const id = rp.post_id ?? rp.id;
            if (id) {
              detailMap[id] = rp;
              detailMap[`urn:li:share:${id}`] = rp;
              detailMap[`urn:li:ugcPost:${id}`] = rp;
            }
          });
        });
      }
      console.log("[AiWatcher] detailMap size:", Object.keys(detailMap).length);

      setPosts(enabledPosts.map((wp) => {
        const raw: any = detailMap[wp.post_id];
        let cardPost: ContentManagerPost | undefined;
        if (raw) {
          const thumb = raw.videos?.thumbnailUrl || (raw.images ?? []).find((i: { url?: string }) => i.url && !/\.mp4/i.test(i.url))?.url;
          cardPost = {
            id: wp.post_id,
            status: "published",
            channel: wp.platform as ContentManagerPost["channel"],
            handle: raw.username || raw.handle || wp.platform,
            body: raw.commentary?.trim() || "",
            imageUrl: thumb,
            publishedPostUrl: raw.permalink,
          };
        }
        return { ...wp, cardPost };
      }));
    } catch (error) {
      console.error("Failed to fetch enabled posts:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchLeads = async (postId: string, platform: string) => {
    try {
      const token = localStorage.getItem("postsiva_access_token") ?? "";
      const workspaceId = localStorage.getItem("postsiva_workspace_id") ?? "";
      // Filter server-side by post_id and platform
      const params = new URLSearchParams({ platform, limit: "50" });
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_POSTSIVA_API_URL}/unified/ai-autoreplier/leads?${params}`,
        { headers: { Authorization: `Bearer ${token}`, "X-Workspace-Id": workspaceId } }
      );
      if (response.ok) {
        const data = await response.json();
        const allLeads: Lead[] = data.data?.leads ?? [];
        // Filter by post_id client-side as extra safety
        const postLeads = allLeads.filter(l => l.post_id === postId);
        setPosts(prev => prev.map(p => p.post_id === postId ? { ...p, leads: postLeads } : p));
      }
    } catch {}
  };

  const handleViewLeads = (postId: string, platform: string) => {
    if (expandedPost === postId) { setExpandedPost(null); return; }
    setExpandedPost(postId);
    const post = posts.find(p => p.post_id === postId);
    if (!post?.leads) fetchLeads(postId, platform);
  };

  const fetchRuns = async (postId: string, platform: string) => {
    try {
      const token = localStorage.getItem("postsiva_access_token") ?? "";
      const workspaceId = localStorage.getItem("postsiva_workspace_id") ?? "";
      const params = new URLSearchParams({ post_id: postId, platform, limit: "10" });
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_POSTSIVA_API_URL}/unified/ai-autoreplier/history?${params}`,
        { headers: { Authorization: `Bearer ${token}`, "X-Workspace-Id": workspaceId } }
      );
      if (res.ok) {
        const data = await res.json();
        const runs: WatcherRun[] = data.runs ?? data.data ?? [];
        setPosts(prev => prev.map(p => p.post_id === postId ? { ...p, runs } : p));
      }
    } catch {}
  };

  const handleViewRuns = (postId: string, platform: string) => {
    if (expandedRuns === postId) { setExpandedRuns(null); return; }
    setExpandedRuns(postId);
    const post = posts.find(p => p.post_id === postId);
    if (!post?.runs) fetchRuns(postId, platform);
  };

  const handleDisable = async (
    postId: string,
    platform: string,
    channelId?: string | null,
  ) => {
    setPosts(prev => prev.map(p => p.post_id === postId ? { ...p, disabling: true } : p));
    try {
      const token = getStoredAccessToken() ?? "";
      const workspaceId = getStoredActiveWorkspaceId() ?? "";
      await disableAiAutoreplier(token, workspaceId, {
        post_id: postId,
        platform,
        channel_id: channelId ?? null,
      });
      if (platform.trim().toLowerCase() === "wordpress") {
        await fetchUnifiedBlogPosts(token, workspaceId, {
          limit: 1,
          forceRefresh: true,
        });
      } else {
        await fetch(
          `${getApiBaseUrl()}/unified/posts/?platforms=${platform}&limit=1&force_refresh=true`,
          { headers: { Authorization: `Bearer ${token}`, "X-Workspace-Id": workspaceId } },
        );
      }
      setPosts(prev => prev.filter(p => p.post_id !== postId));
    } catch {
      setPosts(prev => prev.map(p => p.post_id === postId ? { ...p, disabling: false } : p));
    }
  };

  const handleForceRun = async (postId: string, platform: string) => {
    setRunningPost(postId);
    try {
      const token = localStorage.getItem("postsiva_access_token") ?? "";
      const workspaceId = localStorage.getItem("postsiva_workspace_id") ?? "";
      // encodeURIComponent handles Bluesky at:// and LinkedIn urn:li: URIs
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_POSTSIVA_API_URL}/unified/ai-autoreplier/force-run/${encodeURIComponent(postId)}?platform=${platform}`,
        { method: "POST", headers: { Authorization: `Bearer ${token}`, "X-Workspace-Id": workspaceId } }
      );
      const result = await res.json();
      const replied = result.total_replies_posted ?? 0;
      const errors = result.total_errors ?? 0;
      showToast(
        errors === 0 ? t("aiWatcher.toastRunComplete") : t("aiWatcher.toastRunWithErrors"),
        t("aiWatcher.toastRunSummary", { replied, errors }),
      );
      fetchEnabledPosts();
    } catch {
      showToast(t("aiWatcher.toastRunFailed"), t("aiWatcher.toastRunFailedHint"));
    } finally {
      setRunningPost(null);
    }
  };

  const handleRefreshPost = async (postId: string, platform: string, organizationId?: string | null, pageId?: string | null) => {
    setRefreshingPost(postId);
    try {
      const token = localStorage.getItem("postsiva_access_token") ?? "";
      const workspaceId = localStorage.getItem("postsiva_workspace_id") ?? "";
      const data = await refreshSinglePost(token, workspaceId, postId, platform, organizationId, pageId);
      const slice = (data as any)[platform];
      const post = (slice?.posts ?? [])[0];
      if (post) {
        setPosts(prev => prev.map(p => p.post_id === postId ? { ...p, cardPost: { id: postId, status: "published", channel: platform as any, handle: post.username || post.handle || platform, body: post.commentary?.trim() || "", imageUrl: post.videos?.thumbnailUrl || (post.images ?? [])[0]?.url, publishedPostUrl: post.permalink } } : p));
        showToast(
          t("content.toastPostRefreshed"),
          t("aiWatcher.toastPostRefreshedMediaHint"),
        );
      } else {
        showToast(
          t("content.toastPostNotFound"),
          t("content.toastPostNotFoundHint"),
        );
      }
    } catch (e) {
      showToast(
        t("content.toastRefreshFailed"),
        e instanceof Error ? e.message : t("content.toastRefreshFailedHint"),
      );
    } finally {
      setRefreshingPost(null);
    }
  };

  const leadRulesPost =
    editingRulesPost !== null
      ? posts.find((p) => p.post_id === editingRulesPost) ?? null
      : null;

  if (loading) {
    return (
      <WorkspacePageScaffold accountRail>
        <WorkspacePageDocumentHead
          titleKey="aiWatcher.metaTitle"
          descriptionKey="aiWatcher.metaDescription"
        />
        <header className="mb-8">
          <h1 className="text-3xl font-extrabold tracking-tight text-on-surface md:text-4xl">
            {t("aiWatcher.title")}
          </h1>
          <p className="mt-2 max-w-xl text-sm text-on-surface-variant">
            {t("aiWatcher.subtitle")}
          </p>
        </header>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3 xl:grid-cols-4 xl:gap-8">
          {[...Array(8)].map((_, i) => (
            <article key={i} className="flex flex-col overflow-hidden rounded-3xl bg-surface-container-low shadow-2xl" aria-hidden>
              <div className="relative aspect-video overflow-hidden bg-surface-container">
                <div className="absolute left-4 top-4 h-7 w-28 animate-pulse rounded-full bg-on-surface-variant/15" />
                <div className="h-full w-full bg-on-surface-variant/10 inbox-skeleton-shimmer" />
              </div>
              <div className="flex flex-grow flex-col p-6">
                <div className="mb-4 flex items-center gap-3">
                  <div className="h-8 w-8 animate-pulse rounded-lg bg-on-surface-variant/15" />
                  <div className="h-4 w-32 animate-pulse rounded-md bg-on-surface-variant/15" />
                </div>
                <div className="mb-2 h-4 w-full animate-pulse rounded-md bg-on-surface-variant/10" />
                <div className="mb-6 h-4 w-[85%] max-w-[280px] animate-pulse rounded-md bg-on-surface-variant/10" />
                <div className="mb-6 grid grid-cols-3 gap-2">
                  <div className="h-[72px] animate-pulse rounded-xl bg-on-surface-variant/10" />
                  <div className="h-[72px] animate-pulse rounded-xl bg-on-surface-variant/10" />
                  <div className="h-[72px] animate-pulse rounded-xl bg-on-surface-variant/10" />
                </div>
                <div className="mt-auto border-t border-outline-variant/10 pt-4">
                  <div className="h-10 w-full animate-pulse rounded-xl bg-on-surface-variant/15" />
                </div>
              </div>
            </article>
          ))}
        </div>
      </WorkspacePageScaffold>
    );
  }

  return (
    <WorkspacePageScaffold accountRail>
      <WorkspacePageDocumentHead
        titleKey="aiWatcher.metaTitle"
        descriptionKey="aiWatcher.metaDescription"
      />
      <DraftEditorSuccessToast key={toastKey} title={toast?.title ?? ""} subtitle={toast?.subtitle ?? ""} onDismiss={dismissToast} />
      <LeadRulesEditor
        open={leadRulesPost !== null}
        postId={leadRulesPost?.post_id ?? ""}
        platform={leadRulesPost?.platform ?? ""}
        channelId={leadRulesPost?.channel_id}
        initialKeywords={leadRulesPost?.lead_keywords ?? null}
        initialCustomRule={leadRulesPost?.lead_custom_rule ?? null}
        onCancel={() => setEditingRulesPost(null)}
        onSaved={(keywords, customRule) => {
          const id = leadRulesPost?.post_id;
          if (!id) {
            return;
          }
          setPosts((prev) =>
            prev.map((p) =>
              p.post_id === id
                ? { ...p, lead_keywords: keywords, lead_custom_rule: customRule }
                : p,
            ),
          );
          setEditingRulesPost(null);
          showToast(
            t("aiWatcher.toastLeadRulesSaved"),
            t("aiWatcher.toastLeadRulesSavedHint"),
          );
        }}
      />
      <header className="mb-6 sm:mb-8">
        <h1 className="text-2xl font-extrabold tracking-tight text-on-surface sm:text-3xl md:text-4xl">
          {t("aiWatcher.title")}
        </h1>
        <p className="mt-2 max-w-xl text-sm text-on-surface-variant">
          {t("aiWatcher.subtitle")}
        </p>
      </header>

      {posts.length === 0 ? (
        <div className="rounded-2xl border border-outline-variant/10 bg-surface-container p-8 text-center sm:p-12">
          <span className="material-symbols-outlined text-5xl text-on-surface-variant">visibility_off</span>
          <p className="mt-4 text-on-surface-variant">{t("aiWatcher.empty")}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3 xl:grid-cols-4 xl:gap-8">
          {posts.map((wp) => (
            <div key={wp.post_id} className="relative flex flex-col gap-3">
              {/* Refresh button — always visible top-right */}
              <button
                onClick={() => handleRefreshPost(wp.post_id, wp.platform, wp.organization_id, wp.page_id)}
                disabled={refreshingPost === wp.post_id}
                title={t("aiWatcher.refreshPost")}
                className="absolute right-2 top-2 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm hover:bg-black/70 disabled:opacity-50"
              >
                <span className={`material-symbols-outlined text-sm ${refreshingPost === wp.post_id ? "animate-spin" : ""}`}>refresh</span>
              </button>
              {wp.cardPost ? (
                <ContentManagerCard
                  post={wp.cardPost}
                  aiWatcherData={{
                    total_comments: wp.cardPost ? Number(wp.cardPost.metrics?.comments ?? wp.total_comments) : wp.total_comments,
                    leads_count: wp.leads_count,
                    ai_replies_posted: wp.ai_replies_posted,
                    last_checked: wp.last_checked,
                    next_run: nextRunTime(wp.last_checked, t),
                    isRunning: runningPost === wp.post_id,
                    isDisabling: wp.disabling === true,
                    onViewLeads: () => handleViewLeads(wp.post_id, wp.platform),
                    onViewRuns: () => handleViewRuns(wp.post_id, wp.platform),
                    onRunNow: () => handleForceRun(wp.post_id, wp.platform),
                    onDisable: () => handleDisable(wp.post_id, wp.platform, wp.channel_id),
                    onEditLeadRules: () => setEditingRulesPost(wp.post_id),
                    hasCustomLeadRules: Boolean(
                      wp.lead_keywords?.trim() || wp.lead_custom_rule?.trim(),
                    ),
                  }}
                />
              ) : (
                <div className="rounded-3xl bg-surface-container-low p-4 text-xs text-on-surface-variant break-all">
                  <p className="font-bold capitalize">{wp.platform}</p>
                  <p className="mt-1 opacity-60">{wp.post_id}</p>
                  <div className="mt-3 flex gap-2">
                    <button onClick={() => handleRefreshPost(wp.post_id, wp.platform, wp.organization_id, wp.page_id)} disabled={refreshingPost === wp.post_id}
                      className="rounded-lg bg-surface-container px-3 py-1.5 text-xs font-bold text-on-surface disabled:opacity-50">
                      {refreshingPost === wp.post_id
                        ? t("aiWatcher.refreshing")
                        : t("aiWatcher.refresh")}
                    </button>
                    <button onClick={() => handleForceRun(wp.post_id, wp.platform)} disabled={runningPost === wp.post_id}
                      className="rounded-lg bg-surface-container px-3 py-1.5 text-xs font-bold text-on-surface disabled:opacity-50">
                      {runningPost === wp.post_id
                        ? t("aiWatcher.running")
                        : t("aiWatcher.runNow")}
                    </button>
                    <button onClick={() => handleDisable(wp.post_id, wp.platform, wp.channel_id)}
                      className="rounded-lg bg-error/10 px-3 py-1.5 text-xs font-bold text-error">
                      {t("aiWatcher.disable")}
                    </button>
                  </div>
                </div>
              )}

              {expandedPost === wp.post_id && (
                <div className="rounded-2xl bg-surface-container-low p-4 space-y-2">
                  <h3 className="text-[10px] font-bold uppercase tracking-wide text-on-surface-variant">{t("aiWatcher.leadsTitle")}</h3>
                  {!wp.leads ? (
                    <p className="text-xs text-on-surface-variant">{t("aiWatcher.leadsLoading")}</p>
                  ) : wp.leads.length === 0 ? (
                    <p className="text-xs text-on-surface-variant">{t("aiWatcher.leadsEmpty")}</p>
                  ) : (
                    wp.leads.map((lead) => (
                      <div key={lead.id} className={`rounded-lg border p-2.5 ${lead.is_lead ? "border-secondary/30 bg-secondary/5" : "border-outline-variant/20 bg-surface"}`}>
                        <div className="flex items-start justify-between gap-2">
                          <span className="text-xs font-bold text-on-surface">{lead.comment_author || t("aiWatcher.leadsAnonymous")}</span>
                          {lead.is_lead && lead.lead_confidence && (
                            <span className="rounded-full bg-secondary/20 px-1.5 py-0.5 text-[9px] font-bold text-secondary">
                              {Math.round(lead.lead_confidence * 100)}%
                            </span>
                          )}
                        </div>
                        <p className="mt-1 text-xs text-on-surface-variant">{lead.comment_text}</p>
                        {lead.ai_reply_text && (
                          <div className="mt-1.5 rounded-md bg-primary/10 p-1.5">
                            <p className="text-[9px] font-bold uppercase tracking-wide text-primary">{t("aiWatcher.leadsAiReply")}</p>
                            <p className="mt-0.5 text-xs text-on-surface">{lead.ai_reply_text}</p>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              )}

              {expandedRuns === wp.post_id && (
                <div className="rounded-2xl bg-surface-container-low p-4 space-y-2">
                  <h3 className="text-[10px] font-bold uppercase tracking-wide text-on-surface-variant">{t("aiWatcher.runsTitle")}</h3>
                  {!wp.runs ? (
                    <p className="text-xs text-on-surface-variant">{t("aiWatcher.runsLoading")}</p>
                  ) : wp.runs.length === 0 ? (
                    <p className="text-xs text-on-surface-variant">{t("aiWatcher.runsEmpty")}</p>
                  ) : (
                    wp.runs.map((run) => (
                      <div key={run.id} className="rounded-lg border border-outline-variant/20 bg-surface p-2.5">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[10px] text-on-surface-variant">{new Date(run.ran_at).toLocaleString()}</span>
                          <span className={`rounded-full px-1.5 py-0.5 text-[9px] font-bold ${run.status === "success" ? "bg-secondary/15 text-secondary" : "bg-surface-container-high text-on-surface-variant"}`}>
                            {run.status}
                          </span>
                        </div>
                        <div className="mt-1.5 flex gap-3 text-[10px] text-on-surface-variant">
                          <span><span className="font-bold text-on-surface">{run.comments_fetched}</span> {t("aiWatcher.runsFetched")}</span>
                          <span><span className="font-bold text-secondary">{run.leads_detected}</span> {t("aiWatcher.runsLeads")}</span>
                          <span><span className="font-bold text-primary">{run.comments_replied}</span> {t("aiWatcher.runsReplied")}</span>
                          {run.errors > 0 && <span><span className="font-bold text-on-surface-variant">{run.errors}</span> {t("aiWatcher.runsErrors")}</span>}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </WorkspacePageScaffold>
  );
}
