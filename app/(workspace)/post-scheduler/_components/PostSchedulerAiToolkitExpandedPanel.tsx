"use client";

import type { PostSchedulerAiToolkitSectionId } from "../_data/postSchedulerAiToolkitSectionData";
import { PostSchedulerAiToolkitEditImagePanel } from "./PostSchedulerAiToolkitEditImagePanel";
import { PostSchedulerAiToolkitIdeasPanel } from "./PostSchedulerAiToolkitIdeasPanel";
import { PostSchedulerAiToolkitImageGenPanel } from "./PostSchedulerAiToolkitImageGenPanel";
import { PostSchedulerAiToolkitImageToContentPanel } from "./PostSchedulerAiToolkitImageToContentPanel";
import { PostSchedulerAiToolkitVideoToContentPanel } from "./PostSchedulerAiToolkitVideoToContentPanel";

interface PostSchedulerAiToolkitExpandedPanelProps {
  readonly sectionId: PostSchedulerAiToolkitSectionId;
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

export function PostSchedulerAiToolkitExpandedPanel(
  p: PostSchedulerAiToolkitExpandedPanelProps,
): React.ReactElement | null {
  switch (p.sectionId) {
    case "ideas":
      return (
        <PostSchedulerAiToolkitIdeasPanel
          ideaPrompt={p.ideaPrompt}
          onIdeaPromptChange={p.setIdeaPrompt}
          isGenerating={p.isGeneratingIdeaDraft}
          onGenerate={() => {
            void p.applyIdeaDraft(p.ideaPrompt);
          }}
        />
      );
    case "imageGen":
      return (
        <PostSchedulerAiToolkitImageGenPanel
          selectedContentPreview={p.selectedContentPreview}
          imageGenPrompt={p.imageGenPrompt}
          onImageGenPromptChange={p.setImageGenPrompt}
          isGenerating={p.isGeneratingImage}
          onGenerate={() => {
            void p.runGenerateImage(p.imageGenPrompt);
          }}
        />
      );
    case "imageToContent":
      return (
        <PostSchedulerAiToolkitImageToContentPanel
          hasImage={p.hasImage}
          imageToContentPrompt={p.imageToContentPrompt}
          onImageToContentPromptChange={p.setImageToContentPrompt}
          isGenerating={p.isGeneratingImageToContent}
          onGenerate={() => {
            void p.runImageToContent(p.imageToContentPrompt);
          }}
        />
      );
    case "videoToContent":
      return (
        <PostSchedulerAiToolkitVideoToContentPanel
          hasVideo={p.hasVideo}
          videoToContentPrompt={p.videoToContentPrompt}
          onVideoToContentPromptChange={p.setVideoToContentPrompt}
          isGenerating={p.isGeneratingVideoToContent}
          onGenerate={() => {
            void p.runVideoToContent(p.videoToContentPrompt);
          }}
        />
      );
    case "editImage":
      return (
        <PostSchedulerAiToolkitEditImagePanel
          hasImage={p.hasImage}
          editPrompt={p.editPrompt}
          onEditPromptChange={p.setEditPrompt}
          isEditing={p.isEditingImage}
          onEdit={() => {
            void p.runEditImage(p.editPrompt);
          }}
        />
      );
    default: {
      const _exhaustive: never = p.sectionId;
      return _exhaustive;
    }
  }
}
