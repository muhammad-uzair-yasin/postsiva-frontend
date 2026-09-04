"use client";

import { useEffect } from "react";

import { ensureActiveWorkspaceId } from "@/lib/auth/ensureActiveWorkspace";

/** Ensures a workspace is selected whenever the user is inside the workspace app shell. */
export function ActiveWorkspaceBootstrap(): null {
  useEffect(() => {
    ensureActiveWorkspaceId();
  }, []);

  return null;
}
