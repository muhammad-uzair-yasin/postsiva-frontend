import type { WorkspaceLocale } from "./locales";
import { DEFAULT_WORKSPACE_LOCALE } from "./locales";
import { auth } from "./messages/en/auth";
import { common } from "./messages/en/common";
import { marketing as marketingChrome } from "./messages/en/marketing";
import { marketingAssistant } from "./messages/en/marketingAssistant";
import { marketingHome } from "./messages/en/marketingHome";
import { marketingPages } from "./messages/en/marketingPages";
import { auth as authBs } from "./messages/bs/auth";
import { common as commonBs } from "./messages/bs/common";
import { marketing as marketingChromeBs } from "./messages/bs/marketing";
import { marketingAssistant as marketingAssistantBs } from "./messages/bs/marketingAssistant";
import { marketingHome as marketingHomeBs } from "./messages/bs/marketingHome";
import { marketingPages as marketingPagesBs } from "./messages/bs/marketingPages";

/** Slim catalogs for marketing + auth — excludes workspace modules. */
export const publicEnMessages = {
  common,
  auth,
  marketing: {
    ...marketingChrome,
    ...marketingHome,
    ...marketingPages,
    ...marketingAssistant,
  },
} as const;

export const publicBsMessages = {
  common: commonBs,
  auth: authBs,
  marketing: {
    ...marketingChromeBs,
    ...marketingHomeBs,
    ...marketingPagesBs,
    ...marketingAssistantBs,
  },
} as const;

export type PublicMessages = typeof publicEnMessages;

const PUBLIC_LOCALE_MESSAGES: Record<WorkspaceLocale, PublicMessages> = {
  en: publicEnMessages,
  bs: publicBsMessages as unknown as PublicMessages,
};

export function getPublicMessages(locale: WorkspaceLocale): PublicMessages {
  return (
    PUBLIC_LOCALE_MESSAGES[locale] ??
    PUBLIC_LOCALE_MESSAGES[DEFAULT_WORKSPACE_LOCALE]
  );
}
