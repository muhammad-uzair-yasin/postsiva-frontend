"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { getStoredAccessToken, patchStoredWorkspace } from "@/lib/auth/session";

import { syncWorkspaceImage } from "../_utils/syncWorkspaceImage";

export function useWorkspaceImageUpload(
  workspaceId: string | undefined,
  isOwner: boolean,
  initialUrl: string | null | undefined,
) {
  const [displayUrl, setDisplayUrl] = useState<string | null>(
    initialUrl ?? null,
  );
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    setDisplayUrl(initialUrl ?? null);
  }, [workspaceId, initialUrl]);

  const persist = useCallback(
    (next: string | null) => {
      if (workspaceId) {
        patchStoredWorkspace(workspaceId, { image_url: next });
      }
    },
    [workspaceId],
  );

  const run = useCallback(
    async (input: Parameters<typeof syncWorkspaceImage>[2]) => {
      if (!workspaceId || !isOwner) {
        return;
      }
      const token = getStoredAccessToken();
      if (!token) {
        setError("Not signed in");
        return;
      }
      setBusy(true);
      setError(null);
      try {
        const out = await syncWorkspaceImage(token, workspaceId, input);
        setDisplayUrl(out.image_url);
        persist(out.image_url);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Image update failed");
      } finally {
        setBusy(false);
      }
    },
    [workspaceId, isOwner, persist],
  );

  return {
    displayUrl,
    busy,
    error,
    fileInputRef,
    onFileChange: async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      e.target.value = "";
      if (file) {
        await run({ kind: "file", file });
      }
    },
    applyExternalUrl: async (raw: string) => {
      const t = raw.trim();
      await run({ kind: "url", url: t.length > 0 ? t : null });
    },
    clearImage: async () => {
      await run({ kind: "url", url: null });
    },
  };
}
