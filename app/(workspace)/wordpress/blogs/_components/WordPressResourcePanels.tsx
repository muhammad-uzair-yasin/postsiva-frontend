"use client";

import { useRef, useState, type ReactElement } from "react";

import type { WordPressMediaItem } from "@/lib/social/wordpressMediaApi";
import type { WordPressTermKind } from "@/lib/social/wordpressTaxonomyApi";
import type { WordPressEditorResources } from "../_hooks/useWordPressEditorResources";
import { MediaThumb, SideBox, TermPicker } from "./WordPressEditorParts";

export function WordPressResourcePanels(props: {
  resources: WordPressEditorResources;
  selectedCategories: number[];
  selectedTags: number[];
  onToggleTerm: (id: number, selected: boolean, kind: WordPressTermKind) => void;
  onPickMedia: (item: WordPressMediaItem) => void;
}): ReactElement {
  const fileRef = useRef<HTMLInputElement>(null);
  const [categoryName, setCategoryName] = useState("");
  const [tagName, setTagName] = useState("");
  const [busy, setBusy] = useState<string | null>(null);

  const addTerm = async (kind: WordPressTermKind, name: string): Promise<void> => {
    if (!name.trim()) return;
    setBusy(kind);
    try {
      await props.resources.createTerm(kind, name.trim());
      if (kind === "categories") setCategoryName("");
      else setTagName("");
    } finally {
      setBusy(null);
    }
  };

  const upload = async (file: File | undefined): Promise<void> => {
    if (!file) return;
    setBusy("media");
    try {
      const item = await props.resources.uploadMedia(file);
      props.onPickMedia(item);
    } finally {
      setBusy(null);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  return (
    <>
      <SideBox title="Media" id="wordpress-media-picker">
        <input ref={fileRef} type="file" accept="image/*,video/*" className="hidden" onChange={(event) => void upload(event.target.files?.[0])} />
        <button type="button" onClick={() => fileRef.current?.click()} disabled={busy === "media"} className="h-9 rounded-lg border border-secondary/45 px-3 text-sm font-semibold text-secondary hover:bg-secondary/10 disabled:opacity-60">
          {busy === "media" ? "Uploading..." : "Upload image/video"}
        </button>
        <ResourceState loading={props.resources.loading} error={props.resources.error} />
        <div className="grid max-h-60 gap-2 overflow-y-auto pr-1">
          {props.resources.media.filter((item) => item.source_url).slice(0, 12).map((item) => (
            <div key={item.id} className="flex items-center gap-2 rounded-md border border-outline-variant/25 p-1.5">
              <button type="button" onClick={() => props.onPickMedia(item)} className="flex min-w-0 flex-1 items-center gap-2 text-left">
                <MediaThumb src={item.source_url ?? ""} isVideo={item.mime_type?.startsWith("video/") ?? false} />
                <span className="min-w-0 truncate text-xs text-on-surface-variant">{item.title || item.slug || `Media ${item.id}`}</span>
              </button>
              <button type="button" onClick={() => void props.resources.deleteMedia(item.id)} className="grid h-8 w-8 place-items-center rounded-md text-error hover:bg-error/10" title="Delete media">
                <span className="material-symbols-outlined text-[17px]">delete</span>
              </button>
            </div>
          ))}
        </div>
      </SideBox>
      <TaxonomyBox kind="categories" title="Categories" value={categoryName} onValueChange={setCategoryName} selected={props.selectedCategories} resources={props.resources} busy={busy} onAdd={addTerm} onToggleTerm={props.onToggleTerm} />
      <TaxonomyBox kind="tags" title="Tags" value={tagName} onValueChange={setTagName} selected={props.selectedTags} resources={props.resources} busy={busy} onAdd={addTerm} onToggleTerm={props.onToggleTerm} />
    </>
  );
}

function TaxonomyBox(props: {
  kind: WordPressTermKind;
  title: string;
  value: string;
  selected: number[];
  resources: WordPressEditorResources;
  busy: string | null;
  onValueChange: (value: string) => void;
  onAdd: (kind: WordPressTermKind, name: string) => Promise<void>;
  onToggleTerm: (id: number, selected: boolean, kind: WordPressTermKind) => void;
}): ReactElement {
  const terms = props.kind === "categories" ? props.resources.categories : props.resources.tags;
  const [modalOpen, setModalOpen] = useState(false);
  return (
    <SideBox
      title={
        <span className="flex items-center justify-between gap-2">
          <span>{props.title}</span>
          <button type="button" onClick={() => setModalOpen(true)} className="grid h-7 w-7 place-items-center rounded-md border border-secondary/35 text-secondary hover:bg-secondary/10" title={`Manage ${props.title.toLowerCase()}`}>
            <span className="material-symbols-outlined text-[17px]">add</span>
          </button>
        </span>
      }
    >
      <TermPicker
        terms={terms}
        selected={props.selected}
        onToggle={(id, selected) => props.onToggleTerm(id, selected, props.kind)}
      />
      {modalOpen ? (
        <TermManageModal
          kind={props.kind}
          title={props.title}
          terms={terms}
          resources={props.resources}
          onClose={() => setModalOpen(false)}
          onDeleted={(id) => props.onToggleTerm(id, false, props.kind)}
        />
      ) : null}
    </SideBox>
  );
}

export function TermManageModal(props: {
  kind: WordPressTermKind;
  title: string;
  terms: Array<{ id: number; name: string; count: number }>;
  resources: WordPressEditorResources;
  onClose: () => void;
  onDeleted: (id: number) => void;
}): ReactElement {
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);

  const create = async (): Promise<void> => {
    if (!name.trim()) return;
    setBusy(true);
    try {
      await props.resources.createTerm(props.kind, name.trim());
      setName("");
    } finally {
      setBusy(false);
    }
  };

  const remove = async (id: number): Promise<void> => {
    setBusy(true);
    try {
      await props.resources.deleteTerm(props.kind, id);
      props.onDeleted(id);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[1300] flex items-center justify-center bg-black/60 px-4">
      <div className="w-full max-w-md rounded-xl border border-outline-variant/25 bg-surface p-5 shadow-2xl">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-base font-bold text-on-surface">Manage {props.title}</h2>
          <button type="button" onClick={props.onClose} className="grid h-8 w-8 place-items-center rounded-md text-on-surface-variant hover:bg-surface-container-high" title="Close">
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>
        <form className="mt-4 flex gap-2" onSubmit={(event) => { event.preventDefault(); void create(); }}>
          <input value={name} onChange={(event) => setName(event.target.value)} placeholder={`New ${props.title.slice(0, -1).toLowerCase()}`} className="h-10 min-w-0 flex-1 rounded-lg border border-outline-variant/35 bg-surface-container-low px-3 text-sm text-on-surface outline-none focus:border-secondary" />
          <button type="submit" disabled={busy || !name.trim()} className="h-10 rounded-lg bg-primary px-4 text-sm font-bold text-on-primary disabled:opacity-60">Save</button>
        </form>
        <div className="mt-4 grid max-h-64 gap-2 overflow-y-auto pr-1">
          {props.terms.length === 0 ? (
            <p className="text-sm text-on-surface-variant">No items found.</p>
          ) : props.terms.map((term) => (
            <div key={term.id} className="flex items-center gap-2 rounded-lg border border-outline-variant/20 px-3 py-2">
              <span className="min-w-0 flex-1 truncate text-sm text-on-surface">{term.name}</span>
              <span className="text-xs text-on-surface-variant">{term.count}</span>
              <button type="button" onClick={() => void remove(term.id)} disabled={busy} className="grid h-8 w-8 place-items-center rounded-md text-error hover:bg-error/10 disabled:opacity-50" title="Delete">
                <span className="material-symbols-outlined text-[17px]">delete</span>
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ResourceState({ loading, error }: { loading: boolean; error: string | null }): ReactElement | null {
  if (loading) return <p className="text-xs text-on-surface-variant">Loading...</p>;
  if (error) return <p className="text-xs text-error">{error}</p>;
  return null;
}
