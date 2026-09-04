import { initializePaddle, type Paddle } from "@paddle/paddle-js";

import { fetchPaddleClientConfig } from "@/lib/billing/billingApi";

let paddlePromise: Promise<Paddle | undefined> | null = null;
let configPromise: ReturnType<typeof fetchPaddleClientConfig> | null = null;

async function getPaddleConfig() {
  if (!configPromise) {
    configPromise = fetchPaddleClientConfig();
  }
  return configPromise;
}

async function getPaddle(): Promise<Paddle | undefined> {
  if (!paddlePromise) {
    paddlePromise = (async () => {
      const config = await getPaddleConfig();
      return initializePaddle({
        environment: config.environment === "production" ? "production" : "sandbox",
        token: config.client_token,
      });
    })();
  }
  return paddlePromise;
}

/** Open Paddle overlay checkout for a server-created transaction. */
export async function openPaddleTransactionCheckout(transactionId: string): Promise<void> {
  const config = await getPaddleConfig();
  const paddle = await getPaddle();
  if (!paddle) {
    throw new Error("Could not load Paddle checkout.");
  }

  paddle.Checkout.open({
    transactionId,
    settings: {
      displayMode: "overlay",
      theme: "light",
      locale: "en",
      successUrl: config.success_url,
    },
  });
}
