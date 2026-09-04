"use client";

import { useMemo, type ReactElement } from "react";

import { useTranslations } from "@/lib/i18n/WorkspaceLocaleProvider";

import {
  htmlFromParts,
  insertImageAt,
  partsFromHtml,
  removePartAt,
  type ArticlePart,
} from "../../wordpress/blogs/_components/wordpressArticleParts";

import { PostSchedulerComposerDashedUploadTrigger } from "./PostSchedulerComposerDashedUploadTrigger";

function renderTextPart(part: ArticlePart, index: number, editorial: boolean): ReactElement {
  if (part.kind === "heading") {
    return (
      <h2
        key={`${index}-${part.value}`}
        className={
          editorial
            ? "pt-4 text-2xl font-bold leading-tight text-[#1a1a1a]"
            : "pt-3 text-xl font-bold leading-tight text-on-surface"
        }
      >
        {part.value}
      </h2>
    );
  }
  if (part.kind === "subheading") {
    return (
      <h3
        key={`${index}-${part.value}`}
        className={
          editorial
            ? "pt-3 text-xl font-bold leading-tight text-[#1a1a1a]"
            : "pt-2 text-lg font-bold leading-tight text-on-surface"
        }
      >
        {part.value}
      </h3>
    );
  }
  return (
    <p
      key={`${index}-${part.value}`}
      className={
        editorial
          ? "text-[17px] leading-8 text-[#3d3a34]"
          : "text-[15px] leading-7 text-on-surface-variant"
      }
    >
      {part.value}
    </p>
  );
}

function AddImageSlot({
  onAdd,
}: {
  readonly onAdd: () => void;
}): ReactElement {
  const { t } = useTranslations();
  return (
    <div className="py-2">
      <PostSchedulerComposerDashedUploadTrigger
        onClick={onAdd}
        emptyHint={t("postScheduler.composer.blogInlineImageHint")}
        heightClass="h-20"
      />
    </div>
  );
}

export function PostSchedulerWordPressPreviewBody({
  content,
  loading = false,
  imageSaving = false,
  onContentChange,
  onRequestAddImage,
  editorial = false,
}: {
  readonly content: string;
  readonly loading?: boolean;
  readonly imageSaving?: boolean;
  readonly editorial?: boolean;
  readonly onContentChange: (html: string) => void;
  readonly onRequestAddImage: (insertAt: number) => void;
}): ReactElement {
  const parts = useMemo(() => partsFromHtml(content), [content]);

  const updateParts = (next: ArticlePart[]): void => {
    onContentChange(htmlFromParts(next));
  };

  if (loading) {
    return (
      <div className="mt-6 grid gap-3">
        <div className="h-4 w-full animate-pulse rounded bg-surface-container-highest" />
        <div className="h-4 w-11/12 animate-pulse rounded bg-surface-container-highest" />
        <div className="h-4 w-5/6 animate-pulse rounded bg-surface-container-highest" />
      </div>
    );
  }

  if (parts.length === 0) {
    return (
      <div className="space-y-2">
        <p className="text-sm text-on-surface-variant">
          Write something or use shortcodes, spintax ...
        </p>
        <AddImageSlot onAdd={() => onRequestAddImage(0)} />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {parts.map((part, index) => (
        <div key={`${index}-${part.kind}-${part.value.slice(0, 24)}`} className="group/block space-y-2">
          {part.kind === "image" || part.kind === "video" ? (
            <div className="relative overflow-hidden rounded-lg ring-1 ring-outline-variant/15">
              {imageSaving ? (
                <div className="grid aspect-video w-full place-items-center bg-surface-container-high">
                  <span className="material-symbols-outlined animate-pulse text-[32px] text-on-surface-variant">
                    image
                  </span>
                </div>
              ) : part.kind === "video" ? (
                <video controls src={part.value} className="aspect-video w-full object-cover" />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element -- inline preview URL
                <img src={part.value} alt="" className="aspect-video w-full object-cover" />
              )}
              <button
                type="button"
                title="Remove image"
                aria-label="Remove image"
                onClick={() => updateParts(removePartAt(parts, index))}
                className="absolute right-2 top-2 grid h-8 w-8 place-items-center rounded-full border border-error/35 bg-surface-container-lowest/95 text-error shadow-md opacity-0 transition hover:bg-error hover:text-white group-hover/block:opacity-100 focus-visible:opacity-100"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>
          ) : (
            renderTextPart(part, index, editorial)
          )}
          {(part.kind === "heading" ||
            part.kind === "subheading" ||
            part.kind === "paragraph") &&
          index < parts.length - 1 ? (
            <AddImageSlot onAdd={() => onRequestAddImage(index + 1)} />
          ) : null}
        </div>
      ))}
      <AddImageSlot onAdd={() => onRequestAddImage(parts.length)} />
    </div>
  );
}

export function insertImageIntoWordPressContent(content: string, insertAt: number, url: string): string {
  return htmlFromParts(insertImageAt(partsFromHtml(content), insertAt, url));
}
