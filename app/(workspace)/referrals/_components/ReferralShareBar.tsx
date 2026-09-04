"use client";

import { useState, type ReactElement } from "react";

import { SocialPlatformIcon } from "@/lib/social/SocialPlatformIcon";
import type { SocialPlatformIconId } from "@/lib/social/socialPlatformIconSrc";
import {
  type ReferralShareTarget,
  whatsappIconSrc,
} from "@/lib/referral/referralShareTargets";

export function ReferralShareBar({
  targets,
  shareText,
  onCopied,
}: {
  targets: ReferralShareTarget[];
  shareText: string;
  onCopied?: () => void;
}): ReactElement {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  async function onClick(target: ReferralShareTarget, e: React.MouseEvent) {
    if (!target.copyThenOpen) return;
    e.preventDefault();
    try {
      await navigator.clipboard.writeText(shareText);
      setCopiedId(target.id);
      setTimeout(() => setCopiedId(null), 2000);
      onCopied?.();
    } catch {
      // still open the app
    }
    window.open(target.copyThenOpen, "_blank", "noopener,noreferrer");
  }

  return (
    <div className="mt-4">
      <p className="mb-3 text-center text-[11px] font-semibold uppercase tracking-wider text-on-surface-variant">
        Share on
      </p>
      <div className="flex flex-wrap items-center justify-center gap-2.5">
        {targets.map((target) => {
          const href = target.href || target.copyThenOpen || "#";
          return (
            <a
              key={target.id}
              href={href}
              target="_blank"
              rel="noreferrer"
              aria-label={
                copiedId === target.id
                  ? `Link copied — open ${target.label}`
                  : `Share on ${target.label}`
              }
              title={
                target.copyThenOpen
                  ? `Copy link & open ${target.label}`
                  : `Share on ${target.label}`
              }
              onClick={(e) => void onClick(target, e)}
              className="relative inline-flex h-11 w-11 items-center justify-center rounded-full border border-outline-variant/30 bg-surface transition-colors hover:border-primary/40 hover:bg-surface-container-high"
            >
              <ShareIcon icon={target.icon} />
              {copiedId === target.id ? (
                <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] font-medium text-primary">
                  Copied
                </span>
              ) : null}
            </a>
          );
        })}
      </div>
    </div>
  );
}

function ShareIcon({
  icon,
}: {
  icon: ReferralShareTarget["icon"];
}): ReactElement {
  if (icon === "email") {
    return (
      <span className="material-symbols-outlined text-[22px] text-on-surface">
        mail
      </span>
    );
  }
  if (icon === "whatsapp-cdn") {
    return (
      <img
        src={whatsappIconSrc()}
        alt=""
        className="h-6 w-6 object-contain"
        loading="lazy"
        decoding="async"
      />
    );
  }
  return (
    <SocialPlatformIcon
      platform={icon as SocialPlatformIconId}
      className="h-6 w-6"
      alt=""
    />
  );
}
