export interface PersonaGalleryCard {
  id: string;
  name: string;
  role: string;
  blurb: string;
  ringClass: string;
}

export const PERSONA_GALLERY_CARDS: readonly PersonaGalleryCard[] = [
  {
    id: "p1",
    name: "Brand Architect",
    role: "Corporate · LinkedIn-first",
    blurb: "Calm, precise, authority on product launches.",
    ringClass: "from-primary-container to-secondary",
  },
  {
    id: "p2",
    name: "Community Host",
    role: "Casual · X & Threads",
    blurb: "Warm, witty, short-form engagement.",
    ringClass: "from-amber-500 to-rose-600",
  },
  {
    id: "p3",
    name: "Visual Storyteller",
    role: "Instagram · Reels",
    blurb: "Bold hooks, sensory language, emoji-light.",
    ringClass: "from-fuchsia-500 to-violet-600",
  },
];
