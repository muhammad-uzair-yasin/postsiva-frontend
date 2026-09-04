const RELEASE_ENV_KEYS = [
  "POSTSIVA_RELEASE",
  "GITHUB_SHA",
  "COMMIT_SHA",
] as const;
const SAFE_RELEASE_PATTERN = /^[a-zA-Z0-9._-]{1,128}$/;

export function getReleaseId(): string {
  for (const key of RELEASE_ENV_KEYS) {
    const value = process.env[key]?.trim();
    if (value && SAFE_RELEASE_PATTERN.test(value)) {
      return value;
    }
  }

  return "unknown";
}
