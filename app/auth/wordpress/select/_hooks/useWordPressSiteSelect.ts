"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

import { getStoredAccessToken, getStoredActiveWorkspaceId } from "@/lib/auth/session";
import {
  confirmWordPressSites,
  getWordPressPendingSelection,
  type WordPressPendingSite,
} from "@/lib/social/wordpressIntegrationApi";

export interface WordPressSiteSelectState {
  loading: boolean;
  error: string | null;
  accountLogin: string | null;
  sites: WordPressPendingSite[];
  selected: Set<string>;
  submitting: boolean;
  connectedCount: number | null;
  toggle: (remoteSiteId: string) => void;
  confirm: () => Promise<void>;
  selectableCount: number;
}

/** Turns a backend error code from the callback redirect into a readable line. */
function readableError(code: string): string {
  const map: Record<string, string> = {
    WORDPRESS_ACCESS_DENIED: "You cancelled the WordPress.com authorization.",
    WORDPRESS_STATE_EXPIRED: "That connection attempt expired. Please try again.",
    WORDPRESS_STATE_USED: "That connection link was already used. Please try again.",
    WORDPRESS_INVALID_STATE: "That connection link is not valid. Please try again.",
    WORDPRESS_TOKEN_EXCHANGE_FAILED: "WordPress.com rejected the authorization.",
    WORDPRESS_SITES_FETCH_FAILED: "Could not read the sites on your WordPress.com account.",
    WORDPRESS_NO_ELIGIBLE_SITES: "This WordPress.com account has no sites to connect.",
    WORDPRESS_COM_NOT_CONFIGURED: "WordPress.com is not configured on this server.",
    WORDPRESS_SITE_MISMATCH: "The site that responded did not match the one you entered.",
    WORDPRESS_APPLICATION_PASSWORDS_UNAVAILABLE:
      "That site does not support application passwords. It needs HTTPS and WordPress 5.6 or newer.",
    WORDPRESS_SITE_UNREACHABLE: "Could not reach that WordPress site.",
    WORDPRESS_SSL_ERROR: "That WordPress site has an SSL problem.",
    WORDPRESS_AUTH_FAILED: "WordPress rejected the credential.",
  };
  return map[code] ?? "Something went wrong connecting WordPress. Please try again.";
}

export function useWordPressSiteSelect(): WordPressSiteSelectState {
  const searchParams = useSearchParams();
  const handle = searchParams.get("handle") ?? "";
  const errorCode = searchParams.get("error") ?? "";

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [accountLogin, setAccountLogin] = useState<string | null>(null);
  const [sites, setSites] = useState<WordPressPendingSite[]>([]);
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
      setError("This page was opened without a WordPress authorization.");
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
        const result = await getWordPressPendingSelection(token, workspaceId, handle);
        if (cancelled) return;
        setAccountLogin(result.accountLogin);
        setSites(result.sites);
        // Pre-tick everything the user can actually publish to.
        setSelected(
          new Set(
            result.sites.filter((s) => s.canPublish).map((s) => s.remoteSiteId),
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

  const toggle = useCallback((remoteSiteId: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(remoteSiteId)) next.delete(remoteSiteId);
      else next.add(remoteSiteId);
      return next;
    });
  }, []);

  const confirm = useCallback(async () => {
    const token = getStoredAccessToken()?.trim() ?? "";
    const workspaceId = getStoredActiveWorkspaceId()?.trim() ?? "";
    if (!token || !workspaceId || selected.size === 0) return;
    setSubmitting(true);
    setError(null);
    try {
      const accounts = await confirmWordPressSites(
        token,
        workspaceId,
        handle,
        Array.from(selected),
      );
      setConnectedCount(accounts.length);
      // Let the opener refresh its channel list, then close the popup.
      try {
        window.opener?.postMessage(
          { type: "postsiva-wordpress-connect", connected: accounts.length },
          window.location.origin,
        );
      } catch {
        /* cross-origin opener — ignore */
      }
      window.setTimeout(() => window.close(), 1200);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setSubmitting(false);
    }
  }, [handle, selected]);

  const selectableCount = useMemo(
    () => sites.filter((s) => s.canPublish).length,
    [sites],
  );

  return {
    loading,
    error,
    accountLogin,
    sites,
    selected,
    submitting,
    connectedCount,
    toggle,
    confirm,
    selectableCount,
  };
}
