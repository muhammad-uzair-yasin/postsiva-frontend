"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useSearchParams } from "next/navigation";

import { applyDocumentLocale } from "./applyDocumentLocale";
import {
  DEFAULT_WORKSPACE_LOCALE,
  LOCALE_OPTIONS,
  normalizeWorkspaceLocale,
  type WorkspaceLocale,
} from "./locales";
import {
  getPublicMessages,
  publicEnMessages,
  type PublicMessages,
} from "./publicCatalog";
import {
  resolveInitialPublicLocale,
  writeStoredPublicLocale,
  type PublicLocale,
} from "./publicLocaleStorage";
import { translate, type TranslationVars } from "./translate";

type PublicLocaleContextValue = {
  locale: PublicLocale;
  setLocale: (locale: PublicLocale) => void;
  messages: PublicMessages;
  t: (key: string, vars?: TranslationVars) => string;
  localeOptions: typeof LOCALE_OPTIONS;
};

const PublicLocaleContext = createContext<PublicLocaleContextValue | null>(null);

function PublicLocaleProviderInner({
  children,
}: {
  children: ReactNode;
}): React.ReactElement {
  const searchParams = useSearchParams();
  const [locale, setLocaleState] = useState<PublicLocale>(DEFAULT_WORKSPACE_LOCALE);

  useEffect(() => {
    const fromQuery = searchParams.get("lang");
    const initial = resolveInitialPublicLocale(fromQuery);
    setLocaleState(initial);
    writeStoredPublicLocale(initial);
    applyDocumentLocale(initial);
  }, [searchParams]);

  const setLocale = useCallback((next: PublicLocale) => {
    const normalized = normalizeWorkspaceLocale(next);
    setLocaleState(normalized);
    writeStoredPublicLocale(normalized);
    applyDocumentLocale(normalized);
  }, []);

  const messages = useMemo(() => getPublicMessages(locale), [locale]);
  const t = useCallback(
    (key: string, vars?: TranslationVars) =>
      translate(messages, publicEnMessages, key, vars),
    [messages],
  );

  const value = useMemo(
    () => ({
      locale,
      setLocale,
      messages,
      t,
      localeOptions: LOCALE_OPTIONS,
    }),
    [locale, setLocale, messages, t],
  );

  // Stable tree only — swapping a wrapper when locale becomes "ready"
  // remounted the landing page and replayed every CSS entrance once.
  return (
    <PublicLocaleContext.Provider value={value}>{children}</PublicLocaleContext.Provider>
  );
}

/** Wraps marketing + auth surfaces. Use inside a Suspense boundary if searchParams needed. */
export function PublicLocaleProvider({
  children,
}: {
  children: ReactNode;
}): React.ReactElement {
  return <PublicLocaleProviderInner>{children}</PublicLocaleProviderInner>;
}

export function usePublicTranslations(): PublicLocaleContextValue {
  const ctx = useContext(PublicLocaleContext);
  if (!ctx) {
    const messages = publicEnMessages;
    return {
      locale: DEFAULT_WORKSPACE_LOCALE,
      setLocale: () => undefined,
      messages,
      t: (key: string, vars?: TranslationVars) =>
        translate(messages, publicEnMessages, key, vars),
      localeOptions: LOCALE_OPTIONS,
    };
  }
  return ctx;
}

export function usePublicLocale(): WorkspaceLocale {
  return usePublicTranslations().locale;
}
