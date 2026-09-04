"use client";

import { useEffect, useState } from "react";

import { OpenBillingButton } from "@/components/billing/OpenBillingButton";
import { Toast } from "@/components/Toast";
import { usePlanFeature } from "@/lib/billing/BillingContext";
import { useTranslations } from "@/lib/i18n/WorkspaceLocaleProvider";

import { WorkspacePageScaffold } from "../../_components/WorkspacePageScaffold";
import { PUBLISHED_POSTS } from "../_data/publishedSeed";

const FILTERS = ["All", "LinkedIn", "X", "Instagram"] as const;

export function PublishedPostsScreen(): React.ReactElement {
  const { t } = useTranslations();
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("All");
  const [enabledPosts, setEnabledPosts] = useState<Set<string>>(new Set());
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const { enabled: aiWatcherAllowed, loading: billingLoading } = usePlanFeature("ai_watcher_enabled");

  useEffect(() => {
    const fetchEnabled = async () => {
      try {
        const token = localStorage.getItem("postsiva_access_token");
        const workspaceId = localStorage.getItem("postsiva_workspace_id");
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_POSTSIVA_API_URL}/unified/ai-autoreplier/list`,
          { headers: { Authorization: `Bearer ${token}`, "X-Workspace-Id": workspaceId || "" } }
        );
        if (res.ok) {
          const data = await res.json();
          const ids = (data.enabled_posts || []).map((p: { post_id: string }) => p.post_id);
          setEnabledPosts(new Set(ids));
        }
      } catch {}
    };
    fetchEnabled();
  }, []);
  
  const list =
    filter === "All"
      ? PUBLISHED_POSTS
      : PUBLISHED_POSTS.filter((p) => p.channel === filter);

  const handleEnableAI = async (postId: string, platform: string) => {
    try {
      const token = localStorage.getItem("postsiva_access_token");
      const workspaceId = localStorage.getItem("postsiva_workspace_id");
      
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_POSTSIVA_API_URL}/unified/ai-autoreplier/enable`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "X-Workspace-Id": workspaceId || "",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ 
            post_id: postId, 
            platform: platform.toLowerCase() 
          }),
        }
      );
      
      if (response.ok) {
        setEnabledPosts(prev => new Set(prev).add(postId));
        setToast({ message: t("postScheduler.published.aiWatcherEnabled"), type: "success" });
      } else {
        setToast({ message: t("postScheduler.published.aiWatcherFailed"), type: "error" });
      }
    } catch (error) {
      console.error("Failed to enable AI replier:", error);
      setToast({ message: t("postScheduler.published.aiWatcherFailed"), type: "error" });
    }
  };

  return (
    <WorkspacePageScaffold>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      <header className="mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight text-on-surface md:text-4xl">
          {t("postScheduler.published.title")}{" "}
          <span className="text-secondary">{t("postScheduler.published.titleAccent")}</span>
        </h1>
        <p className="mt-2 max-w-xl text-sm text-on-surface-variant">
          {t("postScheduler.published.subtitle")}
        </p>
      </header>
      <div className="mb-8 flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            className={`rounded-full px-4 py-2 text-xs font-bold transition-colors ${
              filter === f
                ? "bg-primary-container text-on-primary-container"
                : "bg-surface-container-high text-on-surface-variant hover:text-on-surface"
            }`}
          >
            {f === "All" ? t("postScheduler.published.filterAll") : f}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {list.map((p) => (
          <article
            key={p.id}
            className="rounded-2xl border border-outline-variant/10 bg-surface-container p-5 shadow-lg"
          >
            <div className="flex items-start justify-between gap-2">
              <span className="rounded-lg bg-surface-container-high px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-secondary">
                {p.channel}
              </span>
              <span className="text-xs text-on-surface-variant">{p.date}</span>
            </div>
            <h2 className="mt-3 text-lg font-bold text-on-surface">
              {p.title}
            </h2>
            <p className="mt-2 text-sm text-on-surface-variant">{p.excerpt}</p>
            <div className="mt-4 flex items-center justify-between">
              <p className="text-xs font-semibold text-on-surface">
                {p.metric}
              </p>
              {aiWatcherAllowed ? (
                enabledPosts.has(p.id) ? (
                  <button
                    type="button"
                    disabled
                    className="flex items-center gap-1.5 rounded-lg bg-secondary/20 px-3 py-1.5 text-xs font-bold text-secondary"
                  >
                    <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>
                      check_circle
                    </span>
                    {t("postScheduler.published.aiWatcherEnabledBtn")}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleEnableAI(p.id, "instagram")}
                    className="flex items-center gap-1.5 rounded-lg bg-secondary/15 px-3 py-1.5 text-xs font-bold text-secondary transition-colors hover:bg-secondary/25"
                  >
                    <span className="material-symbols-outlined text-sm">smart_toy</span>
                    {t("postScheduler.published.enableAiReplier")}
                  </button>
                )
              ) : !billingLoading ? (
                <OpenBillingButton
                  className="flex items-center gap-1.5 rounded-lg border border-outline-variant/20 bg-surface-container-high px-3 py-1.5 text-xs font-bold text-on-surface-variant transition-colors hover:bg-surface-container"
                >
                  <span className="material-symbols-outlined text-sm">lock</span>
                  {t("postScheduler.published.agencyPlan")}
                </OpenBillingButton>
              ) : null}
            </div>
          </article>
        ))}
      </div>
    </WorkspacePageScaffold>
  );
}
