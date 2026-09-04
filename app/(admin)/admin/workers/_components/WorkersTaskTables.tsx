"use client";

import { Loader2 } from "lucide-react";

import {
  formatDateTime,
  scheduledStatusTone,
  truncateText,
  type PendingTask,
  type ScheduledTask,
} from "@/lib/admin/workersApi";

function TableCard({
  title,
  subtitle,
  loading,
  empty,
  emptyMessage,
  children,
}: {
  title: string;
  subtitle: string;
  loading: boolean;
  empty: boolean;
  emptyMessage: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-outline-variant/20 bg-surface-container-low p-5">
      <h3 className="text-sm font-bold text-on-surface">{title}</h3>
      <p className="mt-0.5 text-xs text-on-surface-variant">{subtitle}</p>
      <div className="mt-4 max-h-96 overflow-auto">
        {loading ? (
          <div className="flex items-center gap-2 py-8 text-sm text-on-surface-variant">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading…
          </div>
        ) : empty ? (
          <p className="py-6 text-sm text-on-surface-variant">{emptyMessage}</p>
        ) : (
          children
        )}
      </div>
    </section>
  );
}

const headerCell =
  "sticky top-0 bg-surface-container-low px-3 py-2 text-xs font-semibold uppercase tracking-wider text-on-surface-variant";

const STATUS_BADGE: Record<ReturnType<typeof scheduledStatusTone>, string> = {
  scheduled: "bg-primary/12 text-primary",
  publishing: "bg-tertiary/15 text-tertiary",
  other: "bg-surface-container-high text-on-surface-variant",
};

export function ScheduledTasksCard({
  tasks,
  loading,
}: {
  tasks: ScheduledTask[];
  loading: boolean;
}) {
  return (
    <TableCard
      title="Upcoming scheduled posts"
      subtitle="Scheduled by which user, when it will be posted, platform, and status."
      loading={loading}
      empty={tasks.length === 0}
      emptyMessage="No upcoming scheduled posts."
    >
      <table className="min-w-full text-left text-sm">
        <thead>
          <tr className="border-b border-outline-variant/20">
            <th className={headerCell}>User</th>
            <th className={headerCell}>Email</th>
            <th className={headerCell}>Platform</th>
            <th className={headerCell}>Post type</th>
            <th className={headerCell}>Scheduled at</th>
            <th className={headerCell}>Status</th>
          </tr>
        </thead>
        <tbody>
          {tasks.map((task) => (
            <tr
              key={task.scheduled_post_id}
              className="border-b border-outline-variant/10 hover:bg-surface-container"
            >
              <td className="px-3 py-2 text-on-surface">
                {task.user_name || task.user_email || "—"}
              </td>
              <td className="px-3 py-2 text-on-surface-variant">
                {task.user_email || "—"}
              </td>
              <td className="px-3 py-2 capitalize text-on-surface">
                {task.platform || "—"}
              </td>
              <td className="px-3 py-2 text-on-surface-variant">
                {task.post_type || "—"}
              </td>
              <td className="px-3 py-2 text-on-surface-variant">
                {formatDateTime(task.scheduled_time)}
              </td>
              <td className="px-3 py-2">
                <span
                  className={[
                    "rounded-full px-2 py-0.5 text-xs font-semibold",
                    STATUS_BADGE[scheduledStatusTone(task.status)],
                  ].join(" ")}
                >
                  {task.status || "—"}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </TableCard>
  );
}

export function PendingTasksCard({
  tasks,
  loading,
}: {
  tasks: PendingTask[];
  loading: boolean;
}) {
  return (
    <TableCard
      title="Pending task details"
      subtitle="No Celery — pending posts live in the DB and are published by the workers app."
      loading={loading}
      empty={tasks.length === 0}
      emptyMessage="No pending tasks (reserved/scheduled). Workers may be stopped, or queues are empty."
    >
      <table className="min-w-full text-left text-sm">
        <thead>
          <tr className="border-b border-outline-variant/20">
            <th className={headerCell}>Worker</th>
            <th className={headerCell}>Queue</th>
            <th className={headerCell}>Task name</th>
            <th className={headerCell}>Task ID</th>
            <th className={headerCell}>ETA</th>
            <th className={headerCell}>Kind</th>
            <th className={headerCell}>Args</th>
          </tr>
        </thead>
        <tbody>
          {tasks.map((task, index) => (
            <tr
              key={task.task_id || index}
              className="border-b border-outline-variant/10 hover:bg-surface-container"
            >
              <td className="px-3 py-2 font-mono text-xs text-on-surface-variant">
                {task.worker || "—"}
              </td>
              <td className="px-3 py-2 text-on-surface">{task.queue || "—"}</td>
              <td className="px-3 py-2 font-medium text-on-surface">
                {task.task_name || "—"}
              </td>
              <td
                className="px-3 py-2 font-mono text-xs text-on-surface-variant"
                title={task.task_id}
              >
                {task.task_id ? truncateText(task.task_id, 16) : "—"}
              </td>
              <td className="px-3 py-2 text-on-surface-variant">
                {task.eta ?? "—"}
              </td>
              <td className="px-3 py-2">
                <span
                  className={[
                    "rounded-full px-2 py-0.5 text-xs font-semibold",
                    task.kind.toLowerCase() === "scheduled"
                      ? "bg-tertiary/15 text-tertiary"
                      : "bg-primary/12 text-primary",
                  ].join(" ")}
                >
                  {task.kind || "—"}
                </span>
              </td>
              <td
                className="px-3 py-2 text-xs text-on-surface-variant"
                title={task.args_preview}
              >
                {task.args_preview ? truncateText(task.args_preview, 80) : "—"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </TableCard>
  );
}
