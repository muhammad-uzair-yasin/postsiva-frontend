import { N8N_NOTIFY_WEBHOOK_URL } from "@/lib/integrations/n8nNotifyWebhook";

/** Marketing primary nav — labels via `marketing.nav*` i18n keys. */
export const MARKETING_NAV = [
  { labelKey: "marketing.navFeatures", href: "/features" },
  { labelKey: "marketing.navIntegrations", href: "/integrations-explore" },
  { labelKey: "marketing.navMadeFor", href: "/made-for" },
  { labelKey: "marketing.navPricing", href: "/pricing" },
  { labelKey: "marketing.navContact", href: "/contact" },
  {
    labelKey: "marketing.navApiDocs",
    label: "API docs",
    href: "https://docs.postsiva.com/introduction",
    external: true,
  },
  { labelKey: "marketing.navHelp", href: "/help" },
] as const;

/** @deprecated Import {@link N8N_NOTIFY_WEBHOOK_URL} from `@/lib/integrations/n8nNotifyWebhook`. */
export const CONTACT_WEBHOOK = N8N_NOTIFY_WEBHOOK_URL;
