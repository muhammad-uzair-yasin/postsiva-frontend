import type { Messages } from "./messageTypes";

export type { Messages };

export type TranslationVars = Record<string, string | number>;

function getNestedValue(obj: unknown, key: string): string | undefined {
  const parts = key.split(".");
  let node: unknown = obj;
  for (const part of parts) {
    if (typeof node !== "object" || node === null || !(part in node)) {
      return undefined;
    }
    node = (node as Record<string, unknown>)[part];
  }
  return typeof node === "string" ? node : undefined;
}

function interpolate(text: string, vars?: TranslationVars): string {
  if (!vars) {
    return text;
  }
  return Object.entries(vars).reduce(
    (acc, [k, v]) => acc.replaceAll(`{${k}}`, String(v)),
    text,
  );
}

/** Dot-path lookup with English fallback; supports `{var}` interpolation. */
export function translate(
  messages: unknown,
  fallback: unknown,
  key: string,
  vars?: TranslationVars,
): string {
  const raw = getNestedValue(messages, key) ?? getNestedValue(fallback, key) ?? key;
  return interpolate(raw, vars);
}
