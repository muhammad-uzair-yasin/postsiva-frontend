"use client";

import { useTranslations } from "@/lib/i18n/WorkspaceLocaleProvider";

interface EditWorkspaceImageUrlControlsProps {
  urlDraft: string;
  onUrlDraftChange: (value: string) => void;
  busy: boolean;
  hasImage: boolean;
  onApplyUrl: () => void;
  onRemoveImage: () => void;
}

export function EditWorkspaceImageUrlControls({
  urlDraft,
  onUrlDraftChange,
  busy,
  hasImage,
  onApplyUrl,
  onRemoveImage,
}: EditWorkspaceImageUrlControlsProps): React.ReactElement {
  const { t } = useTranslations();

  return (
    <div className="space-y-2">
      <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant/70">
        {t("workspaces.editImageUrlLabel")}
      </label>
      <div className="flex flex-wrap gap-2">
        <input
          className="min-w-[200px] flex-1 rounded-lg border-none bg-surface-container-lowest px-4 py-2.5 text-sm text-on-surface placeholder:text-on-surface-variant/40 focus:ring-2 focus:ring-secondary/50"
          value={urlDraft}
          onChange={(e) => {
            onUrlDraftChange(e.target.value);
          }}
          placeholder={t("workspaces.editImageUrlPlaceholder")}
          type="url"
          name="workspaceImageUrl"
        />
        <button
          type="button"
          disabled={busy}
          onClick={onApplyUrl}
          className="rounded-lg bg-secondary-container px-4 py-2.5 text-sm font-bold text-on-secondary-container disabled:opacity-50"
        >
          {t("workspaces.editImageUrlApply")}
        </button>
        {hasImage ? (
          <button
            type="button"
            disabled={busy}
            onClick={onRemoveImage}
            className="rounded-lg border border-outline-variant/30 px-4 py-2.5 text-sm font-bold text-on-surface-variant hover:bg-surface-container-high disabled:opacity-50"
          >
            {t("workspaces.editImageUrlRemove")}
          </button>
        ) : null}
      </div>
      <p className="text-xs text-on-surface-variant">
        {t("workspaces.editImageUrlHint")}
      </p>
    </div>
  );
}
