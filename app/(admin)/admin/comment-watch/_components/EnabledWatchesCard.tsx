"use client";

import { useState } from "react";
import { AlertTriangle, EyeOff, Loader2 } from "lucide-react";

import type { EnabledWatch } from "@/lib/admin/commentWatchApi";
import {
  formatWatchDate,
  truncateId,
  watchCountLabel,
  watchUserLabel,
} from "@/lib/admin/commentWatchApi";

interface Props {
  watches: EnabledWatch[] | null;
  loading: boolean;
  error: string | null;
  disablingId: number | null;
  onDisable: (watchId: number) => Promise<string | null>;
}

const TH = "px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-on-surface-variant";
const TD = "px-4 py-3 text-sm";

export function EnabledWatchesCard({ watches, loading, error, disablingId, onDisable }: Props) {
  const [pendingWatch, setPendingWatch] = useState<EnabledWatch | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const confirmDisable = async () => {
    if (!pendingWatch) return;
    setActionError(null);
    const id = pendingWatch.id;
    setPendingWatch(null);
    const err = await onDisable(id);
    if (err) setActionError(err);
  };

  return (
    <section className="overflow-hidden rounded-2xl border border-outline-variant/20 bg-surface-container-low">
      <div className="flex items-center justify-between border-b border-outline-variant/20 px-4 py-3">
        <h2 className="text-base font-bold text-on-surface">All enabled posts</h2>
        <span className="text-sm text-on-surface-variant">
          {watchCountLabel(watches?.length ?? 0)}
        </span>
      </div>

      {actionError ? (
        <div className="mx-4 mt-3 rounded-xl bg-error-container px-3 py-2 text-sm text-on-error-container">
          {actionError}
        </div>
      ) : null}

      {loading && !watches ? (
        <div className="flex items-center justify-center gap-2 py-10 text-sm text-on-surface-variant">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading…
        </div>
      ) : error ? (
        <div className="px-4 py-8 text-center text-sm text-error">Error: {error}</div>
      ) : !watches || watches.length === 0 ? (
        <div className="px-4 py-8 text-center text-sm text-on-surface-variant">
          No enabled watches.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-outline-variant/20">
              <tr>
                <th className={TH}>ID</th>
                <th className={TH}>User (email)</th>
                <th className={TH}>Post ID</th>
                <th className={TH}>Enabled at</th>
                <th className={TH}>Action</th>
              </tr>
            </thead>
            <tbody>
              {watches.map((w) => (
                <tr
                  key={w.id}
                  className="border-b border-outline-variant/10 last:border-b-0 hover:bg-surface-container"
                >
                  <td className={`${TD} text-on-surface-variant`}>{w.id}</td>
                  <td className={`${TD} text-on-surface`}>{watchUserLabel(w)}</td>
                  <td className={`${TD} font-mono text-xs text-on-surface-variant`} title={w.post_id ?? ""}>
                    {truncateId(w.post_id, 50) || "—"}
                  </td>
                  <td className={`${TD} text-on-surface-variant`}>{formatWatchDate(w.created_at)}</td>
                  <td className={TD}>
                    <button
                      type="button"
                      onClick={() => setPendingWatch(w)}
                      disabled={disablingId !== null}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-error-container px-3 py-1.5 text-sm font-semibold text-on-error-container transition-opacity hover:opacity-85 disabled:opacity-50"
                    >
                      {disablingId === w.id ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <EyeOff className="h-3.5 w-3.5" />
                      )}
                      Disable
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {pendingWatch ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Disable watch confirmation"
          onClick={() => setPendingWatch(null)}
        >
          <div
            className="w-full max-w-md rounded-2xl border border-outline-variant/20 bg-surface-container-low p-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-error-container text-on-error-container">
                <AlertTriangle className="h-5 w-5" />
              </span>
              <div className="min-w-0">
                <h3 className="text-base font-bold text-on-surface">Disable this watch?</h3>
                <p className="mt-1 text-sm text-on-surface-variant">
                  The user will no longer get AI replies on this post.
                </p>
                <p className="mt-2 truncate font-mono text-xs text-on-surface-variant" title={pendingWatch.post_id ?? ""}>
                  {watchUserLabel(pendingWatch)} · {truncateId(pendingWatch.post_id, 40) || "—"}
                </p>
              </div>
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setPendingWatch(null)}
                className="rounded-xl border border-outline-variant/25 bg-surface-container px-4 py-2 text-sm font-bold text-on-surface hover:bg-surface-container-high"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => void confirmDisable()}
                className="rounded-xl bg-error px-4 py-2 text-sm font-bold text-on-error transition-opacity hover:opacity-90"
              >
                Disable watch
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
