import { getApiBaseUrl } from "@/lib/api/config";
import { fetchWithAccessTokenRetry } from "@/lib/api/fetchWithAccessTokenRetry";

export type OpenPostsivaMediaInCanvaResult = {
  readonly designId: string;
  readonly editUrl: string;
  readonly assetOnCanvas: boolean;
};

function workspaceHeaders(token: string, workspaceId: string): HeadersInit {
  return {
    Authorization: `Bearer ${token}`,
    Accept: "application/json",
    "Content-Type": "application/json",
    "X-Workspace-Id": workspaceId,
  };
}

/** Upload Postsiva media into Canva and return a return-nav edit URL. */
export async function openPostsivaMediaInCanva(
  accessToken: string,
  workspaceId: string,
  input: {
    mediaUrl: string;
    mediaType: "image" | "video";
    mediaId?: string;
    title?: string;
    composerSessionId?: string;
  },
): Promise<OpenPostsivaMediaInCanvaResult> {
  const res = await fetchWithAccessTokenRetry(
    `${getApiBaseUrl()}/canva/designs/open-from-media`,
    accessToken,
    (t) => workspaceHeaders(t, workspaceId),
    {
      method: "POST",
      body: JSON.stringify({
        media_url: input.mediaUrl,
        media_type: input.mediaType,
        media_id: input.mediaId,
        title: input.title,
        composer_session_id: input.composerSessionId,
      }),
    },
  );
  const data: unknown = await res.json();
  const o = data && typeof data === "object" ? (data as Record<string, unknown>) : null;
  const success = o?.success === true;
  const message = typeof o?.message === "string" ? o.message : "";
  const payload =
    o?.data && typeof o.data === "object" ? (o.data as Record<string, unknown>) : null;
  if (!res.ok || !success) {
    throw new Error(message || "Could not open media in Canva");
  }
  const designId = typeof payload?.design_id === "string" ? payload.design_id.trim() : "";
  const editUrl = typeof payload?.edit_url === "string" ? payload.edit_url.trim() : "";
  if (!designId || !editUrl) {
    throw new Error("Canva did not return an edit URL");
  }
  return {
    designId,
    editUrl,
    assetOnCanvas: payload?.asset_on_canvas === true,
  };
}
