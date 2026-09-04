/** Fallback avatar when platform profile URLs are missing or fail to load. */
export function avatarUriForDisplay(name: string): string {
  const seed = encodeURIComponent(name.slice(0, 48) || "User");
  return `https://ui-avatars.com/api/?name=${seed}&size=128&background=5c4d7d&color=e7dfff`;
}

function normalizeHttpUrl(raw: string): string | null {
  const trimmed = raw.trim();
  if (
    trimmed.length === 0 ||
    trimmed === "null" ||
    trimmed === "undefined" ||
    trimmed === "None"
  ) {
    return null;
  }
  const withScheme = trimmed.startsWith("//") ? `https:${trimmed}` : trimmed;
  if (!withScheme.startsWith("http://") && !withScheme.startsWith("https://")) {
    return null;
  }
  try {
    const parsed = new URL(withScheme);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return null;
    }
    return parsed.toString();
  } catch {
    return null;
  }
}

export function resolveInboxAvatarUri(
  profileImageUrl: string | null | undefined,
  userName: string,
): string {
  const remote = normalizeHttpUrl(profileImageUrl ?? "");
  return remote ?? avatarUriForDisplay(userName);
}
