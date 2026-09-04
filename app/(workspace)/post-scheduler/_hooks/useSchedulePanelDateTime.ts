"use client";

import { useEffect, useState } from "react";

export interface UseSchedulePanelDateTimeResult {
  scheduledAt: Date;
  setScheduledAt: (d: Date) => void;
}

export function useSchedulePanelDateTime(
  initialScheduledAt?: Date,
): UseSchedulePanelDateTimeResult {
  const [scheduledAt, setScheduledAt] = useState<Date>(
    () => initialScheduledAt ?? new Date(),
  );

  useEffect(() => {
    if (initialScheduledAt) {
      setScheduledAt(new Date(initialScheduledAt));
    }
  }, [initialScheduledAt]);

  return { scheduledAt, setScheduledAt };
}
