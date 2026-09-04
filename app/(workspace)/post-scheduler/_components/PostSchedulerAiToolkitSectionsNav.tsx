"use client";

import { useTranslations } from "@/lib/i18n/WorkspaceLocaleProvider";

import {
  POST_SCHEDULER_AI_TOOLKIT_SECTIONS,
  type PostSchedulerAiToolkitSectionId,
} from "../_data/postSchedulerAiToolkitSectionData";
import { PostSchedulerAiToolkitExpandedPanel } from "./PostSchedulerAiToolkitExpandedPanel";

interface PostSchedulerAiToolkitSectionsNavProps {
  readonly expanded: PostSchedulerAiToolkitSectionId | null;
  readonly setExpanded: (id: PostSchedulerAiToolkitSectionId | null) => void;
  readonly busy: boolean;
  readonly selectedContentPreview: string;
  readonly hasImage: boolean;
  readonly hasVideo: boolean;
  readonly ideaPrompt: string;
  readonly setIdeaPrompt: (v: string) => void;
  readonly imageGenPrompt: string;
  readonly setImageGenPrompt: (v: string) => void;
  readonly imageToContentPrompt: string;
  readonly setImageToContentPrompt: (v: string) => void;
  readonly videoToContentPrompt: string;
  readonly setVideoToContentPrompt: (v: string) => void;
  readonly editPrompt: string;
  readonly setEditPrompt: (v: string) => void;
  readonly isGeneratingIdeaDraft: boolean;
  readonly isGeneratingImage: boolean;
  readonly isGeneratingImageToContent: boolean;
  readonly isGeneratingVideoToContent: boolean;
  readonly isEditingImage: boolean;
  readonly applyIdeaDraft: (idea: string) => Promise<void>;
  readonly runGenerateImage: (req: string) => Promise<void>;
  readonly runImageToContent: (req: string) => Promise<void>;
  readonly runVideoToContent: (req: string) => Promise<void>;
  readonly runEditImage: (req: string) => Promise<void>;
}

export function PostSchedulerAiToolkitSectionsNav(
  props: PostSchedulerAiToolkitSectionsNavProps,
): React.ReactElement {
  const {
    expanded,
    setExpanded,
    busy,
    selectedContentPreview,
    hasImage,
    hasVideo,
    ideaPrompt,
    setIdeaPrompt,
    imageGenPrompt,
    setImageGenPrompt,
    imageToContentPrompt,
    setImageToContentPrompt,
    videoToContentPrompt,
    setVideoToContentPrompt,
    editPrompt,
    setEditPrompt,
    isGeneratingIdeaDraft,
    isGeneratingImage,
    isGeneratingImageToContent,
    isGeneratingVideoToContent,
    isEditingImage,
    applyIdeaDraft,
    runGenerateImage,
    runImageToContent,
    runVideoToContent,
    runEditImage,
  } = props;
  const { t } = useTranslations();

  return (
    <nav className="custom-scrollbar min-h-0 flex-1 space-y-2 overflow-y-auto pr-1">
      {POST_SCHEDULER_AI_TOOLKIT_SECTIONS.map((s) => {
        const isOpen = expanded === s.id;
        return (
          <div
            key={s.id}
            className="overflow-hidden rounded-lg border border-outline-variant/10 bg-surface-container-lowest/80"
          >
            <button
              type="button"
              disabled={busy && !isOpen}
              onClick={() => {
                setExpanded(isOpen ? null : s.id);
              }}
              className="flex w-full items-center justify-between gap-2 px-3 py-2.5 text-left transition-colors hover:bg-surface-container-high"
            >
              <span className="flex items-center gap-2 font-body text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">
                <span className="material-symbols-outlined text-base text-secondary">
                  {s.icon}
                </span>
                {t(s.titleKey)}
              </span>
              <span className="material-symbols-outlined text-on-surface-variant">
                {isOpen ? "expand_less" : "expand_more"}
              </span>
            </button>
            {isOpen ? (
              <div className="border-t border-outline-variant/10 bg-surface-container-high/40 px-3 pb-3 pt-1">
                <PostSchedulerAiToolkitExpandedPanel
                  sectionId={s.id}
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
                  isGeneratingIdeaDraft={isGeneratingIdeaDraft}
                  isGeneratingImage={isGeneratingImage}
                  isGeneratingImageToContent={isGeneratingImageToContent}
                  isGeneratingVideoToContent={isGeneratingVideoToContent}
                  isEditingImage={isEditingImage}
                  applyIdeaDraft={applyIdeaDraft}
                  runGenerateImage={runGenerateImage}
                  runImageToContent={runImageToContent}
                  runVideoToContent={runVideoToContent}
                  runEditImage={runEditImage}
                />
              </div>
            ) : null}
          </div>
        );
      })}
    </nav>
  );
}
