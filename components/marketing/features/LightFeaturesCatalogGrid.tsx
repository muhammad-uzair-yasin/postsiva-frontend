"use client";

import Link from "next/link";

import {
  FEATURES_CATALOG,
  FEATURES_CATALOG_COUNT,
  featureCatalogItemId,
  featureHelpHref,
} from "@/lib/marketing/featuresCatalog";
import { cn } from "@/lib/cn";

export function LightFeaturesCatalogGrid(): React.ReactElement {
  return (
    <section className="border-t border-[#E5E7EB] bg-white py-20">
      <div className="mx-auto max-w-[1280px] px-4 sm:px-10">
        <div className="mb-12 max-w-2xl">
          <p className="font-mono text-xs font-semibold uppercase tracking-wider text-[#0058bc]">
            Full stack
          </p>
          <h2 className="mt-2 font-[family-name:var(--font-headline)] text-2xl font-semibold text-[#111827] sm:text-[2rem]">
            Explore all features
          </h2>
          <p className="mt-3 text-base text-[#4B5563]">
            {FEATURES_CATALOG_COUNT} capabilities across publishing, scheduling, AI, inbox, analytics,
            platforms, and developer tools.
          </p>
        </div>

        <div className="space-y-16">
          {FEATURES_CATALOG.map((category) => (
            <div key={category.id}>
              <h3 className="mb-6 font-[family-name:var(--font-headline)] text-xl font-semibold text-[#111827]">
                {category.title}
              </h3>
              <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {category.features.map((feature) => {
                  const href = featureHelpHref(feature, category.id);
                  const external = href.startsWith("http");
                  const className = cn(
                    "group scroll-mt-28 flex h-full flex-col rounded-xl border border-[#E5E7EB] bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-[#0058bc]/35 hover:shadow-[0_18px_40px_rgba(0,88,188,0.08)]",
                    "target:border-[#0058bc] target:bg-[#F8FBFF] target:shadow-[0_0_0_4px_rgba(0,88,188,0.12)]",
                  );
                  const inner = (
                    <>
                      <div className="mb-3 flex items-start justify-between gap-2">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-[#BFDBFE] bg-white text-[#0058bc] shadow-sm">
                          <span
                            className="material-symbols-outlined text-[22px] leading-none"
                            aria-hidden
                          >
                            {feature.icon}
                          </span>
                        </div>
                        {feature.tag ? (
                          <span className="rounded-full border border-[#BFDBFE] bg-[#EFF6FF] px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wide text-[#0058bc]">
                            {feature.tag}
                          </span>
                        ) : null}
                      </div>
                      <h4 className="mb-1.5 text-sm font-semibold text-[#111827] group-hover:text-[#0058bc]">
                        {feature.title}
                      </h4>
                      <p className="text-sm leading-relaxed text-[#4B5563]">
                        {feature.description}
                      </p>
                    </>
                  );

                  return (
                    <li key={feature.title}>
                      {external ? (
                        <a
                          id={feature.id ?? featureCatalogItemId(feature.title)}
                          href={href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={className}
                        >
                          {inner}
                        </a>
                      ) : (
                        <Link
                          id={feature.id ?? featureCatalogItemId(feature.title)}
                          href={href}
                          className={className}
                        >
                          {inner}
                        </Link>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
