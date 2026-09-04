"use client";

import { useEffect } from "react";
import type { ReactElement } from "react";

import { isBillingCheckoutSuccess } from "@/lib/billing/checkoutReturn";

/**
 * Paddle payment links land on an approved domain with `?_ptxn=txn_...`.
 * Open overlay checkout instead of treating that as payment success.
 *
 * Paddle.js is loaded only inside the effect so this client module stays
 * free of `@paddle/paddle-js` at the root-layout client boundary (avoids
 * "lazy element type resolves to undefined" with React 19 / Next).
 */
export function PaddleCheckoutReturn(): ReactElement | null {
  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    const params = new URLSearchParams(window.location.search);
    if (isBillingCheckoutSuccess(params)) {
      return;
    }
    const ptxn = params.get("_ptxn")?.trim();
    if (!ptxn) {
      return;
    }

    const clean = new URL(window.location.href);
    clean.searchParams.delete("_ptxn");
    window.history.replaceState({}, "", clean.toString());

    void import("@/lib/billing/paddleCheckout")
      .then(({ openPaddleTransactionCheckout }) =>
        openPaddleTransactionCheckout(ptxn),
      )
      .catch(() => {
        const dest = new URL("/settings/billing", window.location.origin);
        dest.searchParams.set("checkout", "error");
        window.location.assign(dest.toString());
      });
  }, []);

  return null;
}
