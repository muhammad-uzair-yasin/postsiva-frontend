"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

import { AnimatedMarketingStat } from "@/components/marketing/AnimatedMarketingStat";
import {
  LIGHT_HERO_BENTO_COLUMNS,
  LIGHT_HERO_CREATORS,
  LIGHT_HERO_STATS,
  type LightHeroStatKey,
} from "@/components/marketing/light/lightHeroBento";
import {
  fetchPublicPlatformStats,
  type PublicPlatformStats,
} from "@/lib/marketing/platformStatsApi";
import { cn } from "@/lib/cn";

function statTarget(
  stats: PublicPlatformStats | null,
  key: LightHeroStatKey,
): number | null {
  if (!stats?.success) return null;
  if (key === "posts_created") return stats.posts_created;
  if (key === "posts_published") return stats.posts_published;
  return stats.comments_posted;
}

function StatCard({
  label,
  bg,
  text,
  target,
  delayMs,
  tall = false,
}: {
  label: string;
  bg: string;
  text: string;
  target: number | null;
  delayMs: number;
  tall?: boolean;
}): React.ReactElement {
  return (
    <div
      className={cn(
        "flex flex-col justify-between rounded-[1.75rem] p-6 sm:p-7",
        bg,
        text,
        tall ? "min-h-[220px] sm:min-h-[280px]" : "min-h-[160px] sm:min-h-[200px]",
      )}
    >
      <p
        className="font-[family-name:var(--font-headline)] text-4xl font-bold tabular-nums leading-[0.95] sm:text-5xl md:text-[3.5rem]"
        aria-live="polite"
      >
        <AnimatedMarketingStat target={target} delayMs={delayMs} showPlus />
      </p>
      <p className="mt-4 text-sm leading-snug opacity-80 sm:text-base">{label}</p>
    </div>
  );
}

function CreatorCard({
  name,
  role,
  image,
  tall = false,
}: {
  name: string;
  role: string;
  image: string;
  tall?: boolean;
}): React.ReactElement {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-[1.75rem] bg-[#E5E7EB]",
        tall ? "min-h-[280px] sm:min-h-[360px]" : "min-h-[200px] sm:min-h-[260px]",
      )}
    >
      <Image
        src={image}
        alt={`${name}, ${role}`}
        fill
        className="object-cover object-center"
        sizes="(max-width: 768px) 45vw, 220px"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 p-5 text-white">
        <p className="font-semibold leading-tight">{name}</p>
        <p className="mt-0.5 text-sm text-white/75">{role}</p>
      </div>
    </div>
  );
}

export function LightHeroBentoGrid(): React.ReactElement {
  const [platformStats, setPlatformStats] = useState<PublicPlatformStats | null>(null);

  useEffect(() => {
    let cancelled = false;
    void fetchPublicPlatformStats().then((data) => {
      if (!cancelled && data?.success) setPlatformStats(data);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  function resolveItem(
    key: (typeof LIGHT_HERO_BENTO_COLUMNS)[number]["items"][number],
  ): React.ReactElement {
    if (key.startsWith("stat-")) {
      const index = Number(key.split("-")[1]);
      const stat = LIGHT_HERO_STATS[index]!;
      return (
        <StatCard
          key={key}
          label={stat.label}
          bg={stat.bg}
          text={stat.text}
          target={statTarget(platformStats, stat.statKey)}
          delayMs={index * 120}
          tall={index === 0}
        />
      );
    }
    const index = Number(key.split("-")[1]);
    const creator = LIGHT_HERO_CREATORS[index]!;
    return (
      <CreatorCard
        key={key}
        name={creator.name}
        role={creator.role}
        image={creator.image}
        tall={index !== 1}
      />
    );
  }

  return (
    <div className="mt-14 flex gap-3 overflow-x-auto pb-2 sm:mt-16 sm:gap-4 md:overflow-visible">
      {LIGHT_HERO_BENTO_COLUMNS.map((column, columnIndex) => (
        <div
          key={columnIndex}
          className={cn(
            "flex w-[42vw] min-w-[140px] shrink-0 flex-col gap-3 sm:w-[200px] sm:gap-4 md:w-auto md:min-w-0 md:flex-1",
            column.offsetClass,
          )}
        >
          {column.items.map((item) => resolveItem(item))}
        </div>
      ))}
    </div>
  );
}
