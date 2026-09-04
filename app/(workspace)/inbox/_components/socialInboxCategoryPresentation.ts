import type { useTranslations } from "@/lib/i18n/WorkspaceLocaleProvider";

type Translator = ReturnType<typeof useTranslations>["t"];

export const INBOX_CATEGORY_OPTIONS = [
  "positive",
  "negative",
  "spam",
  "question",
  "complaint",
  "lead",
] as const;

export function inboxCategoryLabel(
  key: string | undefined,
  t: Translator,
): string {
  if (!key) {
    return "";
  }
  const labels: Record<string, string> = {
    positive: t("inbox.categoryPositive"),
    negative: t("inbox.categoryNegative"),
    spam: t("inbox.categorySpam"),
    question: t("inbox.categoryQuestion"),
    complaint: t("inbox.categoryComplaint"),
    lead: t("inbox.categoryLead"),
  };
  return labels[key] ?? key;
}

export function inboxCategoryColorClasses(key: string | undefined): string {
  const colors: Record<string, string> = {
    positive: "border-emerald-400/30 bg-emerald-400/10 text-emerald-300",
    negative: "border-rose-400/30 bg-rose-400/10 text-rose-300",
    spam: "border-zinc-400/30 bg-zinc-400/10 text-zinc-300",
    question: "border-sky-400/30 bg-sky-400/10 text-sky-300",
    complaint: "border-orange-400/35 bg-orange-400/10 text-orange-300",
    lead: "border-violet-400/35 bg-violet-400/10 text-violet-300",
  };
  return (
    colors[key ?? ""] ??
    "border-outline-variant/20 bg-surface-container-high text-on-surface-variant"
  );
}
