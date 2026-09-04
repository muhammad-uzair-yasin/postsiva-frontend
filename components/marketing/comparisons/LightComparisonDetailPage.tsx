"use client";

import Link from "next/link";
import { ArrowLeft, CheckCircle2, ExternalLink, MinusCircle } from "lucide-react";

import {
  COMPARISON_UPDATED,
  type CompetitorComparison,
} from "@/lib/marketing/comparisons";

export function LightComparisonDetailPage({
  comparison,
}: {
  readonly comparison: CompetitorComparison;
}): React.ReactElement {
  return (
    <main className="mx-auto w-full max-w-[1180px] px-4 pb-24 pt-28 sm:px-10 sm:pt-36">
      <Link
        href="/comparisons"
        className="inline-flex items-center gap-2 text-sm font-bold text-[#0058bc] hover:underline"
      >
        <ArrowLeft className="h-4 w-4" />
        All comparisons
      </Link>

      <section className="mt-8 rounded-3xl border border-[#dbe3ef] bg-white p-8 shadow-[0_24px_60px_rgba(15,23,42,0.1)] sm:p-10">
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#0058bc]">
          {comparison.headline}
        </p>
        <h1 className="mt-4 font-[family-name:var(--font-headline)] text-4xl font-bold tracking-tight text-[#111827] sm:text-6xl">
          Postsiva vs {comparison.name}
        </h1>
        <p className="mt-5 max-w-3xl text-base leading-relaxed text-[#475467] sm:text-lg">
          {comparison.postsivaEdge}
        </p>
        <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-[#667085]">
          Pricing context checked {COMPARISON_UPDATED}. Re-check live competitor pricing before purchase decisions.
        </p>
      </section>

      <section className="mt-8 overflow-hidden rounded-[2rem] border border-[#0058bc] bg-white shadow-[0_30px_90px_rgba(0,88,188,0.16)]">
        <div className="bg-[#0058bc] p-7 text-white sm:p-9">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/70">
            Dedicated pricing comparison
          </p>
          <h2 className="mt-3 max-w-4xl text-3xl font-bold tracking-tight sm:text-4xl">
            What would you pay for the same social workflow?
          </h2>
          <p className="mt-4 max-w-4xl text-base font-medium leading-relaxed text-white/85">
            {comparison.sameUseCase}
          </p>
        </div>

        <div className="grid gap-0 lg:grid-cols-[1fr_1fr]">
          <div className="border-b border-[#dbeafe] bg-[#eff6ff] p-7 sm:p-9 lg:border-b-0 lg:border-r">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#0058bc]">
              Postsiva for this same workflow
            </p>
            <h3 className="mt-3 text-3xl font-bold text-[#111827]">Clear low pricing</h3>
            <p className="mt-5 text-lg font-semibold leading-8 text-[#344054]">
              {comparison.postsivaPrice}
            </p>
            <div className="mt-6 rounded-2xl bg-white p-5 text-base font-bold leading-7 text-[#111827] shadow-sm">
              Includes composer, calendar, inbox, previews, AI content, image generation, Piva,
              MCP/API automation, and workspace context.
            </div>
          </div>

          <div className="bg-white p-7 sm:p-9">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#667085]">
              {comparison.name} for this same workflow
            </p>
            <h3 className="mt-3 text-3xl font-bold text-[#111827]">Cost comparison</h3>
            <p className="mt-5 text-lg font-semibold leading-8 text-[#475467]">
              {comparison.competitorPrice}
            </p>
            <div className="mt-6 rounded-2xl bg-[#f8fafc] p-5 text-base font-semibold leading-7 text-[#475467]">
              Matching Postsiva’s AI and automation surface can require higher tiers, add-ons,
              extra channels, extra users, or separate tools.
            </div>
          </div>
        </div>

        <div className="border-t border-[#dbe3ef] p-4 sm:p-6">
          <div className="overflow-hidden rounded-2xl border border-[#dbe3ef]">
            <div className="grid bg-[#f8fafc] text-xs font-bold uppercase tracking-[0.14em] text-[#667085] md:grid-cols-[0.8fr_1fr_1fr]">
              <div className="p-4">Price item</div>
              <div className="border-t border-[#dbe3ef] p-4 md:border-l md:border-t-0">
                Postsiva
              </div>
              <div className="border-t border-[#dbe3ef] p-4 md:border-l md:border-t-0">
                {comparison.name}
              </div>
            </div>
            {comparison.pricingRows.map((row) => (
              <div
                key={row.item}
                className="grid border-t border-[#dbe3ef] text-sm md:grid-cols-[0.8fr_1fr_1fr]"
              >
                <div className="bg-white p-4 font-bold text-[#111827]">{row.item}</div>
                <div className="border-t border-[#dbe3ef] bg-[#eff6ff] p-4 font-semibold leading-6 text-[#111827] md:border-l md:border-t-0">
                  {row.postsiva}
                </div>
                <div className="border-t border-[#dbe3ef] bg-white p-4 leading-6 text-[#475467] md:border-l md:border-t-0">
                  {row.competitor}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="border-t border-[#bfdbfe] bg-[#0058bc] p-7 text-white sm:p-9">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/70">
            Price verdict
          </p>
          <h3 className="mt-3 text-3xl font-bold">Postsiva is the smarter buy</h3>
          <p className="mt-4 max-w-4xl text-base font-semibold leading-7 text-white/85">
            {comparison.priceVerdict}
          </p>
        </div>
      </section>

      <section className="mt-8 overflow-hidden rounded-3xl border border-[#dbe3ef] bg-white shadow-[0_18px_45px_rgba(15,23,42,0.08)]">
        <div className="border-b border-[#e5edf6] p-7">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#0058bc]">
            Feature comparison
          </p>
          <h2 className="mt-3 text-2xl font-bold text-[#111827]">
            Postsiva gives you more than basic scheduling
          </h2>
        </div>
        <div className="divide-y divide-[#e5edf6]">
          {comparison.featureRows.map((row) => (
            <div key={row.label} className="grid gap-4 p-6 md:grid-cols-[0.8fr_1fr_1fr]">
              <div className="text-sm font-bold text-[#111827]">{row.label}</div>
              <div className="flex gap-3 rounded-2xl bg-[#eff6ff] p-4 text-sm font-semibold leading-relaxed text-[#111827]">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-[#0058bc]" />
                <span>{row.postsiva}</span>
              </div>
              <div className="flex gap-3 rounded-2xl bg-[#f8fafc] p-4 text-sm leading-relaxed text-[#475467]">
                <MinusCircle className="mt-0.5 h-5 w-5 shrink-0 text-[#98a2b3]" />
                <span>{row.competitor}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-8 grid gap-6 lg:grid-cols-2">
        <div className="rounded-3xl border border-[#dbe3ef] bg-white p-7 shadow-[0_18px_45px_rgba(15,23,42,0.08)]">
          <h2 className="text-2xl font-bold text-[#111827]">{comparison.name} snapshot</h2>
          <dl className="mt-6 space-y-5">
            <div>
              <dt className="text-xs font-bold uppercase tracking-wide text-[#0058bc]">Pricing model</dt>
              <dd className="mt-2 text-sm leading-relaxed text-[#475467]">{comparison.pricing}</dd>
            </div>
            <div>
              <dt className="text-xs font-bold uppercase tracking-wide text-[#0058bc]">Best for</dt>
              <dd className="mt-2 text-sm leading-relaxed text-[#475467]">{comparison.bestFor}</dd>
            </div>
          </dl>
          <a
            href={comparison.sourceHref}
            target="_blank"
            rel="noreferrer"
            className="mt-7 inline-flex items-center gap-2 text-sm font-bold text-[#0058bc] hover:underline"
          >
            Source
            <ExternalLink className="h-4 w-4" />
          </a>
        </div>

        <div className="rounded-3xl border border-[#bfdbfe] bg-[#eff6ff] p-7 shadow-[0_18px_45px_rgba(0,88,188,0.08)]">
          <h2 className="text-2xl font-bold text-[#111827]">Why Postsiva is stronger</h2>
          <ul className="mt-6 space-y-4">
            {comparison.benefits.map((benefit) => (
              <li key={benefit} className="flex gap-3 text-sm font-semibold leading-relaxed text-[#111827]">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-[#0058bc]" />
                {benefit}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="mt-8 rounded-3xl border border-[#dbe3ef] bg-white p-8 shadow-[0_18px_45px_rgba(15,23,42,0.08)]">
        <h2 className="text-2xl font-bold text-[#111827]">Bottom line</h2>
        <p className="mt-4 text-base leading-relaxed text-[#475467]">
          Choose Postsiva if you want a modern workspace for publishing, scheduling, comments,
          analytics, AI content, image generation, MCP/API automation, and agent workflows without
          paying enterprise-suite prices or watching per-channel costs stack up.
        </p>
        <p className="mt-4 text-sm leading-relaxed text-[#475467]">
          Fair tradeoff: {comparison.tradeoffs.join(" ")}
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/pricing"
            className="inline-flex items-center justify-center rounded-xl bg-[#0058bc] px-6 py-3 text-sm font-bold text-white hover:bg-[#004a9e]"
          >
            See Postsiva pricing
          </Link>
          <Link
            href="/contact"
            className="inline-flex items-center justify-center rounded-xl border border-[#bfdbfe] px-6 py-3 text-sm font-bold text-[#0058bc] hover:bg-[#eff6ff]"
          >
            Talk to Postsiva
          </Link>
        </div>
      </section>
    </main>
  );
}
