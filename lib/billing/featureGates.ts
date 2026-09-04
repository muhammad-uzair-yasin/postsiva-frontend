/** Central billing feature flags for routes, nav, and integrations. */

export const NAV_BILLING_GATES: Record<string, string> = {
  "/post-scheduler": "publish_enabled",
  "/post-scheduler/calendar": "scheduling_enabled",
  "/drafts": "drafts_enabled",
  "/inbox": "inbox_enabled",
  "/ai-watcher": "ai_watcher_enabled",
  "/ai-pipeline": "piva_agent_enabled",
};

export const SETTINGS_NAV_BILLING_GATES: Record<string, string> = {
  "/settings/persona": "personas_enabled",
  "/settings/api-keys": "api_keys_enabled",
};

export const SETTINGS_ROUTE_BILLING_GATES: Record<string, string> = {
  "/settings/persona": "personas_enabled",
  "/settings/api-keys": "api_keys_enabled",
  "/integrations/api-keys": "api_keys_enabled",
  "/settings/whatsapp": "whatsapp_agent_enabled",
  "/settings/instagram-dm": "instagram_dm_enabled",
  "/settings/facebook-dm": "facebook_dm_enabled",
  "/integrations/mcp": "mcp_enabled",
  "/settings/integrations/mcp": "mcp_enabled",
};

export const MESSAGING_HREF_FEATURES: Record<string, string> = {
  "/settings/whatsapp": "whatsapp_agent_enabled",
  "/settings/instagram-dm": "instagram_dm_enabled",
  "/settings/facebook-dm": "facebook_dm_enabled",
};

/** Integration studio slug → required feature (omit = always listed). */
export const INTEGRATION_SLUG_FEATURES: Record<string, string> = {
  mcp: "mcp_enabled",
  chatgpt: "gpt_app_enabled",
  claude: "mcp_enabled",
  cursor: "mcp_enabled",
  raycast: "mcp_enabled",
  perplexity: "mcp_enabled",
  n8n: "api_keys_enabled",
  zapier: "api_keys_enabled",
};

export function hasBillingFeature(
  features: Record<string, boolean> | null | undefined,
  feature: string,
): boolean {
  if (!features) {
    return false;
  }
  return Boolean(features[feature]);
}

export function isNavAllowed(
  href: string,
  features: Record<string, boolean> | null | undefined,
  loading = false,
): boolean {
  const flag = NAV_BILLING_GATES[href];
  if (!flag) {
    return true;
  }
  if (loading) {
    return false;
  }
  return hasBillingFeature(features, flag);
}

export function isSettingsNavAllowed(
  href: string,
  features: Record<string, boolean> | null | undefined,
  loading = false,
): boolean {
  const flag = SETTINGS_NAV_BILLING_GATES[href];
  if (!flag) {
    return true;
  }
  if (loading) {
    return false;
  }
  return hasBillingFeature(features, flag);
}

export function settingsRouteFeature(pathname: string): string | null {
  return SETTINGS_ROUTE_BILLING_GATES[pathname] ?? null;
}

export function integrationSlugFeature(slug: string): string | null {
  return INTEGRATION_SLUG_FEATURES[slug] ?? null;
}

export function settingsNavBillingFeature(href: string): string | null {
  return SETTINGS_NAV_BILLING_GATES[href] ?? null;
}

export function workspaceNavBillingFeature(href: string): string | null {
  return NAV_BILLING_GATES[href] ?? null;
}

/** True when a gated nav item should render disabled (not hidden). */
export function isBillingNavLocked(
  requiredFeature: string | null,
  features: Record<string, boolean> | null | undefined,
  loading = false,
): boolean {
  if (!requiredFeature || loading) {
    return false;
  }
  return !hasBillingFeature(features, requiredFeature);
}
