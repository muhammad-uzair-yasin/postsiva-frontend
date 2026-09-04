"use client";

import { Loader2, RotateCcw, Save } from "lucide-react";

import type {
  SystemPromptDetail,
  SystemPromptVersionItem,
} from "@/lib/admin/systemPromptsApi";

type Props = {
  detail: SystemPromptDetail | null;
  versions: SystemPromptVersionItem[];
  draft: string;
  note: string;
  detailLoading: boolean;
  busy: boolean;
  status: string | null;
  statusError: boolean;
  onDraftChange: (value: string) => void;
  onNoteChange: (value: string) => void;
  onSave: () => void;
  onReset: () => void;
  onActivate: (versionId: number) => void;
};

const SOFT_WARN_CHARS = 50_000;

export function PromptEditorPanel({
  detail,
  versions,
  draft,
  note,
  detailLoading,
  busy,
  status,
  statusError,
  onDraftChange,
  onNoteChange,
  onSave,
  onReset,
  onActivate,
}: Props) {
  if (!detail && !detailLoading) {
    return (
      <div className="rounded-2xl border border-outline-variant/15 bg-surface-container-low px-4 py-10 text-center text-sm text-on-surface-variant">
        Select a prompt to view and edit.
      </div>
    );
  }

  if (detailLoading || !detail) {
    return (
      <div className="flex items-center gap-3 rounded-2xl border border-outline-variant/15 bg-surface-container-low px-4 py-6">
        <Loader2 className="h-4 w-4 animate-spin text-primary" />
        <span className="text-sm text-on-surface-variant">Loading prompt…</span>
      </div>
    );
  }

  const dirty = draft !== detail.body;
  const longWarn = draft.length >= SOFT_WARN_CHARS;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-on-surface">{detail.title}</h2>
          <p className="mt-1 text-sm text-on-surface-variant">{detail.blurb}</p>
          <p className="mt-2 text-xs text-on-surface-variant">
            Key: <code className="text-on-surface">{detail.prompt_key}</code>
            {" · "}
            {detail.is_default
              ? "Using code default"
              : `Active version v${detail.active_version}`}
            {" · "}
            {draft.length.toLocaleString()} chars
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            disabled={busy || detail.is_default}
            onClick={onReset}
            className="inline-flex items-center gap-1.5 rounded-xl border border-outline-variant/25 bg-surface-container px-3 py-2 text-sm font-bold text-on-surface hover:bg-surface-container-high disabled:opacity-50"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Reset to default
          </button>
          <button
            type="button"
            disabled={busy || !dirty || !draft.trim()}
            onClick={onSave}
            className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-3 py-2 text-sm font-bold text-on-primary hover:opacity-90 disabled:opacity-50"
          >
            {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
            Save new version
          </button>
        </div>
      </div>

      {longWarn ? (
        <p className="text-xs text-error">
          Prompt is very long ({draft.length.toLocaleString()} chars). This increases token cost.
        </p>
      ) : null}
      {status ? (
        <p className={`text-xs ${statusError ? "text-error" : "text-primary"}`}>{status}</p>
      ) : null}

      <label className="block space-y-1.5">
        <span className="text-xs font-bold uppercase tracking-wide text-on-surface-variant">
          Note (optional)
        </span>
        <input
          value={note}
          onChange={(e) => onNoteChange(e.target.value)}
          placeholder="Why this change?"
          className="w-full rounded-xl border border-outline-variant/25 bg-surface-container px-3 py-2 text-sm text-on-surface"
        />
      </label>

      <label className="block space-y-1.5">
        <span className="text-xs font-bold uppercase tracking-wide text-on-surface-variant">
          System prompt
        </span>
        <textarea
          value={draft}
          onChange={(e) => onDraftChange(e.target.value)}
          rows={22}
          spellCheck={false}
          className="w-full resize-y rounded-2xl border border-outline-variant/25 bg-surface-container px-3 py-3 font-mono text-xs leading-relaxed text-on-surface"
        />
      </label>

      <div className="space-y-2">
        <h3 className="text-sm font-bold text-on-surface">Version history</h3>
        {versions.length === 0 ? (
          <p className="text-sm text-on-surface-variant">No saved versions yet (using code default).</p>
        ) : (
          <ul className="divide-y divide-outline-variant/15 rounded-2xl border border-outline-variant/15">
            {versions.map((v) => (
              <li
                key={v.id}
                className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 text-sm"
              >
                <div>
                  <span className="font-bold text-on-surface">v{v.version}</span>
                  {v.is_active ? (
                    <span className="ml-2 rounded-full bg-primary/15 px-2 py-0.5 text-xs font-bold text-primary">
                      active
                    </span>
                  ) : null}
                  {v.note ? (
                    <span className="ml-2 text-on-surface-variant">{v.note}</span>
                  ) : null}
                  <div className="text-xs text-on-surface-variant">
                    {new Date(v.created_at).toLocaleString()} · {v.body.length.toLocaleString()} chars
                  </div>
                </div>
                {!v.is_active ? (
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => onActivate(v.id)}
                    className="rounded-lg border border-outline-variant/25 px-2.5 py-1 text-xs font-bold text-on-surface hover:bg-surface-container-high disabled:opacity-50"
                  >
                    Activate
                  </button>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
