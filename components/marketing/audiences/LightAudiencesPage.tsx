import Link from "next/link";

import { MADE_FOR_AUDIENCES } from "@/components/marketing/landingMadeFor";

const AUDIENCE_STATS = [
  { label: "Profiles", value: "4" },
  { label: "Workflow areas", value: "12" },
  { label: "Shared workspace", value: "1" },
] as const;

const AUDIENCE_WORKFLOWS = [
  "Brand voice and audience context",
  "Approval-ready drafts",
  "Cross-channel scheduling",
  "Inbox and comment follow-up",
] as const;

export function LightAudiencesPage(): React.ReactElement {
  return (
    <main className="bg-white">
      <section className="border-b border-[#E5E7EB] bg-[#F7FBFF] px-4 pb-16 pt-28 sm:px-10 lg:pt-32">
        <div className="mx-auto grid max-w-[1280px] gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-end">
          <div>
            <p className="font-mono text-xs font-semibold uppercase tracking-[0.22em] text-[#0058bc]">
              Explore audiences
            </p>
            <h1 className="mt-3 max-w-2xl font-[family-name:var(--font-headline)] text-4xl font-semibold tracking-tight text-[#111827] sm:text-5xl">
              Pick the Postsiva workflow that matches how you publish.
            </h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-[#4B5563]">
              Creators, small businesses, agencies, and marketing teams all need different
              publishing habits. Start with your audience type, then open the detailed page.
            </p>
          </div>

          <div className="rounded-2xl border border-[#D7E7FF] bg-white p-5 shadow-[0_24px_70px_rgba(15,23,42,0.08)]">
            <div className="grid grid-cols-3 gap-3">
              {AUDIENCE_STATS.map((stat) => (
                <div key={stat.label} className="rounded-xl border border-[#E5E7EB] p-4">
                  <p className="font-[family-name:var(--font-headline)] text-3xl font-semibold text-[#0058bc]">
                    {stat.value}
                  </p>
                  <p className="mt-1 text-xs font-semibold uppercase tracking-[0.12em] text-[#6B7280]">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
            <div className="mt-5 grid gap-2">
              {AUDIENCE_WORKFLOWS.map((workflow) => (
                <div
                  key={workflow}
                  className="flex items-center gap-3 rounded-xl bg-[#F3F8FF] px-4 py-3 text-sm font-semibold text-[#111827]"
                >
                  <span className="h-2 w-2 rounded-full bg-[#0058bc]" />
                  {workflow}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 py-16 sm:px-10 sm:py-20">
        <div className="mx-auto max-w-[1280px]">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {MADE_FOR_AUDIENCES.map((audience, index) => {
              const Icon = audience.icon;
              return (
                <Link
                  key={audience.slug}
                  href={`/made-for/${audience.slug}`}
                  className="group flex min-h-[18rem] flex-col rounded-xl border border-[#E5E7EB] bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-[#0058bc]/35 hover:shadow-[0_20px_50px_rgba(0,88,188,0.1)]"
                >
                  <div className="flex items-center justify-between">
                    <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#EAF3FF] text-[#0058bc]">
                      <Icon className="h-5 w-5" />
                    </span>
                    <span className="font-mono text-xs font-semibold text-[#9CA3AF]">
                      0{index + 1}
                    </span>
                  </div>
                  <h2 className="mt-8 font-[family-name:var(--font-headline)] text-2xl font-semibold text-[#111827] group-hover:text-[#0058bc]">
                    {audience.title}
                  </h2>
                  <p className="mt-3 flex-1 text-sm leading-6 text-[#4B5563]">
                    {audience.description}
                  </p>
                  <span className="mt-6 text-sm font-semibold text-[#0058bc]">
                    View audience workflow
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>
    </main>
  );
}
