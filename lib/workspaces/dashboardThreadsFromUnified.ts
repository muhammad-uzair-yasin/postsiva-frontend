import { asRecord, pickString } from "@/lib/dashboard/profilePick";

import type { DashboardConnectedChannel } from "./dashboardConnectedChannels";

/**
 * If the dashboard list has no Threads card yet but unified profiles include a
 * Threads profile, append one so the account shows (e.g. before login payload
 * exposes threads_connected).
 */
export function appendThreadsChannelIfMissingFromUnified(
  base: DashboardConnectedChannel[],
  unified: Record<string, unknown> | null,
): DashboardConnectedChannel[] {
  if (base.some((c) => c.platform === "threads")) {
    return base;
  }
  if (!unified) {
    return base;
  }
  const slice = asRecord(unified["threads"]);
  if (!slice) {
    return base;
  }
  const profile = asRecord(slice.profile);
  if (!profile) {
    return base;
  }
  const username = pickString(profile, ["username"]);
  const fullName = pickString(profile, ["full_name"]);
  const title =
    fullName ||
    (username ? `@${username.replace(/^@/, "")}` : null) ||
    "Threads account";
  return [
    ...base,
    {
      key: "threads",
      platform: "threads",
      title,
      subtitle: "Threads",
      avatarUrl: pickString(profile, ["profile_picture_url"]),
    },
  ];
}
