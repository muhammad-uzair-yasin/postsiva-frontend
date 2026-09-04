import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";

import type { MadeForAudience } from "@/components/marketing/landingMadeFor";

const AUDIENCE_DETAILS: Record<
  string,
  {
    lead: string;
    outcomes: string[];
    workflow: string[];
    metrics: { label: string; value: string }[];
  }
> = {
  creators: {
    lead:
      "Create once, preview for every channel, and keep publishing even when your content ideas are moving fast.",
    outcomes: [
      "Draft captions and visuals with AI beside the composer.",
      "Preview LinkedIn, Instagram, TikTok, Facebook, and more before publishing.",
      "Keep comments, replies, and follow-up in one workspace.",
    ],
    workflow: ["Idea to post", "AI rewrite", "Channel preview", "Schedule", "Reply"],
    metrics: [
      { label: "Best for", value: "Daily creators" },
      { label: "Core flow", value: "Create + publish" },
      { label: "Plan", value: "Starter / Pro" },
    ],
  },
  "small-businesses": {
    lead:
      "Stay visible without hiring a full social team. Postsiva gives small businesses one place to plan, publish, and respond.",
    outcomes: [
      "Turn promotions, updates, and local news into ready-to-publish posts.",
      "Schedule across all active channels from one calendar.",
      "Use inbox workflows so customer comments do not get missed.",
    ],
    workflow: ["Promotion", "Brand voice", "Post preview", "Calendar", "Inbox"],
    metrics: [
      { label: "Best for", value: "Local teams" },
      { label: "Core flow", value: "Plan + respond" },
      { label: "Plan", value: "Starter / Pro" },
    ],
  },
  agencies: {
    lead:
      "Separate every client into its own workspace, keep approvals clean, and use AI to move faster without losing brand context.",
    outcomes: [
      "Run multiple client brands without mixing drafts, accounts, or comments.",
      "Keep client-specific voice, assets, schedules, and approvals organized.",
      "Use AI and automation to reduce repetitive caption, image, and reply work.",
    ],
    workflow: ["Client workspace", "Draft", "Approve", "Publish", "Report"],
    metrics: [
      { label: "Best for", value: "Client work" },
      { label: "Core flow", value: "Workspace ops" },
      { label: "Plan", value: "Pro" },
    ],
  },
  "marketing-teams": {
    lead:
      "Give your team one command center for content, calendar, approvals, comments, analytics, and AI-assisted execution.",
    outcomes: [
      "Plan campaigns with shared visibility across channels and workspaces.",
      "Use previews and validation to catch platform-specific mistakes early.",
      "Connect AI workflows through Piva, API keys, MCP, and automation paths.",
    ],
    workflow: ["Campaign", "Collaborate", "Validate", "Publish", "Analyze"],
    metrics: [
      { label: "Best for", value: "Growth teams" },
      { label: "Core flow", value: "Team cockpit" },
      { label: "Plan", value: "Pro" },
    ],
  },
};

export function LightAudienceDetailPage({
  audience,
}: {
  readonly audience: MadeForAudience;
}): React.ReactElement {
  const detail = AUDIENCE_DETAILS[audience.slug] ?? AUDIENCE_DETAILS.creators;
  const Icon = audience.icon;

  return (
    <main className="bg-white">
      <section className="border-b border-[#E5E7EB] bg-[#F7FBFF] px-4 pb-16 pt-28 sm:px-10 lg:pt-32">
        <div className="mx-auto grid max-w-[1280px] gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div>
            <Link
              href="/made-for"
              className="inline-flex items-center text-sm font-bold text-[#0058bc] hover:underline"
            >
              Made for
            </Link>
            <h1 className="mt-5 max-w-3xl font-[family-name:var(--font-headline)] text-4xl font-semibold tracking-tight text-[#111827] sm:text-6xl">
              Postsiva for {audience.title.toLowerCase()}
            </h1>
            <p className="mt-5 max-w-2xl text-lg font-medium leading-8 text-[#475467]">
              {detail.lead}
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/signup"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#0058bc] px-6 py-3 text-sm font-bold text-white hover:bg-[#004a9e]"
              >
                Start free
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/features"
                className="inline-flex items-center justify-center rounded-xl border border-[#bfdbfe] bg-white px-6 py-3 text-sm font-bold text-[#0058bc] hover:bg-[#eff6ff]"
              >
                Explore features
              </Link>
            </div>
          </div>

          <div className="rounded-3xl border border-[#dbe3ef] bg-white p-6 shadow-[0_24px_70px_rgba(15,23,42,0.1)]">
            <div className="flex items-center gap-4 rounded-2xl bg-[#eff6ff] p-5">
              <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#0058bc] text-white shadow-[0_16px_36px_rgba(0,88,188,0.24)]">
                <Icon className="h-6 w-6" />
              </span>
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#0058bc]">
                  Audience workflow
                </p>
                <h2 className="mt-1 text-2xl font-bold text-[#111827]">{audience.title}</h2>
              </div>
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              {detail.metrics.map((metric) => (
                <div key={metric.label} className="rounded-2xl border border-[#e5edf6] p-4">
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#667085]">
                    {metric.label}
                  </p>
                  <p className="mt-2 text-lg font-bold text-[#111827]">{metric.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 py-16 sm:px-10 sm:py-20">
        <div className="mx-auto grid max-w-[1280px] gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#0058bc]">
              Why it works
            </p>
            <h2 className="mt-3 font-[family-name:var(--font-headline)] text-3xl font-semibold text-[#111827]">
              Built for the way {audience.title.toLowerCase()} actually publish.
            </h2>
            <p className="mt-4 text-base leading-7 text-[#475467]">{audience.description}</p>
          </div>

          <div className="grid gap-4">
            {detail.outcomes.map((outcome) => (
              <div
                key={outcome}
                className="flex gap-4 rounded-2xl border border-[#dbe3ef] bg-white p-5 shadow-[0_16px_40px_rgba(15,23,42,0.06)]"
              >
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-[#0058bc]" />
                <p className="text-sm font-semibold leading-6 text-[#111827]">{outcome}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 pb-24 sm:px-10">
        <div className="mx-auto max-w-[1280px] rounded-3xl border border-[#dbe3ef] bg-[#111827] p-6 text-white shadow-[0_24px_70px_rgba(15,23,42,0.16)] sm:p-8">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/60">
            Recommended flow
          </p>
          <div className="mt-6 grid gap-3 md:grid-cols-5">
            {detail.workflow.map((step, index) => (
              <div key={step} className="rounded-2xl border border-white/10 bg-white/8 p-4">
                <p className="font-mono text-xs font-bold text-[#8ec5ff]">0{index + 1}</p>
                <p className="mt-3 text-sm font-bold">{step}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
