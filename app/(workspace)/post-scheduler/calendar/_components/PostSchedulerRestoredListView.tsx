"use client";

import { useMemo, useState } from "react";

import { getStoredAccessToken, getStoredActiveWorkspaceId } from "@/lib/auth/session";
import { deleteWorkspaceScheduledPostById } from "@/lib/social/workspaceScheduledPostMutations";
import { ContentManagerScheduledPipelineList } from "../../../content-manager/_components/ContentManagerScheduledPipelineList";
import { DraftEditorActionConfirmModal } from "../../../content-manager/draft/[id]/_components/DraftEditorActionConfirmModal";
import { getDraftEditorConfirmCopy } from "../../../content-manager/draft/[id]/_utils/draftEditorConfirmCopy";
import { mapUnifiedScheduledPostToContentManagerPost } from "../../../content-manager/_utils/mapUnifiedScheduledPostToContentManagerPost";
import type {
  ContentManagerChannel,
  ContentManagerPost,
} from "../../../content-manager/_types/contentManagerTypes";
import { useTranslations } from "@/lib/i18n/WorkspaceLocaleProvider";
import type { CalendarPost } from "../_types/calendarTypes";

interface Props {
  posts: CalendarPost[];
  onOpen: (post: CalendarPost) => void;
  onRefresh: () => Promise<void>;
}

function mapCalendarPostToPipelinePost(
  post: CalendarPost,
): ContentManagerPost | null {
  if (post.postKind === "scheduled" && post.source) {
    return mapUnifiedScheduledPostToContentManagerPost(post.source);
  }
  if (post.postKind !== "published") {
    return null;
  }
  const channel = (post.platform?.trim().toLowerCase() || "facebook") as ContentManagerChannel;
  return {
    id: post.id,
    status: "published",
    channel,
    handle: post.account?.trim() || channel,
    body: post.caption || post.previewText || "",
    imageUrl: post.mediaKind === "image" ? post.mediaUrl ?? undefined : undefined,
    videoUrl: post.mediaKind === "video" ? post.mediaUrl ?? undefined : undefined,
    draftMedia:
      post.mediaKind === "video" ? "video" : post.mediaKind === "image" ? "image" : "empty",
    publishedPostUrl: post.publishedPostUrl,
    publishedAtIso: post.scheduledAt.toISOString(),
    metrics: post.metrics
      ? {
          reach: post.metrics.reach ?? "—",
          likes: post.metrics.likes ?? "—",
          comments: post.metrics.comments ?? "—",
        }
      : undefined,
  };
}

export function PostSchedulerRestoredListView({
  posts,
  onOpen,
  onRefresh,
}: Props): React.ReactElement {
  const { t } = useTranslations();
  const [deleteTarget, setDeleteTarget] = useState<ContentManagerPost | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const mapped = useMemo(
    () =>
      posts.flatMap((post) => {
        const row = mapCalendarPostToPipelinePost(post);
        return row ? [row] : [];
      }),
    [posts],
  );
  const confirmCopy = useMemo(
    () => getDraftEditorConfirmCopy(t, "deleteScheduled", {}),
    [t],
  );

  const openPost = (post: ContentManagerPost): void => {
    if (post.status === "published") {
      const calendarPost = posts.find((item) => item.id === post.id);
      if (calendarPost) {
        onOpen(calendarPost);
        return;
      }
      if (post.publishedPostUrl) {
        window.open(post.publishedPostUrl, "_blank", "noopener,noreferrer");
      }
      return;
    }
    const id = post.sourceScheduledPostId ?? post.scheduledPayload?.scheduled_post_id;
    const calendarPost = posts.find((item) => item.id === id);
    if (calendarPost) onOpen(calendarPost);
  };

  const confirmDelete = async (): Promise<void> => {
    if (deleteTarget?.status === "published") {
      setDeleteTarget(null);
      return;
    }
    const id =
      deleteTarget?.sourceScheduledPostId ??
      deleteTarget?.scheduledPayload?.scheduled_post_id;
    const token = getStoredAccessToken();
    const workspace = getStoredActiveWorkspaceId();
    if (!id || !token || !workspace) return;
    setDeleting(true);
    setDeleteError(null);
    try {
      const platform =
        deleteTarget?.channel ??
        deleteTarget?.scheduledPayload?.platform ??
        null;
      const result = await deleteWorkspaceScheduledPostById(
        token,
        workspace,
        id,
        platform,
      );
      if (!result.success) {
        throw new Error(result.error || result.message);
      }
      setDeleteTarget(null);
      await onRefresh();
    } catch (reason) {
      setDeleteError(
        reason instanceof Error ? reason.message : t("content.toastGenericError"),
      );
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <ContentManagerScheduledPipelineList
        posts={mapped}
        onOpenScheduledEditor={openPost}
        onRequestDeleteScheduled={(post) => {
          if (post.status === "published") return;
          setDeleteError(null);
          setDeleteTarget(post);
        }}
        forceList
        fromTodayOnly
      />
      {deleteError ? (
        <p role="alert" className="mt-3 rounded-lg bg-error/10 px-4 py-2 text-sm text-error">
          {deleteError}
        </p>
      ) : null}
      <DraftEditorActionConfirmModal
        open={deleteTarget !== null}
        title={confirmCopy.title}
        description={confirmCopy.description}
        confirmLabel={confirmCopy.confirmLabel}
        isDanger
        isBusy={deleting}
        onCancel={() => {
          if (!deleting) {
            setDeleteTarget(null);
            setDeleteError(null);
          }
        }}
        onConfirm={() => void confirmDelete()}
      />
    </>
  );
}
