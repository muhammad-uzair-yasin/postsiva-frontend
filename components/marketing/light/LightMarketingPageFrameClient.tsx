"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

import { PublicLocaleBoundary } from "@/components/i18n/PublicLocaleBoundary";
import { LandingAssistantFabIdle } from "@/components/marketing/LandingAssistantFabIdle";

const LandingSocialOrbitBackground = dynamic(
  () =>
    import("@/components/marketing/light/LandingSocialOrbitBackground").then((m) => ({
      default: m.LandingSocialOrbitBackground,
    })),
  { ssr: false },
);

interface LightMarketingPageFrameClientProps {
  readonly children: React.ReactNode;
  readonly showOrbitBelowHero?: boolean;
}

export function LightMarketingPageFrameClient({
  children,
  showOrbitBelowHero = false,
}: LightMarketingPageFrameClientProps): React.ReactElement {
  const [showOrbit, setShowOrbit] = useState(false);

  useEffect(() => {
    if (!showOrbitBelowHero) return;

    const update = (): void => {
      const footer = document.querySelector<HTMLElement>("[data-landing-footer]");
      const footerVisible = footer
        ? footer.getBoundingClientRect().top < window.innerHeight
        : false;

      let inProductDemo = false;
      const depthStage = document.querySelector<HTMLElement>("[data-landing-depth-stage]");
      if (depthStage && window.innerWidth >= 768) {
        const productRangeEnd = Number.parseFloat(
          depthStage.dataset.productRangeEnd ?? "1",
        );
        const top = depthStage.getBoundingClientRect().top + window.scrollY;
        const scrollable = Math.max(depthStage.offsetHeight - window.innerHeight, 0);
        if (scrollable > 0) {
          const progress = Math.min(
            Math.max((window.scrollY - top) / scrollable, 0),
            1,
          );
          inProductDemo = progress < productRangeEnd;
        }
      }

      setShowOrbit(
        window.scrollY > window.innerHeight * 0.88 &&
          !footerVisible &&
          !inProductDemo,
      );
    };

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [showOrbitBelowHero]);

  return (
    <PublicLocaleBoundary>
      <div className="relative min-h-screen w-full min-w-0 max-w-full overflow-x-clip bg-white font-[family-name:var(--font-body)] text-[#111827] antialiased selection:bg-[#d8e2ff] selection:text-[#001a41]">
        {showOrbitBelowHero ? (
          <div
            aria-hidden
            className={`pointer-events-none fixed inset-0 z-20 overflow-hidden transition-opacity duration-300 ${
              showOrbit ? "opacity-50" : "opacity-0"
            }`}
          >
            <LandingSocialOrbitBackground />
          </div>
        ) : null}
        <div className="relative z-10">
          {children}
        </div>
        <LandingAssistantFabIdle />
      </div>
    </PublicLocaleBoundary>
  );
}
