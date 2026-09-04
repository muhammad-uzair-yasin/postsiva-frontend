import type { useTranslations } from "@/lib/i18n/WorkspaceLocaleProvider";

type Translator = ReturnType<typeof useTranslations>["t"];

export type InboxSentimentTone = "positive" | "negative" | "neutral";

export function inboxSentimentFromCategory(
  categoryKey: string | undefined,
): InboxSentimentTone {
  if (categoryKey === "positive") {
    return "positive";
  }
  if (categoryKey === "negative" || categoryKey === "complaint") {
    return "negative";
  }
  return "neutral";
}

export function inboxSentimentLabel(
  tone: InboxSentimentTone,
  t: Translator,
): string {
  if (tone === "positive") {
    return t("inbox.sentimentPositive");
  }
  if (tone === "negative") {
    return t("inbox.sentimentNegative");
  }
  return t("inbox.sentimentNeutral");
}

export function inboxSentimentColorClasses(tone: InboxSentimentTone): string {
  if (tone === "positive") {
    return "border-sky-400/35 bg-sky-400/10 text-sky-200";
  }
  if (tone === "negative") {
    return "border-rose-400/35 bg-rose-400/10 text-rose-200";
  }
  return "border-outline-variant/25 bg-surface-container-high text-on-surface-variant";
}
