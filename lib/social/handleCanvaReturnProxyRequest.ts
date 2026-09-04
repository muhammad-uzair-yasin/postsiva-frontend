import { getStoredAccessToken, getStoredActiveWorkspaceId } from "@/lib/auth/session";
import {
  fetchCanvaReturnHandoffPages,
  importCanvaReturnHandoffPage,
} from "@/lib/social/canvaApi";
import {
  CANVA_RETURN_PROXY_RESPONSE,
  type CanvaReturnProxyRequest,
  postCanvaReturnProxyResponse,
} from "@/lib/social/canvaReturnHandoffProxy";
/** Composer tab: run Canva return API using this window's session for the popup. */
export async function handleCanvaReturnProxyRequest(
  event: MessageEvent,
  request: CanvaReturnProxyRequest,
): Promise<void> {
  const source = event.source;
  if (!source || typeof (source as Window).postMessage !== "function") {
    return;
  }
  const target = source as Window;
  const targetOrigin = event.origin;
  const token = getStoredAccessToken()?.trim();
  const workspaceId = getStoredActiveWorkspaceId()?.trim();
  if (!token || !workspaceId) {
      postCanvaReturnProxyResponse(target, {
        type: CANVA_RETURN_PROXY_RESPONSE,
        requestId: request.requestId,
        ok: false,
        error: "Sign in to Postsiva and keep the composer open, then try Return to Postsiva again.",
      }, targetOrigin);
      return;
  }

  try {
    if (request.action === "list-pages") {
      const result = await fetchCanvaReturnHandoffPages(request.handoff, token, workspaceId);
      postCanvaReturnProxyResponse(target, {
        type: CANVA_RETURN_PROXY_RESPONSE,
        requestId: request.requestId,
        ok: true,
        pages: result.pages,
        designId: result.designId,
      }, targetOrigin);
      return;
    }
    if (request.action === "import-page") {
      const pageIndex = request.pageIndex;
      if (pageIndex === undefined || pageIndex < 0) {
        throw new Error("Missing page index");
      }
      const imported = await importCanvaReturnHandoffPage(
        request.handoff,
        pageIndex,
        token,
        workspaceId,
      );
      postCanvaReturnProxyResponse(target, {
        type: CANVA_RETURN_PROXY_RESPONSE,
        requestId: request.requestId,
        ok: true,
        designId: imported.designId,
        mediaUrl: imported.mediaUrl,
        mediaId: imported.mediaId,
        uploadId: imported.uploadId,
        filename: imported.filename,
      }, targetOrigin);
      return;
    }
    throw new Error("Unknown action");
  } catch (e) {
    postCanvaReturnProxyResponse(target, {
      type: CANVA_RETURN_PROXY_RESPONSE,
      requestId: request.requestId,
      ok: false,
      error: e instanceof Error ? e.message : "Canva return failed",
    }, targetOrigin);
  }
}
