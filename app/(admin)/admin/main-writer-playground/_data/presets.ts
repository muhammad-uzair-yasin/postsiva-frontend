export interface TextPreset {
  id: string;
  label: string;
  text: string;
}

export const USER_IDEA_PRESETS: TextPreset[] = [
  {
    id: "productivity-tip",
    label: "Productivity tip",
    text: "Share a practical tip for founders who batch social content on Sunday nights.",
  },
  {
    id: "launch-announcement",
    label: "Launch announcement",
    text: "Announce a new AI scheduling feature that drafts posts from a single idea.",
  },
  {
    id: "customer-story",
    label: "Customer story",
    text: "Tell a short story about a small agency saving 6 hours a week with unified posting.",
  },
  {
    id: "thought-leadership",
    label: "Thought leadership",
    text: "Explain why consistency beats virality for B2B brands building trust on LinkedIn.",
  },
  {
    id: "mistake-lesson",
    label: "Mistake + lesson",
    text: "Share a mistake you made early in your startup journey and the one lesson that changed how you work.",
  },
  {
    id: "behind-the-scenes",
    label: "Behind the scenes",
    text: "Give a peek behind the scenes of how your team plans a week of social content in under 30 minutes.",
  },
  {
    id: "industry-myth",
    label: "Myth busting",
    text: "Bust a common myth in social media marketing that wastes time for small businesses.",
  },
  {
    id: "tool-comparison",
    label: "Tool comparison",
    text: "Compare posting manually across platforms vs using one unified workflow — focus on time saved, not feature lists.",
  },
  {
    id: "seasonal-hook",
    label: "Seasonal hook",
    text: "Tie a timely Q4 planning message to why brands should lock in their content calendar before the holidays.",
  },
  {
    id: "engagement-question",
    label: "Engagement question",
    text: "Ask your audience one sharp question about their biggest blocker when posting consistently across channels.",
  },
];

export const BRAND_PERSONA_PRESETS: TextPreset[] = [
  {
    id: "saas-founder",
    label: "SaaS founder",
    text: "Voice: confident, helpful, no hype. Audience: solo founders and lean marketing teams. Tone: clear, practical, occasionally witty. Avoid jargon and exclamation marks.",
  },
  {
    id: "creative-studio",
    label: "Creative studio",
    text: "Voice: warm, visual, inspiring. Audience: designers and brand managers. Tone: concise but evocative; celebrate craft and process.",
  },
  {
    id: "enterprise-b2b",
    label: "Enterprise B2B",
    text: "Voice: credible, measured, expert. Audience: marketing directors at mid-market companies. Tone: professional, data-informed, no slang.",
  },
  {
    id: "ecommerce-brand",
    label: "E-commerce brand",
    text: "Voice: friendly, benefit-led, upbeat. Audience: online shoppers aged 25–40. Tone: short sentences, sensory language, light urgency without pressure.",
  },
  {
    id: "coach-consultant",
    label: "Coach / consultant",
    text: "Voice: empathetic, authoritative, encouraging. Audience: professionals seeking career growth. Tone: second person, actionable, one insight per paragraph.",
  },
  {
    id: "dev-tools",
    label: "Dev tools",
    text: "Voice: precise, technical but approachable. Audience: software engineers and tech leads. Tone: respect the reader's intelligence; show don't sell.",
  },
  {
    id: "nonprofit",
    label: "Nonprofit",
    text: "Voice: mission-driven, human, hopeful. Audience: donors and volunteers. Tone: story-first, concrete impact, grateful without guilt.",
  },
  {
    id: "local-business",
    label: "Local business",
    text: "Voice: neighborly, trustworthy, community-focused. Audience: local residents and regulars. Tone: conversational, mention place when natural.",
  },
  {
    id: "fitness-wellness",
    label: "Fitness / wellness",
    text: "Voice: motivating, inclusive, realistic. Audience: busy adults starting or restarting a health routine. Tone: no shame, celebrate small wins.",
  },
  {
    id: "finance-education",
    label: "Finance education",
    text: "Voice: calm, educational, transparent. Audience: young professionals learning money basics. Tone: explain terms simply; never promise guaranteed returns.",
  },
];

export const USER_REQUIREMENTS_PRESETS: TextPreset[] = [
  {
    id: "short-cta",
    label: "Short + CTA",
    text: "Keep the post under 120 words. End with one clear CTA to book a demo. No hashtags.",
  },
  {
    id: "carousel-hook",
    label: "Carousel hook",
    text: "Open with a strong hook. Use 3 short bullet points. Suggest a carousel-friendly structure.",
  },
  {
    id: "video-caption",
    label: "Video caption",
    text: "Write as a video caption: conversational first line, 2 supporting lines, soft CTA. Include 3–5 relevant hashtags at the end.",
  },
  {
    id: "linkedin-long",
    label: "LinkedIn long-form",
    text: "Write for LinkedIn: hook in line 1, 4–6 short paragraphs, one takeaway line, end with a question. No emojis.",
  },
  {
    id: "threads-casual",
    label: "Threads casual",
    text: "Keep it under 280 characters. Casual tone, one idea only. No hashtags.",
  },
  {
    id: "instagram-visual",
    label: "Instagram visual",
    text: "Caption should complement a photo: vivid first line, 2–3 lines of context, 5–8 hashtags grouped at the end.",
  },
  {
    id: "youtube-community",
    label: "YouTube community",
    text: "Write a community post that teases an upcoming video. Include a curiosity gap and ask viewers what they want covered next.",
  },
  {
    id: "pinterest-seo",
    label: "Pinterest SEO",
    text: "Front-load keywords in the first sentence. Include a clear benefit and a soft CTA. Suggest a pin title under 60 characters.",
  },
  {
    id: "bluesky-conversation",
    label: "Bluesky conversation",
    text: "Under 300 characters. Opinionated but respectful. End with an open question to spark replies.",
  },
  {
    id: "multi-platform-neutral",
    label: "Multi-platform neutral",
    text: "Platform-neutral body copy only. No platform-specific jargon. 150–200 words. One CTA. No hashtags.",
  },
];
