"use client";

import { useEffect, useState } from "react";

/** Updates at most once per minute for “current time” UI. */
export function useCalendarNow(): Date {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = window.setInterval(() => {
      setNow(new Date());
    }, 60_000);
    return () => {
      window.clearInterval(id);
    };
  }, []);
  return now;
}
