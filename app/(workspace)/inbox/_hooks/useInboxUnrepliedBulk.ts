"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { useWorkspaceHeaderAccounts } from "@/app/(workspace)/_components/WorkspaceHeaderAccountsProvider";
import { inboxMessageSupportsAiGenerate } from "@/lib/inbox/inboxAiGenerateEligibility";
import type { UnifiedInboxMessage } from "@/lib/inbox/unifiedInboxTypes";

import type { InboxCommentsSection } from "../_components/SocialInboxCommentSectionTabs";
import {
  runUnrepliedBulkGenerateAll,
  runUnrepliedBulkPostAll,
} from "./unrepliedBulkRunners";

function addId(set: Set<string>, id: string): Set<string> {
  const n = new Set(set);
  n.add(id);
  return n;
}
function removeId(set: Set<string>, id: string): Set<string> {
  const n = new Set(set);
  n.delete(id);
  return n;
}

function formatFailureMessage(failures: readonly string[]): string {
  const max = 6;
  const tail =
    failures.length > max ? `\n…+${failures.length - max} more` : "";
  return `${failures.slice(0, max).join("\n")}${tail}`;
}

export function useInboxUnrepliedBulk(
  section: InboxCommentsSection,
  comments: readonly UnifiedInboxMessage[],
  generateForMessage: (
    message: UnifiedInboxMessage,
    moderatorNote: string,
  ) => Promise<
    | { success: true; replies: { reply_text: string }[] }
    | { success: false; message: string }
  >,
  sendQuickReply: (payload: {
    target: NonNullable<UnifiedInboxMessage["replyApiTarget"]>;
    text: string;
  }) => Promise<{ success: boolean; message?: string }>,
  reloadComments: () => void | Promise<void>,
  afterBulkReplies?: (
    oneSamplePerPost: readonly UnifiedInboxMessage[],
  ) => void | Promise<void>,
): {
  bulkTargets: UnifiedInboxMessage[];
  readyToPostCount: number;
  bulkBusy: boolean;
  bulkAllGenerating: boolean;
  bulkAllPosting: boolean;
  bulkStepProgress: {
    completed: number;
    total: number;
    phase: "generating" | "posting";
  } | null;
  bulkComposerFor: (
    msg: UnifiedInboxMessage,
  ) => {
    draft: string;
    onDraftChange: (text: string) => void;
    generateBusy: boolean;
    postBusy: boolean;
    onBulkPosted: () => void;
  } | null;
  handleGenerateAllUnreplied: () => Promise<void>;
  handlePostAll: () => Promise<void>;
  infoModal: { title: string; message: string } | null;
  dismissInfoModal: () => void;
} {
  const { unifiedProfiles } = useWorkspaceHeaderAccounts();

  const [bulkDrafts, setBulkDrafts] = useState<Record<string, string>>({});
  const [bulkActiveIds, setBulkActiveIds] = useState<Set<string>>(
    () => new Set(),
  );
  const [bulkGeneratingIds, setBulkGeneratingIds] = useState<Set<string>>(
    () => new Set(),
  );
  const [bulkPostingIds, setBulkPostingIds] = useState<Set<string>>(
    () => new Set(),
  );
  const [bulkAllGenerating, setBulkAllGenerating] = useState(false);
  const [bulkAllPosting, setBulkAllPosting] = useState(false);
  const [bulkStepProgress, setBulkStepProgress] = useState<{
    completed: number;
    total: number;
    phase: "generating" | "posting";
  } | null>(null);
  const [infoModal, setInfoModal] = useState<{
    title: string;
    message: string;
  } | null>(null);

  const dismissInfoModal = useCallback((): void => {
    setInfoModal(null);
  }, []);

  useEffect(() => {
    if (section !== "unreplied") {
      setBulkDrafts({});
      setBulkActiveIds(new Set());
      setBulkGeneratingIds(new Set());
      setBulkPostingIds(new Set());
      setBulkAllGenerating(false);
      setBulkAllPosting(false);
      setBulkStepProgress(null);
    }
  }, [section]);

  const bulkTargets = useMemo(
    () =>
      comments.filter(
        (m) =>
          m.unreplied &&
          m.replyApiTarget != null &&
          inboxMessageSupportsAiGenerate(m, { unifiedProfiles }),
      ),
    [comments, unifiedProfiles],
  );

  const readyToPostCount = useMemo(
    () =>
      bulkTargets.filter((m) => (bulkDrafts[m.id] ?? "").trim().length > 0)
        .length,
    [bulkDrafts, bulkTargets],
  );

  const clearBulkForMessage = useCallback((id: string): void => {
    setBulkActiveIds((p) => removeId(p, id));
    setBulkDrafts((d) => {
      const next = { ...d };
      delete next[id];
      return next;
    });
    setBulkGeneratingIds((p) => removeId(p, id));
    setBulkPostingIds((p) => removeId(p, id));
  }, []);

  const handleGenerateAllUnreplied = useCallback(async (): Promise<void> => {
    if (bulkTargets.length === 0) {
      return;
    }
    setBulkStepProgress({
      completed: 0,
      total: bulkTargets.length,
      phase: "generating",
    });
    setBulkAllGenerating(true);
    const failures = await runUnrepliedBulkGenerateAll(
      bulkTargets,
      generateForMessage,
      (id) => {
        setBulkActiveIds((prev) => addId(prev, id));
        setBulkGeneratingIds((prev) => addId(prev, id));
      },
      (id) => {
        setBulkGeneratingIds((prev) => removeId(prev, id));
        setBulkStepProgress((p) =>
          p && p.phase === "generating"
            ? { ...p, completed: Math.min(p.total, p.completed + 1) }
            : p,
        );
      },
      (id) => {
        setBulkActiveIds((prev) => removeId(prev, id));
        setBulkGeneratingIds((prev) => removeId(prev, id));
      },
      (id, text) => {
        setBulkDrafts((d) => ({ ...d, [id]: text }));
      },
    );
    setBulkAllGenerating(false);
    setBulkStepProgress(null);
    if (failures.length > 0) {
      setInfoModal({
        title: "Some generations failed",
        message: formatFailureMessage(failures),
      });
    }
  }, [bulkTargets, generateForMessage]);

  const handlePostAll = useCallback(async (): Promise<void> => {
    const queue = bulkTargets
      .map((m) => ({ m, text: (bulkDrafts[m.id] ?? "").trim() }))
      .filter((x) => x.text.length > 0);
    if (queue.length === 0) {
      setInfoModal({
        title: "Nothing to post",
        message:
          'Run "Generate for all" first or type text in each reply box.',
      });
      return;
    }
    setBulkStepProgress({
      completed: 0,
      total: queue.length,
      phase: "posting",
    });
    setBulkAllPosting(true);
    const failures = await runUnrepliedBulkPostAll(
      queue,
      sendQuickReply,
      (id) => {
        setBulkPostingIds((prev) => addId(prev, id));
      },
      (id) => {
        setBulkPostingIds((prev) => removeId(prev, id));
        setBulkStepProgress((p) =>
          p && p.phase === "posting"
            ? { ...p, completed: Math.min(p.total, p.completed + 1) }
            : p,
        );
      },
      (id) => {
        clearBulkForMessage(id);
      },
    );
    setBulkAllPosting(false);
    setBulkStepProgress(null);
    const byPost = new Map<string, UnifiedInboxMessage>();
    for (const { m } of queue) {
      const p = m.sourcePostId?.trim();
      if (p) {
        byPost.set(p, m);
      }
    }
    const samples = [...byPost.values()];
    if (afterBulkReplies !== undefined && samples.length > 0) {
      void afterBulkReplies(samples);
    } else {
      void reloadComments();
    }
    if (failures.length > 0) {
      setInfoModal({
        title: "Some posts failed",
        message: formatFailureMessage(failures),
      });
    }
  }, [
    afterBulkReplies,
    bulkDrafts,
    bulkTargets,
    clearBulkForMessage,
    reloadComments,
    sendQuickReply,
  ]);

  const bulkComposerFor = useCallback(
    (msg: UnifiedInboxMessage) => {
      if (!bulkActiveIds.has(msg.id)) {
        return null;
      }
      return {
        draft: bulkDrafts[msg.id] ?? "",
        onDraftChange: (text: string) => {
          setBulkDrafts((prev) => ({ ...prev, [msg.id]: text }));
        },
        generateBusy: bulkGeneratingIds.has(msg.id),
        postBusy: bulkPostingIds.has(msg.id),
        onBulkPosted: () => {
          clearBulkForMessage(msg.id);
        },
      };
    },
    [
      bulkActiveIds,
      bulkDrafts,
      bulkGeneratingIds,
      bulkPostingIds,
      clearBulkForMessage,
    ],
  );

  return {
    bulkTargets,
    readyToPostCount,
    bulkBusy: bulkAllGenerating || bulkAllPosting,
    bulkAllGenerating,
    bulkAllPosting,
    bulkStepProgress,
    bulkComposerFor,
    handleGenerateAllUnreplied,
    handlePostAll,
    infoModal,
    dismissInfoModal,
  };
}
