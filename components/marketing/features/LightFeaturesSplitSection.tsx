"use client";

import Link from "next/link";
import type { StaticImageData } from "next/image";
import Image from "next/image";

type LightFeaturesSplitSectionProps = {
  readonly id: string;
  readonly label: string;
  readonly icon: string;
  readonly title: string;
  readonly description: string;
  readonly bullets?: readonly string[];
  readonly image: StaticImageData;
  readonly imageAlt: string;
  readonly reverse?: boolean;
  readonly subtleBg?: boolean;
  readonly inboxCta?: boolean;
};

function FeatureCopy({
  label,
  icon,
  title,
  description,
  bullets,
}: Pick<
  LightFeaturesSplitSectionProps,
  "label" | "icon" | "title" | "description" | "bullets"
>): React.ReactElement {
  return (
    <div className="flex flex-col gap-6">
      <div className="inline-flex w-max items-center gap-2 rounded-full border border-[#BFDBFE] bg-white px-3 py-1 shadow-sm">
        <span
          className="material-symbols-outlined text-sm text-[#0058bc]"
          style={{ fontVariationSettings: "'FILL' 1" }}
          aria-hidden
        >
          {icon}
        </span>
        <span className="font-mono text-xs font-semibold uppercase tracking-wider text-[#0058bc]">
          {label}
        </span>
      </div>
      <h2 className="font-[family-name:var(--font-headline)] text-2xl font-semibold text-[#111827] sm:text-[2rem] sm:leading-10">
        {title}
      </h2>
      <p className="text-base leading-relaxed text-[#4B5563]">{description}</p>
      {bullets?.length ? (
        <ul className="mt-2 flex flex-col gap-3">
          {bullets.map((item) => (
            <li key={item} className="flex items-start gap-3">
              <span className="material-symbols-outlined mt-0.5 text-[#0058bc]" aria-hidden>
                check_circle
              </span>
              <span className="text-sm text-[#4B5563]">{item}</span>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

function FeatureImage({
  image,
  imageAlt,
  inboxCta,
}: Pick<LightFeaturesSplitSectionProps, "image" | "imageAlt" | "inboxCta">): React.ReactElement {
  return (
    <div className="group relative overflow-hidden rounded-xl border border-[#E5E7EB] bg-white p-2 shadow-[0_20px_50px_rgba(0,88,188,0.05)] sm:p-3">
      <Image
        src={image}
        alt={imageAlt}
        width={image.width}
        height={image.height}
        placeholder="blur"
        className="h-auto w-full rounded-lg object-contain"
        sizes="(max-width: 768px) 100vw, 560px"
      />
      {inboxCta ? (
        <div className="absolute inset-0 flex items-center justify-center bg-white/40 opacity-0 backdrop-blur-sm transition-opacity duration-300 group-hover:opacity-100">
          <Link
            href="/help"
            className="rounded-xl bg-primary px-6 py-2 text-sm font-medium text-on-primary shadow-lg transition-colors hover:bg-[#004a9e]"
          >
            View Inbox
          </Link>
        </div>
      ) : null}
    </div>
  );
}

export function LightFeaturesSplitSection({
  id,
  label,
  icon,
  title,
  description,
  bullets,
  image,
  imageAlt,
  reverse = false,
  subtleBg = false,
  inboxCta = false,
}: LightFeaturesSplitSectionProps): React.ReactElement {
  const imageEl = <FeatureImage image={image} imageAlt={imageAlt} inboxCta={inboxCta} />;
  const copyEl = (
    <FeatureCopy
      label={label}
      icon={icon}
      title={title}
      description={description}
      bullets={bullets}
    />
  );

  const inner = (
    <div className="grid grid-cols-1 items-start gap-10 md:grid-cols-2 md:gap-12">
      <div className={reverse ? "order-2 md:order-1" : "order-1"}>
        {reverse ? copyEl : imageEl}
      </div>
      <div className={reverse ? "order-1 md:order-2" : "order-2"}>
        {reverse ? imageEl : copyEl}
      </div>
    </div>
  );

  if (subtleBg) {
    return (
      <section
        id={id}
        className="scroll-mt-28 bg-[#F9FAFB] py-16 transition-colors duration-700 target:bg-[#EAF4FF]"
      >
        <div className="mx-auto max-w-[1280px] px-4 sm:px-10">{inner}</div>
      </section>
    );
  }

  return (
    <section
      id={id}
      className="scroll-mt-28 bg-white py-16 transition-colors duration-700 target:bg-[#EAF4FF]"
    >
      <div className="mx-auto max-w-[1280px] px-4 sm:px-10">{inner}</div>
    </section>
  );
}
