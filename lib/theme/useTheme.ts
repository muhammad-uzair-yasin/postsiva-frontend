"use client";

import { useCallback, useEffect, useState } from "react";

import { saveUserAppearance, fetchUserAppearance } from "@/lib/theme/appearanceApi";
import {
  applyThemeToDocument,
  DEFAULT_THEME,
  isAppTheme,
  THEME_STORAGE_KEY,
  type AppTheme,
} from "@/lib/theme/themeConstants";

function readLocalTheme(): AppTheme {
  if (typeof window === "undefined") return DEFAULT_THEME;
  const stored = localStorage.getItem(THEME_STORAGE_KEY);
  return isAppTheme(stored) ? stored : DEFAULT_THEME;
}

export function useTheme(): { theme: AppTheme; setTheme: (t: AppTheme) => void } {
  const [theme, setThemeState] = useState<AppTheme>(DEFAULT_THEME);

  useEffect(() => {
    const initial = readLocalTheme();
    setThemeState(initial);
    applyThemeToDocument(initial);

    let cancelled = false;
    void (async () => {
      try {
        const remote = await fetchUserAppearance();
        if (cancelled || !remote || !isAppTheme(remote.theme)) return;
        setThemeState(remote.theme);
        localStorage.setItem(THEME_STORAGE_KEY, remote.theme);
        applyThemeToDocument(remote.theme);
      } catch {
        /* keep local */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const setTheme = useCallback((t: AppTheme) => {
    setThemeState(t);
    localStorage.setItem(THEME_STORAGE_KEY, t);
    applyThemeToDocument(t);
    void saveUserAppearance({ theme: t }).catch(() => {
      /* offline / logged out — local still applied */
    });
  }, []);

  return { theme, setTheme };
}
