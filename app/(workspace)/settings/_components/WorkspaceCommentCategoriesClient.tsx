"use client";

import { useCallback, type ReactElement } from "react";

import {
  getStoredAccessToken,
  getStoredActiveWorkspaceId,
} from "@/lib/auth/session";
import { CommentCategoriesEditor } from "@/lib/commentCategories/CommentCategoriesEditor";
import {
  fetchWorkspaceCommentCategories,
  deleteWorkspaceCommentCategory,
  saveWorkspaceCommentCategory,
  type CommentCategoriesResponse,
  type CommentCategorySaveInput,
} from "@/lib/commentCategories/commentCategoriesApi";

import { SettingsSectionPanel } from "./SettingsSectionPanel";

function requireSession(): { token: string; workspaceId: string } {
  const token = getStoredAccessToken();
  const workspaceId = getStoredActiveWorkspaceId();
  if (!token?.trim() || !workspaceId?.trim()) {
    throw new Error("Sign in and select a workspace first.");
  }
  return { token, workspaceId };
}

export function WorkspaceCommentCategoriesClient(): ReactElement {
  const load = useCallback(async (): Promise<CommentCategoriesResponse> => {
    const { token, workspaceId } = requireSession();
    return fetchWorkspaceCommentCategories(token, workspaceId);
  }, []);

  const save = useCallback(
    async (input: CommentCategorySaveInput): Promise<CommentCategoriesResponse> => {
      const { token, workspaceId } = requireSession();
      return saveWorkspaceCommentCategory(token, workspaceId, input);
    },
    [],
  );

  const remove = useCallback(async (categoryKey: string): Promise<CommentCategoriesResponse> => {
    const { token, workspaceId } = requireSession();
    return deleteWorkspaceCommentCategory(token, workspaceId, categoryKey);
  }, []);

  return (
    <SettingsSectionPanel title="Comment categories">
      <CommentCategoriesEditor
        title="Comment categories"
        intro="Control how AI classifies comments in this workspace. Workspace prompts override the admin defaults for this workspace only."
        load={load}
        save={save}
        remove={remove}
      />
    </SettingsSectionPanel>
  );
}
