"use client";

import { useCallback, useMemo, useState } from "react";

import type { UnifiedInboxMessage } from "@/lib/inbox/unifiedInboxTypes";
import { buildReplyChildrenMap } from "@/lib/inbox/buildReplyChildrenMap";
import { fetchRepliesForInboxComment } from "@/lib/inbox/fetchRepliesForInboxComment";
import { mergeInboxMessagesById } from "@/lib/inbox/mergeInboxMessagesById";

import type { InboxCommentsSection } from "../_components/SocialInboxCommentSectionTabs";

type CategoryCountKey = Exclude<InboxCommentsSection, "all" | "unreplied">;

function withFirstHighlighted(
  list: UnifiedInboxMessage[],
): UnifiedInboxMessage[] {
  return list.map((m, i) =>
    i === 0 ? { ...m, highlighted: true } : { ...m, highlighted: false },
  );
}

function matchesSection(
  message: UnifiedInboxMessage,
  section: InboxCommentsSection,
): boolean {
  if (section === "all") {
    return true;
  }
  if (section === "unreplied") {
    return Boolean(message.unreplied);
  }
  return message.categoryKey === section;
}

export function useInboxThreadedComments(
  flatComments: UnifiedInboxMessage[],
  section: InboxCommentsSection,
): {
  rootMessages: UnifiedInboxMessage[];
  childrenMap: Map<string, UnifiedInboxMessage[]>;
  expandedReplyIds: ReadonlySet<string>;
  loadingRepliesId: string | null;
  handleToggleReplies: (parent: UnifiedInboxMessage) => Promise<void>;
  tabTotalCount: number;
  unrepliedCount: number;
  categoryCounts: Record<CategoryCountKey, number>;
} {
  const [extraMessages, setExtraMessages] = useState<UnifiedInboxMessage[]>([]);
  const [expandedReplyIds, setExpandedReplyIds] = useState<Set<string>>(
    () => new Set(),
  );
  const [loadingRepliesId, setLoadingRepliesId] = useState<string | null>(
    null,
  );

  const allMessages = useMemo(
    () => mergeInboxMessagesById(flatComments, extraMessages),
    [flatComments, extraMessages],
  );

  const childrenMap = useMemo(
    () => buildReplyChildrenMap(allMessages),
    [allMessages],
  );

  const tabTotalCount = useMemo(
    () => allMessages.filter((m) => !m.parentMessageId).length,
    [allMessages],
  );

  const unrepliedCount = useMemo(
    () =>
      allMessages.filter((c) => c.unreplied && !c.parentMessageId).length,
    [allMessages],
  );

  const categoryCounts = useMemo(() => {
    const counts: Record<CategoryCountKey, number> = {
      positive: 0,
      negative: 0,
      spam: 0,
      question: 0,
      complaint: 0,
      lead: 0,
    };
    for (const message of allMessages) {
      if (message.parentMessageId) {
        continue;
      }
      const key = message.categoryKey as CategoryCountKey | undefined;
      if (key && key in counts) {
        counts[key] += 1;
      }
    }
    return counts;
  }, [allMessages]);

  const rootMessages = useMemo(() => {
    const roots = allMessages.filter((m) => !m.parentMessageId);
    roots.sort((a, b) => (b.sortMs ?? 0) - (a.sortMs ?? 0));
    const filtered = roots.filter((r) => matchesSection(r, section));
    return withFirstHighlighted(filtered);
  }, [allMessages, section]);

  const handleToggleReplies = useCallback(
    async (parent: UnifiedInboxMessage) => {
      if (expandedReplyIds.has(parent.id)) {
        setExpandedReplyIds((prev) => {
          const n = new Set(prev);
          n.delete(parent.id);
          return n;
        });
        return;
      }

      const direct = childrenMap.get(parent.id) ?? [];
      const postId = parent.sourcePostId?.trim() ?? "";
      const needsFetch =
        direct.length === 0 &&
        (parent.threadReplyCount ?? 0) > 0 &&
        postId.length > 0;

      if (needsFetch) {
        setLoadingRepliesId(parent.id);
        try {
          const mapped = await fetchRepliesForInboxComment(parent);
          if (mapped.length > 0) {
            setExtraMessages((prev) => mergeInboxMessagesById(prev, mapped));
          }
        } catch {
          return;
        } finally {
          setLoadingRepliesId(null);
        }
      }

      setExpandedReplyIds((prev) => new Set(prev).add(parent.id));
    },
    [childrenMap, expandedReplyIds],
  );

  return {
    rootMessages,
    childrenMap,
    expandedReplyIds,
    loadingRepliesId,
    handleToggleReplies,
    tabTotalCount,
    unrepliedCount,
    categoryCounts,
  };
}
