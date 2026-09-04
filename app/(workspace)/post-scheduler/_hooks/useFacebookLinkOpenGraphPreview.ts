"use client";

import { useEffect, useRef, useState } from "react";

import { getStoredAccessToken, getStoredActiveWorkspaceId } from "@/lib/auth/session";
import {
  fetchLinkOpenGraphPreview,
  type LinkOpenGraphPreview,
} from "@/lib/social/linkPreviewOgApi";
import { facebookLinkPostPublishBlockReasonHeuristic } from "@/lib/social/facebookLinkPostPublishBlock";

const DEBOUNCE_MS = 650;

function blockReasonFromPreview(
  trimmed: string,
  data: LinkOpenGraphPreview | null,
): string | null {
  if (data?.facebook_link_post_block_reason) {
    return data.facebook_link_post_block_reason;
  }
  if (data && data.facebook_link_post_allowed === false) {
    return "facebook_link_post_unsupported";
  }
  return facebookLinkPostPublishBlockReasonHeuristic(trimmed);
}

export function useFacebookLinkOpenGraphPreview(linkUrl: string): {
  readonly preview: LinkOpenGraphPreview | null;
  readonly loading: boolean;
  readonly error: string | null;
  readonly publishBlockReason: string | null;
} {
  const [preview, setPreview] = useState<LinkOpenGraphPreview | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [publishBlockReason, setPublishBlockReason] = useState<string | null>(
    null,
  );
  const requestId = useRef(0);

  useEffect(() => {
    const trimmed = linkUrl.trim();
    if (!trimmed || !/^https?:\/\//i.test(trimmed)) {
      setPreview(null);
      setLoading(false);
      setError(null);
      setPublishBlockReason(null);
      return;
    }

    setPublishBlockReason(facebookLinkPostPublishBlockReasonHeuristic(trimmed));

    const token = getStoredAccessToken();
    const workspaceId = getStoredActiveWorkspaceId();
    if (!token?.trim() || !workspaceId?.trim()) {
      setPreview(null);
      setLoading(false);
      setError(null);
      return;
    }

    const id = ++requestId.current;
    setLoading(true);
    setError(null);

    const timer = window.setTimeout(() => {
      void fetchLinkOpenGraphPreview(token, workspaceId, trimmed)
        .then((data) => {
          if (requestId.current !== id) return;
          setPreview(data);
          setError(null);
          setPublishBlockReason(blockReasonFromPreview(trimmed, data));
        })
        .catch((e) => {
          if (requestId.current !== id) return;
          setPreview(null);
          setError(e instanceof Error ? e.message : "Could not load link preview.");
          setPublishBlockReason(facebookLinkPostPublishBlockReasonHeuristic(trimmed));
        })
        .finally(() => {
          if (requestId.current === id) {
            setLoading(false);
          }
        });
    }, DEBOUNCE_MS);

    return () => {
      window.clearTimeout(timer);
    };
  }, [linkUrl]);

  return { preview, loading, error, publishBlockReason };
}
