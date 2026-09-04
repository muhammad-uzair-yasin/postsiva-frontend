"use client";

import type { ReactElement, ReactNode } from "react";

import { useActiveWorkspaceId } from "@/app/(workspace)/_hooks/useActiveWorkspaceId";
import { WorkspaceLayoutShell } from "@/app/(workspace)/_components/WorkspaceLayoutShell";

import { AccountShell } from "./AccountShell";

interface AccountLayoutShellProps {
  readonly children: ReactNode;
}

/** Keep workspace sidebar/header when an active workspace exists; otherwise account chrome. */
export function AccountLayoutShell({ children }: AccountLayoutShellProps): ReactElement {
  const activeWorkspaceId = useActiveWorkspaceId();

  if (activeWorkspaceId) {
    return (
      <WorkspaceLayoutShell>
        <div className="app-viewport workspace-dashboard-scroll min-w-0 max-w-full w-full overflow-x-clip px-3 pb-24 pt-4 sm:px-6 md:px-8">
          {children}
        </div>
      </WorkspaceLayoutShell>
    );
  }

  return <AccountShell>{children}</AccountShell>;
}
