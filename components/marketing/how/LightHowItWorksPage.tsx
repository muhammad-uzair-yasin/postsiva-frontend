import Image, { type StaticImageData } from "next/image";
import Link from "next/link";
import { ArrowRight, CalendarDays, CheckCircle2, Plug, Sparkles } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { marketingImageContentManager } from "@/components/marketing/productScreens/contentManager";
import { marketingImagePostComposer } from "@/components/marketing/productScreens/postComposer";
import { marketingImageWorkspaces } from "@/components/marketing/productScreens/workspaces";
import { SocialPlatformIcon } from "@/lib/social/SocialPlatformIcon";
import type { SocialPlatformIconId } from "@/lib/social/socialPlatformIconSrc";

const PLATFORMS: readonly SocialPlatformIconId[] = [
  "linkedin",
  "facebook",
  "instagram",
  "tiktok",
  "youtube",
  "threads",
];

const STEPS: readonly {
  number: string;
  title: string;
  body: string;
  icon: LucideIcon;
  image: StaticImageData;
  bullets: readonly string[];
}[] = [
  {
    number: "01",
    title: "Connect your workspace",
    body: "Add the social accounts, brand context, media, and team setup you want Postsiva to operate from.",
    icon: Plug,
    image: marketingImageWorkspaces,
    bullets: ["One workspace per brand or client", "Accounts and permissions stay organized", "Piva keeps context for future work"],
  },
  {
    number: "02",
    title: "Create with previews and AI",
    body: "Write once, adapt per channel, generate or attach visuals, and preview how each network will render the post.",
    icon: Sparkles,
    image: marketingImagePostComposer,
    bullets: ["AI captions, rewrites, and ideas", "Real channel previews before publish", "Image generation and creative support"],
  },
  {
    number: "03",
    title: "Schedule, publish, and respond",
    body: "Use the calendar, content manager, inbox, analytics, API keys, and MCP workflows to keep social operations moving.",
    icon: CalendarDays,
    image: marketingImageContentManager,
    bullets: ["Calendar and content manager", "Unified comments and replies", "Automation through Piva, MCP, and API"],
  },
];

export function LightHowItWorksPage(): React.ReactElement {
  return (
    <main className="bg-white">
      <section className="border-b border-[#dbe3ef] bg-[#f7fbff] px-4 pb-16 pt-28 sm:px-10 sm:pt-32">
        <div className="mx-auto grid max-w-[1280px] gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#0058bc]">
              How it works
            </p>
            <h1 className="mt-4 max-w-3xl font-[family-name:var(--font-headline)] text-4xl font-bold tracking-tight text-[#111827] sm:text-6xl">
              From connected accounts to published posts in one workspace.
            </h1>
            <p className="mt-5 max-w-2xl text-lg font-medium leading-8 text-[#475467]">
              Postsiva brings composer, calendar, inbox, analytics, AI, image generation, MCP, and
              API automation into a simple operating flow.
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
                href="/pricing"
                className="inline-flex items-center justify-center rounded-xl border border-[#bfdbfe] bg-white px-6 py-3 text-sm font-bold text-[#0058bc] hover:bg-[#eff6ff]"
              >
                See pricing
              </Link>
            </div>
          </div>

          <div className="rounded-3xl border border-[#dbe3ef] bg-white p-6 shadow-[0_24px_70px_rgba(15,23,42,0.1)]">
            <div className="rounded-2xl bg-[#111827] p-4">
              <Image
                src={marketingImagePostComposer}
                alt="Postsiva composer preview workflow"
                width={marketingImagePostComposer.width}
                height={marketingImagePostComposer.height}
                className="h-auto w-full rounded-xl border border-white/10"
                placeholder="blur"
                priority
              />
            </div>
            <div className="mt-5 flex flex-wrap gap-2">
              {PLATFORMS.map((platform) => (
                <span
                  key={platform}
                  className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#dbe3ef] bg-[#f7fbff]"
                >
                  <SocialPlatformIcon platform={platform} className="h-5 w-5" alt="" />
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 py-16 sm:px-10 sm:py-20">
        <div className="mx-auto max-w-[1280px]">
          <div className="grid gap-6">
            {STEPS.map((step, index) => (
              <article
                key={step.number}
                className="grid gap-6 rounded-3xl border border-[#dbe3ef] bg-white p-6 shadow-[0_18px_45px_rgba(15,23,42,0.07)] lg:grid-cols-[0.85fr_1.15fr] lg:items-center lg:p-8"
              >
                <div className={index % 2 === 1 ? "lg:order-2" : ""}>
                  <div className="flex items-center gap-4">
                    <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#0058bc] text-white shadow-[0_16px_36px_rgba(0,88,188,0.24)]">
                      <step.icon className="h-6 w-6" />
                    </span>
                    <div>
                      <p className="font-mono text-xs font-bold text-[#0058bc]">{step.number}</p>
                      <h2 className="mt-1 text-2xl font-bold text-[#111827]">{step.title}</h2>
                    </div>
                  </div>
                  <p className="mt-5 text-base font-medium leading-7 text-[#475467]">
                    {step.body}
                  </p>
                  <ul className="mt-6 grid gap-3">
                    {step.bullets.map((bullet) => (
                      <li key={bullet} className="flex gap-3 text-sm font-semibold text-[#111827]">
                        <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-[#0058bc]" />
                        {bullet}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="rounded-2xl border border-[#dbe3ef] bg-[#f7fbff] p-3">
                  <Image
                    src={step.image}
                    alt=""
                    width={step.image.width}
                    height={step.image.height}
                    className="h-auto w-full rounded-xl border border-[#dbe3ef]"
                    placeholder="blur"
                    sizes="(max-width: 1024px) 100vw, 620px"
                  />
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
