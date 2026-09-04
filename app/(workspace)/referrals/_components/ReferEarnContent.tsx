"use client";

import { useMemo, useState, type ReactElement } from "react";

import { DraftEditorSuccessToast } from "@/app/(workspace)/content-manager/draft/[id]/_components/DraftEditorSuccessToast";
import { useDraftActionSuccessToast } from "@/app/(workspace)/content-manager/draft/[id]/_hooks/useDraftActionSuccessToast";
import { centsToUsd } from "@/lib/referral/referralApi";
import { buildReferralShareTargets } from "@/lib/referral/referralShareTargets";

import { useReferralDashboard } from "../_hooks/useReferralDashboard";
import { ReferralAdminWithdrawals } from "./ReferralAdminWithdrawals";
import { ReferralLimitedOfferBanner } from "./ReferralLimitedOfferBanner";
import { ReferralLoadingSkeleton } from "./ReferralLoadingSkeleton";
import { ReferralShareBar } from "./ReferralShareBar";
import { ReferralStatsRow } from "./ReferralStatsRow";
import { ReferralTabs } from "./ReferralTabs";
import { ReferralWithdrawForm } from "./ReferralWithdrawForm";

const SHARE_COPY =
  "Join me on Postsiva — schedule and publish to every platform from one place.";

/**
 * Scaffold-free Refer & Earn content. Owner-scoped (Bearer only, no workspace),
 * so it renders under both the workspace shell and the `(account)` group.
 */
export function ReferEarnContent(): ReactElement {
  const dash = useReferralDashboard();
  const [copied, setCopied] = useState(false);
  const { toast, toastKey, dismissToast, showToast } = useDraftActionSuccessToast();

  const shareTargets = useMemo(() => {
    if (!dash.me) return null;
    return buildReferralShareTargets(dash.me.share_url, SHARE_COPY);
  }, [dash.me]);

  const shareClipboardText = dash.me
    ? `${SHARE_COPY} ${dash.me.share_url}`
    : "";

  async function copyLink() {
    if (!dash.me) return;
    await navigator.clipboard.writeText(dash.me.share_url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    showToast("Referral link copied", "Your referral link is ready to share.");
  }

  if (dash.loading && !dash.me) {
    return <ReferralLoadingSkeleton />;
  }
  if (dash.error && !dash.me) {
    return <p className="text-sm text-red-600">{dash.error}</p>;
  }
  if (!dash.me || !shareTargets) {
    return <></>;
  }

  const canWithdraw =
    dash.me.wallet.available_cents >= dash.me.wallet.min_withdraw_cents;

  return (
    <div className="flex w-full flex-col gap-10 pb-16">
      <header className="sr-only">
        <h1>Refer &amp; Earn</h1>
      </header>

      <section className="flex flex-col items-center gap-5 text-center">
        <h2 className="text-3xl font-bold tracking-tight text-on-surface sm:text-4xl">
          Earn Rewards
        </h2>
        <p className="max-w-xl text-sm text-on-surface-variant sm:text-base">
          Earn{" "}
          <strong className="text-on-surface">
            {centsToUsd(dash.me.rewards.pro_cents)}
          </strong>{" "}
          when someone buys Pro, or{" "}
          <strong className="text-on-surface">
            {centsToUsd(dash.me.rewards.starter_cents)}
          </strong>{" "}
          for Starter (first paid month only).
        </p>

        <ReferralLimitedOfferBanner
          requiredCredited={dash.me.milestone.required_credited}
          creditedCount={dash.me.milestone.credited_count}
          awarded={dash.me.milestone.awarded}
        />

        <div className="mt-1 w-full rounded-2xl bg-surface-container-low px-4 py-5">
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-on-surface-variant">
            Here is your unique referral link
          </p>
          <div className="flex gap-2">
            <input
              readOnly
              value={dash.me.share_url}
              className="min-w-0 flex-1 rounded-lg border border-outline-variant/40 bg-surface px-3 py-2.5 text-sm text-on-surface"
            />
            <button
              type="button"
              onClick={() => void copyLink()}
              className="shrink-0 rounded-lg bg-on-surface px-4 py-2.5 text-sm font-medium text-surface"
            >
              {copied ? "Copied" : "Copy"}
            </button>
          </div>
          <ReferralShareBar
            targets={shareTargets}
            shareText={shareClipboardText}
            onCopied={() => {
              showToast("Referral link copied", "Your referral message was copied.");
            }}
          />
        </div>
      </section>

      <ReferralStatsRow me={dash.me} />

      <ReferralTabs
        tab={dash.tab}
        setTab={dash.setTab}
        referrals={dash.referrals}
        txs={dash.txs}
        withdrawals={dash.withdrawals}
      />

      {dash.tab === "rewards" ? (
        <ReferralWithdrawForm
          canWithdraw={canWithdraw}
          minCents={dash.me.wallet.min_withdraw_cents}
          availableCents={dash.me.wallet.available_cents}
          onSubmit={dash.submitWithdraw}
        />
      ) : null}

      <ReferralAdminWithdrawals />
      {toast ? (
        <DraftEditorSuccessToast
          key={toastKey}
          title={toast.title}
          subtitle={toast.subtitle}
          onDismiss={dismissToast}
        />
      ) : null}
    </div>
  );
}
