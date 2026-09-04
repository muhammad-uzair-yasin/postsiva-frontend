"use client";

import { motion } from "framer-motion";
import { useCallback, useMemo, useState, type ReactElement } from "react";

import { useTranslations } from "@/lib/i18n/WorkspaceLocaleProvider";
import { findPublishedPostForInboxSelection } from "@/lib/inbox/findPublishedPostForInboxSelection";
import { useSocialInboxPublishedData } from "../_hooks/useSocialInboxPublishedData";
import { useWorkspaceHeaderAccounts } from "../../_components/WorkspaceHeaderAccountsProvider";
import { useWorkspaceLayout } from "../../_context/WorkspaceLayoutContext";

import { WorkspacePageDocumentHead } from "../../_components/WorkspacePageDocumentHead";
import { WorkspaceAccountRailPageShell } from "../../_components/shell/WorkspaceAccountRailPageLayout";
import { SelectedAccountPostsHydrator } from "../../_components/SelectedAccountPostsHydrator";
import { SocialInboxCommentList } from "./SocialInboxCommentList";
import { SocialInboxLeftPanel } from "./SocialInboxLeftPanel";

type InboxPostPanelState = {
  readonly accountId: string | null;
  readonly selectedPostId: string | null;
  readonly showLeftPanel: boolean;
};

export function SocialInboxScreen(): ReactElement {
  return <SocialInboxScreenContent />;
}

function SocialInboxScreenContent(): ReactElement {
  const { t } = useTranslations();
  const { layoutMode } = useWorkspaceLayout();
  const { selectedAccountId } = useWorkspaceHeaderAccounts();
  const isSidebar = layoutMode === "sidebar";
  const {
    publishedPosts,
    listError,
    needsPublishedPostsApiHydration,
  } = useSocialInboxPublishedData();
  const [postPanel, setPostPanel] = useState<InboxPostPanelState>({
    accountId: null,
    selectedPostId: null,
    showLeftPanel: false,
  });
  const activeAccountId = selectedAccountId ?? null;
  const panelMatchesAccount = postPanel.accountId === activeAccountId;
  const selectedPostId = panelMatchesAccount ? postPanel.selectedPostId : null;
  const showLeftPanel = panelMatchesAccount ? postPanel.showLeftPanel : false;

  const handleSelectSourcePost = useCallback(
    (postId: string) => {
      const match = findPublishedPostForInboxSelection(publishedPosts, postId);
      setPostPanel({
        accountId: activeAccountId,
        selectedPostId: match?.id ?? postId.trim(),
        showLeftPanel: true,
      });
    },
    [activeAccountId, publishedPosts],
  );

  const closePostsPanel = useCallback(() => {
    setPostPanel((prev) => ({
      accountId: activeAccountId,
      selectedPostId: panelMatchesAccount ? prev.selectedPostId : null,
      showLeftPanel: false,
    }));
  }, [activeAccountId, panelMatchesAccount]);

  const togglePostsPanel = useCallback(() => {
    setPostPanel((prev) => ({
      accountId: activeAccountId,
      selectedPostId: panelMatchesAccount ? prev.selectedPostId : null,
      showLeftPanel: panelMatchesAccount ? !prev.showLeftPanel : true,
    }));
  }, [activeAccountId, panelMatchesAccount]);

  const setSelectedPostForPanel = useCallback(
    (postId: string): void => {
      setPostPanel({
        accountId: activeAccountId,
        selectedPostId: postId,
        showLeftPanel: true,
      });
    },
    [activeAccountId],
  );

  const clearSelectedPostForPanel = useCallback((): void => {
    setPostPanel((prev) => ({
      accountId: activeAccountId,
      selectedPostId: null,
      showLeftPanel: panelMatchesAccount ? prev.showLeftPanel : true,
    }));
  }, [activeAccountId, panelMatchesAccount]);

  const selectedPost = useMemo(
    () => findPublishedPostForInboxSelection(publishedPosts, selectedPostId),
    [publishedPosts, selectedPostId],
  );
  const effectiveSelectedPostId = selectedPost?.id ?? null;

  return (
    <>
      <WorkspacePageDocumentHead
        titleKey="inbox.metaTitle"
        descriptionKey="inbox.metaDescription"
      />
      <SelectedAccountPostsHydrator />
      <WorkspaceAccountRailPageShell
        mainScroll={false}
        className="selection:bg-primary/30 selection:text-primary-fixed"
      >
        <motion.main
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className={`flex min-h-0 flex-1 flex-col overflow-hidden lg:flex-row lg:items-stretch ${
            isSidebar ? "pb-0" : "pb-20 pt-2 sm:pb-24 sm:pt-4"
          }`}
        >
          {showLeftPanel ? (
            <button
              type="button"
              className="fixed inset-0 z-[19] bg-black/35 lg:hidden"
              aria-label={t("inbox.postsHidePanel")}
              onClick={closePostsPanel}
            />
          ) : null}
          <div className="flex min-h-0 min-w-0 flex-1 flex-col lg:min-h-0 lg:flex-row">
            {showLeftPanel && (
              <SocialInboxLeftPanel
                posts={publishedPosts}
                isLoading={needsPublishedPostsApiHydration}
                error={listError}
                selectedPostId={effectiveSelectedPostId}
                onSelectPostId={setSelectedPostForPanel}
                onClearSelectedPost={clearSelectedPostForPanel}
                onClose={closePostsPanel}
              />
            )}
            <div className="flex min-h-0 min-w-0 flex-1 flex-col lg:min-h-0">
              <SocialInboxCommentList
                selectedPostId={effectiveSelectedPostId}
                selectedPost={selectedPost}
                publishedPosts={publishedPosts}
                onSelectPostId={handleSelectSourcePost}
                showLeftPanel={showLeftPanel}
                onToggleLeftPanel={togglePostsPanel}
              />
            </div>
          </div>
        </motion.main>
      </WorkspaceAccountRailPageShell>
    </>
  );
}
