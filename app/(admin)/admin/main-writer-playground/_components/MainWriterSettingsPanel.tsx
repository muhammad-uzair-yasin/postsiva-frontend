"use client";

import Link from "next/link";
import { Loader2, Plus, RefreshCw, Save, Trash2, Undo2, XCircle } from "lucide-react";

import {
  defaultSlot,
  formatRouteStamp,
  MAX_FALLBACKS,
  type ProviderModelRef,
  routeMetaFor,
} from "@/lib/admin/aiManagerApi";

import { SlotPicker } from "../../ai-manager/_components/SlotPicker";
import { PromptEditorPanel } from "../../system-prompts/_components/PromptEditorPanel";
import { MAIN_WRITER_ROUTE_KEY } from "../_data/keys";
import { useMainWriterPlaygroundSettings } from "../_hooks/useMainWriterPlaygroundSettings";

export function MainWriterSettingsPanel() {
  const settings = useMainWriterPlaygroundSettings();
  const routeMeta = routeMetaFor(MAIN_WRITER_ROUTE_KEY);

  if (settings.loading) {
    return (
      <div className="flex items-center gap-3 rounded-2xl border border-outline-variant/15 bg-surface-container-low px-4 py-6">
        <Loader2 className="h-4 w-4 animate-spin text-primary" />
        <span className="text-sm text-on-surface-variant">Loading agent settings…</span>
      </div>
    );
  }

  if (settings.loadError) {
    return (
      <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-error/25 bg-error/5 px-4 py-4">
        <XCircle className="h-4 w-4 shrink-0 text-error" />
        <span className="text-sm text-on-surface">{settings.loadError}</span>
        <button
          type="button"
          onClick={() => void settings.reload()}
          className="inline-flex items-center gap-1.5 rounded-xl border border-outline-variant/25 bg-surface-container px-3 py-1.5 text-sm font-bold"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Retry
        </button>
      </div>
    );
  }

  const draft = settings.routeDraft;
  const setPrimary = (ref: ProviderModelRef) => {
    if (!draft) return;
    settings.setRouteDraft({ ...draft, primary: ref });
  };
  const setFallback = (idx: number, ref: ProviderModelRef) => {
    if (!draft) return;
    settings.setRouteDraft({
      ...draft,
      fallbacks: draft.fallbacks.map((row, i) => (i === idx ? ref : row)),
    });
  };
  const removeFallback = (idx: number) => {
    if (!draft) return;
    settings.setRouteDraft({
      ...draft,
      fallbacks: draft.fallbacks.filter((_, i) => i !== idx),
    });
  };
  const addFallback = () => {
    if (!draft || draft.fallbacks.length >= MAX_FALLBACKS) return;
    settings.setRouteDraft({
      ...draft,
      fallbacks: [...draft.fallbacks, defaultSlot(settings.catalog, MAIN_WRITER_ROUTE_KEY)],
    });
  };

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-outline-variant/20 bg-surface-container-low p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-sm font-bold text-on-surface">Provider & model cascade</h2>
            <p className="mt-0.5 text-xs text-on-surface-variant">
              Primary model runs first; ordered fallbacks are tried if the prior attempt fails.
              Saved via AI Manager for <code>main_writer</code>.
            </p>
            {settings.route ? (
              <p className="mt-1 text-xs text-on-surface-variant/70">
                {formatRouteStamp(settings.route)}
              </p>
            ) : null}
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled={settings.routeBusy}
              onClick={() => void settings.resetRoute()}
              className="inline-flex items-center gap-1.5 rounded-xl border border-outline-variant/25 bg-surface-container px-3 py-2 text-sm font-bold text-on-surface hover:bg-surface-container-high disabled:opacity-50"
            >
              <Undo2 className="h-3.5 w-3.5" />
              Reset defaults
            </button>
            <button
              type="button"
              disabled={settings.routeBusy || !settings.routeDirty || !draft}
              onClick={() => void settings.saveRoute()}
              className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-3 py-2 text-sm font-bold text-on-primary hover:opacity-90 disabled:opacity-50"
            >
              {settings.routeBusy ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Save className="h-3.5 w-3.5" />
              )}
              Save cascade
            </button>
          </div>
        </div>

        {settings.routeDirty ? (
          <p className="mt-2 text-xs font-bold text-primary">Unsaved provider/model changes</p>
        ) : null}
        {settings.routeStatus ? (
          <p
            className={`mt-2 text-xs ${
              settings.routeStatusError ? "text-error" : "text-primary"
            }`}
          >
            {settings.routeStatus}
          </p>
        ) : null}

        {draft ? (
          <div className="mt-4 space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <SlotPicker
                label="Primary"
                routeKey={MAIN_WRITER_ROUTE_KEY}
                catalog={settings.catalog}
                value={draft.primary}
                onChange={setPrimary}
                disabled={settings.routeBusy}
              />
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between gap-2">
                <span className="text-xs font-bold uppercase tracking-wide text-on-surface-variant">
                  Fallbacks (ordered)
                </span>
                <button
                  type="button"
                  onClick={addFallback}
                  disabled={settings.routeBusy || draft.fallbacks.length >= MAX_FALLBACKS}
                  className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline disabled:opacity-50"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add fallback
                </button>
              </div>
              {draft.fallbacks.length === 0 ? (
                <p className="text-xs text-on-surface-variant">
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
                        routeKey={MAIN_WRITER_ROUTE_KEY}
                        catalog={settings.catalog}
                        value={row}
                        onChange={(ref) => setFallback(idx, ref)}
                        disabled={settings.routeBusy}
                        compact
                      />
                      <button
                        type="button"
                        onClick={() => removeFallback(idx)}
                        disabled={settings.routeBusy}
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
          </div>
        ) : null}

        <p className="mt-3 text-xs text-on-surface-variant">
          Full route editor:{" "}
          <Link href="/admin/ai-manager" className="font-bold text-primary hover:underline">
            AI Manager
          </Link>
          {" · "}
          {routeMeta.blurb}
        </p>
      </div>

      <div className="rounded-2xl border border-outline-variant/20 bg-surface-container-low p-5">
        <p className="mb-4 text-xs text-on-surface-variant">
          System prompt uses the same version history as{" "}
          <Link
            href="/admin/system-prompts?key=main_writer"
            className="font-bold text-primary hover:underline"
          >
            System Prompts
          </Link>
          . Saving creates a new version and activates it.
        </p>
        <PromptEditorPanel
          detail={settings.detail}
          versions={settings.versions}
          draft={settings.promptDraft}
          note={settings.promptNote}
          detailLoading={false}
          busy={settings.promptBusy}
          status={settings.promptStatus}
          statusError={settings.promptStatusError}
          onDraftChange={settings.setPromptDraft}
          onNoteChange={settings.setPromptNote}
          onSave={() => void settings.savePrompt()}
          onReset={() => void settings.resetPrompt()}
          onActivate={(versionId) => void settings.activatePromptVersion(versionId)}
        />
      </div>
    </div>
  );
}
