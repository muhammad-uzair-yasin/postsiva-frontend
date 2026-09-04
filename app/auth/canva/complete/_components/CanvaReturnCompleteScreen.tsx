"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useMemo } from "react";

import {
  canvaReturnParamsFromSearch,
  savePendingCanvaReturn,
  type CanvaReturnMessage,
} from "@/lib/social/canvaReturnHandoff";
import { canvaReturnTargetOrigin } from "@/lib/social/canvaOrigin";

/** Canva return popup: postMessage to opener and close. */
export function CanvaReturnCompleteScreen(): React.ReactElement {
  const searchParams = useSearchParams();

  const payload: CanvaReturnMessage | null = useMemo(() => {
    const qs = searchParams.toString();
    return canvaReturnParamsFromSearch(qs ? `?${qs}` : "");
  }, [searchParams]);

  const success = payload?.canva === "1" && Boolean(payload.mediaUrl?.trim());
  const errorText = payload?.message || payload?.error;

  useEffect(() => {
    if (!payload) {
      return;
    }
    if (success) {
      savePendingCanvaReturn(payload);
    }
    try {
      window.opener?.postMessage(payload, canvaReturnTargetOrigin());
    } catch {
      /* ignore */
    }
    const id = window.setTimeout(() => {
      try {
        window.close();
      } catch {
        /* ignore */
      }
    }, success ? 600 : 2500);
    return () => window.clearTimeout(id);
  }, [payload, success]);

  if (!payload) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-surface px-6 text-center text-on-surface">
        <p className="text-lg font-semibold">Canva return</p>
        <p className="text-sm text-on-surface-variant">
          Missing return parameters. Close this window and try again.
        </p>
      </div>
    );
  }

  if (success) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-surface px-6 text-center text-on-surface">
        <p className="text-lg font-semibold">Design added to Postsiva</p>
        <p className="text-sm text-on-surface-variant">Returning to your post…</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-surface px-6 text-center text-on-surface">
      <p className="text-lg font-semibold text-red-200" role="alert">
        Couldn&apos;t import from Canva
      </p>
      <p className="max-w-sm text-sm text-on-surface-variant">{errorText || "Something went wrong."}</p>
      <p className="text-xs text-on-surface-variant">You can close this window.</p>
    </div>
  );
}
