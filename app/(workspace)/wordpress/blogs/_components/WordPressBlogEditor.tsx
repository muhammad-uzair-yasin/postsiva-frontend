"use client";

import { useMemo, useState, type ReactElement } from "react";

import type {
  WordPressBlogPost,
  WordPressPostStatus,
  WordPressPostUpdatePayload,
} from "@/lib/social/wordpressPostsApi";
import { useWordPressEditorResources } from "../_hooks/useWordPressEditorResources";
import { WordPressEditableBlock } from "./WordPressEditableBlock";
import { DeleteModal, ElementTile, Label, SideBox } from "./WordPressEditorParts";
import { WordPressResourcePanels } from "./WordPressResourcePanels";
import {
  htmlFromParts,
  mediaFromHtml,
  partsFromHtml,
  readMinutes,
  textFromHtml,
  type ArticlePartKind,
} from "./wordpressArticleParts";

const STATUSES: WordPressPostStatus[] = ["publish", "draft", "future", "pending", "private"];

interface WordPressBlogEditorProps {
  post: WordPressBlogPost;
  fallbackImageUrl?: string;
  saving: boolean;
  deleting: boolean;
  onBack: () => void;
  onSave: (payload: WordPressPostUpdatePayload) => Promise<void>;
  onDelete?: () => Promise<void>;
  backLabel?: string;
  saveLabel?: string;
}

function clean(value: string | null | undefined): string {
  return value ?? "";
}

export function WordPressBlogEditor(props: WordPressBlogEditorProps): ReactElement {
  return <WordPressBlogEditorForm key={props.post.id} {...props} />;
}

function WordPressBlogEditorForm({
  post,
  fallbackImageUrl,
  saving,
  deleting,
  onBack,
  onSave,
  onDelete,
  backLabel = "All Blogs",
  saveLabel = "Update",
}: WordPressBlogEditorProps): ReactElement {
  const initialHtml = clean(post.content_raw ?? post.content_rendered);
  const [title, setTitle] = useState(textFromHtml(clean(post.title_raw ?? post.title_rendered)));
  const [slug, setSlug] = useState(clean(post.slug));
  const [parts, setParts] = useState(() => {
    const parsed = partsFromHtml(initialHtml);
    const parsedHasMedia = parsed.some((part) => part.kind === "image" || part.kind === "video");
    const firstMedia = mediaFromHtml(initialHtml);
    if (parsedHasMedia || !firstMedia) return parsed;
    return [{ id: "media-0", kind: firstMedia.type, value: firstMedia.url }, ...parsed];
  });
  const [featuredMedia, setFeaturedMedia] = useState<number | null>(post.featured_media ?? null);
  const [excerpt, setExcerpt] = useState(textFromHtml(clean(post.excerpt_raw ?? post.excerpt_rendered)));
  const [status, setStatus] = useState<WordPressPostStatus>(post.status);
  const [date, setDate] = useState("");
  const [categories, setCategories] = useState<number[]>(post.categories ?? []);
  const [tags, setTags] = useState<number[]>(post.tags ?? []);
  const [commentStatus, setCommentStatus] = useState<"open" | "closed">(
    post.comment_status === "closed" ? "closed" : "open",
  );
  const [selectedPartId, setSelectedPartId] = useState<string | null>(() => partsFromHtml(initialHtml)[0]?.id ?? null);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const resources = useWordPressEditorResources(post.connection_id);
  const stats = useMemo(() => readMinutes(parts), [parts]);
  const selectedPart = parts.find((part) => part.id === selectedPartId) ?? null;
  const firstMediaPart = parts.find((part) => part.kind === "image" || part.kind === "video");
  const displayMedia = !firstMediaPart && fallbackImageUrl ? { url: fallbackImageUrl, type: "image" as const } : null;

  const updatePart = (id: string, value: string): void => {
    setParts((current) => current.map((part) => (part.id === id ? { ...part, value } : part)));
  };

  const setSelectedPartKind = (kind: "heading" | "paragraph"): void => {
    if (!selectedPartId) return;
    setParts((current) =>
      current.map((part) =>
        part.id === selectedPartId ? { ...part, kind } : part,
      ),
    );
  };

  const removeSelectedPart = (): void => {
    if (!selectedPartId) return;
    setParts((current) => current.filter((part) => part.id !== selectedPartId));
    setSelectedPartId(null);
  };

  const removePart = (id: string): void => {
    setParts((current) => current.filter((part) => part.id !== id));
    if (selectedPartId === id) setSelectedPartId(null);
  };

  const addPart = (kind: ArticlePartKind): void => {
    const id = crypto.randomUUID();
    const value = kind === "heading" ? "New heading" : kind === "paragraph" ? "New text" : "";
    setParts((current) => [...current, { id, kind, value }]);
    setSelectedPartId(id);
  };

  const movePart = (id: string, direction: -1 | 1): void => {
    setParts((current) => {
      const index = current.findIndex((part) => part.id === id);
      const nextIndex = index + direction;
      if (index < 0 || nextIndex < 0 || nextIndex >= current.length) return current;
      const copy = [...current];
      [copy[index], copy[nextIndex]] = [copy[nextIndex], copy[index]];
      return copy;
    });
  };

  const toggleTerm = (id: number, selected: boolean, kind: "categories" | "tags"): void => {
    const setter = kind === "categories" ? setCategories : setTags;
    setter((current) => {
      if (selected) return Array.from(new Set([...current, id]));
      return current.filter((item) => item !== id);
    });
  };

  const pickMedia = (item: { id: number; source_url?: string | null; mime_type?: string | null }): void => {
    if (!item.source_url) return;
    const type = item.mime_type?.startsWith("video/") ? "video" : "image";
    if (selectedPart?.kind === "image" || selectedPart?.kind === "video") {
      setParts((current) =>
        current.map((part) =>
          part.id === selectedPart.id ? { ...part, kind: type, value: item.source_url ?? "" } : part,
        ),
      );
    } else {
      const id = crypto.randomUUID();
      setParts((current) => [...current, { id, kind: type, value: item.source_url ?? "" }]);
      setSelectedPartId(id);
    }
    if (type === "image") setFeaturedMedia(item.id);
  };

  const save = async (): Promise<void> => {
    const payload: WordPressPostUpdatePayload = {
      title,
      slug,
      content: htmlFromParts(parts),
      excerpt,
      status,
      date: status === "future" && date ? new Date(date).toISOString() : undefined,
      categories,
      tags,
      comment_status: commentStatus,
    };
    if (featuredMedia) payload.featured_media = featuredMedia;
    await onSave(payload);
  };

  return (
    <div className="relative">
      <main className="overflow-hidden rounded-lg border border-outline-variant/20 bg-surface-container-low">
        <div className="flex items-center justify-between gap-3 border-b border-outline-variant/15 bg-surface px-5 py-3">
          <button
            type="button"
            onClick={onBack}
            className="flex h-9 items-center gap-2 text-sm font-semibold text-secondary hover:underline"
          >
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            {backLabel}
          </button>
        </div>
        <article className="mx-auto max-w-4xl px-5 py-10 sm:px-8">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Blog title"
            className="mx-auto block w-full max-w-3xl rounded-md border border-transparent bg-transparent text-center text-3xl font-bold leading-tight text-on-surface outline-none placeholder:text-on-surface-variant/55 transition focus:border-secondary/35 focus:bg-surface/30 sm:text-4xl"
          />

          {displayMedia?.url ? (
            <div className="group relative mt-10">
              {/* eslint-disable-next-line @next/next/no-img-element -- WordPress media URLs are already remote user content previews. */}
              <img src={displayMedia.url} alt="" className="aspect-[16/6.5] w-full rounded-lg object-cover shadow-sm ring-1 ring-outline-variant/20" />
              <div className="absolute inset-0 rounded-lg ring-0 transition group-hover:bg-surface/15 group-hover:ring-1 group-hover:ring-secondary/35">
                <button
                  type="button"
                  onClick={() => document.getElementById("wordpress-media-picker")?.scrollIntoView({ block: "start" })}
                  className="absolute right-3 top-3 inline-flex h-10 w-10 items-center justify-center rounded-full bg-surface/90 text-secondary shadow-lg ring-1 ring-outline-variant/25 transition hover:bg-secondary hover:text-on-secondary"
                  title="Change image"
                >
                  <span className="material-symbols-outlined text-[20px]">add_photo_alternate</span>
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => document.getElementById("wordpress-media-picker")?.scrollIntoView({ block: "start" })}
              className="mt-10 flex aspect-[16/6.5] w-full items-center justify-center rounded-lg border border-dashed border-secondary/45 text-sm font-semibold text-secondary hover:bg-secondary/10"
            >
              <span className="material-symbols-outlined mr-2 text-[20px]">add_photo_alternate</span>
              Add image
            </button>
          )}

          <div className="mt-8 grid gap-6">
            {parts.map((part, index) => (
              <WordPressEditableBlock
                key={part.id}
                part={part}
                index={index}
                total={parts.length}
                selected={selectedPartId === part.id}
                onSelect={() => setSelectedPartId(part.id)}
                onUpdate={(value) => updatePart(part.id, value)}
                onMove={(direction) => movePart(part.id, direction)}
                onDelete={() => removePart(part.id)}
                onDropPart={(draggedId) => {
                  setParts((current) => {
                    const draggedIndex = current.findIndex((item) => item.id === draggedId);
                    const dropIndex = current.findIndex((item) => item.id === part.id);
                    if (draggedIndex < 0 || dropIndex < 0) return current;
                    const copy = [...current];
                    const [dragged] = copy.splice(draggedIndex, 1);
                    copy.splice(dropIndex, 0, dragged);
                    return copy;
                  });
                }}
              />
            ))}
          </div>
        </article>
      </main>

      <aside className="fixed bottom-0 right-0 top-0 z-40 grid w-[320px] content-start gap-4 overflow-y-auto border-l border-outline-variant/20 bg-surface px-4 py-5 shadow-2xl animate-[wordpressEditorPanel_220ms_ease-out]">
        <SideBox title="Publish">
          <p className="text-xs text-on-surface-variant">{stats} min read</p>
          {post.link ? (
            <a href={post.link} target="_blank" rel="noreferrer" className="h-9 rounded-lg border border-outline-variant/35 px-3 pt-2 text-center text-sm font-semibold text-on-surface-variant hover:border-secondary/50 hover:text-secondary">
              Preview
            </a>
          ) : null}
          <button type="button" onClick={() => void save()} disabled={saving || deleting} className="h-9 rounded-lg bg-primary px-3 text-sm font-semibold text-on-primary disabled:opacity-60">
            {saving ? "Saving" : saveLabel}
          </button>
          <Label text="Status">
            <select value={status} onChange={(e) => setStatus(e.target.value as WordPressPostStatus)} className="h-10 rounded-md border border-outline-variant/35 bg-surface px-3 text-sm text-on-surface outline-none focus:border-secondary">
              {STATUSES.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
          </Label>
          <Label text="Slug">
            <input value={slug} onChange={(e) => setSlug(e.target.value)} className="h-10 rounded-md border border-outline-variant/35 bg-surface px-3 text-xs text-on-surface outline-none focus:border-secondary" />
          </Label>
          {status === "future" ? (
            <Label text="Schedule date">
              <input type="datetime-local" value={date} onChange={(e) => setDate(e.target.value)} className="h-10 rounded-md border border-outline-variant/35 bg-surface px-3 text-xs text-on-surface outline-none focus:border-secondary" />
            </Label>
          ) : null}
          {onDelete ? (
            <button type="button" onClick={() => setConfirmDeleteOpen(true)} disabled={deleting || saving} className="h-9 rounded-lg border border-error/45 px-3 text-sm font-semibold text-error hover:bg-error/10 disabled:opacity-60">
              Move to trash
            </button>
          ) : null}
        </SideBox>
        <SideBox title="Elements">
          <div className="grid grid-cols-2 gap-2">
            <ElementTile icon="title" label="Heading" onClick={() => addPart("heading")} />
            <ElementTile icon="notes" label="Paragraph" onClick={() => addPart("paragraph")} />
            <ElementTile icon="image" label="Image" onClick={() => addPart("image")} />
            <ElementTile icon="video_library" label="Video" onClick={() => addPart("video")} />
          </div>
        </SideBox>
        <SideBox title="Selected component">
          <p className="text-xs text-on-surface-variant">
            {selectedPart ? `${selectedPart.kind.charAt(0).toUpperCase()}${selectedPart.kind.slice(1)} selected` : "Select text, image, or video in the blog."}
          </p>
          <div className="grid grid-cols-3 gap-2">
            <button type="button" onClick={() => setSelectedPartKind("heading")} disabled={!selectedPart || selectedPart.kind === "image" || selectedPart.kind === "video"} className="grid h-9 place-items-center rounded-lg border border-outline-variant/35 text-on-surface-variant hover:border-secondary/50 hover:text-secondary disabled:opacity-40" title="Turn selected into heading">
              <span className="material-symbols-outlined text-[18px]">title</span>
            </button>
            <button type="button" onClick={() => setSelectedPartKind("paragraph")} disabled={!selectedPart || selectedPart.kind === "image" || selectedPart.kind === "video"} className="grid h-9 place-items-center rounded-lg border border-outline-variant/35 text-on-surface-variant hover:border-secondary/50 hover:text-secondary disabled:opacity-40" title="Turn selected into paragraph">
              <span className="material-symbols-outlined text-[18px]">notes</span>
            </button>
            <button type="button" onClick={removeSelectedPart} disabled={!selectedPart} className="grid h-9 place-items-center rounded-lg border border-outline-variant/35 text-on-surface-variant hover:border-error/50 hover:text-error disabled:opacity-40" title="Remove selected component">
              <span className="material-symbols-outlined text-[18px]">delete</span>
            </button>
          </div>
        </SideBox>
        <WordPressResourcePanels
          resources={resources}
          selectedCategories={categories}
          selectedTags={tags}
          onToggleTerm={toggleTerm}
          onPickMedia={pickMedia}
        />
        <SideBox title="Discussion">
          <select value={commentStatus} onChange={(e) => setCommentStatus(e.target.value as "open" | "closed")} className="h-10 rounded-md border border-outline-variant/35 bg-surface px-3 text-sm text-on-surface outline-none focus:border-secondary">
            <option value="open">Allow comments</option>
            <option value="closed">Close comments</option>
          </select>
        </SideBox>
        <SideBox title="Excerpt">
          <textarea value={excerpt} onChange={(e) => setExcerpt(e.target.value)} rows={5} className="min-h-28 w-full resize-y rounded-md border border-outline-variant/35 bg-surface px-3 py-2 text-sm text-on-surface outline-none focus:border-secondary" />
        </SideBox>
      </aside>

      {confirmDeleteOpen && onDelete ? <DeleteModal deleting={deleting} onCancel={() => setConfirmDeleteOpen(false)} onConfirm={onDelete} /> : null}
    </div>
  );
}
