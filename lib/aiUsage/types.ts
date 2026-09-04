export interface AiUsageBreakdownRow {
  key: string;
  label?: string | null;
  credits: number;
  count: number;
}

export interface AiUsageWorkspaceRow extends AiUsageBreakdownRow {
  workspace_id: string;
  name?: string | null;
}

export interface AiUsageDailyRow {
  date: string;
  credits: number;
  count: number;
}

export interface AiUsageSummary {
  period: { start: string; end: string };
  credits: { limit: number; used: number; reserved: number; remaining: number };
  totals: { provider_cost_usd?: number; allowance_consumed_usd?: number };
  resource_usage?: {
    published_posts: { limit: number; used: number; remaining: number };
    scheduled_posts: { limit: number; used: number; remaining: number };
  };
  workspace_activity?: {
    post_published_count: number;
    post_scheduled_count: number;
    draft_saved_count: number;
    comments_posted_count: number;
  };
  breakdown: {
    by_operation: AiUsageBreakdownRow[];
    by_channel: AiUsageBreakdownRow[];
    by_workspace: AiUsageWorkspaceRow[];
    daily: AiUsageDailyRow[];
  };
}

export interface AiUsageEvent {
  id: string;
  created_at: string;
  operation_type: string;
  channel: string;
  workspace_id?: string | null;
  workspace_name?: string | null;
  status: string;
  credits: number;
  steps: AiUsageStep[];
}

export interface AiUsageStep {
  route_key: string;
  status: string;
}

export interface AiUsageEventsPage {
  items: AiUsageEvent[];
  next_cursor?: string | null;
}

export interface AiUsageEventFilters {
  operation?: string;
  channel?: string;
  workspaceId?: string;
  cursor?: string;
}
