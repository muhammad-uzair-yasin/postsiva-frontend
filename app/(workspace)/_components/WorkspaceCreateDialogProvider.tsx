"use client";

import {
  createContext,
  useContext,
  type ReactElement,
  type ReactNode,
} from "react";

import { WorkspaceCreateDialog } from "../workspaces/_components/WorkspaceCreateDialog";
import { useWorkspaceCreateDialog } from "../workspaces/_hooks/useWorkspaceCreateDialog";

type WorkspaceCreateDialogContextValue = ReturnType<typeof useWorkspaceCreateDialog>;

const WorkspaceCreateDialogContext =
  createContext<WorkspaceCreateDialogContextValue | null>(null);

export function useWorkspaceCreateDialogContext(): WorkspaceCreateDialogContextValue {
  const ctx = useContext(WorkspaceCreateDialogContext);
  if (!ctx) {
    throw new Error(
      "useWorkspaceCreateDialogContext must be used within WorkspaceCreateDialogProvider",
    );
  }
  return ctx;
}

export function WorkspaceCreateDialogProvider({
  children,
}: {
  children: ReactNode;
}): ReactElement {
  const dialog = useWorkspaceCreateDialog();

  return (
    <WorkspaceCreateDialogContext.Provider value={dialog}>
      {children}
      <WorkspaceCreateDialog dialog={dialog} />
    </WorkspaceCreateDialogContext.Provider>
  );
}
