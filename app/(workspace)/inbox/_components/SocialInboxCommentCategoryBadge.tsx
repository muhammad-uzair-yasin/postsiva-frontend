"use client";

interface SocialInboxCommentCategoryBadgeProps {
  readonly label: string;
  readonly canEdit: boolean;
  readonly busy: boolean;
  readonly colorClass: string;
  readonly setLabel: string;
  readonly editTitle: string;
  readonly onOpen: (e: React.MouseEvent) => void;
}

export function SocialInboxCommentCategoryBadge({
  label,
  canEdit,
  busy,
  colorClass,
  setLabel,
  editTitle,
  onOpen,
}: SocialInboxCommentCategoryBadgeProps): React.ReactElement | null {
  if (!label && !canEdit) {
    return null;
  }
  if (canEdit) {
    return (
      <button
        type="button"
        className={`inline-flex h-7 items-center rounded-md border px-2 text-[10px] font-bold transition-colors hover:brightness-125 disabled:opacity-50 ${colorClass}`}
        disabled={busy}
        title={editTitle}
        aria-label={editTitle}
        onClick={onOpen}
      >
        {label || setLabel}
      </button>
    );
  }
  return (
    <span
      className={`inline-flex h-7 items-center rounded-md border px-2 text-[10px] font-bold ${colorClass}`}
    >
      {label}
    </span>
  );
}
