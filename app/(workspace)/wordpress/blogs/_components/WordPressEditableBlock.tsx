"use client";

import type { ReactElement } from "react";

import type { ArticlePart } from "./wordpressArticleParts";

export function WordPressEditableBlock(props: {
  part: ArticlePart;
  index: number;
  total: number;
  selected: boolean;
  onSelect: () => void;
  onUpdate: (value: string) => void;
  onMove: (direction: -1 | 1) => void;
  onDelete: () => void;
  onDropPart: (draggedId: string) => void;
}): ReactElement {
  const { part } = props;
  return (
    <section
      draggable
      onDragStart={(event) => {
        event.dataTransfer.setData("text/plain", part.id);
        props.onSelect();
      }}
      onDragOver={(event) => event.preventDefault()}
      onDrop={(event) => {
        event.preventDefault();
        const draggedId = event.dataTransfer.getData("text/plain");
        if (draggedId && draggedId !== part.id) props.onDropPart(draggedId);
      }}
      className={`group relative rounded-lg border px-1 py-1 transition ${
        props.selected ? "border-secondary/35 bg-surface/20" : "border-transparent"
      }`}
    >
      <button
        type="button"
        onClick={props.onDelete}
        className={`absolute -right-3 -top-3 z-10 grid h-7 w-7 place-items-center rounded-full border border-error/45 bg-surface text-error shadow-lg transition hover:bg-error hover:text-on-error ${
          props.selected ? "opacity-100" : "opacity-0 group-hover:opacity-100 group-focus-within:opacity-100"
        }`}
        title="Delete component"
      >
        <span className="material-symbols-outlined text-[16px]">delete</span>
      </button>
      <div className={`absolute -right-11 top-1 grid-cols-1 gap-1 ${props.selected ? "grid" : "hidden group-hover:grid group-focus-within:grid"}`}>
        <button
          type="button"
          onClick={() => props.onMove(-1)}
          disabled={props.index === 0}
          className="grid h-7 w-7 place-items-center rounded-md border border-outline-variant/35 bg-surface text-on-surface-variant disabled:opacity-30"
          title="Move up"
        >
          <span className="material-symbols-outlined text-[16px]">keyboard_arrow_up</span>
        </button>
        <button
          type="button"
          onClick={() => props.onMove(1)}
          disabled={props.index === props.total - 1}
          className="grid h-7 w-7 place-items-center rounded-md border border-outline-variant/35 bg-surface text-on-surface-variant disabled:opacity-30"
          title="Move down"
        >
          <span className="material-symbols-outlined text-[16px]">keyboard_arrow_down</span>
        </button>
      </div>
      {part.kind === "heading" ? (
        <h2
          contentEditable
          suppressContentEditableWarning
          onFocus={props.onSelect}
          onInput={(event) => props.onUpdate(event.currentTarget.textContent ?? "")}
          className="rounded-md border border-transparent px-1 text-2xl font-bold leading-tight text-on-surface outline-none transition focus:border-secondary/35 focus:bg-surface/30"
        >
          {part.value}
        </h2>
      ) : part.kind === "subheading" ? (
        <h3
          contentEditable
          suppressContentEditableWarning
          onFocus={props.onSelect}
          onInput={(event) => props.onUpdate(event.currentTarget.textContent ?? "")}
          className="rounded-md border border-transparent px-1 text-xl font-semibold leading-snug text-on-surface outline-none transition focus:border-secondary/35 focus:bg-surface/30"
        >
          {part.value}
        </h3>
      ) : part.kind === "paragraph" ? (
        <p
          contentEditable
          suppressContentEditableWarning
          onFocus={props.onSelect}
          onInput={(event) => props.onUpdate(event.currentTarget.textContent ?? "")}
          className="rounded-md border border-transparent px-1 text-base leading-8 text-on-surface outline-none transition focus:border-secondary/35 focus:bg-surface/30"
        >
          {part.value}
        </p>
      ) : part.kind === "video" ? (
        <button type="button" onClick={props.onSelect} className="block w-full rounded-lg text-left">
          <video src={part.value} controls className="aspect-video w-full rounded-lg bg-black" />
        </button>
      ) : (
        <button type="button" onClick={props.onSelect} className="relative block w-full rounded-lg">
          {part.value ? (
            // eslint-disable-next-line @next/next/no-img-element -- WordPress media URLs are already remote user content previews.
            <img src={part.value} alt="" className="aspect-[16/6.5] w-full rounded-lg object-cover shadow-sm ring-1 ring-outline-variant/20" />
          ) : (
            <span className="flex aspect-[16/6.5] w-full items-center justify-center rounded-lg border border-dashed border-secondary/45 text-sm font-semibold text-secondary">
              Add image
            </span>
          )}
          <span className="absolute right-3 top-3 inline-flex h-10 w-10 items-center justify-center rounded-full bg-surface/90 text-secondary shadow-lg ring-1 ring-outline-variant/25">
            <span className="material-symbols-outlined text-[20px]">add_photo_alternate</span>
          </span>
        </button>
      )}
    </section>
  );
}
