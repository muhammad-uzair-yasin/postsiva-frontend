"use client";

import { useMemo, useState, type ReactElement } from "react";

import { useTranslations } from "@/lib/i18n/WorkspaceLocaleProvider";

import { PostSchedulerWeekGrid } from "../../post-scheduler/calendar/_components/PostSchedulerWeekGrid";
import { startOfWeekMonday } from "../../post-scheduler/calendar/_utils/postSchedulerCalendarWeekUtils";
import { mapContentManagerScheduledPostToCalendarPost } from "../../post-scheduler/calendar/_utils/mapContentManagerPostToCalendarPost";
import type { ContentManagerPost } from "../_types/contentManagerTypes";
import { groupContentManagerScheduledPostsByDay } from "../_utils/groupContentManagerScheduledPostsByDay";
import { ContentManagerScheduledColumnPostCell } from "./ContentManagerScheduledColumnPostCell";

interface ContentManagerScheduledPipelineColumnsProps {
  posts: ContentManagerPost[];
  now: Date;
  onOpenScheduledEditor: (post: ContentManagerPost) => void;
  onRequestDeleteScheduled: (post: ContentManagerPost) => void;
  onPickSlot?: (at: Date) => void;
}

export function ContentManagerScheduledPipelineColumns({
  posts,
  now,
  onOpenScheduledEditor,
  onRequestDeleteScheduled,
  onPickSlot,
}: ContentManagerScheduledPipelineColumnsProps): ReactElement {
  const { t } = useTranslations();
  const [weekStart, setWeekStart] = useState(() => startOfWeekMonday(now));

  const calendarPosts = useMemo(
    () =>
      posts
        .map(mapContentManagerScheduledPostToCalendarPost)
        .filter((post): post is NonNullable<typeof post> => post !== null),
    [posts],
  );

  const undated = useMemo(
    () => groupContentManagerScheduledPostsByDay(posts).undated,
    [posts],
  );

  return (
    <div className="flex min-h-[min(58vh,560px)] w-full min-w-0 flex-col pb-4 pt-1">
      <PostSchedulerWeekGrid
        weekStart={weekStart}
        posts={calendarPosts}
        onWeekStartChange={setWeekStart}
        onOpen={() => {
          /* Picker / view-only in pipeline modal */
        }}
        onPickSlot={onPickSlot}
        embedded={false}
      />

      {undated.length > 0 ? (
        <div className="mt-4 space-y-2">
          <h3 className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">
            {t("content.pipelineTimePending")}
          </h3>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {undated.map((post) => (
              <ContentManagerScheduledColumnPostCell
                key={post.id}
                post={post}
                scheduledAt={null}
                now={now}
                onOpenEditor={onOpenScheduledEditor}
                onRequestDeleteScheduled={onRequestDeleteScheduled}
              />
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
