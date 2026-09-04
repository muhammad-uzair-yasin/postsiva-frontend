/**
 * Public API client for the Postsiva landing page assistant.
 * No authentication required — anonymous visitors only.
 */

import { getApiBaseUrl } from "@/lib/api/config";

export interface LandingAssistantHistoryMessage {
  role: "user" | "assistant";
  content: string;
}

export interface LandingAssistantRequest {
  message: string;
  history: LandingAssistantHistoryMessage[];
  session_id: string;
}

export interface LandingAssistantResponse {
  success: boolean;
  response: string;
}

/**
 * POST /public/postsiva-assistant/chat
 * No auth headers — fully public endpoint.
 */
export async function postLandingAssistantChat(
  body: LandingAssistantRequest,
): Promise<LandingAssistantResponse> {
  const url = `${getApiBaseUrl()}/public/postsiva-assistant/chat`;

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(body),
  });

  if (res.status === 429) {
    throw new Error("Too many messages. Please wait a moment before trying again.");
  }

  if (!res.ok) {
    let detail = res.statusText;
    try {
      const errBody = (await res.json()) as { detail?: string };
      if (typeof errBody.detail === "string") {
        detail = errBody.detail;
      }
    } catch {
      /* ignore */
    }
    throw new Error(detail || `Request failed (${res.status})`);
  }

  const data = (await res.json()) as LandingAssistantResponse;
  if (!data.success) {
    throw new Error("Assistant did not return a successful response.");
  }
  return data;
}

export async function transcribeLandingAudio(blob: Blob): Promise<string> {
  const url = `${getApiBaseUrl()}/public/postsiva-assistant/transcribe`;
  const form = new FormData();
  form.append("file", blob, "voice.webm");
  const res = await fetch(url, { method: "POST", body: form });
  if (!res.ok) throw new Error(`Transcription failed (${res.status})`);
  const data = (await res.json()) as { success: boolean; transcript: string };
  if (!data.success || !data.transcript) throw new Error("Empty transcript.");
  return data.transcript;
}
