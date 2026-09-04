"use client";

import { useState } from "react";

import { OpenBillingButton } from "@/components/billing/OpenBillingButton";
import { usePlanFeature } from "@/lib/billing/BillingContext";
import { getStoredAccessToken, getStoredActiveWorkspaceId } from "@/lib/auth/session";
import { enableAiAutoreplier } from "@/lib/social/aiAutoreplierApi";
import { useTranslations } from "@/lib/i18n/WorkspaceLocaleProvider";

import type { ContentManagerPost } from "../_types/contentManagerTypes";

/** Matches scheduled + draft card footers: icon buttons left, delete right. */
const footerIconButtonClass =
  "rounded-lg bg-surface-container p-2 text-on-surface-variant transition-colors hover:bg-surface-container-high hover:text-on-surface";
const footerDeleteButtonClass =
  "p-2 text-error/70 transition-colors hover:text-error";

interface ContentManagerCardFooterProps {
  post: ContentManagerPost;
  onOpenDraftEditor?: (post: ContentManagerPost) => void;
  onOpenScheduledEditor?: (post: ContentManagerPost) => void;
  onRequestDeleteDraft?: (post: ContentManagerPost) => void;
  aiWatcherData?: {
    total_comments: number;
    leads_count: number;
    ai_replies_posted: number;
    last_checked: string | null;
    next_run?: string;
    isRunning?: boolean;
    isDisabling?: boolean;
    onViewLeads: () => void;
    onViewRuns: () => void;
    onRunNow: () => void;
    onDisable: () => void;
    onEditLeadRules?: () => void;
    hasCustomLeadRules?: boolean;
  };
  /** Called after AI watcher is successfully enabled — parent shows the toast */
  onAiWatcherEnabled?: () => void;
}

export function ContentManagerCardFooter({
  post,
  onOpenDraftEditor,
  onOpenScheduledEditor,
  onRequestDeleteDraft,
  aiWatcherData,
  onAiWatcherEnabled,
}: ContentManagerCardFooterProps): React.ReactElement {
  const { t } = useTranslations();
  const [localEnabled, setLocalEnabled] = useState<boolean | null>(null);
  const [enabling, setEnabling] = useState(false);
  const { enabled: aiWatcherAllowed, loading: billingLoading } = usePlanFeature("ai_watcher_enabled");

  const aiEnabled = localEnabled ?? (post.aiWatcherEnabled === true);

  const handleEnableAI = async () => {
    setEnabling(true);
    try {
      const token = getStoredAccessToken();
      const workspaceId = getStoredActiveWorkspaceId();
      if (!token?.trim() || !workspaceId?.trim()) {
        return;
      }

      await enableAiAutoreplier(token, workspaceId, {
        post_id: post.id,
        platform: post.channel.toLowerCase(),
        page_id: post.pageId ?? null,
        organization_id: post.organizationId ?? null,
        channel_id: post.youtubeChannelId ?? null,
      });

      setLocalEnabled(true);
      onAiWatcherEnabled?.();
    } catch (error) {
      console.error("Failed to enable AI watcher:", error);
    } finally {
      setEnabling(false);
    }
  };

  return (
    <div className="mt-auto border-t border-outline-variant/10 pt-4">
      {post.status === "published" ? (
        <div className="space-y-2">
          {aiWatcherData && aiWatcherAllowed ? (
            <>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="rounded-xl bg-surface-container p-2">
                  <span className="block text-sm font-bold text-on-surface">{aiWatcherData.total_comments}</span>
                  <span className="block text-[9px] uppercase tracking-tighter text-on-surface-variant">{t("content.aiWatcherComments")}</span>
                </div>
                <div className="rounded-xl bg-surface-container p-2">
                  <span className="block text-sm font-bold text-secondary">{aiWatcherData.leads_count}</span>
                  <span className="block text-[9px] uppercase tracking-tighter text-on-surface-variant">{t("content.aiWatcherLeads")}</span>
                </div>
                <div className="rounded-xl bg-surface-container p-2">
                  <span className="block text-sm font-bold text-primary">{aiWatcherData.ai_replies_posted}</span>
                  <span className="block text-[9px] uppercase tracking-tighter text-on-surface-variant">{t("content.aiWatcherReplies")}</span>
                </div>
              </div>
              <p className="text-[10px] text-on-surface-variant">
                <span className="font-semibold">{t("content.aiWatcherLastRun")}</span>{" "}
                {aiWatcherData.last_checked ? new Date(aiWatcherData.last_checked).toLocaleString() : t("content.aiWatcherNever")}
              </p>
              {aiWatcherData.next_run && (
                <p className="text-[10px] text-on-surface-variant">
                  <span className="font-semibold">{t("content.aiWatcherNextRun")}</span>{" "}{aiWatcherData.next_run}
                </p>
              )}
              <div className="grid grid-cols-2 gap-1.5">
                <button type="button" onClick={aiWatcherData.onViewLeads}
                  className="flex items-center justify-center gap-1 rounded-xl bg-surface-container py-2 text-xs font-bold text-on-surface transition-colors hover:bg-surface-container-high">
                  <span className="material-symbols-outlined text-sm">manage_search</span>
                  {t("content.aiWatcherLeads")}
                </button>
                <button type="button" onClick={aiWatcherData.onRunNow} disabled={aiWatcherData.isRunning}
                  className="flex items-center justify-center gap-1 rounded-xl bg-surface-container py-2 text-xs font-bold text-on-surface transition-colors hover:bg-surface-container-high disabled:opacity-50 disabled:cursor-not-allowed">
                  <span className="material-symbols-outlined text-sm">{aiWatcherData.isRunning ? "hourglass_empty" : "play_arrow"}</span>
                  {aiWatcherData.isRunning ? t("content.aiWatcherRunning") : t("content.aiWatcherRunNow")}
                </button>
                <button type="button" onClick={aiWatcherData.onViewRuns}
                  className="flex items-center justify-center gap-1 rounded-xl bg-surface-container py-2 text-xs font-bold text-on-surface transition-colors hover:bg-surface-container-high">
                  <span className="material-symbols-outlined text-sm">history</span>
                  {t("content.aiWatcherPrevRuns")}
                </button>
                <button type="button" onClick={aiWatcherData.onDisable} disabled={aiWatcherData.isDisabling}
                  className="flex items-center justify-center gap-1 rounded-xl bg-surface-container py-2 text-xs font-bold text-on-surface-variant transition-colors hover:bg-surface-container-high disabled:opacity-60 disabled:cursor-not-allowed">
                  <span className={`material-symbols-outlined text-sm ${aiWatcherData.isDisabling ? "animate-spin" : ""}`}>
                    {aiWatcherData.isDisabling ? "progress_activity" : "stop_circle"}
                  </span>
                  {aiWatcherData.isDisabling ? t("content.aiWatcherDisabling") : t("content.aiWatcherDisable")}
                </button>
              </div>
              {aiWatcherData.onEditLeadRules ? (
                <button
                  type="button"
                  onClick={aiWatcherData.onEditLeadRules}
                  className="flex w-full items-center justify-center gap-1 rounded-xl border border-secondary/25 bg-secondary/5 py-2 text-xs font-bold text-secondary transition-colors hover:bg-secondary/10"
                >
                  <span className="material-symbols-outlined text-sm">tune</span>
                  {aiWatcherData.hasCustomLeadRules ? t("content.aiWatcherEditLeadRules") : t("content.aiWatcherSetLeadRules")}
                </button>
              ) : null}
            </>
          ) : (
            <>
              {post.publishedPostUrl ? (
                <a href={post.publishedPostUrl} target="_blank" rel="noopener noreferrer"
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-surface-container py-2 text-sm font-bold text-on-surface transition-colors hover:bg-surface-container-high">
                  <span className="material-symbols-outlined text-lg">open_in_new</span>
                  {t("content.seePost")}
                </a>
              ) : (
                <button type="button" disabled
                  className="flex w-full cursor-not-allowed items-center justify-center gap-2 rounded-xl border border-outline-variant/15 bg-surface-container/50 py-2 text-sm font-bold text-on-surface-variant/70">
                  <span className="material-symbols-outlined text-lg">link_off</span>
                  {t("content.seePost")}
                </button>
              )}
              {aiWatcherAllowed ? (
                aiEnabled ? (
                  <button type="button" disabled
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-secondary/20 py-2 text-sm font-bold text-secondary">
                    <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                    {t("content.aiWatcherEnabled")}
                  </button>
                ) : (
                  <button type="button" onClick={handleEnableAI} disabled={enabling}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-surface-container py-2 text-sm font-bold text-on-surface transition-colors hover:bg-surface-container-high disabled:opacity-60 disabled:cursor-not-allowed">
                    <span className={`material-symbols-outlined text-lg ${enabling ? "animate-spin" : ""}`}>
                      {enabling ? "progress_activity" : "smart_toy"}
                    </span>
                    {enabling ? t("content.aiWatcherEnabling") : t("content.aiWatcherEnable")}
                  </button>
                )
              ) : !billingLoading ? (
                <OpenBillingButton
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-outline-variant/20 bg-surface-container/50 py-2 text-sm font-bold text-on-surface-variant transition-colors hover:bg-surface-container-high"
                >
                  <span className="material-symbols-outlined text-lg">lock</span>
                  {t("content.aiWatcherAgencyPlan")}
                </OpenBillingButton>
              ) : null}
            </>
          )}
        </div>
      ) : null}
      {post.status === "scheduled" ? (
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => {
                onOpenScheduledEditor?.(post);
              }}
              className={footerIconButtonClass}
              aria-label={t("content.actionEdit")}
            >
              <span className="material-symbols-outlined text-lg">edit</span>
            </button>
            <button
              type="button"
              onClick={() => {
                onOpenScheduledEditor?.(post);
              }}
              className={footerIconButtonClass}
              aria-label={t("content.actionPreview")}
            >
              <span className="material-symbols-outlined text-lg">
                visibility
              </span>
            </button>
          </div>
          <button
            type="button"
            className={footerDeleteButtonClass}
            aria-label={t("content.actionDelete")}
          >
            <span className="material-symbols-outlined text-lg">delete</span>
          </button>
        </div>
      ) : null}
      {post.status === "draft" && post.sourceDraftId ? (
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => {
                onOpenDraftEditor?.(post);
              }}
              className={footerIconButtonClass}
              aria-label={t("content.actionEdit")}
            >
              <span className="material-symbols-outlined text-lg">edit</span>
            </button>
            <button
              type="button"
              onClick={() => {
                onOpenDraftEditor?.(post);
              }}
              className={footerIconButtonClass}
              aria-label={t("content.actionPreview")}
            >
              <span className="material-symbols-outlined text-lg">
                visibility
              </span>
            </button>
          </div>
          <button
            type="button"
            onClick={() => {
              onRequestDeleteDraft?.(post);
            }}
            className={footerDeleteButtonClass}
            aria-label={t("content.actionDeleteDraft")}
          >
            <span className="material-symbols-outlined text-lg">delete</span>
          </button>
        </div>
      ) : null}
      {post.status === "draft" && !post.sourceDraftId && post.draftMedia === "empty" ? (
        <button
          type="button"
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary-container py-2.5 text-sm font-bold text-on-primary-container shadow-lg shadow-primary-container/20 transition-all active:scale-95"
        >
          <span className="material-symbols-outlined text-lg">
            auto_awesome
          </span>
          {t("content.completeWithAi")}
        </button>
      ) : null}
      {post.status === "draft" && !post.sourceDraftId && post.draftMedia === "video" ? (
        <div className="flex gap-3">
          <button
            type="button"
            className="flex-1 rounded-xl bg-surface-container py-2.5 text-sm font-bold text-on-surface transition-all hover:bg-surface-container-high"
          >
            {t("content.openEditor")}
          </button>
          <button
            type="button"
            className="rounded-xl bg-surface-container p-2.5 text-on-surface transition-all hover:bg-surface-container-high"
            aria-label={t("content.actionMore")}
          >
            <span className="material-symbols-outlined text-lg">
              more_horiz
            </span>
          </button>
        </div>
      ) : null}
    </div>
  );
}
