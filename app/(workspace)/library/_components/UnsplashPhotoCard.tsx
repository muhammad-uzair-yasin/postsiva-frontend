"use client";

import type { ReactElement } from "react";

import { useTranslations } from "@/lib/i18n/WorkspaceLocaleProvider";
import type { CloudExportSource } from "@/lib/social/cloudStorageApi";
import type { StockMediaItem } from "@/lib/social/stockMediaApi";
import { UNSPLASH_HOME_URL, withUnsplashUtm } from "@/lib/social/unsplashAttribution";

import { SaveToCloudControl } from "../../_components/cloud-save/SaveToCloudControl";

/** Unsplash-compliant card: hotlinked image + always-visible clickable attribution. */
export function UnsplashPhotoCard({
  item,
  importing,
  onUseImage,
}: {
  item: StockMediaItem;
  importing: boolean;
  onUseImage: () => void;
}): ReactElement {
  const { t } = useTranslations();
  const cloudSource: CloudExportSource = {
    sourceType: "stock_media",
    stockId: item.stock_id,
    mediaType: item.media_type,
  };

  return (
    <div className="group relative w-full overflow-hidden rounded-xl bg-surface-container-highest ring-1 ring-outline-variant/20 transition-all hover:shadow-md hover:ring-secondary/50">
      <div className="relative w-full">
        {/* eslint-disable-next-line @next/next/no-img-element -- Unsplash hotlink (required) */}
        <img
          alt={item.alt || item.credit_name || "Unsplash photo"}
          loading="lazy"
          className="block w-full h-auto transition-transform duration-300 group-hover:scale-[1.02]"
          src={item.thumb_url}
        />
      <p className="pointer-events-auto absolute inset-x-0 bottom-0 z-[5] bg-gradient-to-t from-black/80 to-transparent px-2 pb-1.5 pt-6 text-[9px] leading-snug text-white/90">
        {t("postScheduler.mediaLibrary.unsplashPhotoBy")}{" "}
        <a
          href={withUnsplashUtm(item.credit_url || UNSPLASH_HOME_URL)}
          target="_blank"
          rel="noopener noreferrer"
          className="font-bold text-white underline-offset-2 hover:underline"
        >
          {item.credit_name || "Unsplash"}
        </a>{" "}
        {t("postScheduler.mediaLibrary.unsplashOn")}{" "}
        <a
          href={UNSPLASH_HOME_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="font-bold text-white underline-offset-2 hover:underline"
        >
          Unsplash
        </a>
      </p>
      {!importing ? (
        <SaveToCloudControl source={cloudSource} cornerClassName="absolute right-2 top-2 z-[25]" />
      ) : null}
      {importing ? (
        <div className="absolute inset-0 z-[20] flex flex-col items-center justify-center gap-2 bg-black/55">
          <span
            className="material-symbols-outlined animate-spin text-2xl text-white"
            aria-hidden
          >
            progress_activity
          </span>
        </div>
      ) : (
        <div className="absolute inset-0 z-[10] flex flex-col items-center justify-end bg-gradient-to-t from-black/50 via-transparent to-transparent p-2 opacity-0 transition-opacity group-hover:opacity-100">
          <button
            type="button"
            onClick={onUseImage}
            aria-label={`${t("postScheduler.mediaLibrary.unsplashUseImage")} — ${item.credit_name}`}
            className="inline-flex h-8 w-full items-center justify-center gap-1.5 rounded-lg bg-primary px-3 text-[11px] font-bold text-on-primary shadow-md transition-colors hover:bg-primary/90"
          >
            <span className="material-symbols-outlined text-sm leading-none" aria-hidden>
              add_photo_alternate
            </span>
            {t("postScheduler.mediaLibrary.unsplashUseImage")}
          </button>
        </div>
      )}
      </div>
    </div>
  );
}
