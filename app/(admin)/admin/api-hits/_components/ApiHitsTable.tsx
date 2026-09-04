"use client";

import { Loader2, Mail } from "lucide-react";

import {
  formatSeenAt,
  hitDisplayName,
  type ApiHitRow,
} from "@/lib/admin/apiHitsApi";
import type { FeedbackEmailTarget } from "../_hooks/useFeedbackEmail";

interface ApiHitsTableProps {
  hits: ApiHitRow[];
  loading: boolean;
  error: string | null;
  onEmailUser: (target: FeedbackEmailTarget) => void;
}

const HEADERS = [
  { label: "User ID", align: "text-left" },
  { label: "Email", align: "text-left" },
  { label: "Name", align: "text-left" },
  { label: "Route key", align: "text-left" },
  { label: "Hits", align: "text-right" },
  { label: "First seen", align: "text-left" },
  { label: "Last seen", align: "text-left" },
  { label: "Email user", align: "text-right" },
];

function StateRow({ children }: { children: React.ReactNode }) {
  return (
    <tr>
      <td colSpan={HEADERS.length} className="px-4 py-8 text-center text-sm">
        {children}
      </td>
    </tr>
  );
}

/** Per-user, per-route hit counts table (legacy usage.html #api-detail). */
export function ApiHitsTable({ hits, loading, error, onEmailUser }: ApiHitsTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[64rem] text-sm">
        <thead>
          <tr className="border-b border-outline-variant/20 text-[11px] uppercase tracking-wider text-on-surface-variant">
            {HEADERS.map((h) => (
              <th key={h.label} className={`px-3 py-2.5 font-semibold ${h.align}`}>
                {h.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <StateRow>
              <span className="inline-flex items-center gap-2 text-on-surface-variant">
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
                Loading…
              </span>
            </StateRow>
          ) : error ? (
            <StateRow>
              <span className="text-error">{error}</span>
            </StateRow>
          ) : hits.length === 0 ? (
            <StateRow>
              <span className="text-on-surface-variant">
                No data yet. Authenticated API traffic will appear here.
              </span>
            </StateRow>
          ) : (
            hits.map((h) => {
              const name = hitDisplayName(h);
              return (
                <tr
                  key={`${h.user_id}:${h.route_key}`}
                  className="border-t border-outline-variant/10 transition-colors hover:bg-surface-container-high/50"
                >
                  <td className="px-3 py-2.5 font-mono text-xs text-on-surface-variant">
                    {h.user_id}
                  </td>
                  <td className="px-3 py-2.5">{h.email}</td>
                  <td className="px-3 py-2.5">{name || "—"}</td>
                  <td className="break-all px-3 py-2.5 font-mono text-xs">{h.route_key}</td>
                  <td className="px-3 py-2.5 text-right font-semibold">
                    {(h.hit_count ?? 0).toLocaleString()}
                  </td>
                  <td className="whitespace-nowrap px-3 py-2.5 text-xs text-on-surface-variant">
                    {formatSeenAt(h.first_seen_at)}
                  </td>
                  <td className="whitespace-nowrap px-3 py-2.5 text-xs text-on-surface-variant">
                    {formatSeenAt(h.last_seen_at)}
                  </td>
                  <td className="px-3 py-2.5 text-right">
                    <button
                      type="button"
                      disabled={!h.email}
                      onClick={() =>
                        onEmailUser({ userId: h.user_id, email: h.email, name })
                      }
                      className="inline-flex items-center gap-1.5 rounded-lg border border-outline-variant/25 bg-surface-container px-3 py-1.5 text-xs font-medium text-on-surface transition-colors hover:bg-surface-container-high disabled:opacity-50"
                    >
                      <Mail className="h-3.5 w-3.5" />
                      Email
                    </button>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
