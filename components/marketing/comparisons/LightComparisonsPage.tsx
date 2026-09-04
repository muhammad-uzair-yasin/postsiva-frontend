"use client";

import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";

import {
  COMPARISON_UPDATED,
  COMPETITOR_COMPARISONS,
} from "@/lib/marketing/comparisons";

export function LightComparisonsPage(): React.ReactElement {
  return (
    <main className="mx-auto w-full max-w-[1280px] px-4 pb-24 pt-28 sm:px-10 sm:pt-36">
      <section className="text-center">
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#0058bc]">
          Comparisons
        </p>
        <h1 className="mx-auto mt-4 max-w-4xl font-[family-name:var(--font-headline)] text-4xl font-bold tracking-tight text-[#111827] sm:text-6xl">
          See why Postsiva is the AI-native alternative to legacy social tools.
        </h1>
        <p className="mx-auto mt-5 max-w-3xl text-base leading-relaxed text-[#475467] sm:text-lg">
          Compare Postsiva with Buffer, Hootsuite, Later, Sprout Social, Vista Social,
          SocialPilot, Dash Social, and Metricool. Pricing context checked {COMPARISON_UPDATED}.
        </p>
      </section>

      <section className="mt-14 grid gap-5 md:grid-cols-2">
        {COMPETITOR_COMPARISONS.map((item) => (
          <Link
            key={item.slug}
            href={`/comparisons/${item.slug}`}
            className="group rounded-3xl border border-[#dbe3ef] bg-white p-7 shadow-[0_18px_45px_rgba(15,23,42,0.08)] transition hover:-translate-y-1 hover:border-[#0058bc]/40 focus:outline-none focus:ring-2 focus:ring-[#0058bc]"
          >
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#0058bc]">
              {item.headline}
            </p>
            <h2 className="mt-4 text-2xl font-bold text-[#111827]">{item.name}</h2>
            <p className="mt-3 text-sm leading-relaxed text-[#475467]">{item.pricing}</p>
            <div className="mt-5 flex items-center gap-2 text-sm font-bold text-[#0058bc]">
              Full comparison
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </div>
          </Link>
        ))}
      </section>

      <section className="mt-14 rounded-3xl border border-[#bfdbfe] bg-[#eff6ff] p-8">
        <h2 className="text-2xl font-bold text-[#111827]">Postsiva benefits across every comparison</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {[
            "Workspace plans that avoid per-channel or per-seat cost surprises.",
            "AI-native workflows with MCP, API keys, ChatGPT, DM agents, and automation.",
            "Real social previews and post-type validation before publishing.",
            "Composer, calendar, inbox, analytics, content manager, and AI in one workspace.",
          ].map((benefit) => (
            <div key={benefit} className="flex gap-3 text-sm font-medium text-[#111827]">
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-[#0058bc]" />
              {benefit}
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
