"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  type MotionValue,
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
} from "framer-motion";
import {
  DemoPanel,
  DemoSidebar,
  type DemoTab,
  NAV_ITEMS,
} from "@/components/marketing/light/LightPublishedScheduleDemoParts";

interface LightPublishedScheduleDemoProps {
  readonly sectionProgress?: MotionValue<number>;
  readonly sectionRange?: { start: number; end: number };
  readonly depthStageRef?: React.RefObject<HTMLDivElement | null>;
}

export function LightPublishedScheduleDemo({
  sectionProgress,
  sectionRange,
  depthStageRef,
}: LightPublishedScheduleDemoProps): React.ReactElement {
  const [tab, setTab] = useState<DemoTab>("create-post");
  const reduceMotion = useReducedMotion();
  const activeItem = NAV_ITEMS.find((i) => i.key === tab) ?? NAV_ITEMS[0];
  const desktopPanelId = "landing-demo-panel-desktop";
  const activeIndex = Math.max(
    NAV_ITEMS.findIndex((item) => item.key === activeItem.key),
    0,
  );
  const interactionModeRef = useRef<"scroll" | "sidebar">("scroll");
  const fallbackProgress = useMotionValue(0);
  const scrollProgress = sectionProgress ?? fallbackProgress;

  const selectIndex = useCallback((index: number) => {
    const nextItem = NAV_ITEMS[index];
    if (nextItem) {
      setTab(nextItem.key);
    }
  }, []);

  const scrollToDemoIndex = useCallback(
    (index: number) => {
      const stage = depthStageRef?.current;
      if (!stage || !sectionRange) {
        return;
      }

      const top = stage.getBoundingClientRect().top + window.scrollY;
      const scrollable = Math.max(stage.offsetHeight - window.innerHeight, 0);
      const fraction =
        NAV_ITEMS.length > 1 ? index / (NAV_ITEMS.length - 1) : 0;
      const globalProgress =
        sectionRange.start +
        fraction * (sectionRange.end - sectionRange.start);

      window.scrollTo({
        top: top + scrollable * globalProgress,
        behavior: "auto",
      });
    },
    [depthStageRef, sectionRange],
  );

  const handleSelect = useCallback(
    (index: number) => {
      interactionModeRef.current = "sidebar";
      selectIndex(index);
      scrollToDemoIndex(index);
    },
    [scrollToDemoIndex, selectIndex],
  );

  useEffect(() => {
    if (!sectionProgress) return;

    const resumeScrollSync = (): void => {
      interactionModeRef.current = "scroll";
    };

    window.addEventListener("wheel", resumeScrollSync, { passive: true });
    window.addEventListener("touchmove", resumeScrollSync, { passive: true });
    return () => {
      window.removeEventListener("wheel", resumeScrollSync);
      window.removeEventListener("touchmove", resumeScrollSync);
    };
  }, [sectionProgress]);

  useMotionValueEvent(scrollProgress, "change", (value) => {
    if (!sectionProgress || reduceMotion) return;
    if (typeof window !== "undefined" && window.innerWidth < 768) return;
    if (interactionModeRef.current === "sidebar") return;

    const nextIndex = Math.min(
      NAV_ITEMS.length - 1,
      Math.max(0, Math.round(value * (NAV_ITEMS.length - 1))),
    );
    const nextItem = NAV_ITEMS[nextIndex];
    if (nextItem) {
      setTab((current) => (current === nextItem.key ? current : nextItem.key));
    }
  });

  const moveTab = useCallback(
    (direction: -1 | 1) => {
      const nextIndex = Math.min(Math.max(activeIndex + direction, 0), NAV_ITEMS.length - 1);
      if (nextIndex === activeIndex) {
        return false;
      }
      handleSelect(nextIndex);
      return true;
    },
    [activeIndex, handleSelect],
  );

  const handleTabKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (event.key === "ArrowDown" || event.key === "ArrowRight") {
        event.preventDefault();
        moveTab(1);
      } else if (event.key === "ArrowUp" || event.key === "ArrowLeft") {
        event.preventDefault();
        moveTab(-1);
      } else if (event.key === "Home") {
        event.preventDefault();
        handleSelect(0);
      } else if (event.key === "End") {
        event.preventDefault();
        handleSelect(NAV_ITEMS.length - 1);
      }
    },
    [moveTab, handleSelect],
  );

  return (
    <section
      aria-label="Dashboard demo"
      data-landing-product-demo
      className={sectionProgress ? "relative z-30 bg-[#f8fafc] py-2 sm:py-3" : "bg-[#f8fafc] py-16 sm:py-20"}
    >
      <div className="mx-auto w-full max-w-[1760px] px-3 sm:px-4 lg:px-6 xl:pr-28">
        <div className={sectionProgress ? "mb-3 text-center sm:mb-4" : "mb-8 text-center sm:mb-10"}>
          <h2
            className={[
              "mb-2 font-[family-name:var(--font-headline)] font-bold tracking-tight text-[#111827]",
              sectionProgress
                ? "text-xl sm:text-2xl lg:text-3xl"
                : "text-3xl sm:text-4xl lg:text-5xl",
            ].join(" ")}
          >
            Everything you need, one sidebar away
          </h2>
          {!sectionProgress ? (
            <p className="mx-auto max-w-3xl text-base font-medium text-[#667085] md:text-lg">
              Navigate your entire social workflow without switching tools. Keep scrolling through the main landing animation to move across each workspace page.
            </p>
          ) : (
            <p className="mx-auto max-w-2xl text-sm font-medium text-[#667085]">
              Scroll or use the sidebar to explore each workspace page.
            </p>
          )}
        </div>

        <div className="flex min-w-0 flex-col gap-3 md:flex-row md:items-stretch md:gap-4 lg:gap-5">
          <DemoSidebar
            tab={tab}
            panelId={desktopPanelId}
            idPrefix="landing-demo-desktop"
            onSelect={handleSelect}
            onKeyDown={handleTabKeyDown}
            compact={Boolean(sectionProgress)}
          />
          <DemoPanel
            activeItem={activeItem}
            activeIndex={activeIndex}
            panelId={desktopPanelId}
            idPrefix="landing-demo-desktop"
            onPrev={() => moveTab(-1)}
            onNext={() => moveTab(1)}
            onSelect={handleSelect}
            onKeyDown={handleTabKeyDown}
            showPager={!sectionProgress}
          />
        </div>
      </div>
    </section>
  );
}
