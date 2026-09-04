"use client";

import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { useState, type ReactElement } from "react";

import { useTranslations } from "@/lib/i18n/WorkspaceLocaleProvider";

import { usePostSchedulerComposerDraft } from "../_context/PostSchedulerComposerDraftContext";
import { usePostSchedulerComposerChannels } from "../_context/PostSchedulerComposerChannelsContext";
import { usePostSchedulerComposerInModal } from "../_context/PostSchedulerComposerModalLayoutContext";
import { PostSchedulerCreatePostCard } from "./PostSchedulerCreatePostCard";

const PostSchedulerLivePreviewPanel = dynamic(
  () =>
    import("./PostSchedulerLivePreviewPanel").then((m) => ({
      default: m.PostSchedulerLivePreviewPanel,
    })),
  { ssr: false },
);

const stagger = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
};

/**
 * Draft editor and live preview: wider composer column on large screens, stacked on small.
 */
export function PostSchedulerComposerSection(): ReactElement {
  const { t } = useTranslations();
  const { draftScope, contentMode, livePreviewEnabled } = usePostSchedulerComposerDraft();
  const { selectedAccounts } = usePostSchedulerComposerChannels();
  const inModal = usePostSchedulerComposerInModal();
  const showSocialPreview = livePreviewEnabled && contentMode === "social";
  const showBlogPreview = livePreviewEnabled && contentMode === "blog";
  const [editorBodyAreaHeight, setEditorBodyAreaHeight] = useState<number | null>(null);
  const syncPreviewHeight = showSocialPreview || showBlogPreview;
  const wordpressOnlyComposer =
    selectedAccounts.length > 0 &&
    selectedAccounts.every((a) => a.platform === "wordpress");
  /** Modal composer: fill viewport above footer (social + WordPress-only blog). */
  const fillModalHeight =
    inModal &&
    (contentMode === "social" || (contentMode === "blog" && wordpressOnlyComposer));
  return (
    <section
      aria-label={t("postScheduler.composer.composerAria")}
      className={`grid w-full min-w-0 grid-cols-1 gap-4 lg:gap-x-6 lg:gap-y-0 xl:gap-x-8 ${
        fillModalHeight
          ? "flex-1 min-h-0 lg:min-h-full lg:items-stretch"
          : inModal
            ? "min-h-0 lg:items-start"
            : "h-full min-h-0 flex-1 lg:min-h-[min(70vh,50rem)] lg:items-stretch"
      } ${
        showSocialPreview || showBlogPreview
          ? "lg:grid-cols-[minmax(0,1.22fr)_minmax(0,0.78fr)] xl:grid-cols-[minmax(0,1.25fr)_minmax(0,0.75fr)]"
          : "lg:grid-cols-1"
      }`}
    >
      <motion.div
        {...stagger}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        className={`flex min-h-0 min-w-0 flex-col lg:min-w-0 ${
          fillModalHeight || inModal
            ? "flex h-full min-h-0 flex-col"
            : contentMode === "social" && syncPreviewHeight
              ? "h-full lg:overflow-y-auto"
              : contentMode === "blog" && syncPreviewHeight
                ? "h-auto lg:self-start"
                : "h-full lg:overflow-y-auto"
        }`}
      >
        <PostSchedulerCreatePostCard
          onBodyAreaHeightChange={
            (inModal && (contentMode === "social" || wordpressOnlyComposer)) ||
            syncPreviewHeight
              ? setEditorBodyAreaHeight
              : undefined
          }
        />
      </motion.div>
      {showSocialPreview || showBlogPreview ? (
        <motion.div
          {...stagger}
          transition={{
            duration: 0.3,
            ease: [0.22, 1, 0.36, 1],
            delay: 0.06,
          }}
          className={`flex min-h-0 min-w-0 w-full flex-col self-stretch lg:min-w-0 ${
            fillModalHeight ? "h-full min-h-0" : inModal ? "" : "h-full lg:overflow-visible"
          }`}
        >
          <PostSchedulerLivePreviewPanel
            editorBodyAreaHeight={syncPreviewHeight ? editorBodyAreaHeight : null}
          />
        </motion.div>
      ) : null}
    </section>
  );
}
