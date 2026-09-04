"use client";

import { FileCog, ListTodo, Server, Wifi } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { configSourceLabel, type WorkersStatus } from "@/lib/admin/workersApi";

interface WorkerStatusCardsProps {
  status: WorkersStatus | null;
  pendingCount: number;
  loading: boolean;
}

function StatCard({
  icon: Icon,
  label,
  value,
  hint,
}: {
  icon: LucideIcon;
  label: string;
  value: React.ReactNode;
  hint: string;
}) {
  return (
    <div className="flex items-start justify-between gap-3 rounded-2xl border border-outline-variant/20 bg-surface-container-low p-4">
      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
          {label}
        </p>
        <div className="mt-1 truncate text-2xl font-black text-on-surface">
          {value}
        </div>
        <p className="mt-1 text-[11px] text-on-surface-variant">{hint}</p>
      </div>
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/12 text-primary">
        <Icon className="h-4.5 w-4.5" />
      </span>
    </div>
  );
}

export function WorkerStatusCards({
  status,
  pendingCount,
  loading,
}: WorkerStatusCardsProps) {
  const placeholder = loading ? "…" : "—";
  const workers = status?.workers ?? [];
  const enabledCount = workers.filter((w) => w.enabled).length;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard
        icon={Server}
        label="Workers (jobs)"
        value={status ? workers.length : placeholder}
        hint={
          status
            ? `${enabledCount} enabled · ${workers.length - enabledCount} stopped`
            : "From worker_definitions"
        }
      />
      <StatCard
        icon={FileCog}
        label="Config source"
        value={
          <span className="font-mono text-sm font-semibold">
            {status ? configSourceLabel(status) : placeholder}
          </span>
        }
        hint="Stored in MySQL; toggles update worker_definitions"
      />
      <StatCard
        icon={ListTodo}
        label="Pending tasks"
        value={status ? pendingCount : placeholder}
        hint="Due posts are published by the workers app"
      />
      <StatCard
        icon={Wifi}
        label="Broker"
        value={
          status
            ? status.broker_connected
              ? "Connected"
              : "None"
            : placeholder
        }
        hint="No Celery broker — jobs run via run_workers.py + Redis locks"
      />
    </div>
  );
}
