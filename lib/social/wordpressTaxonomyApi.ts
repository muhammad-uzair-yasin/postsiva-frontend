import { getApiBaseUrl } from "@/lib/api/config";
import { fetchWithAccessTokenRetry } from "@/lib/api/fetchWithAccessTokenRetry";

export type WordPressTermKind = "categories" | "tags";

export interface WordPressTerm {
  id: number;
  name: string;
  slug?: string | null;
  description?: string | null;
  count: number;
  taxonomy?: string | null;
}

interface WordPressTermsResponse {
  success: boolean;
  source: string;
  terms: WordPressTerm[];
}

interface WordPressTermResponse {
  success: boolean;
  term: WordPressTerm;
}

function headers(accessToken: string, workspaceId: string): HeadersInit {
  return {
    Authorization: `Bearer ${accessToken}`,
    Accept: "application/json",
    "X-Workspace-Id": workspaceId,
  };
}

function parseError(raw: Record<string, unknown>, fallback: string): Error {
  const detail = raw.detail;
  if (detail && typeof detail === "object") {
    const d = detail as { message?: unknown; code?: unknown };
    return new Error(String(d.message ?? d.code ?? fallback));
  }
  return new Error(String(raw.message ?? raw.detail ?? fallback));
}

export async function fetchWordPressTerms(input: {
  accessToken: string;
  workspaceId: string;
  connectionId: string;
  kind: WordPressTermKind;
  limit?: number;
  forceRefresh?: boolean;
}): Promise<WordPressTerm[]> {
  const params = new URLSearchParams({ limit: String(input.limit ?? 100) });
  if (input.forceRefresh) {
    params.set("force_refresh", "true");
  }
  const res = await fetchWithAccessTokenRetry(
    `${getApiBaseUrl()}/api/integrations/wordpress/taxonomy/${encodeURIComponent(
      input.connectionId,
    )}/${input.kind}?${params.toString()}`,
    input.accessToken,
    (token) => headers(token, input.workspaceId),
  );
  const raw = (await res.json()) as Record<string, unknown>;
  if (!res.ok || raw.success === false) {
    throw parseError(raw, `Could not load WordPress ${input.kind}.`);
  }
  return (raw as unknown as WordPressTermsResponse).terms;
}

export async function createWordPressTerm(input: {
  accessToken: string;
  workspaceId: string;
  connectionId: string;
  kind: WordPressTermKind;
  name: string;
}): Promise<WordPressTerm> {
  const res = await fetchWithAccessTokenRetry(
    `${getApiBaseUrl()}/api/integrations/wordpress/taxonomy/${encodeURIComponent(
      input.connectionId,
    )}/${input.kind}`,
    input.accessToken,
    (token) => ({
      ...headers(token, input.workspaceId),
      "Content-Type": "application/json",
    }),
    {
      method: "POST",
      body: JSON.stringify({ name: input.name }),
    },
  );
  const raw = (await res.json()) as Record<string, unknown>;
  if (!res.ok || raw.success === false) {
    throw parseError(raw, `Could not create WordPress ${input.kind}.`);
  }
  return (raw as unknown as WordPressTermResponse).term;
}

export async function deleteWordPressTerm(input: {
  accessToken: string;
  workspaceId: string;
  connectionId: string;
  kind: WordPressTermKind;
  termId: number;
}): Promise<void> {
  const res = await fetchWithAccessTokenRetry(
    `${getApiBaseUrl()}/api/integrations/wordpress/taxonomy/${encodeURIComponent(
      input.connectionId,
    )}/${input.kind}/${input.termId}`,
    input.accessToken,
    (token) => headers(token, input.workspaceId),
    { method: "DELETE" },
  );
  const raw = (await res.json()) as Record<string, unknown>;
  if (!res.ok || raw.success === false) {
    throw parseError(raw, `Could not delete WordPress ${input.kind}.`);
  }
}
