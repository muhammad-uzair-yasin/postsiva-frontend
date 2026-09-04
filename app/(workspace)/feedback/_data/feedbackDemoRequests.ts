export type FeedbackRequestStatus = "planned" | "under_review" | "completed";

export interface FeedbackDemoRequest {
  ticketId: string;
  title: string;
  updatedLabel: string;
  status: FeedbackRequestStatus;
}

export const FEEDBACK_DEMO_REQUESTS: readonly FeedbackDemoRequest[] = [
  {
    ticketId: "#PS-842",
    title: "Dark Mode contrast improvements",
    updatedLabel: "Updated 2 days ago",
    status: "planned",
  },
  {
    ticketId: "#PS-791",
    title: "Batch export functionality",
    updatedLabel: "Updated 5 hours ago",
    status: "under_review",
  },
  {
    ticketId: "#PS-612",
    title: "Mobile responsiveness fix",
    updatedLabel: "Updated 1 week ago",
    status: "completed",
  },
];
