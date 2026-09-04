import { BILLING_TRANSACTION_KEY } from "./planCardCopy";

/** Paddle / dashboard success URLs may use either query shape. */
export function isBillingCheckoutSuccess(params: URLSearchParams): boolean {
  if (params.get("checkout") === "success") {
    return true;
  }
  if (params.has("checkout-success")) {
    return true;
  }
  return false;
}

export function readCheckoutTransactionId(params: URLSearchParams): string | null {
  const fromUrl = params.get("_ptxn") || params.get("transaction_id");
  if (fromUrl?.trim()) {
    return fromUrl.trim();
  }
  if (typeof sessionStorage === "undefined") {
    return null;
  }
  return sessionStorage.getItem(BILLING_TRANSACTION_KEY);
}

export function clearCheckoutTransactionId(): void {
  sessionStorage.removeItem(BILLING_TRANSACTION_KEY);
}
