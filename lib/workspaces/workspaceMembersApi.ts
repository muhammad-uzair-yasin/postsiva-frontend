import { getApiBaseUrl } from "@/lib/api/config";
import { fetchWithAccessTokenRetry } from "@/lib/api/fetchWithAccessTokenRetry";

/** Seeded in migration 017: 1=owner, 2=editor, 3=publisher */
export const WORKSPACE_ROLE_EDITOR = 2;
export const WORKSPACE_ROLE_PUBLISHER = 3;

export interface WorkspaceMemberRow {
  user_id: string;
  email: string;
  role_name: string;
}

/** GET /workspaces/:id/invites — pending email invites (owner only). */
export interface PendingWorkspaceInviteRow {
  id: string;
  email: string;
  role_name: string;
  expires_at: string;
  expired: boolean;
}

/** POST /workspaces/:id/members response (member added or invite email sent). */
export type AddMemberResult =
  | { outcome: "member"; member: WorkspaceMemberRow }
  | {
      outcome: "invite_sent";
      invite_email: string;
      expires_in_days: number;
    };

export async function listWorkspaceMembers(
  accessToken: string,
  workspaceId: string,
): Promise<WorkspaceMemberRow[]> {
  const base = getApiBaseUrl();
  const res = await fetchWithAccessTokenRetry(
    `${base}/workspaces/${encodeURIComponent(workspaceId)}/members`,
    accessToken,
    (t) => ({
      Authorization: `Bearer ${t}`,
      Accept: "application/json",
    }),
    { method: "GET" },
  );
  const data: unknown = await res.json();
  if (!Array.isArray(data)) {
    return [];
  }
  return data as WorkspaceMemberRow[];
}

function parsePendingInviteRow(raw: unknown): PendingWorkspaceInviteRow | null {
  if (typeof raw !== "object" || raw === null) {
    return null;
  }
  const o = raw as Record<string, unknown>;
  const idRaw = o.id;
  const email = o.email;
  const roleName = o.role_name;
  const expiresAtRaw = o.expires_at;
  const expiredRaw = o.expired;
  if (typeof email !== "string" || typeof roleName !== "string") {
    return null;
  }
  const id =
    typeof idRaw === "string"
      ? idRaw
      : idRaw != null
        ? String(idRaw)
        : "";
  if (!id.trim()) {
    return null;
  }
  let expiresAt: string;
  if (typeof expiresAtRaw === "string") {
    expiresAt = expiresAtRaw;
  } else if (expiresAtRaw instanceof Date && !Number.isNaN(expiresAtRaw.getTime())) {
    expiresAt = expiresAtRaw.toISOString();
  } else {
    return null;
  }
  let expired = false;
  if (typeof expiredRaw === "boolean") {
    expired = expiredRaw;
  } else if (expiresAt) {
    const t = new Date(expiresAt).getTime();
    if (!Number.isNaN(t)) {
      expired = t < Date.now();
    }
  }
  return {
    id,
    email,
    role_name: roleName,
    expires_at: expiresAt,
    expired,
  };
}

export async function listWorkspacePendingInvites(
  accessToken: string,
  workspaceId: string,
): Promise<PendingWorkspaceInviteRow[]> {
  const base = getApiBaseUrl();
  try {
    const res = await fetchWithAccessTokenRetry(
      `${base}/workspaces/${encodeURIComponent(workspaceId)}/invites`,
      accessToken,
      (t) => ({
        Authorization: `Bearer ${t}`,
        Accept: "application/json",
      }),
      { method: "GET" },
    );
    const data: unknown = await res.json();
    if (!Array.isArray(data)) {
      return [];
    }
    return data
      .map(parsePendingInviteRow)
      .filter((row): row is PendingWorkspaceInviteRow => row !== null);
  } catch (e) {
    const msg = (e instanceof Error ? e.message : "").toLowerCase();
    // Route missing on older deployments (FastAPI 404 → detail "Not Found")
    if (msg.includes("not found")) {
      return [];
    }
    // Member but not owner: GET /invites returns 403
    if (
      msg.includes("only the owner") ||
      msg.includes("forbidden") ||
      msg.includes("403")
    ) {
      return [];
    }
    throw e;
  }
}

export async function resendWorkspaceInviteEmail(
  accessToken: string,
  workspaceId: string,
  inviteId: string,
): Promise<{ message: string }> {
  const base = getApiBaseUrl();
  const res = await fetchWithAccessTokenRetry(
    `${base}/workspaces/${encodeURIComponent(workspaceId)}/invites/${encodeURIComponent(inviteId)}/resend`,
    accessToken,
    (t) => ({
      Authorization: `Bearer ${t}`,
      Accept: "application/json",
    }),
    { method: "POST" },
  );
  const raw: unknown = await res.json().catch(() => null);
  if (!res.ok) {
    const msg =
      typeof raw === "object" && raw !== null && "detail" in raw
        ? String((raw as { detail: unknown }).detail)
        : `Request failed (${res.status})`;
    throw new Error(msg);
  }
  if (raw !== null && typeof raw === "object" && "message" in raw) {
    const m = (raw as { message: unknown }).message;
    if (typeof m === "string") {
      return { message: m };
    }
  }
  return { message: "Invitation sent." };
}

export async function addWorkspaceMemberByEmail(
  accessToken: string,
  workspaceId: string,
  email: string,
  roleId: number,
): Promise<AddMemberResult> {
  const base = getApiBaseUrl();
  const res = await fetchWithAccessTokenRetry(
    `${base}/workspaces/${encodeURIComponent(workspaceId)}/members`,
    accessToken,
    (t) => ({
      Authorization: `Bearer ${t}`,
      "Content-Type": "application/json",
    }),
    {
      method: "POST",
      body: JSON.stringify({ email: email.trim(), role_id: roleId }),
    },
  );
  const raw: unknown = await res.json().catch(() => null);
  if (!res.ok) {
    const msg =
      typeof raw === "object" && raw !== null && "detail" in raw
        ? String((raw as { detail: unknown }).detail)
        : `Request failed (${res.status})`;
    throw new Error(msg);
  }
  if (raw === null || typeof raw !== "object") {
    throw new Error("Empty or invalid JSON from server");
  }
  const data = raw as Record<string, unknown>;

  if (data.outcome === "invite_sent") {
    const inviteEmail = data.invite_email;
    const daysRaw = data.expires_in_days;
    const days =
      typeof daysRaw === "number"
        ? daysRaw
        : typeof daysRaw === "string"
          ? Number.parseInt(daysRaw, 10)
          : Number.NaN;
    if (typeof inviteEmail === "string" && inviteEmail.trim() && Number.isFinite(days)) {
      return {
        outcome: "invite_sent",
        invite_email: inviteEmail.trim(),
        expires_in_days: days,
      };
    }
  }

  if (data.outcome === "member" && data.member && typeof data.member === "object") {
    const m = data.member as Record<string, unknown>;
    const userId = m.user_id;
    const email = m.email;
    const roleName = m.role_name;
    if (userId != null && email != null && roleName != null) {
      return {
        outcome: "member",
        member: {
          user_id: String(userId),
          email: String(email),
          role_name: String(roleName),
        },
      };
    }
  }

  // Legacy: older API returned WorkspaceMemberRow at top level (no outcome).
  if (
    data.outcome === undefined &&
    data.user_id != null &&
    data.email != null &&
    data.role_name != null
  ) {
    return {
      outcome: "member",
      member: {
        user_id: String(data.user_id),
        email: String(data.email),
        role_name: String(data.role_name),
      },
    };
  }

  throw new Error(
    `Unexpected response from server: ${JSON.stringify(raw).slice(0, 400)}`,
  );
}
