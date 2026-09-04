"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { getStoredAccessToken } from "@/lib/auth/session";
import {
  fetchDemandCulture,
  fetchDemandRising,
  fetchDemandTopic,
  type CultureItem,
  type DemandMode,
  type RisingItem,
  type TopicGroup,
} from "@/lib/news/demandApi";

interface Scope {
  mode: DemandMode;
  country: string | null;
  enabled: boolean;
}

export function useDemandRising({ mode, country, enabled }: Scope) {
  const [items, setItems] = useState<RisingItem[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const keyRef = useRef(0);

  const load = useCallback(
    async (bypassCache = false) => {
      const token = getStoredAccessToken();
      if (!token) return;
      const key = ++keyRef.current;
      setIsLoading(true);
      setError(null);
      try {
        const data = await fetchDemandRising(
          {
            mode,
            country: mode === "country" && country ? country : undefined,
            refresh: bypassCache || undefined,
          },
          token,
        );
        if (key !== keyRef.current) return;
        setItems(data.items);
        setTotal(data.total);
      } catch (e) {
        if (key !== keyRef.current) return;
        setError(e instanceof Error ? e.message : "Failed to load rising searches");
      } finally {
        if (key === keyRef.current) setIsLoading(false);
      }
    },
    [mode, country],
  );

  useEffect(() => {
    if (!enabled) return;
    void load();
  }, [enabled, load]);

  const refresh = useCallback(() => {
    void load(true);
  }, [load]);

  return { items, total, isLoading, error, refresh };
}

export function useDemandTopic({
  mode,
  country,
  q,
  enabled,
}: Scope & { q: string }) {
  const [groups, setGroups] = useState<TopicGroup[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const keyRef = useRef(0);

  const load = useCallback(
    async (bypassCache = false) => {
      const seed = q.trim();
      if (!seed) {
        setGroups([]);
        setTotal(0);
        setError(null);
        return;
      }
      const token = getStoredAccessToken();
      if (!token) return;
      const key = ++keyRef.current;
      setIsLoading(true);
      setError(null);
      try {
        const data = await fetchDemandTopic(
          {
            q: seed,
            mode,
            country: mode === "country" && country ? country : undefined,
            refresh: bypassCache || undefined,
          },
          token,
        );
        if (key !== keyRef.current) return;
        setGroups(data.groups);
        setTotal(data.total);
      } catch (e) {
        if (key !== keyRef.current) return;
        setError(e instanceof Error ? e.message : "Failed to load topic suggestions");
      } finally {
        if (key === keyRef.current) setIsLoading(false);
      }
    },
    [mode, country, q],
  );

  useEffect(() => {
    if (!enabled) return;
    void load();
  }, [enabled, load]);

  const refresh = useCallback(() => {
    void load(true);
  }, [load]);

  return { groups, total, isLoading, error, refresh };
}

export function useDemandCulture({ enabled }: { enabled: boolean }) {
  const [items, setItems] = useState<CultureItem[]>([]);
  const [date, setDate] = useState("");
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const keyRef = useRef(0);

  const load = useCallback(async (bypassCache = false) => {
    const token = getStoredAccessToken();
    if (!token) return;
    const key = ++keyRef.current;
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchDemandCulture(token, {
        refresh: bypassCache || undefined,
      });
      if (key !== keyRef.current) return;
      setItems(data.items);
      setDate(data.date);
      setTotal(data.total);
    } catch (e) {
      if (key !== keyRef.current) return;
      setError(e instanceof Error ? e.message : "Failed to load culture pulse");
    } finally {
      if (key === keyRef.current) setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!enabled) return;
    void load();
  }, [enabled, load]);

  const refresh = useCallback(() => {
    void load(true);
  }, [load]);

  return { items, date, total, isLoading, error, refresh };
}
