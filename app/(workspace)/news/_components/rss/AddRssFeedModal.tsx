"use client";

import { useEffect, useId, useState, type FormEvent } from "react";
import { createPortal } from "react-dom";

import type { AddRssFeedInput } from "../../_hooks/useRssFeeds";
import { RssKeywordChips } from "./RssKeywordChips";

interface AddRssFeedModalProps {
  open: boolean;
  onClose: () => void;
  onAdd: (input: AddRssFeedInput) => Promise<void>;
  isSubmitting?: boolean;
  error?: string | null;
}

const inputClass =
  "h-11 w-full rounded-xl border border-outline-variant/20 bg-surface-container-low px-3 text-sm text-on-surface outline-none placeholder:text-on-surface-variant/70 focus:border-primary/40 focus:ring-2 focus:ring-primary/20";

export function AddRssFeedModal({
  open,
  onClose,
  onAdd,
  isSubmitting = false,
  error = null,
}: AddRssFeedModalProps): React.ReactElement | null {
  const titleId = useId();
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [includeKeywords, setIncludeKeywords] = useState<string[]>([]);
  const [excludeKeywords, setExcludeKeywords] = useState<string[]>([]);
  const [localError, setLocalError] = useState<string | null>(null);
  const root = typeof document !== "undefined" ? document.body : null;

  useEffect(() => {
    if (!open) return;
    setName("");
    setUrl("");
    setIncludeKeywords([]);
    setExcludeKeywords([]);
    setLocalError(null);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent): void => {
      if (e.key === "Escape" && !isSubmitting) onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener("keydown", onKey);
    };
  }, [open, onClose, isSubmitting]);

  if (!open || !root) return null;

  const canSubmit = name.trim().length > 0 && url.trim().length > 0 && !isSubmitting;
  const displayError = localError ?? error;

  const handleSubmit = async (e: FormEvent): Promise<void> => {
    e.preventDefault();
    if (!canSubmit) return;
    setLocalError(null);
    try {
      await onAdd({
        name: name.trim(),
        url: url.trim(),
        includeKeywords,
        excludeKeywords,
      });
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : "Failed to add feed");
    }
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
      role="presentation"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget && !isSubmitting) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="w-full max-w-lg rounded-2xl border border-outline-variant/15 bg-surface-container-low shadow-2xl"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-outline-variant/10 px-5 py-4">
          <h2 id={titleId} className="text-base font-semibold text-on-surface">
            Add RSS Feed
          </h2>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            aria-label="Close"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-on-surface-variant transition hover:bg-surface-container-high hover:text-on-surface disabled:opacity-40"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <form onSubmit={(e) => void handleSubmit(e)} className="flex flex-col gap-4 px-5 py-5">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Feed Name"
            className={inputClass}
            disabled={isSubmitting}
            autoFocus
          />
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Feed URL"
            className={inputClass}
            disabled={isSubmitting}
          />
          <RssKeywordChips
            label="Include Keywords"
            keywords={includeKeywords}
            onChange={setIncludeKeywords}
          />
          <RssKeywordChips
            label="Exclude Keywords"
            keywords={excludeKeywords}
            onChange={setExcludeKeywords}
          />

          {displayError ? (
            <p className="text-sm text-error" role="alert">
              {displayError}
            </p>
          ) : null}

          <div className="mt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="rounded-xl border border-outline-variant/25 bg-transparent px-4 py-2 text-sm font-medium text-on-surface transition hover:bg-surface-container-high disabled:opacity-40"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!canSubmit}
              className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-on-primary transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {isSubmitting ? "Adding…" : "Add"}
            </button>
          </div>
        </form>
      </div>
    </div>,
    root,
  );
}
