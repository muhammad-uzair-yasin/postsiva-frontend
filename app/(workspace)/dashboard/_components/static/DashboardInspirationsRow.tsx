"use client";

import { useState, type ReactElement } from "react";

import { getApiBaseUrl } from "@/lib/api/config";
import { formatDate } from "@/app/(workspace)/news/_components/NewsCard";

import type { InspirationRow } from "./inspirationsTypes";

function proxyUrl(url: string): string {
  try {
    return `${getApiBaseUrl()}/news/image-proxy?url=${encodeURIComponent(url)}`;
  } catch {
    return url;
  }
}

interface DashboardInspirationsRowProps {
  readonly row: InspirationRow;
}

export function DashboardInspirationsRow({
  row,
}: DashboardInspirationsRowProps): ReactElement {
  const [imgSrc, setImgSrc] = useState<string | null>(row.image);
  const [imgError, setImgError] = useState(false);
  const dateStr = formatDate(row.publishedAt);
  const showImage = Boolean(imgSrc && !imgError);

  return (
    <a
      href={row.url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-3 border-b border-outline-variant/10 px-1 py-3 last:border-b-0 hover:bg-surface-container-high/40"
    >
      <div className="h-11 w-14 shrink-0 overflow-hidden rounded-md bg-surface-container-highest">
        {showImage ? (
          // eslint-disable-next-line @next/next/no-img-element -- remote news thumbs; proxy URL varies
          <img
            src={imgSrc!.startsWith("http") ? proxyUrl(imgSrc!) : imgSrc!}
            alt=""
            className="h-full w-full object-cover"
            onError={() => {
              if (row.image && imgSrc === row.image) {
                setImgSrc(proxyUrl(row.image));
                return;
              }
              setImgError(true);
            }}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <span className="material-symbols-outlined text-base text-on-surface-variant/50" aria-hidden>
              article
            </span>
          </div>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-on-surface">{row.title}</p>
        {row.source ? (
          <p className="mt-0.5 truncate text-xs text-on-surface-variant">{row.source}</p>
        ) : null}
      </div>
      {dateStr ? (
        <span className="shrink-0 text-xs text-on-surface-variant">{dateStr}</span>
      ) : null}
    </a>
  );
}
