"use client";

import { useEffect, useState } from "react";

import { getStoredAccessToken, getStoredActiveWorkspaceId } from "@/lib/auth/session";
import {
  fetchConnectedContentManagerChannelLabels,
  getConnectedContentManagerChannelLabelsFromCachesOnly,
  type ConnectedContentManagerChannelLabels,
} from "@/lib/contentManager/fetchConnectedContentManagerChannelLabels";

/** Resolve Facebook/LinkedIn page names for draft publish confirm copy. */
export function useDraftChannelLabels(): ConnectedContentManagerChannelLabels {
  const workspaceId = getStoredActiveWorkspaceId()?.trim() ?? "";
  const [labels, setLabels] = useState<ConnectedContentManagerChannelLabels>(
    () =>
      workspaceId
        ? getConnectedContentManagerChannelLabelsFromCachesOnly(workspaceId)
        : {},
  );

  useEffect(() => {
    if (!workspaceId) {
      setLabels({});
      return;
    }
    setLabels(getConnectedContentManagerChannelLabelsFromCachesOnly(workspaceId));
    const token = getStoredAccessToken()?.trim() ?? "";
    if (!token) return;

    let cancelled = false;
    void (async () => {
      try {
        const next = await fetchConnectedContentManagerChannelLabels(
          token,
          workspaceId,
        );
        if (!cancelled) setLabels(next);
      } catch {
        // Keep cache snapshot; publish modal still falls back to platform name.
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [workspaceId]);

  return labels;
}
