import { getApiBaseUrl } from "@/lib/api/config";
import { fetchWithAccessTokenRetry } from "@/lib/api/fetchWithAccessTokenRetry";

import type {
  BrandPersonaData,
  BrandPersonaResponse,
  UpsertBrandPersonaBody,
} from "./brandPersonaTypes";
import { EMPTY_PERSONA_FIELDS } from "./brandPersonaTypes";

function workspaceHeaders(
  accessToken: string,
  workspaceId: string,
): HeadersInit {
  return {
    Authorization: `Bearer ${accessToken}`,
    "X-Workspace-Id": workspaceId,
    Accept: "application/json",
    "Content-Type": "application/json",
  };
}

function normalizePersonaData(raw: BrandPersonaData | null | undefined): BrandPersonaData {
  const global = raw?.global_persona ?? EMPTY_PERSONA_FIELDS;
  const platforms = raw?.platform_personas ?? {};
  return {
    mode: raw?.mode === "per_platform" ? "per_platform" : "same_for_all",
    global_persona: {
      tone: global.tone ?? "",
      brand_description: global.brand_description ?? "",
      target_audience: global.target_audience ?? "",
      avoid: global.avoid ?? "",
    },
    platform_personas: Object.fromEntries(
      Object.entries(platforms).map(([k, v]) => [
        k,
        {
          tone: v?.tone ?? "",
          brand_description: v?.brand_description ?? "",
          target_audience: v?.target_audience ?? "",
          avoid: v?.avoid ?? "",
        },
      ]),
    ),
  };
}

/** GET /unified/brand-persona/ */
export async function fetchBrandPersona(
  accessToken: string,
  workspaceId: string,
): Promise<BrandPersonaData> {
  const url = `${getApiBaseUrl()}/unified/brand-persona/`;
  const res = await fetchWithAccessTokenRetry(
    url,
    accessToken,
    (t) => workspaceHeaders(t, workspaceId),
    { method: "GET" },
  );
  const body = (await res.json()) as BrandPersonaResponse;
  return normalizePersonaData(body.data ?? undefined);
}

/** PUT /unified/brand-persona/ */
export async function upsertBrandPersona(
  accessToken: string,
  workspaceId: string,
  body: UpsertBrandPersonaBody,
): Promise<BrandPersonaData> {
  const url = `${getApiBaseUrl()}/unified/brand-persona/`;
  const res = await fetchWithAccessTokenRetry(
    url,
    accessToken,
    (t) => workspaceHeaders(t, workspaceId),
    { method: "PUT", body: JSON.stringify(body) },
  );
  const json = (await res.json()) as BrandPersonaResponse;
  return normalizePersonaData(json.data ?? undefined);
}

/** DELETE /unified/brand-persona/ */
export async function deleteBrandPersona(
  accessToken: string,
  workspaceId: string,
): Promise<void> {
  const url = `${getApiBaseUrl()}/unified/brand-persona/`;
  await fetchWithAccessTokenRetry(
    url,
    accessToken,
    (t) => workspaceHeaders(t, workspaceId),
    { method: "DELETE" },
  );
}
