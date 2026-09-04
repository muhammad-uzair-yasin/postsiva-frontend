import type { FeedbackCategoryId } from "../_types/feedbackForm";

export interface FeedbackCategoryCardDef {
  id: FeedbackCategoryId;
  title: string;
  description: string;
  icon: string;
  iconBox: string;
  iconFilled?: boolean;
  selectedRing: boolean;
}

export const FEEDBACK_CATEGORY_CARDS: readonly FeedbackCategoryCardDef[] = [
  {
    id: "bug",
    title: "Report a Bug",
    description: "Something isn't working as expected.",
    icon: "bug_report",
    iconBox: "bg-error-container/20 text-error",
    selectedRing: false,
  },
  {
    id: "feature",
    title: "Feature Request",
    description: "A new idea to enhance your workflow.",
    icon: "lightbulb",
    iconBox: "bg-primary-container text-on-primary-container",
    iconFilled: true,
    selectedRing: true,
  },
  {
    id: "improvement",
    title: "Improvement",
    description: "Polish an existing feature or UX.",
    icon: "auto_awesome",
    iconBox: "bg-secondary-container/20 text-secondary",
    selectedRing: false,
  },
];
