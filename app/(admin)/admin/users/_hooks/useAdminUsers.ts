"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { adminGet, adminSend } from "@/lib/admin/adminFetch";
import type { TrackingDashboardResponse } from "@/lib/admin/trackingApi";
import {
  buildImpersonatePath,
  buildUserPath,
  buildUsersPath,
  filterUsersBySignupPeriod,
  hasMoreUsers,
  mergeUserActivity,
  mergeUsersPage,
  removeUser,
  replaceUser,
  resolveImpersonateRedirect,
  sortUsersWithActivity,
  USERS_PAGE_SIZE,
  type AdminUser,
  type AdminUserUpdate,
  type AdminUserWithActivity,
  type ImpersonateResponse,
  type SignupPeriodFilter,
  type SortDirection,
  type UserSortKey,
} from "@/lib/admin/usersApi";

const SEARCH_DEBOUNCE_MS = 300;

export interface UseAdminUsersResult {
  users: AdminUserWithActivity[];
  loading: boolean;
  loadingMore: boolean;
  loadingAll: boolean;
  error: string | null;
  hasMore: boolean;
  search: string;
  period: SignupPeriodFilter;
  periodCounts: Record<SignupPeriodFilter, number>;
  sortKey: UserSortKey;
  sortDir: SortDirection;
  setSearch: (value: string) => void;
  setPeriod: (value: SignupPeriodFilter) => void;
  setSort: (key: UserSortKey) => void;
  reload: () => void;
  loadMore: () => void;
  setUserActive: (userId: string, isActive: boolean) => Promise<void>;
  updateUserProfile: (userId: string, update: AdminUserUpdate) => Promise<void>;
  deleteUser: (userId: string) => Promise<void>;
  impersonateUser: (userId: string) => Promise<string>;
}

export function useAdminUsers(): UseAdminUsersResult {
  const [rawUsers, setRawUsers] = useState<AdminUser[]>([]);
  const [tracking, setTracking] = useState<TrackingDashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [loadingAll, setLoadingAll] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [search, setSearchState] = useState("");
  const [period, setPeriodState] = useState<SignupPeriodFilter>("all");
  const [sortKey, setSortKey] = useState<UserSortKey>("activity_score");
  const [sortDir, setSortDir] = useState<SortDirection>("desc");
  const [reloadTick, setReloadTick] = useState(0);

  const requestIdRef = useRef(0);
  const lastSearchRef = useRef("");

  useEffect(() => {
    const requestId = ++requestIdRef.current;
    const delay = search === lastSearchRef.current ? 0 : SEARCH_DEBOUNCE_MS;
    const timer = window.setTimeout(() => {
      lastSearchRef.current = search;
      Promise.all([
        adminGet<AdminUser[]>(buildUsersPath(search, USERS_PAGE_SIZE, 0)),
        adminGet<TrackingDashboardResponse>("/admin/api/tracking/dashboard"),
      ])
        .then(([page, dashboard]) => {
          if (requestIdRef.current !== requestId) return;
          const rows = Array.isArray(page) ? page : [];
          setRawUsers(rows);
          setTracking(dashboard);
          setHasMore(hasMoreUsers(rows.length, USERS_PAGE_SIZE));
          setLoading(false);
        })
        .catch((err: unknown) => {
          if (requestIdRef.current !== requestId) return;
          setError(err instanceof Error ? err.message : "Failed to load users");
          setLoading(false);
        });
    }, delay);
    return () => window.clearTimeout(timer);
  }, [search, reloadTick]);

  // Week/month filters run client-side — auto-fetch every page so the list is complete.
  useEffect(() => {
    if (period !== "week" && period !== "month") return;
    if (!hasMore || loading || loadingMore || loadingAll) return;

    const requestId = ++requestIdRef.current;
    setLoadingAll(true);
    setError(null);

    void (async () => {
      try {
        let offset = rawUsers.length;
        let merged = rawUsers;
        let more = true;
        while (more) {
          const page = await adminGet<AdminUser[]>(
            buildUsersPath(search, USERS_PAGE_SIZE, offset),
          );
          if (requestIdRef.current !== requestId) return;
          const rows = Array.isArray(page) ? page : [];
          merged = mergeUsersPage(merged, rows);
          more = hasMoreUsers(rows.length, USERS_PAGE_SIZE);
          offset = merged.length;
        }
        if (requestIdRef.current !== requestId) return;
        setRawUsers(merged);
        setHasMore(false);
      } catch (err: unknown) {
        if (requestIdRef.current !== requestId) return;
        setError(err instanceof Error ? err.message : "Failed to load all users");
      } finally {
        if (requestIdRef.current === requestId) setLoadingAll(false);
      }
    })();
  }, [period, hasMore, loading, loadingMore, loadingAll, search, rawUsers]);

  const users = useMemo(() => {
    const merged = mergeUserActivity(rawUsers, tracking?.per_user ?? []);
    const filtered = filterUsersBySignupPeriod(merged, period);
    return sortUsersWithActivity(filtered, sortKey, sortDir);
  }, [rawUsers, tracking, period, sortKey, sortDir]);

  const periodCounts = useMemo(() => {
    const merged = mergeUserActivity(rawUsers, tracking?.per_user ?? []);
    return {
      all: merged.length,
      latest: merged.length,
      week: filterUsersBySignupPeriod(merged, "week").length,
      month: filterUsersBySignupPeriod(merged, "month").length,
    };
  }, [rawUsers, tracking]);

  const setPeriod = useCallback((value: SignupPeriodFilter) => {
    setPeriodState(value);
    if (value === "latest") {
      setSortKey("created_at");
      setSortDir("desc");
    }
  }, []);

  const setSearch = useCallback((value: string) => {
    setSearchState(value);
    setLoading(true);
    setError(null);
  }, []);

  const setSort = useCallback((key: UserSortKey) => {
    setSortKey((prev) => {
      if (prev === key) {
        setSortDir((d) => (d === "asc" ? "desc" : "asc"));
        return prev;
      }
      setSortDir(key === "email" ? "asc" : "desc");
      return key;
    });
  }, []);

  const reload = useCallback(() => {
    setLoading(true);
    setError(null);
    setReloadTick((t) => t + 1);
  }, []);

  const loadMore = useCallback(() => {
    const requestId = ++requestIdRef.current;
    setLoadingMore(true);
    setError(null);
    adminGet<AdminUser[]>(buildUsersPath(search, USERS_PAGE_SIZE, rawUsers.length))
      .then((page) => {
        if (requestIdRef.current !== requestId) return;
        const rows = Array.isArray(page) ? page : [];
        setRawUsers((prev) => mergeUsersPage(prev, rows));
        setHasMore(hasMoreUsers(rows.length, USERS_PAGE_SIZE));
        setLoadingMore(false);
      })
      .catch((err: unknown) => {
        if (requestIdRef.current !== requestId) return;
        setError(err instanceof Error ? err.message : "Failed to load users");
        setLoadingMore(false);
      });
  }, [search, rawUsers.length]);

  const applyUpdate = useCallback(
    async (userId: string, update: AdminUserUpdate) => {
      const updated = await adminSend<AdminUser>(
        "PUT",
        buildUserPath(userId),
        update,
      );
      setRawUsers((prev) => replaceUser(prev, updated));
    },
    [],
  );

  const setUserActive = useCallback(
    (userId: string, isActive: boolean) =>
      applyUpdate(userId, { is_active: isActive }),
    [applyUpdate],
  );

  const updateUserProfile = useCallback(
    (userId: string, update: AdminUserUpdate) => applyUpdate(userId, update),
    [applyUpdate],
  );

  const deleteUser = useCallback(async (userId: string) => {
    await adminSend<{ message?: string }>("DELETE", buildUserPath(userId));
    setRawUsers((prev) => removeUser(prev, userId));
  }, []);

  const impersonateUser = useCallback(async (userId: string) => {
    const payload = await adminSend<ImpersonateResponse>(
      "POST",
      buildImpersonatePath(userId),
    );
    const url = resolveImpersonateRedirect(window.location.origin, payload);
    if (!url) {
      throw new Error("Impersonation response did not include a handoff code");
    }
    return url;
  }, []);

  return {
    users,
    loading,
    loadingMore,
    loadingAll,
    error,
    hasMore,
    search,
    period,
    periodCounts,
    sortKey,
    sortDir,
    setSearch,
    setPeriod,
    setSort,
    reload,
    loadMore,
    setUserActive,
    updateUserProfile,
    deleteUser,
    impersonateUser,
  };
}
