"use client";

import { useEffect, useRef, useState } from "react";

import {
  getStoredAccessToken,
  getStoredActiveWorkspaceId,
} from "@/lib/auth/session";
import {
  fetchUnifiedDraftById,
  type UnifiedDraftResponseJson,
} from "@/lib/social/unifiedDraftsApi";
import { fetchUnifiedBlogDraftById } from "@/lib/social/unifiedBlogDraftsApi";
import { capMainTextForPlatform } from "@/lib/post-composer/composerMainTextCharLimits";

function wordpressDraftCaption(draft: UnifiedDraftResponseJson): string {
  const pd =
    draft.post_data && typeof draft.post_data === "object" ? draft.post_data : {};
  if (draft.platform?.toLowerCase() === "youtube") {
    const raw =
      pd.youtube_description ?? draft.youtube?.youtube_description ?? draft.default_text;
    return capMainTextForPlatform(typeof raw === "string" ? raw.trim() : "", draft.platform);
  }
  if (draft.platform?.toLowerCase() === "pinterest") {
    const raw = pd.description ?? draft.pinterest?.pinterest_description ?? draft.default_text;
    return capMainTextForPlatform(typeof raw === "string" ? raw.trim() : "", draft.platform);
  }
  if (draft.platform?.toLowerCase() !== "wordpress") {
    return capMainTextForPlatform(
      draft.default_text?.trim() ?? "",
      draft.platform,
    );
  }
  const wp = draft.wordpress;
  const excerpt =
    typeof wp?.wordpress_excerpt === "string"
      ? wp.wordpress_excerpt.trim()
      : "";
  if (excerpt) {
    return capMainTextForPlatform(excerpt, draft.platform);
  }
  return capMainTextForPlatform(
    draft.default_text?.trim() ?? "",
    draft.platform,
  );
}

export function useDraftEditorLoad(
  draftId: string,
  initialDraft?: UnifiedDraftResponseJson | null,
): {
  draft: UnifiedDraftResponseJson | null;
  caption: string;
  setCaption: (v: string) => void;
  loadError: string | null;
  isLoading: boolean;
  setDraft: (d: UnifiedDraftResponseJson) => void;
} {
  const initialRef = useRef(initialDraft);
  initialRef.current = initialDraft;

  const [draft, setDraft] = useState<UnifiedDraftResponseJson | null>(() => {
    const snap = initialDraft;
    return snap?.id === draftId ? snap : null;
  });
  const [caption, setCaptionState] = useState(() => {
    const snap = initialDraft;
    if (snap?.id === draftId) {
      return wordpressDraftCaption(snap);
    }
    return "";
  });
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(() => {
    const snap = initialDraft;
    return !(snap?.id === draftId);
  });

  useEffect(() => {
    const snap = initialRef.current;
    if (snap?.id === draftId) {
      setDraft(snap);
      setCaptionState(wordpressDraftCaption(snap));
      setLoadError(null);
      setIsLoading(false);
      return;
    }

    const ac = new AbortController();
    setIsLoading(true);
    setLoadError(null);
    void (async (): Promise<void> => {
      try {
        const token = getStoredAccessToken();
        const ws = getStoredActiveWorkspaceId();
        if (!token?.trim() || !ws?.trim()) {
          setLoadError("Sign in and select a workspace.");
          return;
        }
        const snap = initialRef.current;
        const preferBlog =
          snap?.platform?.toLowerCase() === "wordpress" ||
          (snap?.id === draftId &&
            snap?.platform?.toLowerCase() === "wordpress");
        const res = preferBlog
          ? await fetchUnifiedBlogDraftById(token, ws, draftId, ac.signal)
          : await fetchUnifiedDraftById(token, ws, draftId, ac.signal);
        if (!res.success || !res.data) {
          if (!preferBlog) {
            const blogRes = await fetchUnifiedBlogDraftById(
              token,
              ws,
              draftId,
              ac.signal,
            );
            if (blogRes.success && blogRes.data) {
              setDraft(blogRes.data);
              setCaptionState(wordpressDraftCaption(blogRes.data));
              return;
            }
          }
          setLoadError("Could not load draft.");
          return;
        }
        setDraft(res.data);
        setCaptionState(wordpressDraftCaption(res.data));
      } catch (e) {
        if (!ac.signal.aborted) {
          setLoadError(
            e instanceof Error ? e.message : "Could not load draft.",
          );
        }
      } finally {
        if (!ac.signal.aborted) {
          setIsLoading(false);
        }
      }
    })();
    return () => {
      ac.abort();
    };
  }, [draftId]);

  const setCaption = (v: string): void => {
    setCaptionState(capMainTextForPlatform(v, draft?.platform));
  };

  return { draft, caption, setCaption, loadError, isLoading, setDraft };
}
