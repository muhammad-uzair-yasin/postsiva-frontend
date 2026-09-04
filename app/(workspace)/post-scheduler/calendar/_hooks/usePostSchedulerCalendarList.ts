import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type RefObject,
} from "react";
import type { CalendarListDaySection } from "../_types/postSchedulerCalendarListTypes";
import {
  CALENDAR_LIST_DAY_COUNT,
  CALENDAR_LIST_LOAD_MORE_DAYS,
  CALENDAR_LIST_MAX_DAYS,
  CALENDAR_LIST_MAX_PAST_DAYS,
  getCalendarListSections,
} from "../_utils/postSchedulerCalendarListMerge";

export interface UsePostSchedulerCalendarListResult {
  sections: CalendarListDaySection[];
  scrollRootRef: RefObject<HTMLDivElement | null>;
  topSentinelRef: RefObject<HTMLDivElement | null>;
  bottomSentinelRef: RefObject<HTMLDivElement | null>;
  loadEarlierDays: () => void;
  canLoadEarlierPast: boolean;
}

export function usePostSchedulerCalendarList(
  now: Date,
): UsePostSchedulerCalendarListResult {
  const [pastDays, setPastDays] = useState(0);
  const [futureDays, setFutureDays] = useState(CALENDAR_LIST_DAY_COUNT);
  const scrollRootRef = useRef<HTMLDivElement | null>(null);
  const topSentinelRef = useRef<HTMLDivElement | null>(null);
  const bottomSentinelRef = useRef<HTMLDivElement | null>(null);
  const pendingPastScrollRef = useRef<{
    scrollHeight: number;
    scrollTop: number;
  } | null>(null);
  const pastDaysRef = useRef(pastDays);
  pastDaysRef.current = pastDays;
  /** Throttle top IntersectionObserver so prepending does not run in a tight loop. */
  const lastTopAutoLoadAtRef = useRef(0);

  const sections = useMemo(
    () => getCalendarListSections(now, { pastDays, futureDays }),
    [now, pastDays, futureDays],
  );

  useLayoutEffect(() => {
    const root = scrollRootRef.current;
    const pending = pendingPastScrollRef.current;
    if (!root || !pending) {
      return;
    }
    pendingPastScrollRef.current = null;
    const delta = root.scrollHeight - pending.scrollHeight;
    if (delta !== 0) {
      root.scrollTop = pending.scrollTop + delta;
    }
  }, [sections]);

  const loadEarlierDays = useCallback((): void => {
    const currentPast = pastDaysRef.current;
    if (currentPast >= CALENDAR_LIST_MAX_PAST_DAYS) {
      return;
    }
    const nextPast = Math.min(
      currentPast + CALENDAR_LIST_LOAD_MORE_DAYS,
      CALENDAR_LIST_MAX_PAST_DAYS,
    );
    if (nextPast === currentPast) {
      return;
    }
    const r = scrollRootRef.current;
    if (r) {
      pendingPastScrollRef.current = {
        scrollHeight: r.scrollHeight,
        scrollTop: r.scrollTop,
      };
    }
    lastTopAutoLoadAtRef.current = Date.now();
    setPastDays(nextPast);
  }, []);

  useEffect(() => {
    const root = scrollRootRef.current;
    const topTarget = topSentinelRef.current;
    const bottomTarget = bottomSentinelRef.current;
    if (!root || !topTarget || !bottomTarget) {
      return;
    }

    const bottomObserver = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry?.isIntersecting) {
          return;
        }
        setFutureDays((c) =>
          Math.min(c + CALENDAR_LIST_LOAD_MORE_DAYS, CALENDAR_LIST_MAX_DAYS),
        );
      },
      { root, rootMargin: "200px 0px 0px 0px", threshold: 0 },
    );

    const topObserver = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry?.isIntersecting) {
          return;
        }
        const currentPast = pastDaysRef.current;
        if (currentPast >= CALENDAR_LIST_MAX_PAST_DAYS) {
          return;
        }
        if (currentPast === 0) {
          return;
        }
        const nowMs = Date.now();
        if (nowMs - lastTopAutoLoadAtRef.current < 450) {
          return;
        }
        const nextPast = Math.min(
          currentPast + CALENDAR_LIST_LOAD_MORE_DAYS,
          CALENDAR_LIST_MAX_PAST_DAYS,
        );
        if (nextPast === currentPast) {
          return;
        }
        const r = scrollRootRef.current;
        if (r) {
          pendingPastScrollRef.current = {
            scrollHeight: r.scrollHeight,
            scrollTop: r.scrollTop,
          };
        }
        lastTopAutoLoadAtRef.current = nowMs;
        setPastDays(nextPast);
      },
      { root, rootMargin: "0px 0px 200px 0px", threshold: 0 },
    );

    bottomObserver.observe(bottomTarget);
    topObserver.observe(topTarget);
    return () => {
      bottomObserver.disconnect();
      topObserver.disconnect();
    };
  }, [now, pastDays, futureDays, sections.length]);

  return {
    sections,
    scrollRootRef,
    topSentinelRef,
    bottomSentinelRef,
    loadEarlierDays,
    canLoadEarlierPast: pastDays < CALENDAR_LIST_MAX_PAST_DAYS,
  };
}
