import type { WorkspaceMemberRow } from "@/lib/workspaces/workspaceMembersApi";

type AuthUserLike = {
  id?: string;
  full_name?: string;
  username?: string;
  email?: string;
} | null;

export function memberDisplayName(
  member: WorkspaceMemberRow,
  authUser: AuthUserLike,
): string {
  if (authUser?.id && String(member.user_id) === String(authUser.id)) {
    const full = authUser.full_name?.trim();
    if (full) return full;
    const username = authUser.username?.trim();
    if (username) return username;
  }
  const local = member.email.split("@")[0] ?? member.email;
  return local
    .split(/[._-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");
}

export function memberInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0]![0] ?? ""}${parts[1]![0] ?? ""}`.toUpperCase();
  }
  return name.slice(0, 2).toUpperCase() || "?";
}

export function formatMemberRole(roleName: string): string {
  const trimmed = roleName.trim();
  if (!trimmed) return "Member";
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1).toLowerCase();
}
