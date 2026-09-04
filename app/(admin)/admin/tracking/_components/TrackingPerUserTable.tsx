"use client";

import { useMemo, useState } from "react";
import { ArrowDown, ArrowUp, Mail, Search } from "lucide-react";

import type {
  PerUserSortKey,
  PerUserTrackingRow,
  SortDirection,
} from "@/lib/admin/trackingApi";
import {
  displayName,
  filterPerUserRows,
  formatCount,
  selectAllVisible,
  sortPerUserRows,
  toggleSelection,
} from "@/lib/admin/trackingApi";

const NUMERIC_COLUMNS: { key: PerUserSortKey; label: string }[] = [
  { key: "post_generation_count", label: "Post gen" },
  { key: "image_generation_count", label: "Img gen" },
  { key: "tool_call_count", label: "Tools" },
  { key: "post_published_count", label: "Published" },
  { key: "comments_posted_count", label: "Cmnt" },
  { key: "message_count", label: "Msg" },
  { key: "api_route_hits_total", label: "API hits" },
];

function SortHeader({
  columnKey,
  label,
  align,
  activeKey,
  direction,
  onSort,
}: {
  columnKey: PerUserSortKey;
  label: string;
  align: "left" | "right";
  activeKey: PerUserSortKey;
  direction: SortDirection;
  onSort: (key: PerUserSortKey) => void;
}) {
  return (
    <th className={align === "left" ? "px-3 py-2 text-left font-semibold" : "px-3 py-2 text-right font-semibold"}>
      <button type="button" onClick={() => onSort(columnKey)} className="inline-flex items-center gap-1 hover:text-on-surface">
        {label}
        {activeKey === columnKey ? direction === "asc" ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" /> : null}
      </button>
    </th>
  );
}

export function TrackingPerUserTable({
  rows,
  selected,
  onSelectedChange,
  onEmailUser,
  onEmailSelected,
}: {
  rows: PerUserTrackingRow[];
  selected: string[];
  onSelectedChange: (next: string[]) => void;
  onEmailUser: (row: PerUserTrackingRow) => void;
  onEmailSelected: () => void;
}) {
  const [query, setQuery] = useState("");
  const [sortKey, setSortKey] = useState<PerUserSortKey>("api_route_hits_total");
  const [sortDir, setSortDir] = useState<SortDirection>("desc");

  const visible = useMemo(
    () => sortPerUserRows(filterPerUserRows(rows, query), sortKey, sortDir),
    [rows, query, sortKey, sortDir],
  );
  const allVisibleSelected =
    visible.length > 0 && visible.every((r) => selected.includes(r.user_id));

  const toggleSort = (key: PerUserSortKey) => {
    if (key === sortKey) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir(key === "email" || key === "name" ? "asc" : "desc");
    }
  };

  return (
    <section className="rounded-2xl border border-outline-variant/20 bg-surface-container-low">
      <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-sm font-bold text-on-surface">Per user</h2>
        <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
          <div className="relative w-full max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-on-surface-variant" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Filter by email, name, or user id…"
              className="w-full rounded-xl border border-outline-variant/25 bg-surface-container py-2 pl-9 pr-3 text-sm text-on-surface placeholder:text-on-surface-variant/70 focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="whitespace-nowrap text-xs text-on-surface-variant">
              {selected.length} selected
            </span>
            <button
              type="button"
              disabled={selected.length === 0}
              onClick={onEmailSelected}
              className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-3 py-2 text-xs font-bold text-on-primary disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Mail className="h-3.5 w-3.5" />
              Email selected
            </button>
          </div>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="border-y border-outline-variant/20 text-xs text-on-surface-variant">
            <tr>
              <th className="w-10 px-3 py-2">
                <input
                  type="checkbox"
                  title="Select visible rows"
                  checked={allVisibleSelected}
                  onChange={() => onSelectedChange(selectAllVisible(selected, visible))}
                  className="rounded border-outline-variant"
                />
              </th>
              <SortHeader columnKey="email" label="Email" align="left" activeKey={sortKey} direction={sortDir} onSort={toggleSort} />
              <SortHeader columnKey="name" label="Name" align="left" activeKey={sortKey} direction={sortDir} onSort={toggleSort} />
              {NUMERIC_COLUMNS.map((c) => (
                <SortHeader key={c.key} columnKey={c.key} label={c.label} align="right" activeKey={sortKey} direction={sortDir} onSort={toggleSort} />
              ))}
              <th className="px-3 py-2 text-right font-semibold">Email</th>
            </tr>
          </thead>
          <tbody>
            {visible.length === 0 ? (
              <tr>
                <td colSpan={11} className="px-4 py-8 text-center text-on-surface-variant">
                  No users match
                </td>
              </tr>
            ) : (
              visible.map((r) => (
                <tr
                  key={r.user_id}
                  className="border-t border-outline-variant/15 hover:bg-surface-container"
                >
                  <td className="px-3 py-2">
                    <input
                      type="checkbox"
                      checked={selected.includes(r.user_id)}
                      onChange={() => onSelectedChange(toggleSelection(selected, r.user_id))}
                      className="rounded border-outline-variant"
                    />
                  </td>
                  <td className="px-3 py-2 text-on-surface">{r.email}</td>
                  <td className="px-3 py-2 text-on-surface-variant">{displayName(r)}</td>
                  <td className="px-3 py-2 text-right tabular-nums">
                    {formatCount(r.post_generation_count)}
                  </td>
                  <td className="px-3 py-2 text-right tabular-nums">
                    {formatCount(r.image_generation_count)}
                  </td>
                  <td className="px-3 py-2 text-right tabular-nums">
                    {formatCount(r.tool_call_count)}
                  </td>
                  <td className="px-3 py-2 text-right tabular-nums">
                    {formatCount(r.post_published_count)}
                  </td>
                  <td className="px-3 py-2 text-right tabular-nums">
                    {formatCount(r.comments_posted_count)}
                  </td>
                  <td className="px-3 py-2 text-right tabular-nums">
                    {formatCount(r.message_count)}
                  </td>
                  <td className="px-3 py-2 text-right font-semibold tabular-nums">
                    {formatCount(r.api_route_hits_total)}
                  </td>
                  <td className="px-3 py-2 text-right">
                    <button
                      type="button"
                      title={`Send feedback email to ${r.email}`}
                      onClick={() => onEmailUser(r)}
                      className="rounded-lg border border-outline-variant/25 bg-surface-container p-1.5 text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface"
                    >
                      <Mail className="h-3.5 w-3.5" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
