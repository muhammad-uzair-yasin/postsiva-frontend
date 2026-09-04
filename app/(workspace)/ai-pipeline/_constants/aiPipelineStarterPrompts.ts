/** Suggested prompts for the workspace Website agent (empty state + composer chips). */
export const AI_PIPELINE_STARTER_PROMPTS = [
  "What accounts are connected?",
  "Get my posts and summarize",
  "Get my comments and summarize",
] as const;

export type AiPipelineStarterPrompt = (typeof AI_PIPELINE_STARTER_PROMPTS)[number];
