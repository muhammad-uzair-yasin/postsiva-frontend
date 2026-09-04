"use client";

import type { ReactElement } from "react";

import { useTranslations } from "@/lib/i18n/WorkspaceLocaleProvider";
import type { CloudExportSource } from "@/lib/social/cloudStorageApi";
import type { StockMediaItem } from "@/lib/social/stockMediaApi";

import { SaveToCloudControl } from "../../_components/cloud-save/SaveToCloudControl";

export function StockMediaTile({
  item,
  importing,
  onUseInPost,
  onSaveToLibrary,
}: {
  item: StockMediaItem;
  /** "use" | "save" while this tile has an import in flight, otherwise null. */
  importing: "use" | "save" | null;
  onUseInPost: () => void;
  onSaveToLibrary: () => void;
}): ReactElement {
  const { t } = useTranslations();
  const busy = importing !== null;
  const providerLabel = item.stock_id.startsWith("px:")
    ? "Pexels"
    : item.stock_id.startsWith("pb:")
      ? "Pixabay"
      : "";
  const cloudSource: CloudExportSource = {
    sourceType: "stock_media",
    stockId: item.stock_id,
    stockUrl: item.full_url,
    downloadUrl: item.full_url,
    mediaType: item.media_type,
  };
  const durationLabel =
    item.media_type === "video" && item.duration
      ? `${Math.floor(item.duration / 60)}:${String(item.duration % 60).padStart(2, "0")}`
      : null;

  return (
    <div className="group relative w-full overflow-hidden rounded-xl bg-surface-container-highest ring-1 ring-outline-variant/20 transition-all hover:shadow-md hover:ring-secondary/50">
      <div className="relative w-full">
        {/* eslint-disable-next-line @next/next/no-img-element -- external stock CDN */}
        <img
          alt=""
          loading="lazy"
          className="block w-full h-auto transition-transform duration-300 group-hover:scale-[1.02]"
          src={item.thumb_url || item.preview_url}
        />
        {item.media_type === "video" ? (
        <span className="pointer-events-none absolute left-2 top-2 z-[5] flex items-center gap-1 rounded-md bg-black/60 px-1.5 py-0.5 text-[10px] font-bold text-white">
          <span className="material-symbols-outlined text-xs leading-none" aria-hidden>
            play_arrow
          </span>
          {durationLabel ?? t("postScheduler.mediaLibrary.filterVideos")}
        </span>
        ) : null}
        {!busy ? (
          <SaveToCloudControl source={cloudSource} cornerClassName="absolute right-2 top-2 z-[25]" />
        ) : null}
        {busy ? (
        <div className="absolute inset-0 z-[20] flex flex-col items-center justify-center gap-2 bg-black/55">
          <span
            className="material-symbols-outlined animate-spin text-2xl text-white"
            aria-hidden
          >
            progress_activity
          </span>
          <span className="text-[10px] font-bold text-white">
            {t("postScheduler.mediaLibrary.stockImporting")}
          </span>
        </div>
        ) : (
        <div className="absolute inset-0 z-[10] flex flex-col items-center justify-end gap-1.5 bg-gradient-to-t from-black/75 via-black/25 to-transparent p-2 opacity-0 transition-opacity group-hover:opacity-100">
          <div className="flex w-full flex-col gap-1">
            <button
              type="button"
              onClick={onUseInPost}
              className="inline-flex h-8 w-full items-center justify-center gap-1 rounded-lg bg-primary px-2 text-[11px] font-bold text-on-primary shadow-md transition-colors hover:bg-primary/90"
            >
              <span className="material-symbols-outlined text-sm leading-none" aria-hidden>
                edit_square
              </span>
              {t("postScheduler.mediaLibrary.useInPost")}
            </button>
            <button
              type="button"
              onClick={onSaveToLibrary}
              className="inline-flex h-8 w-full items-center justify-center gap-1 rounded-lg bg-surface/90 px-2 text-[11px] font-bold text-on-surface shadow-md transition-colors hover:bg-surface"
            >
              <span className="material-symbols-outlined text-sm leading-none" aria-hidden>
                bookmark_add
              </span>
              {t("postScheduler.mediaLibrary.stockSaveToLibrary")}
            </button>
          </div>
          <p className="w-full truncate text-center text-[9px] font-medium text-white/75">
            {[
              item.credit_name
                ? t("postScheduler.mediaLibrary.stockCreditBy", { name: item.credit_name })
                : null,
              providerLabel,
            ]
              .filter(Boolean)
              .join(" · ")}
          </p>
        </div>
        )}
      </div>
    </div>
  );
}
