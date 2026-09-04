import type { ContentManagerPost } from "../_types/contentManagerTypes";

/** Demo grid derived from `assets/content-manager-stitch.html`. */
export const CONTENT_MANAGER_POSTS: ContentManagerPost[] = [
  {
    id: "cm-1",
    status: "scheduled",
    channel: "instagram",
    handle: "@postsiva_official",
    body: "Designing for the future requires a shift in perspective. Our latest interface update embraces tonal depth and architectural light. #UXDesign #FutureInterface",
    imageUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuC0GU3vg0nuenePA6nmo2FgM7JnT5iY31DggLLxDfwUsRKXWHimx5TUNUO4zoeczh1z1DWUh4NRpzI_awYvfGv_fvpO5b0lgq82GLFW-DPdv9_tmx44pLLXrTZTP4gjrLRDsjWZSl6P1BCGNHGFkb171a2AkPsvo8KOuwgFiglqx-wz6gLz30UnulOphhjJJ2KN59otL-JVRjr1niQuGzI3VsdYTtTv0XvkNsrs7-jnx9nacP3YDRaQeuWnaaEswkItVOeARg_z0jC0",
    scheduleLabel: "Oct 24, 10:00 AM",
  },
  {
    id: "cm-2",
    status: "published",
    channel: "threads",
    handle: "@postsiva_hq",
    body: "Retro tech meets modern automation. See how we're bridging the gap between legacy workflows and AI power. ⚡️",
    imageUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuD6_NhnmnNYY9UOgMMuGOqOlVLtmumnN_xA8J4Ie9yDHnrqdagpnRhOZM5gcTivRYa0smJKlIIKaFzkNrhnLlCq-Ly-xycKzSERjnMoxzgz3CNH2jpTouEFDgwDWG19XwG7uLSAkFUahJN7UcpJC0A2nkvxFKl6LC6y-v0NoX0yWn-JUwRezhKbxylfWUQ7dU5-c4ZjwAs6smz8-dPV3AjQGCu7IGygM6I6fqhGT66iPhTgTCcOGsV3IERxXWYszh-vIas4XC9lZfsp",
    metrics: { reach: "1.2k", likes: "84", comments: "12" },
  },
  {
    id: "cm-3",
    status: "draft",
    channel: "linkedin",
    handle: "@postsiva_b2b",
    title: "Team Collaboration Update",
    body: "No caption yet. Click to start composing your next viral business update...",
    draftMedia: "empty",
  },
  {
    id: "cm-4",
    status: "published",
    channel: "instagram",
    handle: "@postsiva_official",
    body: "Efficiency isn't just a buzzword. It's the core of how we build. 🚀",
    imageUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuC9W9hOCrhAynKZno8YkSzoj_TWkNnBKH1GGDfifxlEtRfPKu-X-YDI6Rq8PuC4d-mGD-BuXcZU1YTxWWlb-6cZKZFmcr3-xY0hcupuYKzy-21tWQvAU6Sfx8nFBL-MFB_g0-oS68gQ1P2lzv6cs9XqSMrGpEBB-k2q9v-hrNtjEH71n2nWvU8_oK2SYsGk_VdHNEX_BESyhDONs5rRIoDTAmM1GeP1Vfpdwsz594jHvhd_sURmhzoXrppk2xuolLdBy_nkJVeHlssa",
    metrics: { reach: "5.4k", likes: "312", comments: "45" },
  },
  {
    id: "cm-5",
    status: "scheduled",
    channel: "facebook",
    handle: "Postsiva Community",
    body: "Join our upcoming webinar on maximizing content ROI using Postsiva's predictive analytics engine.",
    imageUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuB-MsGWpSJp6wJTFVBSFFzFZWF2UsJeXrwsebdm9vlQXdLa6g7d0wp4Gjxuqsn0atxg3N6Pk6SqF5hIElwD7oj-tKjaTMn99c1psYQ_rZdXpwfFPm1HEkuRr1FLwlxo1jgvVf4H9pG6N6R0s5s5yyrWndDrRm8AkRd6RhIVXvWrs2m8mUZyVhodZoZdb-iz567lnIvwAkvopj3WQ98kAjTcAD9lhXN5XL4NAnyEAAJY3JkajAf9OzEUvxerIlcf1C3kZicKVU3Bw_rO",
    scheduleLabel: "Oct 26, 4:00 PM",
  },
  {
    id: "cm-6",
    status: "draft",
    channel: "instagram",
    handle: "@postsiva_official",
    title: "Reel: Workspace Tour",
    body: "Rough cut of the new studio. Need to add background music and captions...",
    imageUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAO4jmTRavKvTrtZKVE-rnLyYRyeroVuxAdBNkNz_OYtpKQ52ygjiP7CkN4GmX2VbE-E-gqs5jhX6kkxENEZ4HySO-JLd-JwQPHRBgTio-Dvu5FxZXvjrUGma3d5RuupSc2RCPpPG-l72ECqSUw39HK2WOlWhXN5wik_RrUb5IzD22u4ptVWdFR1lrRyj1-PUhqbdxu8fdWsY9Zl3Z5BjYgb4zAXDShu0uSnP1NGg2h6Gj2q0uNg4cyb0xo4Dvn9qX3mfpOSDFYEEVJ",
    draftMedia: "video",
  },
];
