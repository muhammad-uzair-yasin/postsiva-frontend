"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  type ReactNode,
} from "react";

import { DraftEditorSuccessToast } from "../../content-manager/draft/[id]/_components/DraftEditorSuccessToast";
import { useDraftActionSuccessToast } from "../../content-manager/draft/[id]/_hooks/useDraftActionSuccessToast";

interface PostSchedulerActionToastContextValue {
  readonly showSuccessToast: (title: string, subtitle: string) => void;
}

const PostSchedulerActionToastContext =
  createContext<PostSchedulerActionToastContextValue | null>(null);

export function PostSchedulerActionToastProvider({
  children,
}: {
  children: ReactNode;
}): React.ReactElement {
  const { toast, toastKey, dismissToast, showToast } =
    useDraftActionSuccessToast();

  const showSuccessToast = useCallback(
    (title: string, subtitle: string) => {
      showToast(title, subtitle);
    },
    [showToast],
  );

  const value = useMemo(
    (): PostSchedulerActionToastContextValue => ({ showSuccessToast }),
    [showSuccessToast],
  );

  return (
    <PostSchedulerActionToastContext.Provider value={value}>
      {children}
      <DraftEditorSuccessToast
        key={toastKey}
        title={toast?.title ?? ""}
        subtitle={toast?.subtitle ?? ""}
        onDismiss={dismissToast}
      />
    </PostSchedulerActionToastContext.Provider>
  );
}

export function usePostSchedulerActionToast(): PostSchedulerActionToastContextValue {
  const ctx = useContext(PostSchedulerActionToastContext);
  if (!ctx) {
    throw new Error(
      "usePostSchedulerActionToast must be used within PostSchedulerActionToastProvider",
    );
  }
  return ctx;
}
