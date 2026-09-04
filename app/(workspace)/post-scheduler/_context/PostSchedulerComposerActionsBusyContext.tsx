"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

interface ComposerActionsBusyValue {
  busy: boolean;
  setScheduleActionsBusy: (next: boolean) => void;
}

const PostSchedulerComposerActionsBusyContext =
  createContext<ComposerActionsBusyValue | null>(null);

/**
 * Root provider: schedule panel reports busy while Save draft / Schedule run so
 * Publish (anywhere under this tree) can disable.
 */
export function PostSchedulerComposerActionsBusyRootProvider({
  children,
}: {
  children: ReactNode;
}): React.ReactElement {
  const [busy, setBusy] = useState(false);
  const setScheduleActionsBusy = useCallback((next: boolean) => {
    setBusy(next);
  }, []);
  const value = useMemo(
    () => ({ busy, setScheduleActionsBusy }),
    [busy, setScheduleActionsBusy],
  );
  return (
    <PostSchedulerComposerActionsBusyContext.Provider value={value}>
      {children}
    </PostSchedulerComposerActionsBusyContext.Provider>
  );
}

export function usePostSchedulerComposerActionsBusy(): boolean {
  const ctx = useContext(PostSchedulerComposerActionsBusyContext);
  return ctx?.busy ?? false;
}

export function usePostSchedulerComposerActionsBusySetter(): (
  next: boolean,
) => void {
  const ctx = useContext(PostSchedulerComposerActionsBusyContext);
  return ctx?.setScheduleActionsBusy ?? (() => {});
}
