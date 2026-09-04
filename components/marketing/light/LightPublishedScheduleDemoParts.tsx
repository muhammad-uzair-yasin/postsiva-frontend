"use client";

import Image from "next/image";
import type { StaticImageData } from "next/image";

import { PostsivaLogoMark } from "@/components/marketing/PostsivaLogoMark";

import dashboardImg from "@/assets/screenshots/dashbaord.png";
import createPostImg from "@/assets/screenshots/create_post.png";
import calendarImg from "@/assets/screenshots/calendar.png";
import contentImg from "@/assets/screenshots/publihsed_content.png";
import inboxImg from "@/assets/screenshots/inbox.png";
import exploreImg from "@/assets/screenshots/explore.png";
import aiWatcherImg from "@/assets/screenshots/ai_watcher.png";
import mediaImg from "@/assets/screenshots/ai_toolkit_and_media.png";
import integrationImg from "@/assets/screenshots/integration.png";

export type DemoTab =
  | "create-post"
  | "dashboard"
  | "calendar"
  | "content"
  | "inbox"
  | "explore"
  | "ai-watcher"
  | "media"
  | "integrations";

export const NAV_ITEMS: readonly {
  key: DemoTab;
  icon: string;
  label: string;
  image: StaticImageData;
  newBadge?: boolean;
}[] = [
  { key: "create-post", icon: "post_add", label: "Create Post", image: createPostImg },
  { key: "dashboard", icon: "dashboard", label: "Dashboard", image: dashboardImg },
  { key: "calendar", icon: "calendar_month", label: "Calendar", image: calendarImg },
  { key: "content", icon: "folder", label: "Published Content", image: contentImg },
  { key: "inbox", icon: "inbox", label: "Inbox", image: inboxImg },
  { key: "explore", icon: "newspaper", label: "Explore", image: exploreImg, newBadge: true },
  { key: "ai-watcher", icon: "visibility", label: "AI Watcher", image: aiWatcherImg },
  { key: "media", icon: "perm_media", label: "Media", image: mediaImg },
  { key: "integrations", icon: "extension", label: "Integrations", image: integrationImg },
];

export const DEMO_STAGE_STEPS = NAV_ITEMS.length;

export const DEMO_PANEL_ASPECT = Math.max(
  ...NAV_ITEMS.map((item) => item.image.width / item.image.height),
);

export function DemoSidebar({
  tab,
  panelId,
  idPrefix,
  onSelect,
  onKeyDown,
  compact = false,
}: {
  tab: DemoTab;
  panelId: string;
  idPrefix: string;
  onSelect: (index: number) => void;
  onKeyDown: (event: React.KeyboardEvent<HTMLDivElement>) => void;
  compact?: boolean;
}): React.ReactElement {
  return (
    <div
      className={[
        "flex h-full w-full shrink-0 flex-col overflow-hidden rounded-xl border border-[#e2e8f0] bg-white shadow-[0_18px_60px_rgba(15,23,42,0.08)]",
        compact ? "md:w-52 lg:w-56" : "md:w-56 lg:w-60",
      ].join(" ")}
    >
      <div
        className={[
          "flex items-center gap-2 border-b border-[#e2e8f0]",
          compact ? "px-2.5 py-2" : "px-3 py-3",
        ].join(" ")}
      >
        <PostsivaLogoMark size={compact ? 24 : 30} className="shrink-0 rounded-lg" />
        <span className={compact ? "text-[11px] font-bold text-[#111827]" : "text-[13px] font-bold text-[#111827]"}>
          Postsiva
        </span>
        <span className="ml-auto text-[#94a3b8]">
          <span className={["material-symbols-outlined", compact ? "text-[14px]" : "text-[16px]"].join(" ")}>
            tune
          </span>
        </span>
      </div>

      <div className={compact ? "px-2 pt-2 pb-1" : "px-2.5 pt-3 pb-1"}>
        <div
          className={[
            "flex w-full items-center gap-2 rounded-xl bg-[#0058bc] text-white shadow-sm",
            compact ? "px-2 py-2" : "px-2.5 py-2.5",
          ].join(" ")}
        >
          <span
            className={[
              "flex shrink-0 items-center justify-center rounded-full bg-white/20",
              compact ? "h-6 w-6" : "h-7 w-7",
            ].join(" ")}
          >
            <span className={["material-symbols-outlined", compact ? "text-[14px]" : "text-[16px]"].join(" ")}>
              add
            </span>
          </span>
          <span className={compact ? "text-xs font-semibold" : "text-sm font-semibold"}>Create</span>
        </div>
      </div>

      <nav
        className={[
          "min-h-0 flex-1 overflow-y-auto",
          compact ? "px-2 py-2" : "px-2.5 py-3",
        ].join(" ")}
        aria-label="Demo pages"
        role="tablist"
        aria-orientation="vertical"
        onKeyDown={onKeyDown}
      >
        <ul className="space-y-1">
          {NAV_ITEMS.map((item, index) => {
            const isActive = item.key === tab;
            return (
              <li key={item.key}>
                <button
                  type="button"
                  onClick={() => onSelect(index)}
                  id={`${idPrefix}-tab-${item.key}`}
                  role="tab"
                  aria-selected={isActive}
                  aria-controls={panelId}
                  tabIndex={isActive ? 0 : -1}
                  className={[
                    "relative flex w-full items-center gap-2 rounded-lg text-left font-medium transition-all",
                    compact ? "px-2 py-2 text-[11px]" : "rounded-xl px-2.5 py-2.5 text-[12px]",
                    isActive
                      ? "bg-white font-semibold text-[#1f2a5a] shadow-[0_14px_30px_rgba(15,23,42,0.10)] ring-1 ring-[#e8eefc]"
                      : "text-[#475467] hover:bg-[#f8fafc] hover:text-[#111827]",
                  ].join(" ")}
                >
                  <span
                    className={[
                      "material-symbols-outlined shrink-0",
                      compact ? "text-[16px]" : "text-[18px]",
                      isActive ? "text-[#1f2a5a]" : "text-[#94a3b8]",
                    ].join(" ")}
                  >
                    {item.icon}
                  </span>
                  <span className="truncate">{item.label}</span>
                  {item.newBadge ? (
                    <span className="ml-auto rounded-md bg-[#0058bc]/10 px-1 py-0.5 text-[7px] font-bold uppercase tracking-wide text-[#0058bc]">
                      New
                    </span>
                  ) : null}
                  {isActive ? (
                    <span
                      aria-hidden
                      className="absolute bottom-1 right-0.5 top-1 w-0.5 rounded-full bg-[#57d4c9]"
                    />
                  ) : null}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}

export function DemoPanel({
  activeItem,
  activeIndex,
  panelId,
  idPrefix,
  onPrev,
  onNext,
  onSelect,
  onKeyDown,
  showPager = true,
}: {
  activeItem: (typeof NAV_ITEMS)[number];
  activeIndex: number;
  panelId: string;
  idPrefix: string;
  onPrev: () => void;
  onNext: () => void;
  onSelect: (index: number) => void;
  onKeyDown: (event: React.KeyboardEvent<HTMLDivElement>) => void;
  showPager?: boolean;
}): React.ReactElement {
  return (
    <div
      className="relative min-w-0 flex-1"
      role="tabpanel"
      id={panelId}
      aria-labelledby={`${idPrefix}-tab-${activeItem.key}`}
    >
      <div
        className="relative w-full overflow-hidden rounded-xl border border-[#e2e8f0] bg-white shadow-[0_18px_60px_rgba(15,23,42,0.08)]"
        style={{ aspectRatio: DEMO_PANEL_ASPECT }}
      >
        {NAV_ITEMS.map((item, index) => {
          const isActive = index === activeIndex;
          return (
            <Image
              key={item.key}
              src={item.image}
              alt={isActive ? `Postsiva ${item.label} view` : ""}
              fill
              sizes="(max-width: 768px) 100vw, 1400px"
              className={[
                "object-contain object-top transition-opacity duration-200",
                isActive ? "opacity-100" : "pointer-events-none opacity-0",
              ].join(" ")}
              placeholder="blur"
              priority={index === 0}
              aria-hidden={!isActive}
            />
          );
        })}
      </div>

      <div
        className={[
          "absolute right-5 top-1/2 -translate-y-1/2",
          showPager ? "hidden md:flex" : "hidden",
        ].join(" ")}
      >
        <div
          className="flex flex-col items-center gap-3 rounded-full border border-white/70 bg-white/88 px-2.5 py-3 shadow-[0_16px_40px_rgba(15,23,42,0.12)] backdrop-blur"
          aria-label="Mini screen scroller"
          role="group"
          tabIndex={0}
          onKeyDown={onKeyDown}
        >
          <button
            type="button"
            onClick={onPrev}
            disabled={activeIndex === 0}
            aria-disabled={activeIndex === 0}
            className="flex h-8 w-8 items-center justify-center rounded-full text-[#667085] transition hover:bg-[#f4f7fb] hover:text-[#111827] disabled:pointer-events-none disabled:opacity-40"
            aria-label="Show previous demo screen"
          >
            <span className="material-symbols-outlined text-[18px]">keyboard_arrow_up</span>
          </button>

          <div className="flex flex-col items-center gap-2">
            {NAV_ITEMS.map((item, index) => {
              const isActive = index === activeIndex;
              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => onSelect(index)}
                  className={[
                    "h-2.5 rounded-full transition-all",
                    isActive ? "w-8 bg-[#57d4c9]" : "w-2.5 bg-[#cbd5e1] hover:bg-[#94a3b8]",
                  ].join(" ")}
                  aria-label={`Show ${item.label}`}
                  aria-current={isActive ? "true" : undefined}
                />
              );
            })}
          </div>

          <button
            type="button"
            onClick={onNext}
            disabled={activeIndex === NAV_ITEMS.length - 1}
            aria-disabled={activeIndex === NAV_ITEMS.length - 1}
            className="flex h-8 w-8 items-center justify-center rounded-full text-[#667085] transition hover:bg-[#f4f7fb] hover:text-[#111827] disabled:pointer-events-none disabled:opacity-40"
            aria-label="Show next demo screen"
          >
            <span className="material-symbols-outlined text-[18px]">keyboard_arrow_down</span>
          </button>

          <div className="rounded-full bg-[#f4f7fb] px-2 py-1 text-[10px] font-semibold tracking-[0.16em] text-[#667085]">
            {String(activeIndex + 1).padStart(2, "0")}/{String(NAV_ITEMS.length).padStart(2, "0")}
          </div>
        </div>
      </div>
    </div>
  );
}
