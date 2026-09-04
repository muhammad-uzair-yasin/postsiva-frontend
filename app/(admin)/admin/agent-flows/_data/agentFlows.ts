export type FlowStepKind = "prompt" | "model" | "note";

export interface FlowStep {
  label: string;
  key?: string;
  kind: FlowStepKind;
  href?: string;
}

export interface AgentFlow {
  id: string;
  title: string;
  summary: string;
  steps: FlowStep[];
}

/** Static map of which agents / model routes run for each product flow. */
export const AGENT_FLOWS: AgentFlow[] = [
  {
    id: "idea-to-post",
    title: "Idea → post",
    summary: "Text idea only. Does not run after media analyze.",
    steps: [
      { label: "Idea text (user)", kind: "note" },
      {
        label: "Main writer",
        key: "main_writer",
        kind: "prompt",
        href: "/admin/system-prompts?key=main_writer",
      },
      { label: "Post caption / body", kind: "note" },
    ],
  },
  {
    id: "image-to-post",
    title: "Image → post",
    summary: "Analyze the image, then write the post from that analysis.",
    steps: [
      { label: "Image URL / upload", kind: "note" },
      {
        label: "Image analyze",
        key: "image_analyze",
        kind: "prompt",
        href: "/admin/system-prompts?key=image_analyze",
      },
      {
        label: "Main writer",
        key: "main_writer",
        kind: "prompt",
        href: "/admin/system-prompts?key=main_writer",
      },
      { label: "Post caption / body", kind: "note" },
    ],
  },
  {
    id: "video-to-post",
    title: "Video → post",
    summary: "Analyze the video, then write the post from that analysis.",
    steps: [
      { label: "Video URL / upload", kind: "note" },
      {
        label: "Video analyze",
        key: "video_analyze",
        kind: "prompt",
        href: "/admin/system-prompts?key=video_analyze",
      },
      {
        label: "Main writer",
        key: "main_writer",
        kind: "prompt",
        href: "/admin/system-prompts?key=main_writer",
      },
      { label: "Post caption / body", kind: "note" },
    ],
  },
  {
    id: "content-to-image",
    title: "Content → image",
    summary: "Prompt writer first, then pixel model (AI Manager route).",
    steps: [
      { label: "Post / idea text", kind: "note" },
      {
        label: "Image prompt writer",
        key: "image_prompt",
        kind: "prompt",
        href: "/admin/system-prompts?key=image_prompt",
      },
      {
        label: "Image generation",
        key: "image_generation",
        kind: "model",
        href: "/admin/ai-manager",
      },
      { label: "Generated image", kind: "note" },
    ],
  },
  {
    id: "edit-image",
    title: "Edit image",
    summary: "Edit-instruction writer, then image edit model route.",
    steps: [
      { label: "Source image + edit ask", kind: "note" },
      {
        label: "Image editor writer",
        key: "image_editor",
        kind: "prompt",
        href: "/admin/system-prompts?key=image_editor",
      },
      {
        label: "Image edit",
        key: "image_edit",
        kind: "model",
        href: "/admin/ai-manager",
      },
      { label: "Edited image", kind: "note" },
    ],
  },
  {
    id: "news-demand",
    title: "News / demand → post",
    summary: "Explore create-post paths (no media analyze step).",
    steps: [
      { label: "News or demand payload", kind: "note" },
      {
        label: "News → post",
        key: "news_to_post",
        kind: "prompt",
        href: "/admin/system-prompts?key=news_to_post",
      },
      {
        label: "or Demand → post",
        key: "demand_to_post",
        kind: "prompt",
        href: "/admin/system-prompts?key=demand_to_post",
      },
      { label: "Post caption", kind: "note" },
    ],
  },
  {
    id: "comment-reply",
    title: "Comment reply",
    summary: "Optional classify, then reply writer.",
    steps: [
      { label: "Inbound comment", kind: "note" },
      {
        label: "Comment classification",
        key: "comment_classification",
        kind: "prompt",
        href: "/admin/system-prompts?key=comment_classification",
      },
      {
        label: "Comment reply",
        key: "comment_reply",
        kind: "prompt",
        href: "/admin/system-prompts?key=comment_reply",
      },
      { label: "Reply text", kind: "note" },
    ],
  },
  {
    id: "youtube-upload",
    title: "YouTube title / description / thumbnail",
    summary: "YouTube-native writers (not social caption agents). Thumbnail prompt then pixel model.",
    steps: [
      { label: "Transcript / brief", kind: "note" },
      {
        label: "Title",
        key: "youtube_title_generator",
        kind: "prompt",
        href: "/admin/system-prompts?key=youtube_title_generator",
      },
      {
        label: "Description",
        key: "youtube_description_generator",
        kind: "prompt",
        href: "/admin/system-prompts?key=youtube_description_generator",
      },
      {
        label: "Thumbnail writer",
        key: "youtube_thumbnail_generator",
        kind: "prompt",
        href: "/admin/system-prompts?key=youtube_thumbnail_generator",
      },
      {
        label: "Image generation",
        key: "image_generation",
        kind: "model",
        href: "/admin/ai-manager",
      },
    ],
  },
];

export const AGENT_FLOW_NOTES = [
  "Prompt steps are edited under System Prompts.",
  "Model steps (image_generation / image_edit) are configured under AI Manager — not system prompts.",
  "Per-platform variants (e.g. linkedin_image_to_content) follow the same flow with platform-specific keys.",
  "All-mode image/video analyze feeds the same main_writer prompt (not separate image/video writers).",
  "YouTube uses title/description/thumbnail writers, not image_to_content.",
] as const;
