"use client";

import { CommentCategoriesEditor } from "@/lib/commentCategories/CommentCategoriesEditor";
import {
  fetchAdminCommentCategories,
  saveAdminCommentCategory,
} from "@/lib/commentCategories/commentCategoriesApi";

export function AdminCommentCategoriesScreen() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
      <CommentCategoriesEditor
        title="Comment categories"
        intro="Manage global AI category defaults. Workspace-specific category prompts override these defaults only inside that workspace."
        load={fetchAdminCommentCategories}
        save={saveAdminCommentCategory}
      />
    </div>
  );
}
