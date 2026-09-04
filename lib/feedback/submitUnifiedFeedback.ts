import {
  getStoredAccessToken,
  getStoredUser,
  STORAGE_KEY_WORKSPACE_ID,
} from "@/lib/auth/session";
import { N8N_NOTIFY_WEBHOOK_URL } from "@/lib/integrations/n8nNotifyWebhook";

import { createFeedbackItem, type ApiFeedbackType } from "./feedbackApi";
import type { FeedbackCategoryId, FeedbackPriorityId } from "@/app/(workspace)/feedback/_types/feedbackForm";

export interface SubmitUnifiedFeedbackInput {
  category: FeedbackCategoryId;
  priority: FeedbackPriorityId;
  subject: string;
  description: string;
}

export interface SubmitUnifiedFeedbackResult {
  ok: boolean;
  error?: string;
  persistedToApi: boolean;
  notifiedWebhook: boolean;
}

function mapCategory(
  category: FeedbackCategoryId,
): { apiType: ApiFeedbackType; label: string } {
  if (category === "bug") {
    return { apiType: "bug", label: "bug" };
  }
  if (category === "feature") {
    return { apiType: "feature_request", label: "feature" };
  }
  return { apiType: "feature_request", label: "improvement" };
}

function buildDescription(
  category: FeedbackCategoryId,
  priority: FeedbackPriorityId,
  body: string,
): string {
  const trimmed = body.trim();
  const head =
    category === "improvement"
      ? `Category: improvement\nPriority: ${priority}\n\n`
      : priority !== "medium"
        ? `Priority: ${priority}\n\n`
        : "";
  return `${head}${trimmed}`;
}

function splitName(fullName: string): { firstName: string; lastName: string } {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) {
    return { firstName: "", lastName: "" };
  }
  if (parts.length === 1) {
    return { firstName: parts[0] ?? "", lastName: "" };
  }
  return {
    firstName: parts[0] ?? "",
    lastName: parts.slice(1).join(" "),
  };
}

/**
 * Matches LinkedIn Postsiva: POST /feedback when logged in, plus n8n webhook
 * (same pipeline as marketing contact) so you get notification emails.
 */
export async function submitUnifiedFeedback(
  input: SubmitUnifiedFeedbackInput,
): Promise<SubmitUnifiedFeedbackResult> {
  const title = input.subject.trim();
  const { apiType, label } = mapCategory(input.category);
  const description = buildDescription(
    input.category,
    input.priority,
    input.description,
  );

  const user = getStoredUser();
  const { firstName, lastName } = splitName(user?.full_name ?? "");
  const workspaceId =
    typeof window !== "undefined"
      ? window.localStorage.getItem(STORAGE_KEY_WORKSPACE_ID)
      : null;

  let notifiedWebhook = false;
  try {
    const res = await fetch(N8N_NOTIFY_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        source: "Unified Postsiva Feedback",
        feedback_category: label,
        priority: input.priority,
        title,
        message: description,
        description,
        firstName,
        lastName,
        email: user?.email ?? "",
        user_id: user?.id ?? null,
        workspace_id: workspaceId,
        api_feedback_type: apiType,
        date: new Date().toISOString(),
      }),
    });
    notifiedWebhook = res.ok;
  } catch {
    notifiedWebhook = false;
  }

  const token = getStoredAccessToken();
  let persistedToApi = false;
  if (token) {
    try {
      const apiResult = await createFeedbackItem(token, {
        type: apiType,
        title,
        description,
      });
      persistedToApi = apiResult.success;
    } catch {
      persistedToApi = false;
    }
  }

  const ok = notifiedWebhook || persistedToApi;
  return {
    ok,
    error: ok
      ? undefined
      : "Could not send feedback. Check your connection and try again.",
    persistedToApi,
    notifiedWebhook,
  };
}
