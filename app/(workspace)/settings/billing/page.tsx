import { Suspense, type ReactElement } from "react";

import { BillingPageLoading } from "./_components/BillingPageLoading";
import { SettingsBillingRedirectClient } from "./SettingsBillingRedirectClient";

/** Legacy billing URL — opens billing modal instead of a dedicated page. */
export default function SettingsBillingRedirect(): ReactElement {
  return (
    <Suspense fallback={<BillingPageLoading />}>
      <SettingsBillingRedirectClient />
    </Suspense>
  );
}
