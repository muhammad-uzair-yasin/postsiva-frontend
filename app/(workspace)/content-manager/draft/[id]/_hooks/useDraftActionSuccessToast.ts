"use client";

import { useCallback, useState } from "react";

export interface DraftActionToastPayload {
  title: string;
  subtitle: string;
}

export function useDraftActionSuccessToast(): {
  toast: DraftActionToastPayload | null;
  toastKey: number;
  dismissToast: () => void;
  showToast: (title: string, subtitle: string) => void;
} {
  const [toast, setToast] = useState<DraftActionToastPayload | null>(null);
  const [toastKey, setToastKey] = useState(0);
  const dismissToast = useCallback((): void => {
    setToast(null);
  }, []);
  const showToast = useCallback((title: string, subtitle: string): void => {
    setToastKey((k) => k + 1);
    setToast({ title: title.trim(), subtitle: subtitle.trim() });
  }, []);

  return {
    toast,
    toastKey,
    dismissToast,
    showToast,
  };
}
