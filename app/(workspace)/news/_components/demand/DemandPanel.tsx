"use client";

import { useEffect, useState } from "react";

import type { DemandMode, DemandSection } from "@/lib/news/demandApi";
import {
  useDemandCulture,
  useDemandRising,
  useDemandTopic,
} from "../../_hooks/useDemand";
import { CultureView } from "./CultureView";
import { DemandFilters } from "./DemandFilters";
import { RisingView } from "./RisingView";
import { TopicView } from "./TopicView";

const SECTIONS: { id: DemandSection; label: string }[] = [
  { id: "rising", label: "Rising Searches" },
  { id: "topic", label: "Topic Search" },
  { id: "culture", label: "Culture Pulse" },
];

const COUNTRIES = ["US", "BA", "PK"];

export type DemandRefreshHandle = {
  refresh: () => void;
  isLoading: boolean;
};

interface DemandPanelProps {
  refreshHandle?: { current: DemandRefreshHandle | null };
  onBusyChange?: (busy: boolean) => void;
}

export function DemandPanel({
  refreshHandle,
  onBusyChange,
}: DemandPanelProps): React.ReactElement {
  const [section, setSection] = useState<DemandSection>("rising");
  const [mode, setMode] = useState<DemandMode>("global");
  const [country, setCountry] = useState<string | null>(null);
  const [topicDraft, setTopicDraft] = useState("");
  const [topicQuery, setTopicQuery] = useState("");

  const rising = useDemandRising({
    mode,
    country,
    enabled: section === "rising",
  });
  const topic = useDemandTopic({
    mode,
    country,
    q: topicQuery,
    enabled: section === "topic",
  });
  const culture = useDemandCulture({ enabled: section === "culture" });

  const showCountry = section === "rising" || section === "topic";

  useEffect(() => {
    if (!refreshHandle) return;
    const isLoading =
      section === "rising"
        ? rising.isLoading
        : section === "topic"
          ? topic.isLoading
          : culture.isLoading;
    refreshHandle.current = {
      isLoading,
      refresh: () => {
        if (section === "rising") rising.refresh();
        else if (section === "topic") topic.refresh();
        else culture.refresh();
      },
    };
    onBusyChange?.(isLoading);
    return () => {
      refreshHandle.current = null;
      onBusyChange?.(false);
    };
  }, [
    refreshHandle,
    onBusyChange,
    section,
    rising.isLoading,
    rising.refresh,
    topic.isLoading,
    topic.refresh,
    culture.isLoading,
    culture.refresh,
  ]);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-1 rounded-xl border border-outline-variant/15 bg-surface-container-low/60 p-1">
          {SECTIONS.map((s) => {
            const active = section === s.id;
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => setSection(s.id)}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                  active
                    ? "bg-surface-container-highest text-on-surface shadow-sm"
                    : "text-on-surface-variant hover:text-on-surface"
                }`}
              >
                {s.label}
              </button>
            );
          })}
        </div>

        <DemandFilters
          mode={mode}
          country={country}
          countries={COUNTRIES}
          showCountry={showCountry}
          onSelectGlobal={() => {
            setMode("global");
            setCountry(null);
          }}
          onSelectCountry={(code) => {
            setMode("country");
            setCountry(code);
          }}
          showTopicSearch={section === "topic"}
          topicSeed={topicDraft}
          onTopicSeedChange={setTopicDraft}
          onTopicSubmit={() => setTopicQuery(topicDraft.trim())}
        />
      </div>

      {section === "rising" ? (
        <RisingView
          items={rising.items}
          isLoading={rising.isLoading}
          error={rising.error}
          total={rising.total}
          country={country}
        />
      ) : null}
      {section === "topic" ? (
        <TopicView
          groups={topic.groups}
          isLoading={topic.isLoading}
          error={topic.error}
          total={topic.total}
          hasSeed={Boolean(topicQuery.trim())}
          seedQ={topicQuery.trim()}
          country={country}
        />
      ) : null}
      {section === "culture" ? (
        <CultureView
          items={culture.items}
          date={culture.date}
          isLoading={culture.isLoading}
          error={culture.error}
          total={culture.total}
        />
      ) : null}
    </div>
  );
}
