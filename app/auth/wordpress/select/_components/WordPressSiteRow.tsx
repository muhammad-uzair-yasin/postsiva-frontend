"use client";

import Image from "next/image";

import type { WordPressPendingSite } from "@/lib/social/wordpressIntegrationApi";

interface WordPressSiteRowProps {
  site: WordPressPendingSite;
  checked: boolean;
  onToggle: (remoteSiteId: string) => void;
}

export function WordPressSiteRow({
  site,
  checked,
  onToggle,
}: WordPressSiteRowProps): React.ReactElement {
  const disabled = !site.canPublish;
  return (
    <li>
      <label
        className={`flex items-center gap-3 rounded-xl border border-outline-variant px-4 py-3 ${
          disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer hover:bg-surface-variant/40"
        }`}
      >
        <input
          type="checkbox"
          checked={checked}
          disabled={disabled}
          onChange={() => onToggle(site.remoteSiteId)}
          className="h-4 w-4 shrink-0 accent-primary"
        />
        {site.iconUrl ? (
          <Image
            src={site.iconUrl}
            alt=""
            width={32}
            height={32}
            unoptimized
            className="h-8 w-8 shrink-0 rounded"
          />
        ) : (
          <span className="h-8 w-8 shrink-0 rounded bg-surface-variant" aria-hidden />
        )}
        <span className="min-w-0 flex-1">
          <span className="flex items-center gap-2">
            <span className="truncate text-sm font-medium">{site.name ?? site.url}</span>
            {site.alreadyConnected ? (
              <span className="shrink-0 rounded-full bg-primary-container px-2 py-0.5 text-[10px] font-semibold text-on-primary-container">
                Connected
              </span>
            ) : null}
          </span>
          <span className="block truncate text-xs text-on-surface-variant">{site.url}</span>
          {disabled && site.reason ? (
            <span className="block text-xs text-red-200">{site.reason}</span>
          ) : null}
        </span>
      </label>
    </li>
  );
}
