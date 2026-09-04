import { getApiBaseUrl } from "@/lib/api/config";
import { fetchWithAccessTokenRetry } from "@/lib/api/fetchWithAccessTokenRetry";

/** GET /workspaces/:id — member-only; includes canonical `owner_id` and `name` for ACL / UI. */
export async function getWorkspaceById(
  accessToken: string,
  workspaceId: string,
): Promise<{ id: string; owner_id: string; name: string }> {
  const base = getApiBaseUrl();
  const res = await fetchWithAccessTokenRetry(
    `${base}/workspaces/${encodeURIComponent(workspaceId)}`,
    accessToken,
    (t) => ({
      Authorization: `Bearer ${t}`,
      Accept: "application/json",
    }),
    { method: "GET" },
  );
  const raw: unknown = await res.json();
  if (typeof raw !== "object" || raw === null) {
    throw new Error("Invalid workspace response");
  }
  const o = raw as Record<string, unknown>;
  const id = o.id;
  const ownerId = o.owner_id;
  const nameRaw = o.name;
  if (id == null || ownerId == null) {
    throw new Error("Invalid workspace response: missing id or owner_id");
  }
  const name =
    typeof nameRaw === "string" && nameRaw.trim().length > 0
      ? nameRaw
      : "Workspace";
  return {
    id: String(id),
    owner_id: typeof ownerId === "string" ? ownerId : String(ownerId),
    name,
  };
}

/** DELETE /workspaces/:id — owner only; 204 No Content on success. */
export async function deleteWorkspace(
  accessToken: string,
  workspaceId: string,
): Promise<void> {
  const base = getApiBaseUrl();
  await fetchWithAccessTokenRetry(
    `${base}/workspaces/${encodeURIComponent(workspaceId)}`,
    accessToken,
    (t) => ({
      Authorization: `Bearer ${t}`,
    }),
    { method: "DELETE" },
  );
}

export async function createWorkspace(
  accessToken: string,
  name: string,
): Promise<void> {
  const base = getApiBaseUrl();
  const trimmed = name.trim();
  await fetchWithAccessTokenRetry(
    `${base}/workspaces`,
    accessToken,
    (t) => ({
      Authorization: `Bearer ${t}`,
      Accept: "application/json",
      "Content-Type": "application/json",
    }),
    {
      method: "POST",
      body: JSON.stringify({
        name: trimmed.length > 0 ? trimmed : "My Workspace",
        source_product: "postsiva",
      }),
    },
  );
}

export interface PatchWorkspaceBody {
  name?: string;
  description?: string | null;
  slug?: string | null;
  image_url?: string | null;
  locale?: string;
  ai_output_locale?: string;
}

export async function patchWorkspace(
  accessToken: string,
  workspaceId: string,
  body: PatchWorkspaceBody,
): Promise<{
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  locale: string;
  ai_output_locale: string;
  updated_at: string;
}> {
  const base = getApiBaseUrl();
  const res = await fetchWithAccessTokenRetry(
    `${base}/workspaces/${encodeURIComponent(workspaceId)}`,
    accessToken,
    (t) => ({
      Authorization: `Bearer ${t}`,
      "Content-Type": "application/json",
    }),
    { method: "PATCH", body: JSON.stringify(body) },
  );
  const data = (await res.json()) as {
    name: string;
    slug: string;
    description?: string | null;
    image_url?: string | null;
    locale?: string;
    ai_output_locale?: string;
    updated_at: string;
  };
  return {
    name: data.name,
    slug: data.slug,
    description: data.description ?? null,
    image_url: data.image_url ?? null,
    locale: data.locale ?? "en",
    ai_output_locale: data.ai_output_locale ?? data.locale ?? "en",
    updated_at: data.updated_at,
  };
}

export async function uploadWorkspaceImage(
  accessToken: string,
  workspaceId: string,
  file: File,
): Promise<{ image_url: string | null }> {
  const base = getApiBaseUrl();
  const fd = new FormData();
  fd.append("file", file);
  const res = await fetchWithAccessTokenRetry(
    `${base}/workspaces/${encodeURIComponent(workspaceId)}/image`,
    accessToken,
    (t) => ({ Authorization: `Bearer ${t}` }),
    { method: "POST", body: fd },
  );
  const data = (await res.json()) as { image_url?: string | null };
  return { image_url: data.image_url ?? null };
}

export async function patchWorkspaceImageUrl(
  accessToken: string,
  workspaceId: string,
  imageUrl: string | null,
): Promise<{ image_url: string | null }> {
  const base = getApiBaseUrl();
  const res = await fetchWithAccessTokenRetry(
    `${base}/workspaces/${encodeURIComponent(workspaceId)}`,
    accessToken,
    (t) => ({
      Authorization: `Bearer ${t}`,
      "Content-Type": "application/json",
    }),
    { method: "PATCH", body: JSON.stringify({ image_url: imageUrl }) },
  );
  const data = (await res.json()) as { image_url?: string | null };
  return { image_url: data.image_url ?? null };
}
