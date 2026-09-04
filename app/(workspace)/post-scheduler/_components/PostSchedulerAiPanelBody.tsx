"use client";

import { useState } from "react";

import { useTranslations } from "@/lib/i18n/WorkspaceLocaleProvider";

import { usePostSchedulerComposerDraft } from "../_context/PostSchedulerComposerDraftContext";
import { usePostSchedulerAiToolkit } from "../_context/PostSchedulerAiToolkitContext";
import { PostSchedulerAiToolkitQuickPromptsProvider } from "../_context/PostSchedulerAiToolkitQuickPromptsContext";
import type { PostSchedulerAiToolkitSectionId } from "../_data/postSchedulerAiToolkitSectionData";
import { PostSchedulerAiToolkitBlogPanel } from "./PostSchedulerAiToolkitBlogPanel";
import { PostSchedulerAiToolkitOutputLanguage } from "./PostSchedulerAiToolkitOutputLanguage";
import { PostSchedulerAiToolkitSectionsNav } from "./PostSchedulerAiToolkitSectionsNav";

export function PostSchedulerAiPanelBody(): React.ReactElement {
  const { t } = useTranslations();
  const { editorBody, editorMedia, contentMode } = usePostSchedulerComposerDraft();
  const toolkit = usePostSchedulerAiToolkit();

  const [expanded, setExpanded] =
    useState<PostSchedulerAiToolkitSectionId | null>("ideas");
  const [ideaPrompt, setIdeaPrompt] = useState("");
  const [blogInput, setBlogInput] = useState("");
  const [imageGenPrompt, setImageGenPrompt] = useState("");
  const [imageToContentPrompt, setImageToContentPrompt] = useState("");
  const [videoToContentPrompt, setVideoToContentPrompt] = useState("");
  const [editPrompt, setEditPrompt] = useState("");

  const selectedContentPreview = editorBody.trim().slice(0, 280);
  const hasImage = Boolean(
    editorMedia.find((m) => m.mediaType === "image")?.publicUrl?.trim(),
  );
  const hasVideo = Boolean(
    editorMedia.find((m) => m.mediaType === "video")?.publicUrl?.trim(),
  );

  const busy =
    toolkit.isGeneratingIdeaDraft ||
    toolkit.isGeneratingBlogDraft ||
    toolkit.isGeneratingImage ||
    toolkit.isGeneratingImageToContent ||
    toolkit.isGeneratingVideoToContent ||
    toolkit.isEditingImage;

  if (contentMode === "blog") {
    return (
      <PostSchedulerAiToolkitQuickPromptsProvider>
        <div className="flex min-h-0 flex-1 flex-col gap-3">
          <PostSchedulerAiToolkitOutputLanguage compact />
          <PostSchedulerAiToolkitBlogPanel
            input={blogInput}
            onInputChange={setBlogInput}
            isGenerating={
              toolkit.isGeneratingBlogDraft || toolkit.wordpressArticleGenerating
            }
            onGenerate={() => {
              void toolkit.applyBlogDraft(blogInput);
            }}
          />
        </div>
      </PostSchedulerAiToolkitQuickPromptsProvider>
    );
  }

  return (
    <PostSchedulerAiToolkitQuickPromptsProvider>
      <div className="flex min-h-0 flex-1 flex-col">
      <PostSchedulerAiToolkitOutputLanguage compact />
      <p className="mb-3 mt-3 text-[10px] font-medium uppercase tracking-wide text-on-surface-variant/80">
        {t("postScheduler.aiToolkit.allToolsHint")}
      </p>
      <PostSchedulerAiToolkitSectionsNav
        expanded={expanded}
        setExpanded={setExpanded}
        busy={busy}
        selectedContentPreview={selectedContentPreview}
        hasImage={hasImage}
        hasVideo={hasVideo}
        ideaPrompt={ideaPrompt}
        setIdeaPrompt={setIdeaPrompt}
        imageGenPrompt={imageGenPrompt}
        setImageGenPrompt={setImageGenPrompt}
        imageToContentPrompt={imageToContentPrompt}
        setImageToContentPrompt={setImageToContentPrompt}
        videoToContentPrompt={videoToContentPrompt}
        setVideoToContentPrompt={setVideoToContentPrompt}
        editPrompt={editPrompt}
        setEditPrompt={setEditPrompt}
        isGeneratingIdeaDraft={toolkit.isGeneratingIdeaDraft}
        isGeneratingImage={toolkit.isGeneratingImage}
        isGeneratingImageToContent={toolkit.isGeneratingImageToContent}
        isGeneratingVideoToContent={toolkit.isGeneratingVideoToContent}
        isEditingImage={toolkit.isEditingImage}
        applyIdeaDraft={toolkit.applyIdeaDraft}
        runGenerateImage={toolkit.runGenerateImage}
        runImageToContent={toolkit.runImageToContent}
        runVideoToContent={toolkit.runVideoToContent}
        runEditImage={toolkit.runEditImage}
      />
      </div>
    </PostSchedulerAiToolkitQuickPromptsProvider>
  );
}
