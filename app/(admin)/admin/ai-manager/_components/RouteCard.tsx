"use client";

import Link from "next/link";
import { Loader2, Plus, Save, Trash2, Undo2 } from "lucide-react";

import {
  type CatalogProvider,
  defaultSlot,
  formatRouteStamp,
  isDraftDirty,
  MAX_FALLBACKS,
  type ProviderModelRef,
  type RouteConfigResponse,
  type RouteDraft,
  routeMetaFor,
} from "@/lib/admin/aiManagerApi";
import type { CardStatus } from "../_hooks/useAiManager";

import { SlotPicker } from "./SlotPicker";

interface RouteCardProps {
  route: RouteConfigResponse;
  draft: RouteDraft;
  catalog: CatalogProvider[];
  busy: boolean;
  status: CardStatus;
  onChangeDraft: (updater: (draft: RouteDraft) => RouteDraft) => void;
  onSave: () => void;
  onResetRequest: () => void;
}

const STATUS_CLASS: Record<CardStatus["kind"], string> = {
  idle: "text-on-surface-variant",
  pending: "text-on-surface-variant",
  ok: "text-primary",
  error: "text-error",
};

/** One config route: primary (+ summarizer for Piva) and ordered fallbacks. */
export function RouteCard({
  route,
  draft,
  catalog,
  busy,
  status,
  onChangeDraft,
  onSave,
  onResetRequest,
}: RouteCardProps) {
  const meta = routeMetaFor(route.config_key);
  const dirty = isDraftDirty(draft, route.config, meta.hasSummarizer);

  const setPrimary = (ref: ProviderModelRef) =>
    onChangeDraft((d) => ({ ...d, primary: ref }));
  const setSummarizer = (ref: ProviderModelRef) =>
    onChangeDraft((d) => ({ ...d, summarizer: ref }));
  const setFallback = (idx: number, ref: ProviderModelRef) =>
    onChangeDraft((d) => ({
      ...d,
      fallbacks: d.fallbacks.map((f, i) => (i === idx ? ref : f)),
    }));
  const removeFallback = (idx: number) =>
    onChangeDraft((d) => ({
      ...d,
      fallbacks: d.fallbacks.filter((_, i) => i !== idx),
    }));
  const addFallback = () =>
    onChangeDraft((d) =>
      d.fallbacks.length >= MAX_FALLBACKS
        ? d
        : { ...d, fallbacks: [...d.fallbacks, defaultSlot(catalog, route.config_key)] },
    );

  return (
    <div className="space-y-3 rounded-2xl border border-outline-variant/15 bg-surface-container-low p-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-base font-bold text-on-surface">{meta.title}</h2>
            {dirty ? (
              <span className="rounded-full bg-primary/12 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-primary">
                Unsaved changes
              </span>
            ) : null}
          </div>
          {meta.blurb ? (
            <p className="text-xs text-on-surface-variant">{meta.blurb}</p>
          ) : null}
          <p className="mt-1 text-xs text-on-surface-variant/70">
            {formatRouteStamp(route)}
          </p>
        </div>
        <Link
          href="/admin/ai-providers"
          className="text-sm font-medium text-primary hover:underline"
        >
          Test providers →
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <SlotPicker
          label="Main agent"
          routeKey={route.config_key}
          catalog={catalog}
          value={draft.primary}
          onChange={setPrimary}
          disabled={busy}
        />
      </div>

      {meta.hasSummarizer && draft.summarizer ? (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <SlotPicker
            label="Summary agent (background)"
            routeKey={route.config_key}
            catalog={catalog}
            value={draft.summarizer}
            onChange={setSummarizer}
            disabled={busy}
          />
        </div>
      ) : null}

      <div>
        <div className="mb-2 flex items-center justify-between gap-2">
          <span className="text-sm font-medium text-on-surface">
            Fallbacks (ordered)
          </span>
          <button
            type="button"
            onClick={addFallback}
            disabled={busy || draft.fallbacks.length >= MAX_FALLBACKS}
            className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline disabled:opacity-50"
          >
            <Plus className="h-3.5 w-3.5" />
            Add fallback
          </button>
        </div>
        {draft.fallbacks.length === 0 ? (
          <p className="text-xs text-on-surface-variant/70">
            No fallbacks — only the primary model is tried.
          </p>
        ) : (
          <div className="space-y-3">
            {draft.fallbacks.map((row, idx) => (
              <div
                key={idx}
                className="grid grid-cols-1 items-end gap-2 md:grid-cols-[1fr_1fr_auto]"
              >
                <SlotPicker
                  label={`Fallback ${idx + 1}`}
                  routeKey={route.config_key}
                  catalog={catalog}
                  value={row}
                  onChange={(ref) => setFallback(idx, ref)}
                  disabled={busy}
                  compact
                />
                <button
                  type="button"
                  onClick={() => removeFallback(idx)}
                  disabled={busy}
                  title={`Remove fallback ${idx + 1}`}
                  className="mb-0.5 inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-medium text-error hover:bg-error/10 disabled:opacity-50"
                >
                  <Trash2 className="h-4 w-4" />
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2 pt-1">
        <button
          type="button"
          onClick={onSave}
          disabled={busy}
          className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-sm font-bold text-on-primary disabled:opacity-50"
        >
          {busy && status.kind === "pending" && status.message === "Saving…" ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          Save
        </button>
        <button
          type="button"
          onClick={onResetRequest}
          disabled={busy}
          className="inline-flex items-center gap-1.5 rounded-xl border border-outline-variant/25 bg-surface-container px-4 py-2 text-sm font-bold text-on-surface hover:bg-surface-container-high disabled:opacity-50"
        >
          <Undo2 className="h-4 w-4" />
          Back to defaults
        </button>
        {status.message ? (
          <span className={`text-sm ${STATUS_CLASS[status.kind]}`}>
            {status.message}
          </span>
        ) : null}
      </div>
    </div>
  );
}
