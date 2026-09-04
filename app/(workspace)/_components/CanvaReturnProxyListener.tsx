"use client";

import { useEffect } from "react";

import { isCanvaReturnProxyRequest } from "@/lib/social/canvaReturnHandoffProxy";
import { handleCanvaReturnProxyRequest } from "@/lib/social/handleCanvaReturnProxyRequest";

/** Any workspace tab opened from Canva can proxy return API calls using this tab's session. */
export function CanvaReturnProxyListener(): null {
  useEffect(() => {
    const onMessage = (event: MessageEvent): void => {
      if (event.origin !== window.location.origin) {
        return;
      }
      if (!isCanvaReturnProxyRequest(event.data)) {
        return;
      }
      void handleCanvaReturnProxyRequest(event, event.data);
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);
  return null;
}
