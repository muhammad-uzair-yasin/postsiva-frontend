"use client";

export type NewsSubpage = "news" | "rss" | "trending" | "demand";

const TABS: {
  id: NewsSubpage;
  label: string;
  comingSoon: boolean;
}[] = [
  { id: "news", label: "News", comingSoon: false },
  { id: "rss", label: "RSS Feeds", comingSoon: false },
  { id: "trending", label: "Trending Posts", comingSoon: false },
  { id: "demand", label: "Demand", comingSoon: false },
];

interface NewsSubNavProps {
  active: NewsSubpage;
  onChange: (id: NewsSubpage) => void;
}

export function NewsSubNav({ active, onChange }: NewsSubNavProps): React.ReactElement {
  return (
    <nav
      aria-label="Explore sections"
      className="flex min-w-0 items-stretch overflow-x-auto"
    >
      {TABS.map((tab, index) => {
        const isActive = active === tab.id;
        return (
          <div key={tab.id} className="flex items-stretch">
            {index > 0 ? (
              <span
                className="my-2 w-px shrink-0 self-stretch bg-outline-variant/25"
                aria-hidden
              />
            ) : null}
            <button
              type="button"
              onClick={() => onChange(tab.id)}
              className={`relative shrink-0 px-3 pb-2.5 pt-2 text-sm font-medium transition-colors ${
                isActive
                  ? "text-on-surface"
                  : "text-on-surface-variant hover:text-on-surface"
              }`}
            >
              <span className="inline-flex items-center gap-1.5">
                {tab.label}
                {tab.comingSoon ? (
                  <span className="rounded-full bg-surface-container-highest px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-on-surface-variant">
                    Soon
                  </span>
                ) : null}
              </span>
              {isActive ? (
                <span className="absolute inset-x-2 bottom-0 h-[3px] rounded-full bg-primary" />
              ) : null}
            </button>
          </div>
        );
      })}
    </nav>
  );
}
