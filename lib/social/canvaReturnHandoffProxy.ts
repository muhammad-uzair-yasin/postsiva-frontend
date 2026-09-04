import type { CanvaReturnExportPage } from "@/lib/social/canvaApi";
import { canvaReturnTargetOrigin } from "@/lib/social/canvaOrigin";

export const CANVA_RETURN_PROXY_REQUEST = "postsiva-canva-return-proxy" as const;
export const CANVA_RETURN_PROXY_RESPONSE = "postsiva-canva-return-proxy-response" as const;

export type CanvaReturnProxyAction = "list-pages" | "import-page";

export type CanvaReturnProxyRequest = {
  type: typeof CANVA_RETURN_PROXY_REQUEST;
  requestId: string;
  action: CanvaReturnProxyAction;
  handoff: string;
  pageIndex?: number;
};

export type CanvaReturnProxyResponse = {
  type: typeof CANVA_RETURN_PROXY_RESPONSE;
  requestId: string;
  ok: boolean;
  error?: string;
  pages?: CanvaReturnExportPage[];
  designId?: string;
  mediaUrl?: string;
  mediaId?: string;
  uploadId?: string;
  filename?: string;
};

export function isCanvaReturnProxyRequest(data: unknown): data is CanvaReturnProxyRequest {
  if (!data || typeof data !== "object") {
    return false;
  }
  const o = data as Record<string, unknown>;
  return (
    o.type === CANVA_RETURN_PROXY_REQUEST &&
    typeof o.requestId === "string" &&
    typeof o.handoff === "string" &&
    (o.action === "list-pages" || o.action === "import-page")
  );
}

const PROXY_TIMEOUT_MS = 45_000;

export function requestCanvaReturnViaOpener(
  input: Omit<CanvaReturnProxyRequest, "type">,
): Promise<CanvaReturnProxyResponse> {
  if (typeof window === "undefined" || !window.opener) {
    return Promise.reject(new Error("Composer tab not found"));
  }
    const origin = canvaReturnTargetOrigin();
    return new Promise((resolve, reject) => {
    const requestId = input.requestId;
    const timer = window.setTimeout(() => {
      window.removeEventListener("message", onMessage);
      reject(new Error("Timed out waiting for Postsiva composer"));
    }, PROXY_TIMEOUT_MS);

    const onMessage = (event: MessageEvent): void => {
      if (event.origin !== origin) {
        return;
      }
      const data = event.data;
      if (!data || typeof data !== "object") {
        return;
      }
      const o = data as CanvaReturnProxyResponse;
      if (o.type !== CANVA_RETURN_PROXY_RESPONSE || o.requestId !== requestId) {
        return;
      }
      window.clearTimeout(timer);
      window.removeEventListener("message", onMessage);
      resolve(o);
    };

    window.addEventListener("message", onMessage);
    try {
      window.opener.postMessage(
        { type: CANVA_RETURN_PROXY_REQUEST, ...input } satisfies CanvaReturnProxyRequest,
        origin,
      );
    } catch (e) {
      window.clearTimeout(timer);
      window.removeEventListener("message", onMessage);
      reject(e instanceof Error ? e : new Error("Could not reach composer tab"));
    }
  });
}

export function postCanvaReturnProxyResponse(
  target: Window,
  payload: CanvaReturnProxyResponse,
  targetOrigin: string,
): void {
  try {
    target.postMessage(payload, targetOrigin);
  } catch {
    /* ignore */
  }
}
