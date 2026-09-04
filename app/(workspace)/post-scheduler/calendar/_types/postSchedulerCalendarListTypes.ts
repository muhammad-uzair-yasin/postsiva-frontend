export type PipelinePlatformId = "instagram" | "x" | "tiktok" | "linkedin";

export type CalendarListRow =
  | {
      kind: "pipeline_card";
      id: string;
      status: "scheduled" | "draft";
      scheduledAt: Date;
      handle: string;
      body: string;
      platforms: readonly PipelinePlatformId[];
      imageUrl: string;
      isVideo?: boolean;
      footerAction: "view_analytics" | "review_schedule";
      timelineDot: "secondary" | "primary_soft";
    }
  | {
      kind: "empty_slot";
      id: string;
      scheduledAt: Date;
    };

export interface CalendarListDaySection {
  day: Date;
  rows: CalendarListRow[];
}
