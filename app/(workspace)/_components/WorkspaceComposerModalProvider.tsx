"use client";

import dynamic from "next/dynamic";
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

import { flushComposerClearOnClose } from "@/lib/post-composer/composerClearOnClose";
import {
  buildComposerEditSessionFromDraft,
  buildComposerEditSessionFromScheduled,
  type WorkspaceComposerEditSession,
} from "@/lib/post-composer/composerEditSessionFromUnifiedPost";
import type { UnifiedDraftResponseJson } from "@/lib/social/unifiedDraftsApi";
import type { UnifiedScheduledPostItemJson } from "@/lib/social/unifiedScheduledPostsApi";
import type { WorkspaceHeaderAccountRow } from "@/lib/workspace/headerAccountsTypes";

const PostSchedulerComposerModal = dynamic(
  () =>
    import("../post-scheduler/_components/PostSchedulerComposerModal").then(
      (m) => m.PostSchedulerComposerModal,
    ),
  {
    ssr: false,
    loading: () => (
      <div
        className="fixed inset-0 z-[80] flex items-center justify-center bg-black/40"
        role="status"
        aria-live="polite"
      >
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/30 border-t-white" />
      </div>
    ),
  },
);

export interface WorkspaceComposerEditCallbacks {
  readonly onUpdateSuccess?: () => void;
  readonly onScheduleComplete?: () => void;
  readonly onPublishSuccess?: () => void;
  readonly onDeleteSuccess?: () => void;
  readonly onMoveToDraftSuccess?: () => void;
}

interface WorkspaceComposerModalContextValue {
  openComposer: (scheduledAt?: Date) => void;
  openComposerForDraft: (
    draft: UnifiedDraftResponseJson,
    accounts: readonly WorkspaceHeaderAccountRow[],
    callbacks?: WorkspaceComposerEditCallbacks,
  ) => void;
  openComposerForScheduled: (
    scheduled: UnifiedScheduledPostItemJson,
    accounts: readonly WorkspaceHeaderAccountRow[],
    callbacks?: WorkspaceComposerEditCallbacks,
  ) => void;
  closeComposer: () => void;
  isComposerOpen: boolean;
}

const WorkspaceComposerModalContext =
  createContext<WorkspaceComposerModalContextValue | null>(null);

export function useWorkspaceComposerModal(): WorkspaceComposerModalContextValue {
  const ctx = useContext(WorkspaceComposerModalContext);
  if (!ctx) {
    throw new Error(
      "useWorkspaceComposerModal must be used within WorkspaceComposerModalProvider",
    );
  }
  return ctx;
}

/** Safe for layout chrome (e.g. hide Piva FAB while composer drawer is open). */
export function useWorkspaceComposerModalOpen(): boolean {
  return useContext(WorkspaceComposerModalContext)?.isComposerOpen ?? false;
}

export function WorkspaceComposerModalProvider({
  children,
}: {
  children: React.ReactNode;
}): React.ReactElement {
  const [open, setOpen] = useState(false);
  const [scheduledAt, setScheduledAt] = useState<Date>(() => new Date());
  const [explicitScheduleTime, setExplicitScheduleTime] = useState(false);
  const [editSession, setEditSession] =
    useState<WorkspaceComposerEditSession | null>(null);
  const [editCallbacks, setEditCallbacks] =
    useState<WorkspaceComposerEditCallbacks>({});

  const openComposer = useCallback((at?: Date) => {
    setEditSession(null);
    setEditCallbacks({});
    setScheduledAt(at ?? new Date());
    setExplicitScheduleTime(at !== undefined);
    setOpen(true);
  }, []);

  const openComposerForDraft = useCallback(
    (
      draft: UnifiedDraftResponseJson,
      accounts: readonly WorkspaceHeaderAccountRow[],
      callbacks?: WorkspaceComposerEditCallbacks,
    ) => {
      const session = buildComposerEditSessionFromDraft(draft, accounts);
      if (!session) {
        return;
      }
      setEditSession(session);
      setEditCallbacks(callbacks ?? {});
      setScheduledAt(new Date());
      setExplicitScheduleTime(false);
      setOpen(true);
    },
    [],
  );

  const openComposerForScheduled = useCallback(
    (
      scheduled: UnifiedScheduledPostItemJson,
      accounts: readonly WorkspaceHeaderAccountRow[],
      callbacks?: WorkspaceComposerEditCallbacks,
    ) => {
      const session = buildComposerEditSessionFromScheduled(scheduled, accounts);
      if (!session) {
        return;
      }
      setEditSession(session);
      setEditCallbacks(callbacks ?? {});
      setScheduledAt(new Date());
      setExplicitScheduleTime(false);
      setOpen(true);
    },
    [],
  );

  const closeComposer = useCallback(() => {
    flushComposerClearOnClose();
    setOpen(false);
    setEditSession(null);
    setEditCallbacks({});
  }, []);

  const value = useMemo(
    () => ({
      openComposer,
      openComposerForDraft,
      openComposerForScheduled,
      closeComposer,
      isComposerOpen: open,
    }),
    [
      closeComposer,
      open,
      openComposer,
      openComposerForDraft,
      openComposerForScheduled,
    ],
  );

  const wrappedEditCallbacks = useMemo(
    (): WorkspaceComposerEditCallbacks => ({
      onUpdateSuccess: () => {
        editCallbacks.onUpdateSuccess?.();
        closeComposer();
      },
      onScheduleComplete: () => {
        editCallbacks.onScheduleComplete?.();
        closeComposer();
      },
      onPublishSuccess: () => {
        editCallbacks.onPublishSuccess?.();
        closeComposer();
      },
      onDeleteSuccess: () => {
        editCallbacks.onDeleteSuccess?.();
        closeComposer();
      },
      onMoveToDraftSuccess: () => {
        editCallbacks.onMoveToDraftSuccess?.();
        closeComposer();
      },
    }),
    [closeComposer, editCallbacks],
  );

  return (
    <WorkspaceComposerModalContext.Provider value={value}>
      {children}
      {open ? (
        <PostSchedulerComposerModal
          key={
            editSession
              ? `${editSession.kind}:${editSession.kind === "draft" ? editSession.draftId : editSession.scheduledPostId}`
              : "create"
          }
          scheduledAt={scheduledAt}
          pipelineSlotPreselected={explicitScheduleTime}
          editSession={editSession}
          editCallbacks={editSession ? wrappedEditCallbacks : undefined}
          onClose={closeComposer}
        />
      ) : null}
    </WorkspaceComposerModalContext.Provider>
  );
}
