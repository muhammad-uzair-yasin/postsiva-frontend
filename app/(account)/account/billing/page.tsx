import type { Metadata } from "next";
import { Suspense, type ReactElement } from "react";

import { BillingPageLoading } from "@/app/(workspace)/settings/billing/_components/BillingPageLoading";

import { AccountBillingRedirectClient } from "./AccountBillingRedirectClient";

export const metadata: Metadata = {
  title: "Billing | Account | Postsiva",
};

/** Legacy account billing route — opens billing modal instead of a full page. */
export default function AccountBillingPage(): ReactElement {
  return (
    <Suspense fallback={<BillingPageLoading />}>
      <AccountBillingRedirectClient />
    </Suspense>
  );
}
