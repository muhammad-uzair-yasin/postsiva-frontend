import type { AuthUser } from "./types";

/** Prefer `image_url`; accept common API aliases if present. */
export function profileImageUrlFromUser(user: AuthUser): string | null {
  const raw = user as AuthUser & Record<string, unknown>;
  const candidates: unknown[] = [
    user.image_url,
    raw.profile_image_url,
    raw.profile_picture_url,
    raw.avatar_url,
  ];
  for (const c of candidates) {
    if (typeof c === "string" && c.trim()) {
      return c.trim();
    }
  }
  return null;
}

export function userAvatarInitialsFromUser(user: AuthUser): string {
  const name = user.full_name?.trim() || user.username?.trim() || user.email || "?";
  const parts = name.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    const a = parts[0]?.[0];
    const b = parts[1]?.[0];
    if (a && b) {
      return (a + b).toUpperCase();
    }
  }
  return name.slice(0, 2).toUpperCase();
}
