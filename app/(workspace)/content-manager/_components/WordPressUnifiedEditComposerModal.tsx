"use client";

import { useEffect, useMemo, type ReactElement } from "react";

import { useTranslations } from "@/lib/i18n/WorkspaceLocaleProvider";
import type { UnifiedDraftResponseJson } from "@/lib/social/unifiedDraftsApi";
import type { UnifiedScheduledPostItemJson } from "@/lib/social/unifiedScheduledPostsApi";
import {
  composerSessionSnapshotFromWordPressHydrated,
  hydrateWordPressComposerFromDraft,
  hydrateWordPressComposerFromScheduled,
} from "@/lib/post-composer/hydrateWordPressComposerFromPostData";

import { PostSchedulerComposerShell } from "../../post-scheduler/_components/PostSchedulerComposerShell";
import { PostSchedulerComposerSection } from "../../post-scheduler/_components/PostSchedulerComposerSection";
import { PostSchedulerAiDrawerHost } from "../../post-scheduler/_components/PostSchedulerAiDrawerHost";
import { PostSchedulerComposerEditModeProvider } from "../_context/PostSchedulerComposerEditModeContext";
import { WordPressComposerHydrator } from "./WordPressComposerHydrator";
import { WordPressUnifiedEditActionBar } from "./WordPressUnifiedEditActionBar";

export function WordPressUnifiedEditComposerModal({
  mode,
  draft,
  scheduled,
  onClose,
  onUpdateSuccess,
  onScheduleComplete,
  onPublishSuccess,
  onDeleteSuccess,
  onMoveToDraftSuccess,
}: {
  mode: "draft" | "scheduled";
  draft?: UnifiedDraftResponseJson | null;
  scheduled?: UnifiedScheduledPostItemJson | null;
  onClose: () => void;
  onUpdateSuccess?: () => void;
  onScheduleComplete?: () => void;
  onPublishSuccess?: () => void;
  onDeleteSuccess?: () => void;
  onMoveToDraftSuccess?: () => void;
}): ReactElement | null {
  const open = mode === "draft" ? Boolean(draft) : Boolean(scheduled);

  useEffect(() => {
    if (!open) {
      return;
    }
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!open) {
    return null;
  }

  const hydrated =
    mode === "draft" && draft
      ? hydrateWordPressComposerFromDraft(draft)
      : mode === "scheduled" && scheduled
        ? hydrateWordPressComposerFromScheduled({
            platform_user_id: scheduled.platform_user_id,
            post_data: scheduled.post_data,
          })
        : null;

  if (!hydrated) {
    return null;
  }

  return (
    <WordPressUnifiedEditComposerModalBody
      key={mode === "draft" ? draft?.id : scheduled?.scheduled_post_id}
      mode={mode}
      hydrated={hydrated}
      draftId={draft?.id}
      scheduledPostId={scheduled?.scheduled_post_id}
      onClose={onClose}
      onUpdateSuccess={onUpdateSuccess}
      onScheduleComplete={onScheduleComplete}
      onPublishSuccess={onPublishSuccess}
      onDeleteSuccess={onDeleteSuccess}
      onMoveToDraftSuccess={onMoveToDraftSuccess}
    />
  );
}

function WordPressUnifiedEditComposerModalBody({
  mode,
  hydrated,
  draftId,
  scheduledPostId,
  onClose,
  onUpdateSuccess,
  onScheduleComplete,
  onPublishSuccess,
  onDeleteSuccess,
  onMoveToDraftSuccess,
}: {
  mode: "draft" | "scheduled";
  hydrated: ReturnType<typeof hydrateWordPressComposerFromDraft>;
  draftId?: string;
  scheduledPostId?: string;
  onClose: () => void;
  onUpdateSuccess?: () => void;
  onScheduleComplete?: () => void;
  onPublishSuccess?: () => void;
  onDeleteSuccess?: () => void;
  onMoveToDraftSuccess?: () => void;
}): ReactElement {
  const { t } = useTranslations();
  const connectionId = useMemo(
    () => hydrated.connectionAccountId.replace(/^wordpress:/, ""),
    [hydrated.connectionAccountId],
  );
  const sessionBootstrap = useMemo(
    () => composerSessionSnapshotFromWordPressHydrated(hydrated),
    [hydrated],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent): void => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[120] flex items-end justify-center sm:items-center">
      <button
        type="button"
        aria-label={t("content.draftModalCloseAria")}
        className="draft-editor-modal-backdrop-animate absolute inset-0 z-[120] bg-black/70"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="wordpress-edit-composer-title"
        className="draft-editor-modal-shell-animate relative z-[121] flex max-h-[min(94vh,920px)] w-full max-w-[min(96vw,1400px)] flex-col overflow-hidden rounded-t-3xl border border-outline-variant/20 bg-surface shadow-2xl sm:mx-4 sm:rounded-3xl"
      >
        <header className="flex shrink-0 items-center justify-between gap-4 border-b border-outline-variant/10 px-4 py-4 md:px-6">
          <h2
            id="wordpress-edit-composer-title"
            className="text-lg font-extrabold text-on-surface md:text-xl"
          >
            {mode === "draft"
              ? t("content.draftEditTitle")
              : t("content.scheduledEditTitle")}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-2 text-on-surface-variant transition-colors hover:bg-surface-container hover:text-on-surface"
            aria-label={t("content.actionClose")}
          >
            <span className="material-symbols-outlined text-2xl">close</span>
          </button>
        </header>
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
          <PostSchedulerComposerEditModeProvider mode={mode}>
            <PostSchedulerComposerShell
              lockedAccountId={hydrated.connectionAccountId}
              sessionBootstrap={sessionBootstrap}
            >
              <WordPressComposerHydrator state={hydrated} />
              <PostSchedulerAiDrawerHost
                manageBodyScroll={false}
                drawerVariant="modalPanel"
                stickyFooter={
                  <WordPressUnifiedEditActionBar
                    mode={mode}
                    connectionId={connectionId}
                    draftId={draftId}
                    scheduledPostId={scheduledPostId}
                    onClose={onClose}
                    onUpdateSuccess={onUpdateSuccess}
                    onScheduleComplete={() => {
                      onScheduleComplete?.();
                      onClose();
                    }}
                    onPublishSuccess={() => {
                      onPublishSuccess?.();
                      onClose();
                    }}
                    onDeleteSuccess={() => {
                      onDeleteSuccess?.();
                      onClose();
                    }}
                    onMoveToDraftSuccess={() => {
                      onMoveToDraftSuccess?.();
                      onClose();
                    }}
                  />
                }
              >
                <div className="workspace-dashboard-scroll flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto p-3 sm:gap-4 sm:p-4 lg:gap-5">
                  <PostSchedulerComposerSection />
                </div>
              </PostSchedulerAiDrawerHost>
            </PostSchedulerComposerShell>
          </PostSchedulerComposerEditModeProvider>
        </div>
      </div>
    </div>
  );
}
