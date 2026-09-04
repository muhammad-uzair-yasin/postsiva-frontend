"use client";

import {
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";
import Image from "next/image";
import { Children, cloneElement, isValidElement, useMemo, useRef } from "react";
import type { StaticImageData } from "next/image";

import {
  LIGHT_UPDATE_IMAGES,
  lightLandingPiva,
  lightLandingWorkspace,
} from "@/components/marketing/light/light-images";
import { marketingImageComposeWithPreview } from "@/components/marketing/productScreens/composeWithPreview";
import { marketingImageDashboard } from "@/components/marketing/productScreens/dashboard";
import { marketingImageWhatsapp } from "@/components/marketing/productScreens/whatsapp";
import { cn } from "@/lib/cn";

interface LightDepthScrollStageProps {
  readonly children: React.ReactNode;
  readonly itemWeights?: readonly number[];
}

interface DepthStageItemProps {
  readonly children: React.ReactNode;
  readonly index: number;
  readonly progress: ReturnType<typeof useSpring>;
  readonly rangeStart: number;
  readonly rangeEnd: number;
  readonly depthStageRef: React.RefObject<HTMLDivElement | null>;
}

const SECTION_PREVIEWS: readonly { label: string; image: StaticImageData }[] = [
  { label: "Product", image: marketingImageDashboard },
  { label: "Vision", image: lightLandingPiva },
  { label: "Brand", image: lightLandingWorkspace },
  { label: "Workflow", image: marketingImageComposeWithPreview },
  { label: "Pricing", image: LIGHT_UPDATE_IMAGES.pricing },
  { label: "Updates", image: LIGHT_UPDATE_IMAGES.features },
  { label: "Contact", image: marketingImageWhatsapp },
];

function computeIndicatorProgress(
  value: number,
  ranges: readonly { start: number; end: number }[],
): number {
  const total = ranges.length;
  if (total <= 1) return value;

  const productRange = ranges[0];
  if (!productRange) return value;

  const nextSectionMark = 1 / Math.max(total - 1, 1);
  const productReached = nextSectionMark * 0.42;
  const productMax = nextSectionMark * 0.82;

  if (value < productRange.start) {
    const t = value / Math.max(productRange.start, 0.0001);
    return t * productReached;
  }
  if (value < productRange.end) {
    const local =
      (value - productRange.start) /
      Math.max(productRange.end - productRange.start, 0.0001);
    return productReached + local * (productMax - productReached);
  }

  for (let index = 1; index < total; index += 1) {
    const range = ranges[index];
    if (!range) continue;
    if (value >= range.start && value <= range.end) {
      const local =
        (value - range.start) / Math.max(range.end - range.start, 0.0001);
      const to = index / (total - 1);
      const from = index === 1 ? productMax : (index - 1) / (total - 1);
      return from + local * (to - from);
    }
  }

  return value >= (ranges[total - 1]?.end ?? 1) ? 1 : productMax;
}

function DepthStageIndicator({
  total,
  progress,
  stageRef,
  ranges,
}: {
  readonly total: number;
  readonly progress: ReturnType<typeof useSpring>;
  readonly stageRef: React.RefObject<HTMLDivElement | null>;
  readonly ranges: readonly { start: number; end: number }[];
}): React.ReactElement {
  const indicatorProgress = useTransform(progress, (value) =>
    computeIndicatorProgress(value, ranges),
  );
  const progressHeight = useTransform(indicatorProgress, [0, 1], ["0%", "100%"]);

  const goToSection = (index: number): void => {
    const stage = stageRef.current;
    if (!stage) return;

    const top = stage.getBoundingClientRect().top + window.scrollY;
    const scrollable = Math.max(stage.offsetHeight - window.innerHeight, 0);
    const range = ranges[index];
    const midpoint = range ? (range.start + range.end) / 2 : (index + 0.5) / total;
    const target = top + scrollable * midpoint;
    window.scrollTo({ top: target, behavior: "smooth" });
  };

  return (
    <div
      aria-label="Landing section navigation"
      className="absolute right-5 top-1/2 z-30 hidden h-[66vh] -translate-y-1/2 items-center gap-3 md:flex"
    >
      <div className="relative h-full w-1.5 overflow-hidden rounded-full bg-white shadow-[0_0_0_1px_rgba(0,88,188,0.18),0_12px_28px_rgba(15,23,42,0.12)]">
        <motion.div
          className="absolute left-0 top-0 w-full rounded-full bg-[#0058bc]"
          style={{ height: progressHeight }}
        />
      </div>
      <div className="flex h-full flex-col justify-between">
        {Array.from({ length: total }).map((_, index) => (
          <button
            key={index}
            type="button"
            onClick={() => goToSection(index)}
            className="group flex items-center gap-2 rounded-xl bg-white/95 p-1.5 text-left shadow-[0_10px_28px_rgba(15,23,42,0.14)] ring-1 ring-[#0058bc]/15 backdrop-blur transition hover:-translate-x-1 hover:ring-[#0058bc]/45 focus:outline-none focus:ring-2 focus:ring-[#0058bc]"
            aria-label={`Go to ${SECTION_PREVIEWS[index]?.label ?? `section ${index + 1}`}`}
          >
            <span className="relative h-10 w-14 overflow-hidden rounded-lg border border-[#bfdbfe] bg-slate-950">
              <Image
                src={SECTION_PREVIEWS[index]?.image ?? marketingImageDashboard}
                alt=""
                fill
                sizes="56px"
                className="object-cover object-top transition-transform duration-300 group-hover:scale-110"
              />
            </span>
            <span className="hidden min-w-16 text-[10px] font-bold uppercase tracking-wide text-slate-700 xl:block">
              {SECTION_PREVIEWS[index]?.label ?? `Section ${index + 1}`}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

function DepthStageItem({
  children,
  index,
  progress,
  rangeStart,
  rangeEnd,
  depthStageRef,
}: DepthStageItemProps): React.ReactElement {
  const span = Math.max(rangeEnd - rangeStart, 0.0001);
  const inset = Math.min(span * 0.18, 0.08);
  const enter = rangeStart;
  const holdStart = Math.min(rangeStart + inset, rangeEnd);
  const holdEnd = Math.max(rangeEnd - inset, rangeStart);
  const leave = rangeEnd;
  const drift = index % 2 === 0 ? -10 : 10;
  const localProgress = useTransform(progress, [holdStart, holdEnd], [0, 1]);
  const opacity = useTransform(
    progress,
    [enter, holdStart, holdEnd, leave],
    [0, 1, 1, 0],
  );
  const pointerEvents = useTransform(progress, (value) =>
    value >= holdStart && value <= holdEnd ? "auto" : "none",
  );
  const scale = useTransform(
    progress,
    [enter, holdStart, holdEnd, leave],
    [0.9, 1, 1, 1.08],
  );
  const z = useTransform(
    progress,
    [enter, holdStart, holdEnd, leave],
    [-160, 0, 0, 120],
  );
  const x = useTransform(
    progress,
    [enter, holdStart, holdEnd, leave],
    [drift, 0, 0, -drift],
  );
  const rotateX = useTransform(
    progress,
    [enter, holdStart, holdEnd, leave],
    [2, 0, 0, -2],
  );
  const childNode = isValidElement(children)
    ? cloneElement(
        children as React.ReactElement<{
          sectionProgress?: typeof localProgress;
          sectionRange?: { start: number; end: number };
          depthStageRef?: React.RefObject<HTMLDivElement | null>;
        }>,
        {
          sectionProgress: localProgress,
          sectionRange: { start: holdStart, end: holdEnd },
          depthStageRef,
        },
      )
    : children;

  const isProductDemo = index === 0;

  return (
    <motion.div
      aria-hidden={undefined}
      className={
        isProductDemo
          ? "absolute inset-0 flex items-center justify-center overflow-hidden px-2 py-2 sm:px-3 lg:px-4"
          : "absolute inset-0 flex items-center justify-center overflow-hidden px-3 py-8 sm:px-5 lg:px-8"
      }
      style={{
        opacity,
        pointerEvents,
        scale,
        z,
        x,
        rotateX,
        transformPerspective: 1400,
        transformStyle: "preserve-3d",
      }}
    >
      <div
        className={
          isProductDemo
            ? "w-full max-w-[1920px] origin-center scale-[0.92] sm:scale-[0.94] lg:scale-[0.92] xl:scale-[0.97] 2xl:scale-[1]"
            : "w-full max-w-[1680px] origin-center scale-[0.72] sm:scale-[0.76] lg:scale-[0.64] xl:scale-[0.72] 2xl:scale-[0.78]"
        }
      >
        {childNode}
      </div>
    </motion.div>
  );
}

export function LightDepthScrollStage({
  children,
  itemWeights,
}: LightDepthScrollStageProps): React.ReactElement {
  const reduceMotion = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const items = Children.toArray(children);
  const ranges = useMemo(() => {
    const weights = items.map((_, index) => Math.max(itemWeights?.[index] ?? 1, 1));
    const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
    return weights.reduce<{ start: number; end: number; cursor: number }[]>(
      (accumulator, weight) => {
        const previousCursor = accumulator[accumulator.length - 1]?.cursor ?? 0;
        const nextCursor = previousCursor + weight;
        accumulator.push({
          start: previousCursor / totalWeight,
          end: nextCursor / totalWeight,
          cursor: nextCursor,
        });
        return accumulator;
      },
      [],
    ).map(({ start, end }) => ({ start, end }));
  }, [itemWeights, items]);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });
  const progress = useSpring(scrollYProgress, {
    stiffness: 48,
    damping: 28,
    mass: 0.72,
  });

  if (reduceMotion) {
    return <div className="space-y-0">{items}</div>;
  }

  return (
    <>
      <div className="space-y-0 bg-[#f8fafc] md:hidden">{items}</div>
      <section
        ref={ref}
        data-landing-depth-stage
        data-product-range-end={ranges[0]?.end ?? 1}
        className={cn("relative hidden bg-[#f8fafc] md:block", "[height:calc(var(--depth-items)*100vh)]")}
        style={{ "--depth-items": items.length + 2 } as React.CSSProperties}
      >
        <div className="sticky top-0 h-screen overflow-hidden bg-[#f8fafc] [perspective:1400px] [transform-style:preserve-3d]">
          {items.map((item, index) => (
            <DepthStageItem
              key={index}
              index={index}
              progress={progress}
              rangeStart={ranges[index]?.start ?? 0}
              rangeEnd={ranges[index]?.end ?? 1}
              depthStageRef={ref}
            >
              {item}
            </DepthStageItem>
          ))}
          <DepthStageIndicator
            total={items.length}
            progress={progress}
            stageRef={ref}
            ranges={ranges}
          />
        </div>
      </section>
    </>
  );
}
