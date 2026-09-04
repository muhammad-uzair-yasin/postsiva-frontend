"use client";

import type { ReactElement } from "react";

export function PostSchedulerComposerDashedUploadTrigger({
  onClick,
  disabled,
  previewUrl,
  emptyHint,
  changeLabel,
  className = "",
  heightClass = "h-28",
}: {
  readonly onClick: () => void;
  readonly disabled?: boolean;
  readonly previewUrl?: string;
  readonly emptyHint: string;
  readonly changeLabel?: string;
  readonly className?: string;
  readonly heightClass?: string;
}): ReactElement {
  const hero = previewUrl?.trim() ?? "";

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`group relative flex w-full flex-col items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-outline-variant/25 bg-surface-container-low/50 px-3 py-2 transition hover:border-secondary/40 hover:bg-surface-container-low disabled:cursor-not-allowed disabled:opacity-60 ${heightClass} ${className}`}
    >
      {hero ? (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element -- upload preview */}
          <img src={hero} alt="" className="absolute inset-0 h-full w-full object-cover opacity-90" />
          {changeLabel ? (
            <span className="relative rounded-full bg-black/50 px-3 py-1.5 text-xs font-semibold text-white">
              {changeLabel}
            </span>
          ) : null}
        </>
      ) : (
        <>
          <span className="material-symbols-outlined mb-0.5 text-[1.5rem] text-on-surface-variant/50">
            upload
          </span>
          <span className="max-w-xs text-center text-[11px] leading-snug text-on-surface-variant">
            {emptyHint}
          </span>
        </>
      )}
    </button>
  );
}
