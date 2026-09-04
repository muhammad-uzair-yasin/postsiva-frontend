"use client";

import { useEffect, useId, useMemo, useRef, useState, type ReactElement } from "react";

interface WordPressTerm {
  readonly id: number;
  readonly name: string;
  readonly count: number;
}

interface PostSchedulerWordPressTermDropdownProps {
  readonly label: string;
  readonly placeholder: string;
  readonly loadingLabel: string;
  readonly terms: WordPressTerm[];
  readonly selected: number[];
  readonly loading: boolean;
  readonly refreshTitle: string;
  readonly addTitle: string;
  readonly onRefresh: () => void;
  readonly onAdd: () => void;
  readonly onToggle: (id: number, selected: boolean) => void;
}

export function PostSchedulerWordPressTermDropdown({
  label,
  placeholder,
  loadingLabel,
  terms,
  selected,
  loading,
  refreshTitle,
  addTitle,
  onRefresh,
  onAdd,
  onToggle,
}: PostSchedulerWordPressTermDropdownProps): ReactElement {
  const labelId = useId();
  const buttonId = useId();
  const rootRef = useRef<HTMLDivElement | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) {
      return;
    }
    const closeOnOutsideClick = (event: MouseEvent): void => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    const closeOnEscape = (event: KeyboardEvent): void => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("mousedown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [open]);

  const selectedLabel = useMemo(() => {
    const names = terms
      .filter((term) => selected.includes(term.id))
      .map((term) => term.name);
    if (names.length === 0) {
      return placeholder;
    }
    if (names.length <= 2) {
      return names.join(", ");
    }
    return `${names.slice(0, 2).join(", ")} +${names.length - 2}`;
  }, [placeholder, selected, terms]);

  return (
    <div ref={rootRef} className="relative">
      <div className="mb-2 flex items-center justify-between gap-2">
        <p id={labelId} className="text-xs font-bold text-on-surface">
          {label}
        </p>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={onRefresh}
            className="grid h-7 w-7 place-items-center rounded-md text-on-surface-variant hover:bg-surface-container-high hover:text-secondary"
            title={refreshTitle}
          >
            <span className="material-symbols-outlined text-[16px]">refresh</span>
          </button>
          <button
            type="button"
            onClick={onAdd}
            className="grid h-7 w-7 place-items-center rounded-md border border-secondary/35 text-secondary hover:bg-secondary/10"
            title={addTitle}
          >
            <span className="material-symbols-outlined text-[16px]">add</span>
          </button>
        </div>
      </div>

      <button
        id={buttonId}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-labelledby={`${labelId} ${buttonId}`}
        onClick={() => setOpen((value) => !value)}
        className="flex h-10 w-full items-center justify-between gap-2 rounded-lg border border-outline-variant/25 bg-surface-container-lowest px-3 text-left text-sm text-on-surface transition hover:border-secondary/45 focus:outline-none focus:ring-2 focus:ring-secondary/25"
      >
        <span
          className={`min-w-0 flex-1 truncate ${
            selected.length > 0 ? "text-on-surface" : "text-on-surface-variant"
          }`}
        >
          {loading ? loadingLabel : selectedLabel}
        </span>
        <span className="material-symbols-outlined text-[18px] text-on-surface-variant">
          {open ? "expand_less" : "expand_more"}
        </span>
      </button>

      {open ? (
        <div
          role="listbox"
          aria-multiselectable="true"
          aria-labelledby={labelId}
          className="absolute left-0 right-0 z-30 mt-2 max-h-56 overflow-y-auto rounded-lg border border-outline-variant/30 bg-surface-container-lowest p-2 shadow-2xl"
        >
          {loading ? (
            <p className="px-2 py-2 text-xs text-on-surface-variant">{loadingLabel}</p>
          ) : terms.length === 0 ? (
            <p className="px-2 py-2 text-xs text-on-surface-variant">No items found.</p>
          ) : (
            terms.map((term) => {
              const checked = selected.includes(term.id);
              return (
                <label
                  key={term.id}
                  role="option"
                  aria-selected={checked}
                  className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-2 text-sm text-on-surface-variant hover:bg-surface-container"
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={(event) => onToggle(term.id, event.target.checked)}
                    className="h-4 w-4 accent-secondary"
                  />
                  <span className="min-w-0 flex-1 truncate">{term.name}</span>
                  <span className="text-xs text-on-surface-variant/70">{term.count}</span>
                </label>
              );
            })
          )}
        </div>
      ) : null}
    </div>
  );
}
