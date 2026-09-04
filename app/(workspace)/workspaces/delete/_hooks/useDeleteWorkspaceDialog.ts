"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import { useActiveWorkspaceId } from "@/app/(workspace)/_hooks/useActiveWorkspaceId";
import { useStoredAuthUser } from "@/app/(workspace)/_hooks/useStoredAuthUser";
import { useTranslations } from "@/lib/i18n/WorkspaceLocaleProvider";
import { userIdsEqual } from "@/lib/auth/userIdsEqual";
import {
  getStoredAccessToken,
  setActiveWorkspaceId,
} from "@/lib/auth/session";
import { getWorkspaceById } from "@/lib/workspaces/workspaceApi";

import { runDeleteWorkspaceFlow } from "../_lib/runDeleteWorkspaceFlow";

export function useDeleteWorkspaceDialog(initialWorkspaceId: string): {
  workspaceName: string;
  confirmValue: string;
  setConfirmValue: (v: string) => void;
  deleting: boolean;
  error: string | null;
  loadError: string | null;
  canDelete: boolean;
  noWorkspace: boolean;
  notOwner: boolean;
  onDelete: () => Promise<void>;
} {
  const { t } = useTranslations();
  const router = useRouter();
  const activeWorkspaceId = useActiveWorkspaceId();
  const workspaceIdFromQuery = initialWorkspaceId.trim();
  const workspaceId =
    workspaceIdFromQuery.length > 0 ? workspaceIdFromQuery : activeWorkspaceId;
  const { user } = useStoredAuthUser();
  const [workspaceName, setWorkspaceName] = useState("");
  const [ownerId, setOwnerId] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [confirmValue, setConfirmValue] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (workspaceIdFromQuery.length > 0 && activeWorkspaceId !== workspaceIdFromQuery) {
      setActiveWorkspaceId(workspaceIdFromQuery);
    }
  }, [activeWorkspaceId, workspaceIdFromQuery]);

  useEffect(() => {
    if (!workspaceId) {
      setWorkspaceName("");
      setOwnerId(null);
      setLoadError(null);
      return;
    }
    const token = getStoredAccessToken()?.trim();
    if (!token) {
      setLoadError(t("workspaces.deleteErrorNotSignedIn"));
      return;
    }
    let cancelled = false;
    setLoadError(null);
    void getWorkspaceById(token, workspaceId)
      .then((w) => {
        if (!cancelled) {
          setWorkspaceName(w.name);
          setOwnerId(w.owner_id);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setLoadError(t("workspaces.deleteErrorLoadFailed"));
          setWorkspaceName("");
          setOwnerId(null);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [workspaceId, t]);

  const isOwner = Boolean(user && ownerId && userIdsEqual(user.id, ownerId));
  const noWorkspace = !workspaceId;
  const notOwner = Boolean(workspaceId && ownerId && user && !isOwner);
  const trimmedExpected = workspaceName.trim();
  const nameOk =
    trimmedExpected.length > 0 && confirmValue.trim() === trimmedExpected;
  const canDelete = Boolean(
    workspaceId && isOwner && nameOk && !deleting && !loadError,
  );

  const onDelete = useCallback(async () => {
    if (!workspaceId || !canDelete) {
      return;
    }
    const token = getStoredAccessToken()?.trim();
    if (!token) {
      setError(t("workspaces.deleteErrorNotSignedInAction"));
      return;
    }
    setDeleting(true);
    setError(null);
    try {
      await runDeleteWorkspaceFlow(workspaceId, token, () => {
        router.push("/dashboard");
        router.refresh();
      });
    } catch (e) {
      const msg =
        e instanceof Error ? e.message : t("workspaces.deleteErrorFailed");
      setError(msg);
    } finally {
      setDeleting(false);
    }
  }, [canDelete, router, workspaceId, t]);

  return {
    workspaceName,
    confirmValue,
    setConfirmValue,
    deleting,
    error,
    loadError,
    canDelete,
    noWorkspace,
    notOwner,
    onDelete,
  };
}
