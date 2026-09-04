export type BrandPersonaMode = "same_for_all" | "per_platform";

export interface PersonaFields {
  tone: string;
  brand_description: string;
  target_audience: string;
  avoid: string;
}

export interface BrandPersonaData {
  mode: BrandPersonaMode;
  global_persona: PersonaFields;
  platform_personas: Record<string, PersonaFields>;
}

export interface BrandPersonaResponse {
  success: boolean;
  message?: string | null;
  data?: BrandPersonaData | null;
  error?: string | null;
}

export interface UpsertBrandPersonaBody {
  mode: BrandPersonaMode;
  global_persona?: PersonaFields;
  platform_personas?: Record<string, PersonaFields>;
}

export const EMPTY_PERSONA_FIELDS: PersonaFields = {
  tone: "",
  brand_description: "",
  target_audience: "",
  avoid: "",
};

export const BRAND_PERSONA_PLATFORM_SLUGS = [
  "linkedin",
  "instagram",
  "facebook",
  "tiktok",
  "youtube",
  "threads",
  "bluesky",
  "pinterest",
  "twitter",
] as const;
