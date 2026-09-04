"use client";

import dynamic from "next/dynamic";
import { useEffect, useState, type ReactElement } from "react";

/**
 * Defers mounting the landing assistant until idle (or ~2s), so first paint
 * is not charged for markdown/chat bundle. Auth pages skip this entirely.
 */
export function LandingAssistantFabIdle(): ReactElement | null {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const enable = (): void => {
      if (!cancelled) {
        setReady(true);
      }
    };
    const ric = (
      window as Window & {
        requestIdleCallback?: (
          cb: () => void,
          opts?: { timeout: number },
        ) => number;
        cancelIdleCallback?: (id: number) => void;
      }
    ).requestIdleCallback;
    if (typeof ric === "function") {
      const id = ric(enable, { timeout: 2500 });
      return () => {
        cancelled = true;
        window.cancelIdleCallback?.(id);
      };
    }
    const t = window.setTimeout(enable, 2000);
    return () => {
      cancelled = true;
      window.clearTimeout(t);
    };
  }, []);

  if (!ready) {
    return null;
  }

  return <LandingAssistantFabLazy />;
}

const LandingAssistantFabLazy = dynamic(
  () =>
    import("@/components/marketing/LandingAssistantFab").then((m) => ({
      default: m.LandingAssistantFab,
    })),
  { ssr: false },
);
