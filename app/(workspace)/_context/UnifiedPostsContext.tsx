"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { POSTSIVA_ACTIVE_WORKSPACE_CHANGED } from "@/lib/auth/session";
import { UnifiedPostsApiResponse } from "@/lib/contentManager/unifiedPostsApi";

interface UnifiedPostsContextValue {
  postsData: UnifiedPostsApiResponse | null;
  setPostsData: (data: UnifiedPostsApiResponse | null) => void;
}

const UnifiedPostsContext = createContext<UnifiedPostsContextValue | undefined>(
  undefined,
);

export function UnifiedPostsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [postsData, setPostsData] = useState<UnifiedPostsApiResponse | null>(
    null,
  );

  useEffect(() => {
    const onWorkspaceChange = (): void => {
      setPostsData(null);
    };
    window.addEventListener(POSTSIVA_ACTIVE_WORKSPACE_CHANGED, onWorkspaceChange);
    return () => {
      window.removeEventListener(
        POSTSIVA_ACTIVE_WORKSPACE_CHANGED,
        onWorkspaceChange,
      );
    };
  }, []);

  const value = useMemo(
    (): UnifiedPostsContextValue => ({ postsData, setPostsData }),
    [postsData],
  );

  return (
    <UnifiedPostsContext.Provider value={value}>
      {children}
    </UnifiedPostsContext.Provider>
  );
}

export function useUnifiedPostsContext() {
  const context = useContext(UnifiedPostsContext);
  return context ?? { postsData: null, setPostsData: () => {} };
}
