export type PostSchedulerAiToolkitSectionId =
  | "ideas"
  | "imageGen"
  | "imageToContent"
  | "videoToContent"
  | "editImage";

export const POST_SCHEDULER_AI_TOOLKIT_SECTIONS: {
  id: PostSchedulerAiToolkitSectionId;
  titleKey: string;
  icon: string;
}[] = [
  { id: "ideas", titleKey: "postScheduler.aiToolkit.sectionIdeas", icon: "lightbulb" },
  { id: "imageGen", titleKey: "postScheduler.aiToolkit.sectionImageGen", icon: "image_search" },
  {
    id: "imageToContent",
    titleKey: "postScheduler.aiToolkit.sectionImageToContent",
    icon: "description",
  },
  {
    id: "videoToContent",
    titleKey: "postScheduler.aiToolkit.sectionVideoToContent",
    icon: "movie",
  },
  { id: "editImage", titleKey: "postScheduler.aiToolkit.sectionEditImage", icon: "brush" },
];
