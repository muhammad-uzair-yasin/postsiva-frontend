"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { fetchUserAppearance, saveUserAppearance } from "@/lib/theme/appearanceApi";
import {
  DEFAULT_LAYOUT_MODE,
  LAYOUT_STORAGE_KEY,
  type LayoutMode,
} from "@/lib/theme/themeConstants";

interface WorkspaceLayoutContextValue {
  layoutMode: LayoutMode;
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (collapsed: boolean) => void;
  /** True while pointer is over the collapsed sidebar (desktop/tablet hover expand). */
  sidebarHovered: boolean;
  setSidebarHovered: (hovered: boolean) => void;
  /** Sidebar is visually wide: pinned open or hover-expanded while collapsed. */
  sidebarExpanded: boolean;
  /** Mobile-only: whether the sidebar drawer is open (< 1024px) */
  sidebarMobileOpen: boolean;
  setSidebarMobileOpen: (open: boolean) => void;
}

const WorkspaceLayoutContext = createContext<WorkspaceLayoutContextValue | null>(null);

const MOBILE_BREAKPOINT = 1024;
const DESKTOP_BREAKPOINT = 1280;

export function WorkspaceLayoutProvider({ children }: { children: ReactNode }) {
  const layoutMode = DEFAULT_LAYOUT_MODE;
  const [sidebarCollapsed, setSidebarCollapsedState] = useState(false);
  const [sidebarHovered, setSidebarHovered] = useState(false);
  const [sidebarMobileOpen, setSidebarMobileOpen] = useState(false);
  const sidebarExpanded = !sidebarCollapsed || sidebarHovered;

  useEffect(() => {
    const storedMode = localStorage.getItem(LAYOUT_STORAGE_KEY);
    if (storedMode !== DEFAULT_LAYOUT_MODE) {
      localStorage.setItem(LAYOUT_STORAGE_KEY, DEFAULT_LAYOUT_MODE);
    }

    let cancelled = false;
    void (async () => {
      try {
        const remote = await fetchUserAppearance();
        if (cancelled || !remote || remote.layout_mode === DEFAULT_LAYOUT_MODE) return;
        await saveUserAppearance({ layout_mode: DEFAULT_LAYOUT_MODE });
      } catch {
        /* keep local sidebar */
      }
    })();

    const w = window.innerWidth;
    if (w < MOBILE_BREAKPOINT) {
      setSidebarCollapsedState(true);
    } else {
      const storedCollapsed = localStorage.getItem("workspace-sidebar-collapsed");
      if (storedCollapsed !== null) {
        setSidebarCollapsedState(storedCollapsed === "true");
      } else {
        setSidebarCollapsedState(w < DESKTOP_BREAKPOINT);
      }
    }

    const onResize = (): void => {
      if (window.innerWidth < MOBILE_BREAKPOINT) {
        setSidebarMobileOpen(false);
        setSidebarCollapsedState(true);
      }
    };

    window.addEventListener("resize", onResize, { passive: true });
    return () => {
      cancelled = true;
      window.removeEventListener("resize", onResize);
    };
  }, []);

  const setSidebarCollapsed = useCallback((collapsed: boolean): void => {
    setSidebarCollapsedState(collapsed);
    if (collapsed) {
      setSidebarHovered(false);
    }
    if (window.innerWidth >= MOBILE_BREAKPOINT) {
      localStorage.setItem("workspace-sidebar-collapsed", String(collapsed));
    }
  }, []);

  const value = useMemo(
    (): WorkspaceLayoutContextValue => ({
      layoutMode,
      sidebarCollapsed,
      setSidebarCollapsed,
      sidebarHovered,
      setSidebarHovered,
      sidebarExpanded,
      sidebarMobileOpen,
      setSidebarMobileOpen,
    }),
    [
      layoutMode,
      sidebarCollapsed,
      setSidebarCollapsed,
      sidebarHovered,
      sidebarExpanded,
      sidebarMobileOpen,
    ],
  );

  return (
    <WorkspaceLayoutContext.Provider value={value}>
      {children}
    </WorkspaceLayoutContext.Provider>
  );
}

export function useWorkspaceLayout() {
  const ctx = useContext(WorkspaceLayoutContext);
  if (!ctx) {
    throw new Error("useWorkspaceLayout must be used within WorkspaceLayoutProvider");
  }
  return ctx;
}
