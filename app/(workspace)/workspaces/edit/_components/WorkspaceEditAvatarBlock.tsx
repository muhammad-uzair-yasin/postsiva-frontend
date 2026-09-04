"use client";

import { useTranslations } from "@/lib/i18n/WorkspaceLocaleProvider";

interface WorkspaceEditAvatarBlockProps {
  workspaceName: string;
  initialLetter: string;
  imageUrl: string | null;
  busy: boolean;
  canManage: boolean;
  onOpenPicker: () => void;
}

export function WorkspaceEditAvatarBlock({
  workspaceName,
  initialLetter,
  imageUrl,
  busy,
  canManage,
  onOpenPicker,
}: WorkspaceEditAvatarBlockProps): React.ReactElement {
  const { t } = useTranslations();

  const shell = (
    <div
      className={`relative flex h-24 w-24 items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-outline-variant/30 bg-surface-container-lowest transition-all ${
        canManage
          ? "cursor-pointer group-hover:border-primary/50"
          : "cursor-default"
      } ${busy ? "opacity-60" : ""}`}
    >
      {imageUrl ? (
        <img
          alt=""
          className="h-full w-full object-cover"
          src={imageUrl}
        />
      ) : (
        <span
          className="text-2xl font-black text-on-surface-variant"
          aria-hidden
        >
          {initialLetter}
        </span>
      )}
      {canManage ? (
        <div className="absolute inset-0 flex items-center justify-center bg-surface-dim/60 opacity-0 transition-opacity group-hover:opacity-100">
          <span className="material-symbols-outlined text-primary">
            add_a_photo
          </span>
        </div>
      ) : null}
    </div>
  );

  return (
    <div className="group relative shrink-0">
      {canManage ? (
        <button
          type="button"
          onClick={onOpenPicker}
          className="block text-left"
          aria-label={t("workspaces.editAvatarChangeAria", { name: workspaceName })}
        >
          {shell}
        </button>
      ) : (
        <div aria-label={t("workspaces.editAvatarImageAria", { name: workspaceName })}>
          {shell}
        </div>
      )}
      {canManage ? (
        <span className="pointer-events-none absolute -bottom-1 -right-1 rounded-lg bg-primary p-1 text-[10px] font-bold text-on-primary">
          {imageUrl ? t("workspaces.editAvatarChange") : t("workspaces.editAvatarUpload")}
        </span>
      ) : null}
    </div>
  );
}
