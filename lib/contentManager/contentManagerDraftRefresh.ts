export const CONTENT_MANAGER_DRAFT_REFRESH_EVENT =
  "postsiva:content-manager-draft-refresh";

export type ContentManagerDraftRefreshDetail = {
  draftId?: string;
};

export function dispatchContentManagerDraftRefresh(draftId?: string): void {
  if (typeof window === "undefined") {
    return;
  }
  window.dispatchEvent(
    new CustomEvent(CONTENT_MANAGER_DRAFT_REFRESH_EVENT, {
      detail: draftId ? { draftId } : undefined,
    }),
  );
}
