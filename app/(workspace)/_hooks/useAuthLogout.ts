"use client";

import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";

import { logoutWithTokens } from "@/lib/auth/authApi";
import {
  clearLoginSession,
  getStoredAccessToken,
} from "@/lib/auth/session";

export function useAuthLogout(): {
  readonly modalOpen: boolean;
  readonly busy: boolean;
  readonly apiError: string | null;
  readonly openLogoutModal: () => void;
  readonly closeLogoutModal: () => void;
  readonly confirmLogout: () => Promise<void>;
} {
  const router = useRouter();
  const [modalOpen, setModalOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const openLogoutModal = useCallback(() => {
    setApiError(null);
    setModalOpen(true);
  }, []);

  const closeLogoutModal = useCallback(() => {
    if (!busy) {
      setModalOpen(false);
      setApiError(null);
    }
  }, [busy]);

  const confirmLogout = useCallback(async () => {
    setBusy(true);
    setApiError(null);
    try {
      await logoutWithTokens(getStoredAccessToken());
      clearLoginSession();
      router.push("/login");
    } catch (e) {
      setApiError(
        e instanceof Error ? e.message : "Could not log out. Try again.",
      );
    } finally {
      setBusy(false);
    }
  }, [router]);

  return {
    modalOpen,
    busy,
    apiError,
    openLogoutModal,
    closeLogoutModal,
    confirmLogout,
  };
}
