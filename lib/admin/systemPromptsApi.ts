/**
 * Admin System Prompts API client (Phase 1 registry + versions).
 */

import { adminGet, adminSend } from "./adminFetch";

export interface SystemPromptListItem {
  prompt_key: string;
  title: string;
  blurb: string;
  is_default: boolean;
  active_version?: number | null;
  updated_at?: string | null;
  updated_by?: string | null;
  body_chars: number;
}

export interface SystemPromptDetail {
  prompt_key: string;
  title: string;
  blurb: string;
  body: string;
  default_body: string;
  is_default: boolean;
  active_version?: number | null;
  active_version_id?: number | null;
  updated_at?: string | null;
  updated_by?: string | null;
}

export interface SystemPromptVersionItem {
  id: number;
  version: number;
  body: string;
  note?: string | null;
  created_at: string;
  created_by?: string | null;
  is_active: boolean;
}

const BASE = "/admin/api/system-prompts";

export function listSystemPrompts(signal?: AbortSignal) {
  return adminGet<{ prompts: SystemPromptListItem[] }>(BASE, signal);
}

export function getSystemPrompt(key: string, signal?: AbortSignal) {
  return adminGet<SystemPromptDetail>(`${BASE}/${encodeURIComponent(key)}`, signal);
}

export function listSystemPromptVersions(key: string, signal?: AbortSignal) {
  return adminGet<{ prompt_key: string; versions: SystemPromptVersionItem[] }>(
    `${BASE}/${encodeURIComponent(key)}/versions`,
    signal,
  );
}

export function saveSystemPromptVersion(key: string, body: string, note?: string) {
  return adminSend<SystemPromptDetail>("POST", `${BASE}/${encodeURIComponent(key)}/versions`, {
    body,
    note: note || null,
  });
}

export function activateSystemPromptVersion(key: string, versionId: number) {
  return adminSend<SystemPromptDetail>("POST", `${BASE}/${encodeURIComponent(key)}/activate`, {
    version_id: versionId,
  });
}

export function resetSystemPrompt(key: string) {
  return adminSend<SystemPromptDetail>("POST", `${BASE}/${encodeURIComponent(key)}/reset`);
}
