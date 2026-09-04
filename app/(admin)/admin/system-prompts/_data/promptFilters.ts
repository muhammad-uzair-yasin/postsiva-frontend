import type { SystemPromptListItem } from "@/lib/admin/systemPromptsApi";

export type PromptScope = "all" | "unified" | "piva" | "workspace" | "platform";

export type PromptRole =
  | "all"
  | "content"
  | "image_to_content"
  | "video_to_content"
  | "analyze"
  | "image_prompt"
  | "image_editor"
  | "comment"
  | "other";

export const PLATFORM_OPTIONS = [
  { id: "linkedin", label: "LinkedIn" },
  { id: "instagram", label: "Instagram" },
  { id: "facebook", label: "Facebook" },
  { id: "twitter", label: "Twitter/X" },
  { id: "tiktok", label: "TikTok" },
  { id: "threads", label: "Threads" },
  { id: "pinterest", label: "Pinterest" },
  { id: "mastodon", label: "Mastodon" },
  { id: "blue_sky", label: "Bluesky" },
  { id: "youtube", label: "YouTube" },
] as const;

export type PlatformId = (typeof PLATFORM_OPTIONS)[number]["id"];

export const SCOPE_OPTIONS: { id: PromptScope; label: string }[] = [
  { id: "all", label: "All" },
  { id: "unified", label: "Unified" },
  { id: "piva", label: "Piva" },
  { id: "workspace", label: "Workspace" },
  { id: "platform", label: "Per-platform" },
];

export const ROLE_OPTIONS: { id: PromptRole; label: string }[] = [
  { id: "all", label: "All types" },
  { id: "content", label: "Content write" },
  { id: "image_to_content", label: "Image → post" },
  { id: "video_to_content", label: "Video → post" },
  { id: "analyze", label: "Analyze" },
  { id: "image_prompt", label: "Image prompt" },
  { id: "image_editor", label: "Edit image" },
  { id: "comment", label: "Comment" },
  { id: "other", label: "Other" },
];

const PLATFORM_PREFIXES = [...PLATFORM_OPTIONS]
  .map((p) => p.id)
  .sort((a, b) => b.length - a.length);

const PLATFORM_TYPE_TO_ROLE: Record<string, Exclude<PromptRole, "all">> = {
  content_generator: "content",
  image_to_content: "image_to_content",
  video_to_content: "video_to_content",
  content_to_image: "image_prompt",
  image_editor: "image_editor",
  comment_generator: "comment",
  title_generator: "content",
  description_generator: "content",
  thumbnail_generator: "image_prompt",
};

const UNIFIED_ROLE: Record<string, Exclude<PromptRole, "all">> = {
  main_writer: "content",
  idea_to_content: "content",
  news_to_post: "content",
  demand_to_post: "content",
  wordpress_article: "content",
  image_to_content: "image_to_content",
  video_to_content: "video_to_content",
  image_analyze: "analyze",
  video_analyze: "analyze",
  image_prompt: "image_prompt",
  image_editor: "image_editor",
  comment_reply: "comment",
  comment_classification: "comment",
  rephrase: "other",
  landing_assistant: "other",
};

export type PromptClass = {
  scope: Exclude<PromptScope, "all">;
  platform: PlatformId | null;
  role: Exclude<PromptRole, "all">;
};

export function classifyPromptKey(key: string): PromptClass {
  if (key === "workspace_saved_prompt" || key.startsWith("workspace_")) {
    return { scope: "workspace", platform: null, role: "other" };
  }
  if (key === "piva_base" || key.startsWith("piva_")) {
    return { scope: "piva", platform: null, role: "other" };
  }
  for (const platform of PLATFORM_PREFIXES) {
    const prefix = `${platform}_`;
    if (key.startsWith(prefix)) {
      const agentType = key.slice(prefix.length);
      return {
        scope: "platform",
        platform: platform as PlatformId,
        role: PLATFORM_TYPE_TO_ROLE[agentType] ?? "other",
      };
    }
  }
  return {
    scope: "unified",
    platform: null,
    role: UNIFIED_ROLE[key] ?? "other",
  };
}

export function filterPrompts(
  prompts: SystemPromptListItem[],
  opts: {
    scope: PromptScope;
    platform: PlatformId | "all";
    role: PromptRole;
    query: string;
  },
): SystemPromptListItem[] {
  const q = opts.query.trim().toLowerCase();
  return prompts.filter((p) => {
    const c = classifyPromptKey(p.prompt_key);
    if (opts.scope !== "all" && c.scope !== opts.scope) return false;
    if (opts.scope === "platform" && opts.platform !== "all" && c.platform !== opts.platform) {
      return false;
    }
    if (opts.role !== "all" && c.role !== opts.role) return false;
    if (!q) return true;
    return (
      p.prompt_key.toLowerCase().includes(q) ||
      p.title.toLowerCase().includes(q) ||
      (p.blurb || "").toLowerCase().includes(q)
    );
  });
}

/** Filters that make a deep-linked key visible in the list. */
export function filtersForPromptKey(key: string): {
  scope: PromptScope;
  platform: PlatformId | "all";
  role: PromptRole;
} {
  const c = classifyPromptKey(key);
  return {
    scope: c.scope,
    platform: c.platform ?? "all",
    role: "all",
  };
}

export function systemPromptHref(key: string): string {
  return `/admin/system-prompts?key=${encodeURIComponent(key)}`;
}
