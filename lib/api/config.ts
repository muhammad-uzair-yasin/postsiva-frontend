/**
 * Set in `.env.local`: NEXT_PUBLIC_POSTSIVA_API_URL=https://api.example.com
 * No trailing slash.
 */
export function getApiBaseUrl(): string {
  const raw = process.env.NEXT_PUBLIC_POSTSIVA_API_URL?.trim();
  const base = raw?.replace(/\/$/, "") ?? "";
  if (!base) {
    throw new Error(
      "Missing NEXT_PUBLIC_POSTSIVA_API_URL. Add it to .env.local (e.g. http://127.0.0.1:8000).",
    );
  }
  return base;
}

/** Remote MCP base URL (Streamable HTTP). Optional env override. */
export function getMcpBaseUrl(): string {
  const raw = process.env.NEXT_PUBLIC_POSTSIVA_MCP_URL?.trim();
  const u = raw?.replace(/\/$/, "") ?? "";
  return u || "https://mcp.postsiva.com/mcp";
}
