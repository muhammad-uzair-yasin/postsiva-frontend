import { billingFeatureLabel } from "@/lib/billing/billingErrors";

import type { TranslationVars } from "./translate";

export function resolveBillingFeatureLabel(
  t: (key: string, vars?: TranslationVars) => string,
  feature: string,
): string {
  const key = `billing.features.${feature}`;
  const translated = t(key);
  return translated !== key ? translated : billingFeatureLabel(feature);
}
