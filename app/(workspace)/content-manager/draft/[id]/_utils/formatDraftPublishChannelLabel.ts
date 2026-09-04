import type { ConnectedContentManagerChannelLabels } from "@/lib/contentManager/fetchConnectedContentManagerChannelLabels";
import type { UnifiedDraftResponseJson } from "@/lib/social/unifiedDraftsApi";

const PLATFORM_LABELS: Record<string, string> = {
  instagram: "Instagram",
  facebook: "Facebook",
  youtube: "YouTube",
  linkedin: "LinkedIn",
  tiktok: "TikTok",
  threads: "Threads",
  bluesky: "Bluesky",
  twitter: "X",
  x: "X",
  pinterest: "Pinterest",
};

function formatPlatformName(raw: string): string {
  const key = raw.trim().toLowerCase();
  return (
    PLATFORM_LABELS[key] ??
    `${raw.charAt(0).toUpperCase()}${raw.slice(1).toLowerCase()}`
  );
}

/** "Page Name (1)" → "Page Name" */
function stripAccountIndexSuffix(label: string): string {
  return label.replace(/\s*\(\d+\)\s*$/, "").trim();
}

function looksLikeNumericId(value: string): boolean {
  return /^\d{6,}$/.test(value.trim());
}

function resolveAccountDisplayName(
  draft: UnifiedDraftResponseJson,
  labels?: ConnectedContentManagerChannelLabels | null,
): string | null {
  const platform = (draft.platform || "").trim().toLowerCase();
  const id = draft.platform_user_id?.trim() ?? "";
  if (!platform || !labels) {
    return null;
  }

  const candidates: string[] = [];
  if (id) {
    candidates.push(`${platform}:${id}`);
  }
  // Facebook drafts sometimes key page via facebook_page_ids
  if (platform === "facebook") {
    for (const pageId of draft.facebook_page_ids ?? []) {
      const pid = pageId?.trim();
      if (pid) candidates.push(`facebook:${pid}`);
    }
  }
  if (platform === "linkedin") {
    for (const orgId of draft.linkedin_page_ids ?? []) {
      const oid = orgId?.trim();
      if (oid) candidates.push(`linkedin:${oid}`);
    }
  }

  for (const key of candidates) {
    const named = labels[key]?.trim();
    if (named) {
      return stripAccountIndexSuffix(named);
    }
  }

  const platformOnly = labels[platform]?.trim();
  if (platformOnly && !looksLikeNumericId(platformOnly)) {
    return stripAccountIndexSuffix(platformOnly);
  }
  return null;
}

/** Human-readable channel for publish confirmation copy (page/account name, not raw id). */
export function formatDraftPublishChannelLabel(
  draft: UnifiedDraftResponseJson,
  labels?: ConnectedContentManagerChannelLabels | null,
): string {
  const platform = formatPlatformName(draft.platform);
  const displayName = resolveAccountDisplayName(draft, labels);
  if (displayName) {
    return `${platform} — ${displayName}`;
  }

  const handle = draft.platform_user_id?.trim();
  // Never show bare numeric Facebook/LinkedIn page ids in user-facing copy
  if (handle && !looksLikeNumericId(handle)) {
    return `${platform} — ${handle}`;
  }
  return platform;
}

/** Short account title for the draft editor header. */
export function formatDraftAccountSummaryLabel(
  draft: UnifiedDraftResponseJson,
  labels?: ConnectedContentManagerChannelLabels | null,
): string {
  const displayName = resolveAccountDisplayName(draft, labels);
  if (displayName) return displayName;

  const handle = draft.platform_user_id?.trim();
  if (handle && !looksLikeNumericId(handle)) return handle;
  return formatPlatformName(draft.platform);
}
