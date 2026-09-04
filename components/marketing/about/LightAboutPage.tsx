import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Bot, CheckCircle2, Globe2, Layers3, ShieldCheck } from "lucide-react";

import { marketingImageDashboard } from "@/components/marketing/productScreens/dashboard";

const PRINCIPLES = [
  {
    title: "One workspace, every network",
    body: "Postsiva keeps accounts, drafts, schedules, comments, analytics, media, and brand context together instead of scattering social work across native apps.",
    icon: Layers3,
  },
  {
    title: "AI that works inside operations",
    body: "Piva, content generation, image generation, MCP, API keys, and reply workflows are built into the daily publishing flow.",
    icon: Bot,
  },
  {
    title: "Built for real teams",
    body: "Creators, small businesses, agencies, and marketing teams can run separate brands or clients without rebuilding their setup.",
    icon: ShieldCheck,
  },
] as const;

const FACTS = [
  "Composer, calendar, inbox, analytics, and workspaces in one cockpit.",
  "Support for major social networks plus automation through API and MCP.",
  "Pricing designed to stay accessible for creators, agencies, and growing teams.",
] as const;

export function LightAboutPage(): React.ReactElement {
  return (
    <main className="bg-white">
      <section className="border-b border-[#dbe3ef] bg-[#f7fbff] px-4 pb-16 pt-28 sm:px-10 sm:pt-32">
        <div className="mx-auto grid max-w-[1280px] gap-10 lg:grid-cols-[0.92fr_1.08fr] lg:items-center">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#0058bc]">
              About Postsiva
            </p>
            <h1 className="mt-4 max-w-3xl font-[family-name:var(--font-headline)] text-4xl font-bold tracking-tight text-[#111827] sm:text-6xl">
              A social command center for teams that publish everywhere.
            </h1>
            <p className="mt-5 max-w-2xl text-lg font-medium leading-8 text-[#475467]">
              Postsiva exists to make social operations simpler: one workspace for creation,
              publishing, comments, analytics, AI assistance, and automation.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/features"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#0058bc] px-6 py-3 text-sm font-bold text-white hover:bg-[#004a9e]"
              >
                Explore features
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center justify-center rounded-xl border border-[#bfdbfe] bg-white px-6 py-3 text-sm font-bold text-[#0058bc] hover:bg-[#eff6ff]"
              >
                Contact us
              </Link>
            </div>
          </div>

          <div className="rounded-3xl border border-[#dbe3ef] bg-white p-4 shadow-[0_24px_70px_rgba(15,23,42,0.1)]">
            <div className="rounded-2xl bg-[#111827] p-3">
              <Image
                src={marketingImageDashboard}
                alt="Postsiva workspace dashboard"
                width={marketingImageDashboard.width}
                height={marketingImageDashboard.height}
                className="h-auto w-full rounded-xl border border-white/10"
                placeholder="blur"
                priority
              />
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 py-16 sm:px-10 sm:py-20">
        <div className="mx-auto max-w-[1280px]">
          <div className="grid gap-6 md:grid-cols-3">
            {PRINCIPLES.map((item) => (
              <article
                key={item.title}
                className="rounded-3xl border border-[#dbe3ef] bg-white p-6 shadow-[0_18px_45px_rgba(15,23,42,0.07)]"
              >
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#eff6ff] text-[#0058bc]">
                  <item.icon className="h-6 w-6" />
                </span>
                <h2 className="mt-6 text-xl font-bold text-[#111827]">{item.title}</h2>
                <p className="mt-3 text-sm font-medium leading-7 text-[#475467]">{item.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 pb-24 sm:px-10">
        <div className="mx-auto grid max-w-[1280px] gap-8 rounded-3xl border border-[#0058bc] bg-[#0058bc] p-7 text-white shadow-[0_24px_70px_rgba(0,88,188,0.18)] lg:grid-cols-[0.85fr_1.15fr] sm:p-9">
          <div>
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15">
              <Globe2 className="h-7 w-7" />
            </div>
            <h2 className="mt-6 max-w-xl text-3xl font-bold tracking-tight">
              Designed to remove social media tool sprawl.
            </h2>
            <p className="mt-4 text-base font-medium leading-7 text-white/80">
              The goal is simple: help people create, publish, respond, and automate without
              jumping between disconnected tools.
            </p>
          </div>
          <div className="grid gap-3">
            {FACTS.map((fact) => (
              <div key={fact} className="flex gap-3 rounded-2xl bg-white/10 p-4">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-white" />
                <p className="text-sm font-semibold leading-6 text-white/90">{fact}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
