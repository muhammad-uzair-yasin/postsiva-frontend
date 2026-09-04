import type { ComposerPostJob } from "./buildComposerPostJobs";
import type { ComposerPostingAccount } from "./composerPostingAccount";
import { formatUnifiedPostPlatformLabel } from "./formatUnifiedPostPlatformLabel";
import { iconPlatformToUnifiedApiPlatform } from "./unifiedPostingPlatforms";
import {
  parseUnifiedPostResultsForUi,
  unifiedPostResponseAllSucceeded,
  type UnifiedPostResultRowParsed,
} from "@/lib/social/unifiedPostingApi";

export type ComposerPublishPhase = "pending" | "posting" | "done";

export interface ComposerPublishProgressRow {
  readonly id: string;
  readonly jobIndex: number;
  readonly platformKey: string;
  readonly label: string;
  readonly phase: ComposerPublishPhase;
  readonly success: boolean;
  readonly message: string;
  readonly error: string | null;
  readonly urls: readonly string[];
  /** Exact API `platform` when disambiguating (e.g. facebook_page:123). */
  readonly resultMatchHint?: string;
}

function platformRowMatchesResult(rowKey: string, resultKey: string): boolean {
  const row = rowKey.trim().toLowerCase();
  const res = resultKey.trim().toLowerCase();
  if (row === res) {
    return true;
  }
  if (res.startsWith(`${row}_`) || res.startsWith(`${row}:`)) {
    return true;
  }
  if (row === "linkedin" && res.startsWith("linkedin")) {
    return true;
  }
  if (row === "facebook" && res.startsWith("facebook")) {
    return true;
  }
  return false;
}

function resultMatchHintForAccount(
  acc: ComposerPostingAccount,
): string | undefined {
  if (acc.platform === "linkedin" && acc.id === "linkedin") {
    return "linkedin_personal";
  }
  const tr = acc.targetResourceId?.trim();
  if (!tr) {
    return undefined;
  }
  if (acc.platform === "facebook") {
    return `facebook_page:${tr}`;
  }
  if (acc.platform === "linkedin" && acc.id.startsWith("linkedin:org:")) {
    return `linkedin_page:${tr}`;
  }
  return undefined;
}

function resolveJobIndexForAccount(
  accountId: string,
  jobs: readonly ComposerPostJob[],
  accounts: readonly ComposerPostingAccount[],
): number {
  for (let i = 0; i < jobs.length; i += 1) {
    if (jobs[i].targetAccountId === accountId) {
      return i;
    }
  }

  const acc = accounts.find((a) => a.id === accountId);
  if (!acc) {
    return 0;
  }
  const plat = iconPlatformToUnifiedApiPlatform(acc.platform);
  if (!plat) {
    return 0;
  }

  for (let i = 0; i < jobs.length; i += 1) {
    const raw = jobs[i].body.platforms;
    const list = Array.isArray(raw)
      ? raw.filter(
          (x): x is string => typeof x === "string" && x.trim().length > 0,
        )
      : [];

    if (plat === "pinterest") {
      if (!list.includes("pinterest")) {
        continue;
      }
      const bid = acc.targetResourceId?.trim();
      const pBody = jobs[i].body.pinterest as { board_id?: string } | undefined;
      const jb = pBody?.board_id?.trim();
      if (bid && jb === bid) {
        return i;
      }
      continue;
    }

    if (list.includes(plat)) {
      return i;
    }
  }
  return 0;
}

/** One row per selected post target — all show loading while their batch runs. */
export function buildPostingProgressRowsFromPostTargets(
  postTargetIds: readonly string[],
  accounts: readonly ComposerPostingAccount[],
  jobs: readonly ComposerPostJob[],
): ComposerPublishProgressRow[] {
  const byId = new Map(accounts.map((a) => [a.id, a]));
  return postTargetIds.map((accountId) => {
    const acc = byId.get(accountId);
    const apiPlat = acc ? iconPlatformToUnifiedApiPlatform(acc.platform) : null;
    const pk = (apiPlat ?? "unknown").toLowerCase();
    const label = apiPlat ? formatUnifiedPostPlatformLabel(apiPlat) : "Unknown";
    const ji = resolveJobIndexForAccount(accountId, jobs, accounts);
    const hint = acc ? resultMatchHintForAccount(acc) : undefined;
    return {
      id: accountId,
      jobIndex: ji,
      platformKey: pk,
      label,
      phase: "pending",
      success: false,
      message: "",
      error: null,
      urls: [],
      ...(hint ? { resultMatchHint: hint } : {}),
    };
  });
}

function parsedRowToProgress(
  row: ComposerPublishProgressRow,
  match: UnifiedPostResultRowParsed,
): ComposerPublishProgressRow {
  return {
    ...row,
    phase: "done",
    success: match.success,
    message: match.message,
    error: match.error,
    urls: match.urls,
  };
}

function pickMatchForRow(
  row: ComposerPublishProgressRow,
  parsed: readonly UnifiedPostResultRowParsed[],
  consumed: Set<number>,
): UnifiedPostResultRowParsed | null {
  if (row.resultMatchHint) {
    const i = parsed.findIndex(
      (p, idx) => !consumed.has(idx) && p.platformKey === row.resultMatchHint,
    );
    if (i >= 0) {
      consumed.add(i);
      return parsed[i];
    }
  }
  for (let i = 0; i < parsed.length; i += 1) {
    if (consumed.has(i)) {
      continue;
    }
    if (platformRowMatchesResult(row.platformKey, parsed[i].platformKey)) {
      consumed.add(i);
      return parsed[i];
    }
  }
  return null;
}

export function applyJobResponseToRows(
  rows: readonly ComposerPublishProgressRow[],
  jobIndex: number,
  response: unknown,
): ComposerPublishProgressRow[] {
  const parsed = parseUnifiedPostResultsForUi(response);
  const jobOk = unifiedPostResponseAllSucceeded(response);
  const consumed = new Set<number>();

  return rows.map((row) => {
    if (row.jobIndex !== jobIndex) {
      return row;
    }

    const match = pickMatchForRow(row, parsed, consumed);
    if (match) {
      return parsedRowToProgress(row, match);
    }

    if (parsed.length === 1 && row.platformKey === "post") {
      return parsedRowToProgress(row, parsed[0]);
    }

    if (parsed.length === 0) {
      return {
        ...row,
        phase: "done",
        success: jobOk,
        message: jobOk ? "Posted" : "Request failed",
        error: jobOk ? null : "unknown",
        urls: [],
      };
    }

    const joined = parsed
      .map(
        (p) =>
          `${formatUnifiedPostPlatformLabel(p.platformKey)}: ${p.success ? "OK" : p.message || p.error || "Failed"}`,
      )
      .join(" · ");
    return {
      ...row,
      phase: "done",
      success: jobOk,
      message: joined,
      error: jobOk ? null : "partial",
      urls: parsed.flatMap((p) => p.urls),
    };
  });
}
