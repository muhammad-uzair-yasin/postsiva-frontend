"use client";

import { HeroHighlightsRow } from "@/components/marketing/sections/HeroHighlightsRow";
import { HeroProductVisual } from "@/components/marketing/sections/HeroProductVisual";
import { usePublicTranslations } from "@/lib/i18n/PublicLocaleProvider";
import { ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";

export function HeroUnified(): React.ReactElement {
  const { t } = usePublicTranslations();

  return (
    <section className="relative min-h-[92vh] overflow-x-clip overflow-y-visible pt-28 pb-16 sm:pt-32 lg:pt-36 lg:pb-24">
      <div className="marketing-hero-gradient pointer-events-none absolute inset-0 opacity-40" />
      <div
        aria-hidden
        className="marketing-glow-orb marketing-float-animate -left-32 top-24 h-72 w-72 bg-primary/50"
      />
      <div
        aria-hidden
        className="marketing-glow-orb marketing-float-animate right-[-20%] top-1/3 h-96 w-96 bg-secondary/40"
        style={{ animationDelay: "2s" }}
      />

      <div className="marketing-container">
        <div className="lg:grid lg:grid-cols-2 lg:items-center lg:gap-x-10 lg:gap-y-8">
          <div className="flex flex-col items-center text-center lg:items-start lg:text-left">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-2 text-xs font-bold uppercase tracking-widest text-primary">
              <Sparkles className="h-3.5 w-3.5" />
              {t("marketing.heroBadge")}
            </div>

            <h1 className="mt-8 max-w-xl text-balance font-[family-name:var(--font-headline)] text-3xl font-extrabold leading-tight tracking-tight text-on-surface sm:text-4xl md:text-5xl lg:text-[3.25rem] lg:leading-[1.08]">
              {t("marketing.heroTitle1")}
              <span className="mt-2 block bg-gradient-to-r from-primary via-on-surface to-secondary bg-clip-text text-transparent">
                {t("marketing.heroTitle2")}
              </span>
            </h1>

            <p className="mt-6 max-w-xl text-base text-on-surface-variant sm:text-lg">
              {t("marketing.heroBody")}
            </p>

            <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row lg:items-start">
              <Link
                href="/signup"
                className="group inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-primary to-secondary px-8 py-3.5 text-sm font-bold text-on-primary shadow-xl shadow-primary/30 transition-transform hover:scale-[1.02] active:scale-[0.98]"
              >
                {t("marketing.heroCtaStart")}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <Link
                href="/how-it-works"
                className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-8 py-3.5 text-sm font-semibold text-on-surface backdrop-blur-sm transition-colors hover:border-primary/40 hover:bg-primary/5"
              >
                {t("marketing.heroCtaHow")}
              </Link>
            </div>
          </div>

          <HeroProductVisual />
        </div>

        <HeroHighlightsRow />
      </div>
    </section>
  );
}
