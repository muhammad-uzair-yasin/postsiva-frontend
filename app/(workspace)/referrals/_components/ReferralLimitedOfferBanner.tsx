"use client";

import type { ReactElement } from "react";

import { POSTSIVA_REFERRAL_POLICY_URL } from "@/lib/legalLinks";

export function ReferralLimitedOfferBanner({
  requiredCredited,
  creditedCount,
  awarded,
}: {
  requiredCredited: number;
  creditedCount: number;
  awarded: boolean;
}): ReactElement {
  const remaining = Math.max(0, requiredCredited - creditedCount);

  return (
    <div className="w-full overflow-hidden rounded-2xl border border-secondary/35 bg-gradient-to-br from-secondary/20 via-surface-container-low to-primary/10 p-5 text-left ring-1 ring-secondary/20">
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-md bg-secondary px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-on-secondary">
          Limited time offer
        </span>
        <span className="text-xs font-medium text-on-surface-variant">
          Worth $29 / month
        </span>
      </div>
      <h3 className="mt-3 text-lg font-bold tracking-tight text-on-surface sm:text-xl">
        Get Postsiva Pro free for 1 month
      </h3>
      <p className="mt-2 text-sm leading-relaxed text-on-surface-variant">
        Refer{" "}
        <strong className="text-on-surface">{requiredCredited} paying users</strong>{" "}
        and unlock a full{" "}
        <strong className="text-on-surface">Pro plan ($29 value)</strong> at no
        charge for one month — on top of your cash rewards.{" "}
        <a
          href={POSTSIVA_REFERRAL_POLICY_URL}
          className="underline underline-offset-2"
          target="_blank"
          rel="noreferrer"
        >
          See terms
        </a>
        .
      </p>
      <p className="mt-3 text-sm font-semibold text-on-surface">
        {awarded
          ? "Offer unlocked — Pro grant applied (or already on Pro)."
          : `${creditedCount} / ${requiredCredited} credited · ${remaining} more to go`}
      </p>
    </div>
  );
}
