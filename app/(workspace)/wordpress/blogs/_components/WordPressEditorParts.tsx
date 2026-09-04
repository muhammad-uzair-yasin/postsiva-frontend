"use client";

import type { ReactElement, ReactNode } from "react";
import { useState } from "react";

export function TermPicker(props: {
  terms: Array<{ id: number; name: string; count: number }>;
  selected: number[];
  onToggle: (id: number, selected: boolean) => void;
  onDelete?: (id: number) => void;
}): ReactElement {
  if (props.terms.length === 0) {
    return <p className="text-xs text-on-surface-variant">No items found.</p>;
  }
  return (
    <div className="grid max-h-44 gap-2 overflow-y-auto pr-1">
      {props.terms.map((term) => (
        <div key={term.id} className="flex items-center gap-2 rounded-md border border-outline-variant/20 px-2 py-2 text-sm text-on-surface-variant">
          <label className="flex min-w-0 flex-1 items-center gap-2">
            <input type="checkbox" checked={props.selected.includes(term.id)} onChange={(e) => props.onToggle(term.id, e.target.checked)} className="h-4 w-4 accent-secondary" />
            <span className="min-w-0 flex-1 truncate">{term.name}</span>
            <span className="text-xs text-on-surface-variant/70">{term.count}</span>
          </label>
          {props.onDelete ? (
            <button type="button" onClick={() => props.onDelete?.(term.id)} className="grid h-6 w-6 place-items-center rounded text-error hover:bg-error/10" title="Delete">
              <span className="material-symbols-outlined text-[15px]">delete</span>
            </button>
          ) : null}
        </div>
      ))}
    </div>
  );
}

export function SideBox({ title, children, id }: { title: ReactNode; children: ReactNode; id?: string }): ReactElement {
  return (
    <section id={id} className="rounded-lg border border-outline-variant/20 bg-surface-container-low">
      <h2 className="border-b border-outline-variant/15 px-4 py-3 text-sm font-bold text-on-surface">{title}</h2>
      <div className="grid gap-3 px-4 py-4 text-sm">{children}</div>
    </section>
  );
}

export function Label({ text, children }: { text: string; children: ReactNode }): ReactElement {
  return (
    <label className="grid gap-1.5 text-xs font-semibold text-on-surface-variant">
      {text}
      {children}
    </label>
  );
}

export function MediaThumb({ src, isVideo }: { src: string; isVideo: boolean }): ReactElement {
  const [failed, setFailed] = useState(false);
  if (failed || !src) {
    return (
      <span className="grid h-11 w-14 shrink-0 place-items-center rounded bg-surface-container-high text-secondary">
        <span className="material-symbols-outlined text-[20px]">{isVideo ? "videocam" : "image"}</span>
      </span>
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element -- WordPress media URLs are already remote user content previews.
    <img src={src} alt="" onError={() => setFailed(true)} className="h-11 w-14 shrink-0 rounded object-cover" />
  );
}

export function ElementTile(props: {
  icon: string;
  label: string;
  onClick: () => void;
  crown?: boolean;
}): ReactElement {
  return (
    <button
      type="button"
      onClick={props.onClick}
      className="relative grid h-[74px] place-items-center rounded-sm border border-outline-variant/30 bg-surface-container-high/45 text-on-surface-variant transition hover:border-secondary/55 hover:text-secondary"
      title={`Add ${props.label.toLowerCase()}`}
    >
      {props.crown ? <span className="material-symbols-outlined absolute right-1.5 top-1.5 text-[13px] text-secondary">crown</span> : null}
      <span className="material-symbols-outlined text-[23px]">{props.icon}</span>
      <span className="text-[11px] font-medium">{props.label}</span>
    </button>
  );
}

export function DeleteModal(props: { deleting: boolean; onCancel: () => void; onConfirm: () => Promise<void> }): ReactElement {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 px-4">
      <div className="w-full max-w-sm rounded-lg border border-outline-variant/30 bg-surface p-5 shadow-2xl">
        <h2 className="text-base font-bold text-on-surface">Move blog to trash?</h2>
        <p className="mt-2 text-sm leading-6 text-on-surface-variant">This moves the blog to trash in WordPress.</p>
        <div className="mt-5 flex justify-end gap-3">
          <button type="button" onClick={props.onCancel} disabled={props.deleting} className="h-9 rounded-lg border border-outline-variant/40 px-4 text-sm font-semibold text-on-surface-variant disabled:opacity-60">Cancel</button>
          <button type="button" onClick={() => void props.onConfirm()} disabled={props.deleting} className="h-9 rounded-lg bg-error px-4 text-sm font-semibold text-on-error disabled:opacity-60">{props.deleting ? "Moving" : "Move to trash"}</button>
        </div>
      </div>
    </div>
  );
}
