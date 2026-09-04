"use client";

import { createContext, useContext } from "react";

const PostSchedulerComposerModalLayoutContext = createContext(false);

export function PostSchedulerComposerModalLayoutProvider({
  children,
}: {
  children: React.ReactNode;
}): React.ReactElement {
  return (
    <PostSchedulerComposerModalLayoutContext.Provider value={true}>
      {children}
    </PostSchedulerComposerModalLayoutContext.Provider>
  );
}

export function usePostSchedulerComposerInModal(): boolean {
  return useContext(PostSchedulerComposerModalLayoutContext);
}
