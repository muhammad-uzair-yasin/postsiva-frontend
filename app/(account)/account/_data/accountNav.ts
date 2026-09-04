export type AccountNavItem = {
  href: string;
  labelKey: string;
  fallback: string;
  icon: string;
};

/**
 * Left-nav for the account area. Workspaces is the first entry; the rest are the
 * user-global settings pages. Rendered with the dashboard-style sidebar.
 */
export const ACCOUNT_NAV_ITEMS: readonly AccountNavItem[] = [
  { href: "/account/profile", labelKey: "settings.profile", fallback: "Profile", icon: "account_circle" },
  { href: "/account/billing", labelKey: "billing.title", fallback: "Billing", icon: "credit_card" },
  { href: "/account/ai-usage", labelKey: "settings.aiUsage", fallback: "AI Usage", icon: "bolt" },
  { href: "/referrals", labelKey: "nav.referEarn", fallback: "Refer & Earn", icon: "card_giftcard" },
  { href: "/account/preferences", labelKey: "preferences.appearance", fallback: "Appearance", icon: "palette" },
];
