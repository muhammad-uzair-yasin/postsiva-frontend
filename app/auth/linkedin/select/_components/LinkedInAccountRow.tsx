"use client";

import Image from "next/image";

import type { LinkedInPendingDestination } from "@/lib/social/linkedinIntegrationApi";

interface LinkedInAccountRowProps {
  destination: LinkedInPendingDestination;
  checked: boolean;
  onToggle: (key: string) => void;
}

export function LinkedInAccountRow({
  destination,
  checked,
  onToggle,
}: LinkedInAccountRowProps): React.ReactElement {
  const disabled = destination.alreadyConnected;
  const kindLabel = destination.kind === "personal" ? "Profile" : "Page";

  return (
    <li>
      <label
        className={`flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 ${
          disabled ? "cursor-not-allowed opacity-80" : "cursor-pointer hover:bg-slate-50"
        }`}
      >
        {destination.avatarUrl ? (
          <Image
            src={destination.avatarUrl}
            alt=""
            width={40}
            height={40}
            unoptimized
            className="h-10 w-10 shrink-0 rounded-md object-cover"
          />
        ) : (
          <span
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-slate-100 text-sm font-semibold text-slate-500"
            aria-hidden
          >
            {(destination.name ?? "?").slice(0, 1).toUpperCase()}
          </span>
        )}
        <span className="min-w-0 flex-1">
          <span className="flex items-center gap-2">
            <span className="truncate text-sm font-semibold text-slate-900">
              {destination.name ?? destination.destinationKey}
            </span>
            {destination.alreadyConnected ? (
              <span className="shrink-0 rounded bg-slate-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-600">
                Connected already
              </span>
            ) : null}
          </span>
          <span className="block text-xs text-slate-500">{kindLabel}</span>
        </span>
        <input
          type="checkbox"
          checked={checked}
          disabled={disabled}
          onChange={() => onToggle(destination.destinationKey)}
          className="h-4 w-4 shrink-0 accent-[#0A66C2]"
        />
      </label>
    </li>
  );
}
