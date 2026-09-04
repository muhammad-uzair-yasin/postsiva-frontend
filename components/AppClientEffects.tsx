"use client";

import { useEffect, type ReactElement } from "react";

import { SessionExpiredModal } from "@/components/auth/SessionExpiredModal";
import { PaddleCheckoutReturn } from "@/components/billing/PaddleCheckoutReturn";
import {
  applyThemeToDocument,
  DEFAULT_THEME,
  isAppTheme,
  THEME_STORAGE_KEY,
} from "@/lib/theme/themeConstants";

/**
 * Global client side-effects (theme, Paddle return, session expiry).
 * Mount from existing client shells — not the root layout (Next 16 / React 19
 * lazy-boundary bug when root layout imports a client island).
 */
export function AppClientEffects(): ReactElement {
  useEffect(() => {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    applyThemeToDocument(isAppTheme(stored) ? stored : DEFAULT_THEME);
  }, []);

  return (
    <>
      <PaddleCheckoutReturn />
      <SessionExpiredModal />
    </>
  );
}
