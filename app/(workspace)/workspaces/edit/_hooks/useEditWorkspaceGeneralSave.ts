"use client";

import type { FormEvent } from "react";
import { useCallback, useState } from "react";

import { useTranslations } from "@/lib/i18n/WorkspaceLocaleProvider";
import type { AuthWorkspaceLoginItem } from "@/lib/auth/types";
import { getStoredAccessToken, patchStoredWorkspace } from "@/lib/auth/session";
import { patchWorkspace } from "@/lib/workspaces/workspaceApi";

export function useEditWorkspaceGeneralSave(
  workspace: AuthWorkspaceLoginItem | null,
  isOwner: boolean,
): {
  saveBusy: boolean;
  saveError: string | null;
  onSubmit: (e: FormEvent<HTMLFormElement>) => Promise<void>;
} {
  const { t } = useTranslations();
  const [saveBusy, setSaveBusy] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const onSubmit = useCallback(
    async (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (!workspace || !isOwner) {
        return;
      }
      const token = getStoredAccessToken();
      if (!token) {
        setSaveError(t("workspaces.editErrorNotSignedIn"));
        return;
      }
      const fd = new FormData(e.currentTarget);
      const name = String(fd.get("workspaceName") ?? "").trim();
      const slug = String(fd.get("workspaceSlug") ?? "").trim();
      const descriptionRaw = String(fd.get("workspaceDescription") ?? "");
      const description =
        descriptionRaw.trim() === "" ? null : descriptionRaw.trim();
      if (!name) {
        setSaveError(t("workspaces.editErrorNameRequired"));
        return;
      }
      if (!slug) {
        setSaveError(t("workspaces.editErrorSlugRequired"));
        return;
      }
      setSaveError(null);
      setSaveBusy(true);
      try {
        const out = await patchWorkspace(token, workspace.id, {
          name,
          slug,
          description,
        });
        patchStoredWorkspace(workspace.id, {
          name: out.name,
          description: out.description,
          slug: out.slug,
          image_url: out.image_url,
          updated_at: out.updated_at,
        });
      } catch (err) {
        setSaveError(
          err instanceof Error ? err.message : t("workspaces.editErrorSaveFailed"),
        );
      } finally {
        setSaveBusy(false);
      }
    },
    [workspace, isOwner, t],
  );

  return { saveBusy, saveError, onSubmit };
}
