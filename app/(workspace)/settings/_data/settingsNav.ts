export type SettingsNavItem = {
  href: string;
  label: string;
};

export type SettingsNavGroup = {
  id: string;
  title: string;
  items: readonly SettingsNavItem[];
};

/**
 * Workspace-scoped settings only. User-global settings (Profile, Billing,
 * AI Usage, Appearance) live in the `(account)` group under `/account/*`.
 */
export const SETTINGS_NAV_GROUPS: readonly SettingsNavGroup[] = [
  {
    id: "workspace",
    title: "Workspace",
    items: [{ href: "/settings/connections", label: "Connections" }],
  },
  {
    id: "beta",
    title: "Beta",
    items: [
      { href: "/settings/preferences", label: "Language" },
      { href: "/settings/ai", label: "AI settings" },
      { href: "/settings/comment-categories", label: "Comment Categories" },
      { href: "/settings/persona", label: "Persona" },
    ],
  },
];

export const SETTINGS_NAV_ITEMS: readonly SettingsNavItem[] =
  SETTINGS_NAV_GROUPS.flatMap((g) => [...g.items]);

export function isSettingsNavActive(pathname: string, itemHref: string): boolean {
  return pathname === itemHref;
}
