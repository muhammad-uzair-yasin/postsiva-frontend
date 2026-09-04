"use client";

import { motion } from "framer-motion";
import { ArrowRight, Crown, Shield } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState, type ReactElement } from "react";

import {
  type BillingInterval,
  type BillingPlanPublic,
  type BillingPlansResponse,
} from "@/lib/billing/billingApi";
import { MARKETING_BILLING_PLANS_FALLBACK } from "@/lib/billing/marketingPlansFallback";
import { planPriceLabel } from "@/lib/billing/planCardCopy";
import { PlanDetailsBlock } from "@/components/billing/PlanDetailsBlock";
import { getStoredAccessToken } from "@/lib/auth/session";
import { usePublicTranslations } from "@/lib/i18n/PublicLocaleProvider";

const PLAN_ICONS: Record<string, typeof Shield> = {
  free: Shield,
  starter: Shield,
  pro: Crown,
};

function planCtaHref(planId: string, loggedIn: boolean): string {
  if (planId === "free") {
    return loggedIn ? "/dashboard" : "/signup";
  }
  if (loggedIn) {
    return `/settings/billing?upgrade=${planId}`;
  }
  return `/signup?next=${encodeURIComponent(`/settings/billing?upgrade=${planId}`)}`;
}

function planCtaLabel(planId: string, loggedIn: boolean): string {
  if (planId === "free") {
    return loggedIn ? "Go to app" : "Create workspace";
  }
  if (planId === "pro") {
    return loggedIn ? "Upgrade to Pro" : "Start Pro";
  }
  return loggedIn ? "Upgrade to Starter" : "Start Starter";
}

export function PricingUnified(): ReactElement {
  const { t } = usePublicTranslations();
  const [interval, setInterval] = useState<BillingInterval>("month");
  const [plans, setPlans] = useState<BillingPlanPublic[]>(
    MARKETING_BILLING_PLANS_FALLBACK.plans,
  );
  const [yearlySavings, setYearlySavings] = useState(
    MARKETING_BILLING_PLANS_FALLBACK.yearly_savings_percent,
  );
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    setLoggedIn(Boolean(getStoredAccessToken()?.trim()));
    let cancelled = false;
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 8000);

    void (async () => {
      try {
        const base = (await import("@/lib/api/config")).getApiBaseUrl();
        const res = await fetch(`${base}/billing/plans`, {
          headers: { Accept: "application/json" },
          cache: "no-store",
          signal: controller.signal,
        });
        if (!res.ok) return;
        const data = (await res.json()) as BillingPlansResponse;        if (cancelled || !data.plans?.length) return;
        setPlans(data.plans);
        setYearlySavings(data.yearly_savings_percent);
      } catch {
        /* keep marketing fallback — same catalog as production */
      } finally {
        window.clearTimeout(timeout);
      }
    })();

    return () => {
      cancelled = true;
      controller.abort();
      window.clearTimeout(timeout);
    };
  }, []);

  const ordered = useMemo(
    () => ["free", "starter", "pro"].map((id) => plans.find((p) => p.plan_id === id)).filter(Boolean) as BillingPlanPublic[],
    [plans],
  );

  return (
    <section id="pricing" className="relative scroll-mt-28 overflow-hidden py-28">
      <div className="marketing-section-aurora pointer-events-none absolute inset-0 opacity-50" />
      <div className="marketing-container-wide">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mx-auto max-w-2xl text-center"
        >
          <p className="text-xs font-black uppercase tracking-[0.28em] text-secondary">
            {t("marketing.pricingEyebrow")}
          </p>
          <h2 className="mt-4 text-3xl font-black text-on-surface sm:text-4xl md:text-[2.65rem] md:leading-tight">
            {t("marketing.pricingTitle")}{" "}
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              {t("marketing.pricingTitleAccent")}
            </span>
          </h2>
          <p className="mt-4 text-on-surface-variant">{t("marketing.pricingSubtitle")}</p>

          <div className="mt-8 inline-flex rounded-full border border-white/15 bg-surface-container/80 p-1">
            <button
              type="button"
              onClick={() => setInterval("month")}
              className={`rounded-full px-5 py-2 text-sm font-bold transition-colors ${
                interval === "month"
                  ? "bg-primary text-on-primary"
                  : "text-on-surface-variant hover:text-on-surface"
              }`}
            >
              {t("marketing.pricingMonthly")}
            </button>
            <button
              type="button"
              onClick={() => setInterval("year")}
              className={`rounded-full px-5 py-2 text-sm font-bold transition-colors ${
                interval === "year"
                  ? "bg-primary text-on-primary"
                  : "text-on-surface-variant hover:text-on-surface"
              }`}
            >
              {t("marketing.pricingYearly")}
              <span className="ml-1.5 text-xs opacity-90">−{yearlySavings}%</span>
            </button>
          </div>
        </motion.div>

        <div className="mt-14 grid gap-6 lg:grid-cols-3">
          {ordered.map((plan, i) => {
            const highlight = plan.plan_id === "pro";
            const Icon = PLAN_ICONS[plan.plan_id] ?? Shield;
            const price = planPriceLabel(plan, interval);
            const href = planCtaHref(plan.plan_id, loggedIn);
            return (
              <motion.div
                key={plan.plan_id}
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.06 * i }}
                className={`relative flex flex-col overflow-visible rounded-3xl border p-6 shadow-xl backdrop-blur-md ${
                  highlight
                    ? "border-primary/50 bg-gradient-to-b from-primary/15 via-surface-container to-surface-container-low ring-1 ring-primary/30"
                    : "border-white/10 bg-surface-container/85"
                }`}
              >
                {highlight ? (
                  <span className="absolute -top-3 left-1/2 z-[1] -translate-x-1/2 rounded-full bg-secondary px-3 py-1 text-[10px] font-black uppercase tracking-widest text-on-secondary">
                    Most popular
                  </span>
                ) : null}
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/15 text-primary">
                    <Icon className="h-6 w-6" aria-hidden />
                  </div>
                  <div>
                    <p className="text-lg font-black text-on-surface">{plan.display_name}</p>
                    <p className="text-xs text-on-surface-variant">{plan.tagline}</p>
                  </div>
                </div>
                <div className="mt-6">
                  <p className="text-4xl font-black text-on-surface">{price.main}</p>
                  <p className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
                    {price.sub}
                  </p>
                </div>

                <div className="flex-1">
                  <PlanDetailsBlock plan={plan} variant="marketing" />
                </div>

                <Link
                  href={href}
                  className={`mt-8 inline-flex items-center justify-center gap-2 rounded-full px-4 py-3 text-sm font-bold transition-transform hover:scale-[1.02] ${
                    highlight
                      ? "bg-gradient-to-r from-primary to-secondary text-on-primary"
                      : "border border-white/15 bg-white/5 text-on-surface"
                  }`}
                >
                  {planCtaLabel(plan.plan_id, loggedIn)}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
