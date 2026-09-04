"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

import { getStoredAccessToken, getStoredActiveWorkspaceId } from "@/lib/auth/session";
import {
  confirmLinkedInDestinations,
  getLinkedInPendingSelection,
  type LinkedInPendingDestination,
} from "@/lib/social/linkedinIntegrationApi";

export interface LinkedInAccountSelectState {
  loading: boolean;
  error: string | null;
  destinations: LinkedInPendingDestination[];
  selected: Set<string>;
  submitting: boolean;
  connectedCount: number | null;
  toggle: (key: string) => void;
  selectAll: () => void;
  clearNewSelections: () => void;
  confirm: () => Promise<void>;
  newSelectableCount: number;
  selectedNewCount: number;
}

function readableError(code: string): string {
  const map: Record<string, string> = {
    LINKEDIN_NO_CODE: "LinkedIn did not return an authorization code.",
    LINKEDIN_INVALID_STATE: "That connection link is not valid. Please try again.",
    LINKEDIN_CALLBACK_FAILED: "LinkedIn connection failed. Please try again.",
    access_denied: "You cancelled the LinkedIn authorization.",
  };
  return map[code] ?? "Something went wrong connecting LinkedIn. Please try again.";
}

export function useLinkedInAccountSelect(): LinkedInAccountSelectState {
  const searchParams = useSearchParams();
  const handle = searchParams.get("handle") ?? "";
  const errorCode = searchParams.get("error") ?? "";

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [destinations, setDestinations] = useState<LinkedInPendingDestination[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [submitting, setSubmitting] = useState(false);
  const [connectedCount, setConnectedCount] = useState<number | null>(null);

  useEffect(() => {
    if (errorCode) {
      setError(readableError(errorCode));
      setLoading(false);
      return;
    }
    if (!handle) {
      setError("This page was opened without a LinkedIn authorization.");
      setLoading(false);
      return;
    }
    const token = getStoredAccessToken()?.trim() ?? "";
    const workspaceId = getStoredActiveWorkspaceId()?.trim() ?? "";
    if (!token || !workspaceId) {
      setError("Your session expired. Please sign in again and retry.");
      setLoading(false);
      return;
    }
    let cancelled = false;
    void (async () => {
      try {
        const result = await getLinkedInPendingSelection(token, workspaceId, handle);
        if (cancelled) return;
        setDestinations(result.destinations);
        // Already-connected stay checked; nothing else pre-selected.
        setSelected(
          new Set(
            result.destinations
              .filter((d) => d.alreadyConnected)
              .map((d) => d.destinationKey),
          ),
        );
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : String(err));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [handle, errorCode]);

  const toggle = useCallback(
    (key: string) => {
      const dest = destinations.find((d) => d.destinationKey === key);
      if (!dest || dest.alreadyConnected) return;
      setSelected((prev) => {
        const next = new Set(prev);
        if (next.has(key)) next.delete(key);
        else next.add(key);
        return next;
      });
    },
    [destinations],
  );

  const selectAll = useCallback(() => {
    setSelected(new Set(destinations.map((d) => d.destinationKey)));
  }, [destinations]);

  const clearNewSelections = useCallback(() => {
    setSelected(
      new Set(
        destinations.filter((d) => d.alreadyConnected).map((d) => d.destinationKey),
      ),
    );
  }, [destinations]);

  const confirm = useCallback(async () => {
    const token = getStoredAccessToken()?.trim() ?? "";
    const workspaceId = getStoredActiveWorkspaceId()?.trim() ?? "";
    const newKeys = destinations
      .filter((d) => !d.alreadyConnected && selected.has(d.destinationKey))
      .map((d) => d.destinationKey);
    if (!token || !workspaceId || newKeys.length === 0) return;
    setSubmitting(true);
    setError(null);
    try {
      const accounts = await confirmLinkedInDestinations(
        token,
        workspaceId,
        handle,
        newKeys,
      );
      setConnectedCount(accounts.length);
      try {
        window.opener?.postMessage(
          { type: "postsiva-linkedin-connect", connected: accounts.length },
          window.location.origin,
        );
      } catch {
        /* ignore */
      }
      window.setTimeout(() => window.close(), 1200);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setSubmitting(false);
    }
  }, [destinations, handle, selected]);

  const newSelectableCount = useMemo(
    () => destinations.filter((d) => !d.alreadyConnected).length,
    [destinations],
  );

  const selectedNewCount = useMemo(
    () =>
      destinations.filter((d) => !d.alreadyConnected && selected.has(d.destinationKey))
        .length,
    [destinations, selected],
  );

  return {
    loading,
    error,
    destinations,
    selected,
    submitting,
    connectedCount,
    toggle,
    selectAll,
    clearNewSelections,
    confirm,
    newSelectableCount,
    selectedNewCount,
  };
}
