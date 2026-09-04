"use client";

import { usePublicTranslations } from "@/lib/i18n/PublicLocaleProvider";
import {
  Bot,
  CalendarDays,
  Layers,
  Share2,
  type LucideIcon,
} from "lucide-react";

export function HeroHighlightsRow(): React.ReactElement {
  const { t } = usePublicTranslations();

  const highlights: readonly {
    title: string;
    label: string;
    Icon: LucideIcon;
  }[] = [
    { title: "10+", label: t("marketing.highlightChannelsLabel"), Icon: Share2 },
    {
      title: t("marketing.highlightComposerTitle"),
      label: t("marketing.highlightComposerLabel"),
      Icon: Layers,
    },
    {
      title: t("marketing.highlightAiStackTitle"),
      label: t("marketing.highlightAiStackLabel"),
      Icon: Bot,
    },
    {
      title: t("marketing.highlightCalendarTitle"),
      label: t("marketing.highlightCalendarLabel"),
      Icon: CalendarDays,
    },
  ];

  return (
    <div className="mt-20 grid w-full max-w-5xl grid-cols-2 gap-3 sm:mx-auto sm:gap-4 lg:mx-0 lg:max-w-none lg:grid-cols-4">
      {highlights.map((item, i) => (
        <div
          key={item.label}
          className="group motion-safe:animate-[marketing-fade-up_0.55s_ease-out_both] transition-transform duration-300 hover:-translate-y-2"
          style={{ animationDelay: `${340 + i * 90}ms` }}
        >
          <div className="relative rounded-2xl p-px transition-shadow duration-500 group-hover:shadow-[0_0_40px_-8px_rgba(204,190,255,0.45)]">
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/35 via-white/5 to-secondary/25 opacity-60 blur-[1px] transition-opacity duration-500 group-hover:opacity-100" />
            <div className="relative overflow-hidden rounded-[15px] border border-white/10 bg-surface-container-low/92 text-left shadow-[0_20px_50px_-24px_rgba(0,0,0,0.85)] backdrop-blur-md transition-colors duration-300 group-hover:border-primary/30">
              <div className="marketing-card-shine rounded-[15px] opacity-50" />
              <div className="pointer-events-none absolute -right-6 -top-10 h-28 w-28 rounded-full bg-gradient-to-br from-primary/25 to-transparent opacity-40 transition-all duration-500 group-hover:scale-125 group-hover:opacity-70" />
              <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/35 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
              <div className="relative z-10 p-4 sm:p-5">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary/25 to-secondary/10 text-primary ring-1 ring-inset ring-white/10 transition-transform duration-300 group-hover:scale-110 group-hover:text-secondary sm:h-11 sm:w-11">
                  <item.Icon className="h-[1.15rem] w-[1.15rem] sm:h-5 sm:w-5" strokeWidth={2.25} />
                </div>
                <p className="text-lg font-black leading-snug tracking-tight text-on-surface sm:text-xl">
                  {item.title}
                </p>
                <p className="mt-2 text-[10px] font-bold uppercase tracking-[0.18em] text-on-surface-variant/90 sm:text-[11px] sm:tracking-[0.22em]">
                  {item.label}
                </p>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
