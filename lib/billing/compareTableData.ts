export type CompareCell = boolean | string | number;

/** Sentinel for translated “Unlimited” cell text */
export const COMPARE_UNLIMITED = "__unlimited__" as const;

export interface CompareRowDef {
  sectionKey?: string;
  labelKey: string;
  free: CompareCell;
  starter: CompareCell;
  pro: CompareCell;
}

function yes(): boolean {
  return true;
}

function no(): boolean {
  return false;
}

const U = COMPARE_UNLIMITED;

/** Row defs use message keys under `billing.compare*` (workspace) / `marketing.compare*` (public). */
export const PRICING_COMPARE_ROWS: CompareRowDef[] = [
  { sectionKey: "compareSecPricing", labelKey: "compareRowMonthly", free: "$0", starter: "$10", pro: "$29" },
  { labelKey: "compareRowYearly", free: "$0", starter: "$100", pro: "$290" },
  { sectionKey: "compareSecWorkspaces", labelKey: "compareRowWorkspaces", free: 1, starter: 3, pro: 8 },
  { labelKey: "compareRowAccounts", free: 1, starter: 12, pro: U },
  { labelKey: "compareRowTeam", free: 1, starter: 5, pro: U },
  { sectionKey: "compareSecLimits", labelKey: "compareRowPosts", free: 5, starter: 150, pro: U },
  { labelKey: "compareRowAiCredits", free: "500", starter: "3,000", pro: "10,000" },
  { labelKey: "compareRowScheduled", free: 5, starter: 100, pro: U },
  { sectionKey: "compareSecPosting", labelKey: "compareRowPublishNow", free: yes(), starter: yes(), pro: yes() },
  { labelKey: "compareRowDrafts", free: yes(), starter: yes(), pro: yes() },
  { labelKey: "compareRowScheduling", free: yes(), starter: yes(), pro: yes() },
  { labelKey: "compareRowChrome", free: yes(), starter: yes(), pro: yes() },
  { sectionKey: "compareSecAi", labelKey: "compareRowAiComposer", free: yes(), starter: yes(), pro: yes() },
  { labelKey: "compareRowPiva", free: yes(), starter: yes(), pro: yes() },
  { labelKey: "compareRowPersonas", free: yes(), starter: yes(), pro: yes() },
  { labelKey: "compareRowCommentAi", free: yes(), starter: yes(), pro: yes() },
  { labelKey: "compareRowAiWatcher", free: yes(), starter: yes(), pro: yes() },
  { sectionKey: "compareSecInbox", labelKey: "compareRowUnifiedInbox", free: yes(), starter: yes(), pro: yes() },
  { sectionKey: "compareSecIntegrations", labelKey: "compareRowWhatsapp", free: yes(), starter: yes(), pro: yes() },
  { labelKey: "compareRowDm", free: yes(), starter: yes(), pro: yes() },
  { labelKey: "compareRowGptMcp", free: yes(), starter: yes(), pro: yes() },
  { sectionKey: "compareSecAnalytics", labelKey: "compareRowAnalytics", free: yes(), starter: yes(), pro: yes() },
  { labelKey: "compareRowEmailSupport", free: no(), starter: yes(), pro: yes() },
];

export function formatCompareCell(
  value: CompareCell,
  unlimitedLabel: string,
): string {
  if (value === true) return "✓";
  if (value === false) return "—";
  if (value === COMPARE_UNLIMITED) return unlimitedLabel;
  return String(value);
}
