import type { WorkspaceLocale } from "./locales";
import { DEFAULT_WORKSPACE_LOCALE } from "./locales";
import type { Messages } from "./messageTypes";
import { enMessages } from "./messages/en";
import { bsMessages } from "./messages/bs/index";

const LOCALE_MESSAGES: Record<WorkspaceLocale, Messages> = {
  en: enMessages as Messages,
  bs: bsMessages as Messages,
};

export function getMessages(locale: WorkspaceLocale): Messages {
  return LOCALE_MESSAGES[locale] ?? LOCALE_MESSAGES[DEFAULT_WORKSPACE_LOCALE];
}

export { enMessages };
export type { Messages };
