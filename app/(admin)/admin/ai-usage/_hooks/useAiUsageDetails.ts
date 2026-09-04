"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { adminGet } from "@/lib/admin/adminFetch";
import {
  type AdminOperationDetail,
  type ReconciliationReport,
  aiUsagePaths,
} from "@/lib/admin/aiUsageAdminApi";

/** Lazy operation drill-down: GET /admin/api/ai/usage/operations/{id}. */
export function useOperationDetail() {
  const [operationId, setOperationId] = useState<string | null>(null);
  const [detail, setDetail] = useState<AdminOperationDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const openOperation = useCallback((id: string) => {
    const trimmed = id.trim();
    if (!trimmed) return;
    const controller = new AbortController();
    abortRef.current?.abort();
    abortRef.current = controller;
    setOperationId(trimmed);
    setLoading(true);
    setError(null);
    setDetail(null);
    void adminGet<AdminOperationDetail>(
      aiUsagePaths.operation(trimmed),
      controller.signal,
    )
      .then((result) => {
        if (controller.signal.aborted) return;
        setDetail(result);
        setLoading(false);
      })
      .catch((cause: unknown) => {
        if (controller.signal.aborted) return;
        setError(cause instanceof Error ? cause.message : "Unable to load operation");
        setLoading(false);
      });
  }, []);

  const close = useCallback(() => {
    abortRef.current?.abort();
    setOperationId(null);
    setDetail(null);
    setError(null);
    setLoading(false);
  }, []);

  useEffect(() => () => abortRef.current?.abort(), []);

  return { operationId, detail, loading, error, openOperation, close };
}

/** Reconciliation report, loaded when the tab is first opened. */
export function useReconciliation(active: boolean) {
  const [report, setReport] = useState<ReconciliationReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const requestedRef = useRef(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setReport(
        await adminGet<ReconciliationReport>(aiUsagePaths.reconciliation()),
      );
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "Unable to load reconciliation",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (active && !requestedRef.current) {
      requestedRef.current = true;
      void load();
    }
  }, [active, load]);

  return { report, loading, error, reload: load };
}
