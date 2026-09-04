import type { ContentManagerPost } from "../_types/contentManagerTypes";
import { startOfDay } from "../../post-scheduler/calendar/_utils/postSchedulerCalendarWeekUtils";

export interface ContentManagerScheduledDaySection {
  day: Date;
  posts: Array<{ post: ContentManagerPost; scheduledAt: Date }>;
}

export function parseContentManagerScheduledAt(
  post: ContentManagerPost,
): Date | null {
  const item = post.scheduledPayload;
  if (!item) {
    return null;
  }
  const raw =
    item.scheduled_time_local?.trim() ||
    item.scheduled_time?.trim() ||
    "";
  if (!raw) {
    return null;
  }
  const d = new Date(raw);
  return Number.isNaN(d.getTime()) ? null : d;
}

function parseContentManagerPublishedAt(
  post: ContentManagerPost,
): Date | null {
  const raw = post.publishedAtIso?.trim();
  if (!raw) {
    return null;
  }
  const hasOffset = /(?:Z|[+-]\d{2}:?\d{2})$/i.test(raw);
  const normalized = hasOffset ? raw : `${raw}Z`;
  const d = new Date(normalized);
  return Number.isNaN(d.getTime()) ? null : d;
}

/** Scheduled time, or published_at for live posts shown on the calendar list. */
export function parseContentManagerPipelineAt(
  post: ContentManagerPost,
): Date | null {
  if (post.status === "published") {
    return parseContentManagerPublishedAt(post);
  }
  return parseContentManagerScheduledAt(post);
}

export function groupContentManagerScheduledPostsByDay(
  posts: ContentManagerPost[],
): {
  sections: ContentManagerScheduledDaySection[];
  undated: ContentManagerPost[];
} {
  const timed = posts.filter(
    (p) => p.status === "scheduled" || p.status === "published",
  );
  const undated: ContentManagerPost[] = [];
  const withDates: Array<{ post: ContentManagerPost; scheduledAt: Date }> = [];

  for (const post of timed) {
    const at = parseContentManagerPipelineAt(post);
    if (!at) {
      undated.push(post);
      continue;
    }
    withDates.push({ post, scheduledAt: at });
  }

  withDates.sort(
    (a, b) => a.scheduledAt.getTime() - b.scheduledAt.getTime(),
  );

  const byDay = new Map<
    number,
    Array<{ post: ContentManagerPost; scheduledAt: Date }>
  >();

  for (const row of withDates) {
    const sod = startOfDay(row.scheduledAt).getTime();
    const list = byDay.get(sod) ?? [];
    list.push(row);
    byDay.set(sod, list);
  }

  const sections: ContentManagerScheduledDaySection[] = Array.from(
    byDay.entries(),
  )
    .sort((a, b) => a[0] - b[0])
    .map(([t, rows]) => ({
      day: new Date(t),
      posts: rows,
    }));

  return { sections, undated };
}
