export function isWordPressUnifiedPlatform(
  platform: string | null | undefined,
): boolean {
  return (platform ?? "").trim().toLowerCase() === "wordpress";
}

export function wordpressConnectionIdFromHeaderAccountId(
  accountId: string,
): string | null {
  const trimmed = accountId.trim();
  if (!trimmed.startsWith("wordpress:")) {
    return null;
  }
  const connectionId = trimmed.slice("wordpress:".length).trim();
  return connectionId || null;
}
