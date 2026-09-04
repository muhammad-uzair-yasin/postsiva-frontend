/**
 * Postsiva marketing 3-color system.
 * @see docs/ui/postsiva-marketing-colors.md
 */

/** Core — white */
export const POSTSIVA_WHITE = "#FFFFFF";
export const POSTSIVA_WHITE_SOFT = "#F9FAFB";

/** Core — light blue (brand) */
export const POSTSIVA_BLUE = "#0058BC";
export const POSTSIVA_BLUE_LIGHT = "#38BDF8";
export const POSTSIVA_BLUE_HOVER = "#004A9E";

/** Core — dark blue (navbar source of truth: `slate-900` / `slate-800`) */
export const POSTSIVA_DARK = "#0F172A";
export const POSTSIVA_DARK_PANEL = "#1E293B";
export const POSTSIVA_DARK_ELEVATED = "#0F1117";

/** Tailwind classes — match `MarketingNavbar.tsx` exactly */
export const marketingNavBar =
  "border-slate-800/80 bg-slate-900/90 backdrop-blur-xl shadow-2xl shadow-black/40";
export const marketingNavBarScrolled =
  "border-slate-800 bg-slate-900/95 backdrop-blur-xl shadow-lg shadow-black/30 ring-1 ring-white/10";
export const marketingNavSurface = "border-slate-800 bg-slate-900";
export const marketingNavSurfaceSoft = "border-slate-800 bg-slate-900/95";
export const marketingHeroBg = "bg-slate-900";
export const marketingHeroPanel =
  "border-slate-800 bg-slate-900/95 shadow-lg shadow-black/30 ring-1 ring-white/10 backdrop-blur-xl";

/** Body text on light backgrounds */
export const POSTSIVA_TEXT_PRIMARY = "#111827";
export const POSTSIVA_TEXT_SECONDARY = "#4B5563";

/** Legacy aliases (prefer POSTSIVA_* names) */
export const LP_PRIMARY = POSTSIVA_BLUE;
export const LP_PRIMARY_CONTAINER = "#0070EB";
export const LP_SURFACE_SUBTLE = POSTSIVA_WHITE_SOFT;

export const LP_LIVE_SUCCESS = "#10B981";

/** CSS variable names — use in style={{ color: 'var(--postsiva-blue)' }} */
export const postsivaCssVars = {
  white: "var(--postsiva-white)",
  whiteSoft: "var(--postsiva-white-soft)",
  blue: "var(--postsiva-blue)",
  blueLight: "var(--postsiva-blue-light)",
  blueHover: "var(--postsiva-blue-hover)",
  dark: "var(--postsiva-dark)",
  darkPanel: "var(--postsiva-dark-panel)",
  darkElevated: "var(--postsiva-dark-elevated)",
} as const;

export const postsivaGlow =
  "shadow-[0_0_20px_rgba(0,88,188,0.5)] hover:shadow-[0_0_24px_rgba(0,88,188,0.55)]";

export const postsivaShadowAmbient =
  "shadow-[0_20px_40px_-15px_rgba(0,88,188,0.08)]";

export const postsivaShadowElevated =
  "shadow-[0_30px_60px_-15px_rgba(0,88,188,0.15)] ring-1 ring-inset ring-white/40";

export const postsivaGlassCard =
  "border border-white/50 bg-white/70 backdrop-blur-xl";

/** @deprecated use postsivaGlow */
export const lightGlowAccent = postsivaGlow;

/** @deprecated use postsivaShadowAmbient */
export const lightShadowAmbient = postsivaShadowAmbient;

/** @deprecated use postsivaShadowElevated */
export const lightShadowElevated = postsivaShadowElevated;

/** @deprecated use postsivaGlassCard */
export const lightGlassCard = postsivaGlassCard;
