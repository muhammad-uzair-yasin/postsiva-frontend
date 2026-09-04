/** Short lines shown in the FAB tooltip bubble (each visible ~3s). */
export const WORKSPACE_AGENT_CAPABILITY_HINTS: readonly string[] = [
  "Ask me about connected accounts, posts, and comments.",
  "I can summarize your posts and comments.",
  "Open chat to plan posts and get quick answers.",
  "Use quick prompts below the composer to start.",
  "Attach images when you send — I work with your media.",
  "Expand the panel for a larger view anytime.",
  "I run on your workspace agent — same context as the full page.",
  "Esc shrinks the preview, then closes.",
];

/** Shown in the hover card above the FAB. */
export const WORKSPACE_AGENT_FAB_HOVER_MESSAGE =
  "Click to chat — posts, comments, connected accounts, and help.";

/** How long each hint stays on screen (ms). */
export const WORKSPACE_AGENT_CAPABILITY_DISPLAY_MS = 3000;

/** Delay before the first hint after load (ms). */
export const WORKSPACE_AGENT_CAPABILITY_WELCOME_DELAY_MS = 600;

/** Gap after the welcome hint before the random loop starts (ms). */
export const WORKSPACE_AGENT_CAPABILITY_AFTER_WELCOME_GAP_MS = 1000;

/** Random time between hints (ms), inclusive range — lower = more frequent bubbles. */
export const WORKSPACE_AGENT_CAPABILITY_RANDOM_MIN_MS = 10_000;
export const WORKSPACE_AGENT_CAPABILITY_RANDOM_MAX_MS = 22_000;

export function pickRandomCapabilityHint(exclude: string | undefined): string {
  const pool =
    exclude === undefined
      ? [...WORKSPACE_AGENT_CAPABILITY_HINTS]
      : WORKSPACE_AGENT_CAPABILITY_HINTS.filter((h) => h !== exclude);
  if (pool.length === 0) {
    return WORKSPACE_AGENT_CAPABILITY_HINTS[0] ?? "";
  }
  return pool[Math.floor(Math.random() * pool.length)] ?? pool[0];
}
