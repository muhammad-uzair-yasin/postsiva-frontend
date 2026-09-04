"use client";
import { useEffect, useMemo, useRef, useState, type ReactElement } from "react";
import { getStoredAccessToken, getStoredActiveWorkspaceId } from "@/lib/auth/session";
import {
  createWordPressPost,
  fetchWordPressPosts,
  type WordPressPostStatus,
} from "@/lib/social/wordpressPostsApi";
import type { WordPressMediaItem } from "@/lib/social/wordpressMediaApi";
import { featuredMediaUrlsForPosts, normalizeWordPressMediaUrl } from "@/lib/social/wordpressBlogMedia";
import { TermPicker } from "../../wordpress/blogs/_components/WordPressEditorParts";
import { TermManageModal } from "../../wordpress/blogs/_components/WordPressResourcePanels";
import { WordPressEditableBlock } from "../../wordpress/blogs/_components/WordPressEditableBlock";
import {
  htmlFromParts,
  readMinutes,
  type ArticlePart,
  type ArticlePartKind,
} from "../../wordpress/blogs/_components/wordpressArticleParts";
import { useWordPressEditorResources } from "../../wordpress/blogs/_hooks/useWordPressEditorResources";
import { useWorkspaceLayout } from "../../_context/WorkspaceLayoutContext";
import { PostSchedulerMediaLibraryModal } from "./PostSchedulerMediaLibraryModal";
import { PostSchedulerMediaSourcePickerModal } from "./PostSchedulerMediaSourcePickerModal";
import { PostSchedulerWordPressMediaPickerModal } from "./PostSchedulerWordPressMediaPickerModal";
const STATUSES: WordPressPostStatus[] = ["draft", "publish", "future", "pending", "private"];
const DEFAULT_TITLE = "The Future of Brand Storytelling";
const DEFAULT_PARTS: ArticlePart[] = [
  {
    id: "intro",
    kind: "paragraph",
    value:
      "Brand storytelling helps customers understand what makes a company memorable. A clear story gives your audience a reason to trust the brand, remember the offer, and take action.",
  },
  {
    id: "heading-1",
    kind: "heading",
    value: "Why Stories Beat Slogans",
  },
  {
    id: "paragraph-1",
    kind: "paragraph",
    value:
      "Customers remember narratives longer than feature lists. A story connects emotion to outcome, which makes your message stick when competitors sound interchangeable.",
  },
  {
    id: "heading-2",
    kind: "heading",
    value: "Three Pillars of Strong Brand Narrative",
  },
  {
    id: "subheading-1",
    kind: "subheading",
    value: "Know your audience",
  },
  {
    id: "paragraph-2",
    kind: "paragraph",
    value:
      "Start with the problem your customer cares about. Use their language, not internal jargon, so the opening line feels written for one real person.",
  },
  {
    id: "subheading-2",
    kind: "subheading",
    value: "Show the transformation",
  },
  {
    id: "paragraph-3",
    kind: "paragraph",
    value:
      "Then show how your product, service, or team creates a better outcome. Keep the language direct, useful, and specific.",
  },
  {
    id: "subheading-3",
    kind: "subheading",
    value: "End with one clear action",
  },
  {
    id: "paragraph-4",
    kind: "paragraph",
    value:
      "Strong blog posts combine a focused headline, a clear opening, helpful examples, and one simple next step for the reader.",
  },
  {
    id: "heading-3",
    kind: "heading",
    value: "Put It Into Practice",
  },
  {
    id: "paragraph-5",
    kind: "paragraph",
    value:
      "Draft your next post around one customer problem, one proof point, and one call to action. Publish, measure engagement, and refine the story in your next article.",
  },
];

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function heroMediaHtml(mediaUrl: string, mediaKind: "image" | "video"): string {
  if (!mediaUrl.trim()) return "";
  return mediaKind === "video"
    ? `<figure><video controls src="${escapeHtml(mediaUrl.trim())}"></video></figure>`
    : `<figure><img src="${escapeHtml(mediaUrl.trim())}" alt="" /></figure>`;
}
function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}): ReactElement {
  return (
    <label className="grid gap-2 text-xs font-semibold text-on-surface-variant">
      {label}
      {children}
    </label>
  );
}

export function PostSchedulerWordPressBlogComposer({
  connectionId,
  onClose,
}: {
  connectionId: string;
  onClose: () => void;
}): ReactElement {
  const fileRef = useRef<HTMLInputElement>(null);
  const [title, setTitle] = useState(DEFAULT_TITLE);
  const [slug, setSlug] = useState("");
  const [mediaUrl, setMediaUrl] = useState("");
  const [mediaKind, setMediaKind] = useState<"image" | "video">("image");
  const [parts, setParts] = useState<ArticlePart[]>(() =>
    DEFAULT_PARTS.map((part) => ({ ...part, id: crypto.randomUUID() })),
  );
  const [selectedPartId, setSelectedPartId] = useState<string | null>(null);
  const [status, setStatus] = useState<WordPressPostStatus>("draft");
  const [date, setDate] = useState("");
  const [categories, setCategories] = useState<number[]>([]);
  const [tags, setTags] = useState<number[]>([]);
  const [termModal, setTermModal] = useState<"categories" | "tags" | null>(null);
  const [sourcePickerOpen, setSourcePickerOpen] = useState(false);
  const [libraryOpen, setLibraryOpen] = useState(false);
  const [postsivaLibraryOpen, setPostsivaLibraryOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [mediaBusy, setMediaBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const dummyMediaSeededRef = useRef(false);
  const { layoutMode, sidebarExpanded } = useWorkspaceLayout();
  const resources = useWordPressEditorResources(connectionId);
  const modalOffsetClass =
    layoutMode === "sidebar"
      ? sidebarExpanded
        ? "lg:left-64"
        : "lg:left-20"
      : "";

  const minutes = useMemo(() => readMinutes(parts), [parts]);

  useEffect(() => {
    if (dummyMediaSeededRef.current || resources.loading || resources.media.length === 0) return;

    const accessToken = getStoredAccessToken()?.trim();
    const workspaceId = getStoredActiveWorkspaceId()?.trim();
    if (!accessToken || !workspaceId) return;

    let active = true;
    void fetchWordPressPosts({ accessToken, workspaceId, limit: 10 })
      .then((response) => {
        if (!active || dummyMediaSeededRef.current) return;

        const urls = featuredMediaUrlsForPosts(response.posts, resources.media, connectionId);
        if (urls.length === 0) return;

        dummyMediaSeededRef.current = true;
        setMediaUrl((current) => current || urls[0]);
        setMediaKind("image");

        if (urls.length > 1) {
          setParts((current) => {
            if (current.some((part) => part.kind === "image" || part.kind === "video")) return current;
            const insertAt = current.findIndex((part) => part.id === "paragraph-1");
            const imagePart: ArticlePart = {
              id: crypto.randomUUID(),
              kind: "image",
              value: urls[1],
            };
            if (insertAt < 0) return [...current, imagePart];
            return [...current.slice(0, insertAt + 1), imagePart, ...current.slice(insertAt + 1)];
          });
        }
      })
      .catch(() => {
        // Keep the empty hero placeholder if saved blog media cannot be resolved.
      });

    return () => {
      active = false;
    };
  }, [connectionId, resources.loading, resources.media]);

  const updatePart = (id: string, value: string): void => {
    setParts((current) => current.map((part) => (part.id === id ? { ...part, value } : part)));
  };

  const removePart = (id: string): void => {
    setParts((current) => current.filter((part) => part.id !== id));
    if (selectedPartId === id) setSelectedPartId(null);
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

  const addPart = (kind: ArticlePartKind): void => {
    const id = crypto.randomUUID();
    const value =
      kind === "heading"
        ? "New heading"
        : kind === "subheading"
          ? "New subheading"
          : kind === "paragraph"
            ? "New paragraph"
            : "";
    setParts((current) => [...current, { id, kind, value }]);
    setSelectedPartId(id);
  };

  const pickMedia = (item: WordPressMediaItem): void => {
    const url = normalizeWordPressMediaUrl(item.source_url);
    if (!url) return;
    setMediaUrl(url);
    setMediaKind(item.mime_type?.startsWith("video/") ? "video" : "image");
  };

  const uploadMedia = async (file: File | undefined): Promise<void> => {
    if (!file) return;
    setMediaBusy(true);
    setMessage(null);
    try {
      const item = await resources.uploadMedia(file);
      pickMedia(item);
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Could not upload WordPress media.");
    } finally {
      setMediaBusy(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const save = async (nextStatus = status): Promise<void> => {
    const accessToken = getStoredAccessToken()?.trim();
    const workspaceId = getStoredActiveWorkspaceId()?.trim();
    if (!accessToken || !workspaceId) {
      setMessage("Missing workspace session.");
      return;
    }
    setSaving(true);
    setMessage(null);
    try {
      const created = await createWordPressPost({
        accessToken,
        workspaceId,
        connectionId,
        payload: {
          title: title.trim() || "Untitled blog post",
          slug: slug.trim() || undefined,
          content: `${heroMediaHtml(mediaUrl, mediaKind)}${htmlFromParts(parts)}`,
          status: nextStatus,
          date: nextStatus === "future" && date ? new Date(date).toISOString() : undefined,
          categories,
          tags,
        },
      });
      setMessage(`Saved to WordPress as ${created.status}.`);
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Could not save WordPress blog post.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={`fixed bottom-0 left-0 right-0 top-0 z-[1200] bg-surface/95 shadow-2xl backdrop-blur-xl ${modalOffsetClass}`}>
      <div className="flex h-full min-h-0 flex-col">
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-outline-variant/15 bg-surface-container-low px-5">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center gap-2 text-sm font-bold text-secondary transition hover:text-secondary-container"
          >
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            Back to post composer
          </button>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={saving}
              onClick={() => void save("draft")}
              className="h-10 rounded-lg border border-outline-variant/35 px-4 text-sm font-bold text-on-surface-variant transition hover:border-secondary/50 hover:text-secondary disabled:opacity-60"
            >
              Save draft
            </button>
            <button
              type="button"
              disabled={saving}
              onClick={() => void save(status)}
              className="h-10 rounded-lg bg-primary px-5 text-sm font-bold text-on-primary transition hover:brightness-110 disabled:opacity-60"
            >
              {saving ? "Saving" : status === "publish" ? "Publish" : status === "future" ? "Schedule" : "Save to WordPress"}
            </button>
          </div>
        </header>

        <div className="grid min-h-0 flex-1 grid-cols-1 overflow-hidden lg:grid-cols-[minmax(0,1fr)_360px]">
          <main className="min-h-0 overflow-y-auto bg-surface-container px-5 py-8">
            <article className="mx-auto w-full max-w-3xl">
              <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Blog title" className="mx-auto block w-full rounded-lg border border-transparent bg-transparent px-4 py-2 text-center text-4xl font-bold leading-tight text-on-surface outline-none placeholder:text-on-surface-variant/60 focus:border-secondary/40 focus:bg-surface/40" />
              {mediaUrl.trim() ? (
                <div className="group relative mt-8">
                  {mediaKind === "video" ? (
                    <video controls src={mediaUrl.trim()} className="aspect-video w-full rounded-lg object-cover ring-1 ring-outline-variant/20" />
                  ) : (
                    // eslint-disable-next-line @next/next/no-img-element -- selected media URL
                    <img src={mediaUrl.trim()} alt="" className="aspect-[16/7] w-full rounded-lg object-cover ring-1 ring-outline-variant/20" />
                  )}
                  <button type="button" onClick={() => setSourcePickerOpen(true)} className="absolute right-3 top-3 inline-flex h-9 items-center gap-1 rounded-lg border border-secondary/45 bg-surface/90 px-3 text-xs font-bold text-secondary shadow-md opacity-0 transition group-hover:opacity-100">
                    <span className="material-symbols-outlined text-[17px]">add_photo_alternate</span>
                    Change
                  </button>
                </div>
              ) : (
                <button type="button" onClick={() => setSourcePickerOpen(true)} className="mt-8 grid aspect-[16/7] w-full place-items-center rounded-lg border border-dashed border-secondary/45 text-sm font-semibold text-secondary hover:bg-secondary/10">
                  {mediaBusy ? "Uploading..." : "Add image or video"}
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

          <aside className="min-h-0 overflow-y-auto border-l border-outline-variant/15 bg-surface-container-low p-5">
            <div className="grid gap-4">
              {message ? (
                <p className="rounded-lg border border-outline-variant/25 bg-surface px-3 py-2 text-sm text-on-surface-variant">
                  {message}
                </p>
              ) : null}
              <section className="rounded-xl border border-outline-variant/15 bg-surface p-4">
                <p className="mb-1 text-sm font-bold text-on-surface">Post settings</p>
                <p className="mb-4 text-xs text-on-surface-variant">{minutes} min read</p>
                <div className="grid gap-4">
                  <Field label="Status">
                    <select value={status} onChange={(e) => setStatus(e.target.value as WordPressPostStatus)} className="h-10 rounded-lg border border-outline-variant/30 bg-surface-container-low px-3 text-sm text-on-surface outline-none focus:border-secondary">
                      {STATUSES.map((item) => <option key={item} value={item}>{item}</option>)}
                    </select>
                  </Field>
                  {status === "future" ? (
                    <Field label="Schedule date">
                      <input type="datetime-local" value={date} onChange={(e) => setDate(e.target.value)} className="h-10 rounded-lg border border-outline-variant/30 bg-surface-container-low px-3 text-sm text-on-surface outline-none focus:border-secondary" />
                    </Field>
                  ) : null}
                  <Field label="Slug">
                    <input value={slug} onChange={(e) => setSlug(e.target.value)} className="h-10 rounded-lg border border-outline-variant/30 bg-surface-container-low px-3 text-sm text-on-surface outline-none focus:border-secondary" placeholder="url-slug" />
                  </Field>
                </div>
              </section>
              <input ref={fileRef} type="file" accept="image/*,video/*" className="hidden" onChange={(event) => void uploadMedia(event.target.files?.[0])} />
              <section className="rounded-xl border border-outline-variant/15 bg-surface p-4">
                <div className="mb-4 flex items-center justify-between gap-2">
                  <p className="text-sm font-bold text-on-surface">Categories</p>
                  <button type="button" onClick={() => setTermModal("categories")} className="grid h-7 w-7 place-items-center rounded-md border border-secondary/35 text-secondary hover:bg-secondary/10" title="Manage categories">
                    <span className="material-symbols-outlined text-[17px]">add</span>
                  </button>
                </div>
                {resources.loading ? (
                  <p className="text-xs text-on-surface-variant">Loading categories...</p>
                ) : (
                  <TermPicker
                    terms={resources.categories}
                    selected={categories}
                    onToggle={(id, selected) => {
                      setCategories((current) =>
                        selected
                          ? Array.from(new Set([...current, id]))
                          : current.filter((item) => item !== id),
                      );
                    }}
                  />
                )}
              </section>
              <section className="rounded-xl border border-outline-variant/15 bg-surface p-4">
                <div className="mb-4 flex items-center justify-between gap-2">
                  <p className="text-sm font-bold text-on-surface">Tags</p>
                  <button type="button" onClick={() => setTermModal("tags")} className="grid h-7 w-7 place-items-center rounded-md border border-secondary/35 text-secondary hover:bg-secondary/10" title="Manage tags">
                    <span className="material-symbols-outlined text-[17px]">add</span>
                  </button>
                </div>
                {resources.loading ? (
                  <p className="text-xs text-on-surface-variant">Loading tags...</p>
                ) : (
                  <TermPicker
                    terms={resources.tags}
                    selected={tags}
                    onToggle={(id, selected) => {
                      setTags((current) =>
                        selected
                          ? Array.from(new Set([...current, id]))
                          : current.filter((item) => item !== id),
                      );
                    }}
                  />
                )}
              </section>
              {resources.error ? (
                <p className="rounded-lg border border-error/25 bg-error/10 px-3 py-2 text-xs text-error">
                  {resources.error}
                </p>
              ) : null}
              <section className="rounded-xl border border-outline-variant/15 bg-surface p-4">
                <p className="mb-4 text-sm font-bold text-on-surface">Elements</p>
                <div className="grid grid-cols-2 gap-2">
                  <button type="button" onClick={() => addPart("heading")} className="h-12 rounded-lg border border-secondary/30 text-xs font-bold text-secondary hover:bg-secondary/10">Heading</button>
                  <button type="button" onClick={() => addPart("subheading")} className="h-12 rounded-lg border border-secondary/30 text-xs font-bold text-secondary hover:bg-secondary/10">Subheading</button>
                  <button type="button" onClick={() => addPart("paragraph")} className="h-12 rounded-lg border border-secondary/30 text-xs font-bold text-secondary hover:bg-secondary/10">Paragraph</button>
                  <button type="button" onClick={() => setSourcePickerOpen(true)} className="h-12 rounded-lg border border-secondary/30 text-xs font-bold text-secondary hover:bg-secondary/10">Image</button>
                  <button type="button" onClick={() => setSourcePickerOpen(true)} className="h-12 rounded-lg border border-secondary/30 text-xs font-bold text-secondary hover:bg-secondary/10">Video</button>
                </div>
              </section>
              {termModal ? (
                <TermManageModal
                  kind={termModal}
                  title={termModal === "categories" ? "Categories" : "Tags"}
                  terms={termModal === "categories" ? resources.categories : resources.tags}
                  resources={resources}
                  onClose={() => setTermModal(null)}
                  onDeleted={(id) => {
                    if (termModal === "categories") {
                      setCategories((current) => current.filter((item) => item !== id));
                    } else {
                      setTags((current) => current.filter((item) => item !== id));
                    }
                  }}
                />
              ) : null}
              <PostSchedulerMediaSourcePickerModal
                visible={sourcePickerOpen}
                onClose={() => setSourcePickerOpen(false)}
                onPickDevice={() => {
                  setSourcePickerOpen(false);
                  fileRef.current?.click();
                }}
                onPickLibrary={() => {
                  setSourcePickerOpen(false);
                  setPostsivaLibraryOpen(true);
                }}
                onPickWordPress={() => {
                  setSourcePickerOpen(false);
                  setLibraryOpen(true);
                }}
              />
              <PostSchedulerMediaLibraryModal
                visible={postsivaLibraryOpen}
                onBack={() => {
                  setPostsivaLibraryOpen(false);
                  setSourcePickerOpen(true);
                }}
                onClose={() => setPostsivaLibraryOpen(false)}
                overlayClassName="z-[1300]"
                onPickMedia={(media) => {
                  setMediaUrl(media.publicUrl);
                  setMediaKind(media.mediaType === "video" ? "video" : "image");
                }}
              />
              <PostSchedulerWordPressMediaPickerModal
                visible={libraryOpen}
                loading={resources.loading}
                items={resources.media}
                onBack={() => {
                  setLibraryOpen(false);
                  setSourcePickerOpen(true);
                }}
                onClose={() => setLibraryOpen(false)}
                onPick={pickMedia}
              />
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
