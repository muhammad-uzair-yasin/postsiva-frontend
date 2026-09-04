"use client";

import { LightFeaturesCatalogGrid } from "@/components/marketing/features/LightFeaturesCatalogGrid";
import { LightFeaturesSplitSection } from "@/components/marketing/features/LightFeaturesSplitSection";
import { FEATURES_PAGE_SECTIONS } from "@/lib/marketing/featuresPageSections";

export function LightFeaturesPage(): React.ReactElement {
  return (
    <main className="flex-grow pb-20 pt-24">
      <section className="mx-auto max-w-[1280px] px-4 py-16 text-center sm:px-10">
        <h1 className="mb-6 font-[family-name:var(--font-headline)] text-4xl font-bold tracking-tight text-[#111827] sm:text-5xl lg:text-[3rem] lg:leading-[1.15]">
          Master your social workflows.
        </h1>
        <p className="mx-auto mb-12 max-w-2xl text-base leading-relaxed text-[#4B5563] sm:text-lg">
          Discover the tools designed to bring clarity to chaos. Postsiva combines powerful
          creation features with a unified command center for all your communications.
        </p>
      </section>

      {FEATURES_PAGE_SECTIONS.map((section) => (
        <LightFeaturesSplitSection
          key={section.id}
          id={section.id}
          label={section.label}
          icon={section.icon}
          title={section.title}
          description={section.description}
          bullets={section.bullets}
          image={section.image}
          imageAlt={section.imageAlt}
          reverse={section.reverse}
          subtleBg={section.subtleBg}
          inboxCta={section.inboxCta}
        />
      ))}

      <LightFeaturesCatalogGrid />
    </main>
  );
}
