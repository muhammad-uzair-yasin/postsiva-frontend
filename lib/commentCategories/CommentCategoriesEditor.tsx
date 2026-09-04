"use client";

import { useCallback, useEffect, useState, type ReactElement } from "react";

import type {
  CommentCategoriesResponse,
  CommentCategoryItem,
  CommentCategorySaveInput,
} from "./commentCategoriesApi";

interface CommentCategoriesEditorProps {
  readonly title: string;
  readonly intro: string;
  readonly load: () => Promise<CommentCategoriesResponse>;
  readonly save: (input: CommentCategorySaveInput) => Promise<CommentCategoriesResponse>;
  readonly remove?: (categoryKey: string) => Promise<CommentCategoriesResponse>;
  readonly onReclassifyAll?: () => Promise<{ stale_count: number; message?: string }>;
}

const EMPTY: CommentCategoryItem = {
  category_key: "",
  label: "",
  prompt: "",
  enabled: true,
  version: 0,
};

function normalizeDraft(item: CommentCategoryItem): CommentCategoryItem {
  return {
    ...item,
    category_key: item.category_key.trim().toLowerCase().replace(/\s+/g, "_"),
  };
}

export function CommentCategoriesEditor({
  title,
  intro,
  load,
  save,
  remove,
  onReclassifyAll,
}: CommentCategoriesEditorProps): ReactElement {
  const [categories, setCategories] = useState<CommentCategoryItem[]>([]);
  const [draft, setDraft] = useState<CommentCategoryItem>(EMPTY);
  const [loading, setLoading] = useState(true);
  const [savingKey, setSavingKey] = useState<string | null>(null);
  const [removingKey, setRemovingKey] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [confirmReclassify, setConfirmReclassify] = useState(false);
  const [reclassifying, setReclassifying] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await load();
      setCategories(data.categories ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load categories.");
    } finally {
      setLoading(false);
    }
  }, [load]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const saveItem = useCallback(
    async (item: CommentCategoryItem) => {
      const normalized = normalizeDraft(item);
      if (!normalized.category_key || !normalized.label.trim()) {
        setError("Category key and label are required.");
        return;
      }
      setSavingKey(normalized.category_key);
      setError(null);
      setStatus(null);
      try {
        const data = await save({
          categoryKey: normalized.category_key,
          label: normalized.label,
          prompt: normalized.prompt,
          enabled: normalized.enabled,
        });
        setCategories(data.categories ?? []);
        setDraft(EMPTY);
        setStatus("Saved.");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Could not save category.");
      } finally {
        setSavingKey(null);
      }
    },
    [save],
  );

  const removeItem = useCallback(
    async (categoryKey: string) => {
      if (!remove) {
        return;
      }
      setRemovingKey(categoryKey);
      setError(null);
      setStatus(null);
      try {
        const data = await remove(categoryKey);
        setCategories(data.categories ?? []);
        setStatus("Removed.");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Could not remove category.");
      } finally {
        setRemovingKey(null);
      }
    },
    [remove],
  );

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-on-surface">{title}</h1>
        <p className="mt-2 max-w-3xl text-sm text-on-surface-variant">{intro}</p>
      </div>
      {loading ? <p className="text-sm text-on-surface-variant">Loading…</p> : null}
      {error ? <p className="rounded-lg bg-error/10 px-3 py-2 text-sm text-error">{error}</p> : null}
      {status ? <p className="rounded-lg bg-primary/10 px-3 py-2 text-sm text-primary">{status}</p> : null}
      {onReclassifyAll ? (
        <div className="rounded-lg border border-secondary/25 bg-secondary/10 p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-sm font-bold text-on-surface">Re-categorize comments</h2>
              <p className="mt-1 text-xs text-on-surface-variant">
                Re-run AI categorization for saved AI-classified comments. Manual overrides are kept.
              </p>
            </div>
            <button
              type="button"
              className="rounded-lg bg-secondary px-4 py-2 text-sm font-bold text-on-secondary disabled:opacity-50"
              disabled={reclassifying}
              onClick={() => setConfirmReclassify(true)}
            >
              Re-categorize all
            </button>
          </div>
        </div>
      ) : null}
      {confirmReclassify ? (
        <div
          className="fixed inset-0 z-[120] flex items-center justify-center bg-black/60 p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-md rounded-xl border border-outline-variant/20 bg-surface p-5 shadow-2xl">
            <h2 className="text-lg font-bold text-on-surface">Use AI credits?</h2>
            <p className="mt-2 text-sm leading-relaxed text-on-surface-variant">
              Re-categorizing comments will run AI again and can cost credits. Manual category changes will be kept.
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                className="rounded-lg px-4 py-2 text-sm font-bold text-on-surface-variant hover:bg-surface-container"
                disabled={reclassifying}
                onClick={() => setConfirmReclassify(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="rounded-lg bg-secondary px-4 py-2 text-sm font-bold text-on-secondary disabled:opacity-50"
                disabled={reclassifying}
                onClick={async () => {
                  if (!onReclassifyAll) return;
                  setReclassifying(true);
                  setError(null);
                  try {
                    const result = await onReclassifyAll();
                    setStatus(result.message ?? `${result.stale_count} comments marked for recategorization.`);
                    setConfirmReclassify(false);
                  } catch (err) {
                    setError(err instanceof Error ? err.message : "Could not re-categorize comments.");
                  } finally {
                    setReclassifying(false);
                  }
                }}
              >
                {reclassifying ? "Working…" : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
      <div className="space-y-3">
        {categories.map((item, index) => (
          <CategoryRow
            key={`${item.category_key}-${index}`}
            item={item}
            busy={savingKey === item.category_key || removingKey === item.category_key}
            onSave={saveItem}
            onRemove={remove ? removeItem : undefined}
          />
        ))}
      </div>
      <div className="rounded-lg border border-outline-variant/20 bg-surface-container p-4">
        <h2 className="text-sm font-bold text-on-surface">Add category</h2>
        <CategoryFields item={draft} onChange={setDraft} />
        <button
          type="button"
          className="mt-4 rounded-lg bg-primary px-4 py-2 text-sm font-bold text-on-primary disabled:opacity-50"
          disabled={savingKey != null}
          onClick={() => void saveItem(draft)}
        >
          Add category
        </button>
      </div>
    </section>
  );
}

function CategoryRow({
  item,
  busy,
  onSave,
  onRemove,
}: {
  readonly item: CommentCategoryItem;
  readonly busy: boolean;
  readonly onSave: (item: CommentCategoryItem) => Promise<void>;
  readonly onRemove?: (categoryKey: string) => Promise<void>;
}): ReactElement {
  const [draft, setDraft] = useState(item);
  const [confirmRemove, setConfirmRemove] = useState(false);
  useEffect(() => {
    setDraft(item);
  }, [item]);
  return (
    <div className="rounded-lg border border-outline-variant/20 bg-surface-container p-4">
      <CategoryFields item={draft} onChange={setDraft} />
      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          className="rounded-lg bg-primary-container px-4 py-2 text-sm font-bold text-on-primary-container disabled:opacity-50"
          disabled={busy}
          onClick={() => void onSave(draft)}
        >
          {busy ? "Saving…" : "Save"}
        </button>
        {onRemove ? (
          <button
            type="button"
            className="rounded-lg bg-error px-4 py-2 text-sm font-bold text-on-error disabled:opacity-50"
            disabled={busy}
            onClick={() => setConfirmRemove(true)}
          >
            Remove
          </button>
        ) : null}
      </div>
      {confirmRemove ? (
        <div
          className="fixed inset-0 z-[120] flex items-center justify-center bg-black/60 p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-sm rounded-xl border border-outline-variant/20 bg-surface p-5 shadow-2xl">
            <h2 className="text-lg font-bold text-on-surface">Remove category?</h2>
            <p className="mt-2 text-sm leading-relaxed text-on-surface-variant">
              This removes the category from this workspace&apos;s category settings.
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                className="rounded-lg px-4 py-2 text-sm font-bold text-on-surface-variant hover:bg-surface-container"
                disabled={busy}
                onClick={() => setConfirmRemove(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="rounded-lg bg-error px-4 py-2 text-sm font-bold text-on-error disabled:opacity-50"
                disabled={busy}
                onClick={() => {
                  setConfirmRemove(false);
                  void onRemove?.(item.category_key);
                }}
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function CategoryFields({
  item,
  onChange,
}: {
  readonly item: CommentCategoryItem;
  readonly onChange: (item: CommentCategoryItem) => void;
}): ReactElement {
  return (
    <div className="mt-3 grid gap-3 md:grid-cols-[180px_220px_1fr_auto] md:items-start">
      <input
        className="rounded-lg border border-outline-variant/20 bg-surface px-3 py-2 text-sm"
        placeholder="key"
        value={item.category_key}
        onChange={(e) => onChange({ ...item, category_key: e.target.value })}
      />
      <input
        className="rounded-lg border border-outline-variant/20 bg-surface px-3 py-2 text-sm"
        placeholder="Label"
        value={item.label}
        onChange={(e) => onChange({ ...item, label: e.target.value })}
      />
      <textarea
        className="min-h-20 rounded-lg border border-outline-variant/20 bg-surface px-3 py-2 text-sm"
        placeholder="AI prompt description for this category"
        value={item.prompt}
        onChange={(e) => onChange({ ...item, prompt: e.target.value })}
      />
      <label className="inline-flex items-center gap-2 text-sm font-bold text-on-surface-variant">
        <input
          type="checkbox"
          className="h-4 w-4 accent-primary"
          checked={item.enabled}
          onChange={(e) => onChange({ ...item, enabled: e.target.checked })}
        />
        Enabled
      </label>
    </div>
  );
}
