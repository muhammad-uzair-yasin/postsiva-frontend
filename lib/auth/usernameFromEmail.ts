/**
 * Backend requires a unique `username`. Derive a stable handle from the email
 * (local + first domain label) so users are not forced to pick one on signup.
 */
export function usernameFromEmail(email: string): string {
  const trimmed = email.trim().toLowerCase();
  const [localRaw, domainRaw = ""] = trimmed.split("@");
  const local = (localRaw || "user").replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "") || "user";
  const domain = (domainRaw.split(".")[0] || "mail").replace(/[^a-z0-9]+/g, "_") || "mail";
  const combined = `${local}_${domain}`;
  return combined.slice(0, 80);
}
