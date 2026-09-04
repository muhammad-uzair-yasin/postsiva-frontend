"use client";

import { fadeUp, staggerContainer } from "@/components/marketing/motion-variants";
import type { StaticImageData } from "next/image";
import { LightScreenshotFrame, lightAccentBar } from "@/components/marketing/light/LightScreenshotFrame";
import { motion, useReducedMotion } from "framer-motion";

interface FeatureItem {
  readonly title: string;
  readonly body: string;
  readonly active?: boolean;
}

interface LightFeatureSplitProps {
  readonly image: StaticImageData;
  readonly imageAlt: string;
  readonly heading: string;
  readonly items: readonly FeatureItem[];
  readonly reverse?: boolean;
}

export function LightFeatureSplit({
  image,
  imageAlt,
  heading,
  items,
  reverse = false,
}: LightFeatureSplitProps): React.ReactElement {
  const reduceMotion = useReducedMotion();

  return (
    <section className="mx-auto max-w-[1728px] px-6 py-16 sm:px-10 sm:py-24">
      <div
        className={`grid items-center gap-12 lg:grid-cols-2 lg:gap-[100px] ${reverse ? "" : ""}`}
      >
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, x: reverse ? 24 : -24 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
          className={`relative overflow-hidden rounded-[40px] border border-[#D9D7D0]/30 bg-gradient-to-br from-[#F4F3EF] to-[#E9E8E4] p-6 shadow-sm sm:p-8 ${reverse ? "lg:order-2" : ""}`}
        >
          <LightScreenshotFrame
            src={image}
            alt={imageAlt}
            sizes="(max-width: 1024px) 100vw, 50vw"
          />
        </motion.div>

        <motion.div
          variants={staggerContainer}
          initial={reduceMotion ? false : "hidden"}
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          className={reverse ? "lg:order-1" : ""}
        >
          <motion.h3
            variants={fadeUp}
            custom={0}
            className="mb-10 font-[family-name:var(--font-headline)] text-2xl font-bold tracking-tight text-[#1B1B1B] sm:text-[2rem]"
          >
            {heading}
          </motion.h3>
          <div className="relative space-y-10 border-l-[3px] border-[#D9D7D0] pl-8">
            <div className={`absolute left-[-3px] top-0 h-1/3 w-[3px] ${lightAccentBar}`} />
            {items.map((item, i) => (
              <motion.div
                key={item.title}
                variants={fadeUp}
                custom={i + 1}
                className={item.active === false ? "opacity-50 transition-opacity hover:opacity-100" : undefined}
              >
                <h4 className="mb-2 text-lg font-bold text-[#1B1B1B]">{item.title}</h4>
                <p className="text-[15px] leading-relaxed text-[#8C8880]">{item.body}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
