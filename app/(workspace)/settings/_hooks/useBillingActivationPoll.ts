"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { confirmBillingCheckout, fetchBillingUsage } from "@/lib/billing/billingApi";
import { getStoredAccessToken, getStoredActiveWorkspaceId } from "@/lib/auth/session";

export type BillingActivationPhase =
  | "idle"
  | "confirming"
  | "activating"
  | "success"
  | "timeout";

const POLL_MS = 2000;
const MAX_POLLS = 30;

export interface UseBillingActivationPollResult {
  phase: BillingActivationPhase;
  expectedPlanId: string | null;
  activatedPlanId: string | null;
  startActivation: (
    expectedPlanId: string,
    previousPlanId: string,
    transactionId?: string | null,
  ) => void;
  dismiss: () => void;
}

export function useBillingActivationPoll(
  onActivated: () => void,
): UseBillingActivationPollResult {
  const [phase, setPhase] = useState<BillingActivationPhase>("idle");
  const [expectedPlanId, setExpectedPlanId] = useState<string | null>(null);
  const [activatedPlanId, setActivatedPlanId] = useState<string | null>(null);
  const previousPlanRef = useRef<string>("free");
  const expectedPlanRef = useRef<string | null>(null);
  const transactionIdRef = useRef<string | null>(null);
  const pollCountRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const finishedRef = useRef(false);
  const onActivatedRef = useRef(onActivated);
  onActivatedRef.current = onActivated;

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const dismiss = useCallback(() => {
    clearTimer();
    pollCountRef.current = 0;
    finishedRef.current = false;
    setPhase("idle");
    setExpectedPlanId(null);
    setActivatedPlanId(null);
    expectedPlanRef.current = null;
    transactionIdRef.current = null;
  }, [clearTimer]);

  const pollOnce = useCallback(async () => {
    if (finishedRef.current) {
      return;
    }

    const token = getStoredAccessToken();
    if (!token?.trim()) {
      setPhase("timeout");
      return;
    }

    pollCountRef.current += 1;
    if (pollCountRef.current > 1) {
      setPhase("activating");
    }

    try {
      await confirmBillingCheckout(token, transactionIdRef.current ?? undefined);

      const ws = getStoredActiveWorkspaceId();
      const usage = await fetchBillingUsage(token, ws ?? undefined);
      const expected = expectedPlanRef.current;
      const previous = previousPlanRef.current;
      const planChanged = usage.plan_id !== previous;
      const matchesExpected =
        !expected || expected === "__any_upgrade__"
          ? planChanged && usage.plan_id !== "free"
          : usage.plan_id === expected;
      const isLive =
        usage.billing_status === "active" ||
        usage.billing_status === "trialing" ||
        (usage.plan_id !== "free" && usage.billing_status !== "none");

      if (matchesExpected && isLive && usage.plan_id !== "free") {
        finishedRef.current = true;
        clearTimer();
        setActivatedPlanId(usage.plan_id);
        setPhase("success");
        onActivatedRef.current();
        return;
      }
    } catch {
      // keep polling until timeout
    }

    if (finishedRef.current) {
      return;
    }

    if (pollCountRef.current >= MAX_POLLS) {
      setPhase("timeout");
      return;
    }

    timerRef.current = setTimeout(() => {
      void pollOnce();
    }, POLL_MS);
  }, [clearTimer]);

  const startActivation = useCallback(
    (expected: string, previous: string, transactionId?: string | null) => {
      if (finishedRef.current) {
        return;
      }
      clearTimer();
      pollCountRef.current = 0;
      previousPlanRef.current = previous;
      expectedPlanRef.current = expected;
      transactionIdRef.current = transactionId?.trim() || null;
      setExpectedPlanId(expected);
      setActivatedPlanId(null);
      setPhase("confirming");
      void pollOnce();
    },
    [clearTimer, pollOnce],
  );

  useEffect(() => clearTimer, [clearTimer]);

  return {
    phase,
    expectedPlanId,
    activatedPlanId,
    startActivation,
    dismiss,
  };
}
