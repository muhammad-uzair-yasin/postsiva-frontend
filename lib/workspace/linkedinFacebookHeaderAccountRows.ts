import type { WorkspaceHeaderAccountRow } from "./headerAccountsTypes";
import { linkedinOrganizationLogoUrl } from "./linkedinOrganizationLogoUrl";

function isRecord(v: unknown): v is Record<string, unknown> {
  return v !== null && typeof v === "object";
}

function nonEmptyString(v: unknown): string | null {
  if (typeof v !== "string") {
    return null;
  }
  const t = v.trim();
  return t.length > 0 ? t : null;
}

function linkedinMemberPicture(block: Record<string, unknown>): string | undefined {
  const profile = block.profile;
  if (!isRecord(profile)) {
    return undefined;
  }
  const pic = nonEmptyString(profile.picture);
  return pic ?? undefined;
}

function linkedInPersonalDisplayName(block: Record<string, unknown>): string {
  const fallback = "LinkedIn";
  const profile = block.profile;
  if (!isRecord(profile)) {
    return fallback;
  }
  const parts = [
    nonEmptyString(profile.given_name),
    nonEmptyString(profile.family_name),
  ].filter((x): x is string => Boolean(x));
  const combined = parts.join(" ").trim();
  return (
    nonEmptyString(profile.name) ??
    (combined.length > 0 ? combined : null) ??
    nonEmptyString(profile.vanity_name) ??
    fallback
  );
}

function orgDisplayName(org: Record<string, unknown>, index: number): string {
  return (
    nonEmptyString(org.page_name) ??
    nonEmptyString(org.localized_name) ??
    `LinkedIn page ${index + 1}`
  );
}

function orgStableId(org: Record<string, unknown>, index: number): string {
  const raw = nonEmptyString(org.page_id) ?? nonEmptyString(org.numeric_id);
  if (raw) {
    return raw.replace(/:/g, "_");
  }
  return `idx_${index}`;
}

function pagePictureUrl(page: Record<string, unknown>): string | undefined {
  const pic =
    nonEmptyString(page.picture_url) ??
    nonEmptyString(page.profile_picture_url) ??
    nonEmptyString(page.picture);
  return pic ?? undefined;
}

function pageDisplayName(page: Record<string, unknown>, index: number): string {
  return nonEmptyString(page.page_name) ?? `Facebook page ${index + 1}`;
}

function pageStableId(page: Record<string, unknown>, index: number): string {
  const raw = nonEmptyString(page.page_id);
  if (raw) {
    return raw.replace(/:/g, "_");
  }
  return `idx_${index}`;
}

function connectionRowsFromMeta(
  block: Record<string, unknown>,
): WorkspaceHeaderAccountRow[] | null {
  if (block.selection_mode !== true) {
    return null;
  }
  const connectionsRaw = block.connections;
  if (!Array.isArray(connectionsRaw) || connectionsRaw.length === 0) {
    return [];
  }
  const iconId = "linkedin" as const;
  const rows: WorkspaceHeaderAccountRow[] = [];
  connectionsRaw.filter(isRecord).forEach((conn, i) => {
    const kind = nonEmptyString(conn.kind) ?? "page";
    const destinationKey = nonEmptyString(conn.destination_key);
    const pageId = nonEmptyString(conn.page_id);
    const label =
      nonEmptyString(conn.display_name) ??
      (kind === "personal" ? linkedInPersonalDisplayName(block) : `LinkedIn page ${i + 1}`);
    const avatar =
      nonEmptyString(conn.avatar_url) ??
      (kind === "personal" ? linkedinMemberPicture(block) : undefined);
    if (kind === "personal") {
      rows.push({
        id: "linkedin",
        iconId,
        label,
        avatarUrl: avatar ?? undefined,
        hint: "LinkedIn · Personal",
        // destination_key for per-target unlink
        targetResourceId: destinationKey ?? "personal",
      });
      return;
    }
    const stable =
      pageId?.replace(/:/g, "_") ??
      destinationKey?.replace(/:/g, "_") ??
      `idx_${i}`;
    rows.push({
      id: `linkedin:org:${stable}`,
      iconId,
      label,
      avatarUrl: avatar ?? undefined,
      hint: "LinkedIn · Page",
      targetResourceId: pageId ?? destinationKey,
    });
  });
  return rows;
}

export function buildLinkedInHeaderAccountRows(
  block: unknown,
): WorkspaceHeaderAccountRow[] {
  const iconId = "linkedin" as const;
  const platformLabel = "LinkedIn";
  if (!isRecord(block)) {
    return [];
  }

  const fromConnections = connectionRowsFromMeta(block);
  if (fromConnections !== null) {
    return fromConnections;
  }

  // Legacy umbrella: personal + all orgs (existing users kept as-is).
  const orgsRaw = block.organizations;
  const organizations = Array.isArray(orgsRaw) ? orgsRaw.filter(isRecord) : [];
  const memberAvatar = linkedinMemberPicture(block);
  const includePersonal = block.include_personal !== false;
  if (organizations.length === 0) {
    if (!includePersonal && !block.profile) {
      return [];
    }
    return [
      {
        id: "linkedin",
        iconId,
        label: linkedInPersonalDisplayName(block),
        avatarUrl: memberAvatar,
        hint: platformLabel,
        targetResourceId: "personal",
      },
    ];
  }
  const rows: WorkspaceHeaderAccountRow[] = [];
  if (includePersonal) {
    rows.push({
      id: "linkedin",
      iconId,
      label: linkedInPersonalDisplayName(block),
      avatarUrl: memberAvatar,
      hint: `${platformLabel} · Personal`,
      targetResourceId: "personal",
    });
  }
  organizations.forEach((org, i) => {
    const n = i + 1;
    const pageId =
      nonEmptyString(org.page_id) ?? nonEmptyString(org.numeric_id) ?? null;
    rows.push({
      id: `linkedin:org:${orgStableId(org, i)}`,
      iconId,
      label: orgDisplayName(org, i),
      avatarUrl: linkedinOrganizationLogoUrl(org) ?? memberAvatar,
      hint: `${platformLabel} · Page ${n}`,
      targetResourceId: pageId,
    });
  });
  return rows;
}

export function buildFacebookHeaderAccountRows(
  block: unknown,
): WorkspaceHeaderAccountRow[] {
  const iconId = "facebook" as const;
  const platformLabel = "Facebook";
  if (!isRecord(block)) {
    return [];
  }
  const pagesRaw = block.pages;
  const pages = Array.isArray(pagesRaw) ? pagesRaw.filter(isRecord) : [];
  if (pages.length === 0) {
    return [];
  }
  // Never expose the personal Facebook profile: every row is a Page.
  return pages.map((page, i) => {
    const n = i + 1;
    const isBusinessManager =
      page.support_status === "unsupported_bm" || page.is_business_manager === true;
    return {
      id: `facebook:page:${pageStableId(page, i)}`,
      iconId,
      label: pageDisplayName(page, i),
      avatarUrl: pagePictureUrl(page),
      hint: `${platformLabel} · Page ${n}`,
      targetResourceId: nonEmptyString(page.page_id),
      disabled: isBusinessManager,
      disabledMessage: isBusinessManager
        ? nonEmptyString(page.availability_message) ??
          "We can't manage Meta Business Suite pages yet. This is coming soon."
        : undefined,
    };
  });
}
