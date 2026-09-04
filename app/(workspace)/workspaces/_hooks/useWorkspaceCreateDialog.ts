"use client";

import { useCallback, useState } from "react";

import { fetchWorkspacesForSession } from "@/lib/auth/authApi";
import {
  getStoredAccessToken,
  setStoredWorkspaces,
} from "@/lib/auth/session";
import { createWorkspace } from "@/lib/workspaces/workspaceApi";
import { BillingPlanError } from "@/lib/billing/billingErrors";
import { useBilling } from "@/lib/billing/BillingContext";
import { useUpgradePlanLimit } from "@/lib/billing/UpgradePlanLimitProvider";

export function useWorkspaceCreateDialog(): {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  name: string;
  setName: (value: string) => void;
  error: string | null;
  isSubmitting: boolean;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => Promise<void>;
} {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { promptUpgradeIfNeeded, promptUpgradeForBillingError } = useUpgradePlanLimit();
  const { refresh } = useBilling();

  const open = useCallback((): void => {
    setError(null);
    setIsOpen(true);
    void (async () => {
      const snapshot = await refresh();
      if (promptUpgradeIfNeeded("workspaces", { usageSnapshot: snapshot })) {
        setIsOpen(false);
      }
    })();
  }, [promptUpgradeIfNeeded, refresh]);

  const close = useCallback((): void => {
    setIsOpen(false);
    setName("");
    setError(null);
  }, []);

  const onSubmit = useCallback(
    async (event: React.FormEvent<HTMLFormElement>): Promise<void> => {
      event.preventDefault();
      setError(null);
      const token = getStoredAccessToken()?.trim() ?? "";
      if (!token) {
        setError("Not signed in.");
        return;
      }
      setIsSubmitting(true);
      try {
        await createWorkspace(token, name);
        const list = await fetchWorkspacesForSession(token);
        setStoredWorkspaces(list);
        await refresh();
        close();
      } catch (err) {
        if (err instanceof BillingPlanError) {
          if (promptUpgradeForBillingError(err.detail)) {
            close();
            return;
          }
        }
        setError(
          err instanceof Error ? err.message : "Could not create workspace.",
        );
      } finally {
        setIsSubmitting(false);
      }
    },
    [name, close, promptUpgradeForBillingError, refresh],
  );

  return {
    isOpen,
    open,
    close,
    name,
    setName,
    error,
    isSubmitting,
    onSubmit,
  };
}
