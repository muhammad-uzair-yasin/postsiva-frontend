"use client";

import { CheckCircle2, FilterX, RefreshCw, Search, X } from "lucide-react";

import { API_HITS_MAX_LIMIT, apiHitsMetaLabel } from "@/lib/admin/apiHitsApi";

import { useApiHits } from "../_hooks/useApiHits";
import { useFeedbackEmail } from "../_hooks/useFeedbackEmail";
import { ApiHitsTable } from "./ApiHitsTable";
import { FeedbackEmailModal } from "./FeedbackEmailModal";

const INPUT_CLASSES =
  "rounded-xl border border-outline-variant/25 bg-surface px-3 py-2 text-sm text-on-surface placeholder:text-on-surface-variant/60 focus:outline-none focus:ring-2 focus:ring-primary/40";

/** Per-user API route hits with filters, pagination, and feedback email action. */
export function ApiHitsScreen() {
  const hits = useApiHits();
  const feedback = useFeedbackEmail();

  return (
    <div className="w-full min-w-0">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-on-surface">API hits</h1>
          <p className="mt-1 text-sm text-on-surface-variant">
            Per-user, per-route hit counts from authenticated API traffic
          </p>
        </div>
        <button
          type="button"
          onClick={hits.refresh}
          className="inline-flex items-center gap-1.5 rounded-xl border border-outline-variant/25 bg-surface-container px-4 py-2 text-sm font-bold text-on-surface transition-colors hover:bg-surface-container-high"
        >
          <RefreshCw className={`h-4 w-4 ${hits.loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {feedback.sentDetail ? (
        <div className="mt-4 flex items-center justify-between gap-3 rounded-2xl border border-outline-variant/20 bg-surface-container-low px-4 py-3 text-sm">
          <span className="inline-flex items-center gap-2 text-on-surface">
            <CheckCircle2 className="h-4 w-4 text-primary" />
            {feedback.sentDetail}
          </span>
          <button
            type="button"
            onClick={feedback.dismissSentDetail}
            className="rounded-lg p-1.5 text-on-surface-variant hover:bg-surface-container-high"
            aria-label="Dismiss"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : null}

      <div className="mt-4 rounded-2xl border border-outline-variant/20 bg-surface-container-low p-4">
        <div className="flex flex-wrap items-end gap-3">
          <label className="flex flex-col gap-1 text-xs font-semibold text-on-surface-variant">
            User ID
            <input
              value={hits.draft.userId}
              onChange={(e) => hits.setDraftField("userId", e.target.value)}
              placeholder="UUID"
              className={`w-64 font-mono ${INPUT_CLASSES}`}
            />
          </label>
          <label className="flex flex-col gap-1 text-xs font-semibold text-on-surface-variant">
            Route contains
            <input
              value={hits.draft.routeContains}
              onChange={(e) => hits.setDraftField("routeContains", e.target.value)}
              placeholder="e.g. /workspaces"
              className={`w-52 ${INPUT_CLASSES}`}
            />
          </label>
          <label className="flex flex-col gap-1 text-xs font-semibold text-on-surface-variant">
            Rows per page
            <input
              type="number"
              min={1}
              max={API_HITS_MAX_LIMIT}
              value={hits.draft.limit}
              onChange={(e) => hits.setDraftField("limit", e.target.value)}
              className={`w-24 ${INPUT_CLASSES}`}
            />
          </label>
          <button
            type="button"
            onClick={hits.applyFilters}
            className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-sm font-bold text-on-primary"
          >
            <Search className="h-4 w-4" />
            Apply
          </button>
          <button
            type="button"
            onClick={hits.clearFilters}
            className="inline-flex items-center gap-1.5 rounded-xl border border-outline-variant/25 bg-surface-container px-4 py-2 text-sm font-bold text-on-surface transition-colors hover:bg-surface-container-high"
          >
            <FilterX className="h-4 w-4" />
            Clear
          </button>
        </div>
      </div>

      <div className="mt-4 rounded-2xl border border-outline-variant/20 bg-surface-container-low">
        <ApiHitsTable
          hits={hits.data?.hits ?? []}
          loading={hits.loading}
          error={hits.error}
          onEmailUser={feedback.open}
        />
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-outline-variant/20 px-4 py-3">
          <p className="text-xs text-on-surface-variant">
            {hits.data
              ? apiHitsMetaLabel(hits.data.hits.length, hits.data.total, hits.data.offset)
              : "—"}
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={hits.goPrev}
              disabled={!hits.canPrev || hits.loading}
              className="rounded-xl border border-outline-variant/25 bg-surface-container px-4 py-2 text-sm font-bold text-on-surface transition-colors hover:bg-surface-container-high disabled:opacity-50"
            >
              Previous
            </button>
            <button
              type="button"
              onClick={hits.goNext}
              disabled={!hits.canNext || hits.loading}
              className="rounded-xl border border-outline-variant/25 bg-surface-container px-4 py-2 text-sm font-bold text-on-surface transition-colors hover:bg-surface-container-high disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      <FeedbackEmailModal
        target={feedback.target}
        message={feedback.message}
        sending={feedback.sending}
        error={feedback.error}
        onMessageChange={feedback.setMessage}
        onClose={feedback.close}
        onSend={feedback.send}
      />
    </div>
  );
}
