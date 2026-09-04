"use client";

import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";

import { fetchWorkspacesForSession } from "@/lib/auth/authApi";
import { defaultSkippedWorkspaceName } from "@/lib/auth/workspaceOnboarding";
import {
  getStoredAccessToken,
  getStoredUser,
  setActiveWorkspaceId,
  setStoredWorkspaces,
} from "@/lib/auth/session";
import { createWorkspace } from "@/lib/workspaces/workspaceApi";

export function useOnboardingWorkspaceSetup(): {
  name: string;
  setName: (value: string) => void;
  error: string | null;
  isSubmitting: boolean;
  submitNamed: () => Promise<void>;
  submitSkip: () => Promise<void>;
} {
  const router = useRouter();
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const finish = useCallback(
    async (workspaceName: string): Promise<void> => {
      setError(null);
      const token = getStoredAccessToken()?.trim() ?? "";
      if (!token) {
        setError("Not signed in.");
        return;
      }
      setIsSubmitting(true);
      try {
        await createWorkspace(token, workspaceName);
        const list = await fetchWorkspacesForSession(token);
        setStoredWorkspaces(list);
        const created = list[0];
        if (created?.id) {
          setActiveWorkspaceId(created.id);
        }
        router.replace("/onboarding/connect");
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Could not create workspace.",
        );
      } finally {
        setIsSubmitting(false);
      }
    },
    [router],
  );

  const submitNamed = useCallback(async (): Promise<void> => {
    const trimmed = name.trim();
    if (!trimmed) {
      setError("Enter a workspace name or skip to use the default.");
      return;
    }
    await finish(trimmed);
  }, [finish, name]);

  const submitSkip = useCallback(async (): Promise<void> => {
    const user = getStoredUser();
    await finish(
      defaultSkippedWorkspaceName(user?.username, user?.full_name),
    );
  }, [finish]);

  return {
    name,
    setName,
    error,
    isSubmitting,
    submitNamed,
    submitSkip,
  };
}
