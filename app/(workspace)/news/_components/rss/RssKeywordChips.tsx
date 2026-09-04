"use client";

interface RssKeywordChipsProps {
  label: string;
  keywords: string[];
  onChange: (next: string[]) => void;
  placeholder?: string;
}

export function RssKeywordChips({
  label,
  keywords,
  onChange,
  placeholder = "Add a new keyword and press enter",
}: RssKeywordChipsProps): React.ReactElement {
  const addKeyword = (raw: string): void => {
    const value = raw.trim();
    if (!value) return;
    const exists = keywords.some((k) => k.toLowerCase() === value.toLowerCase());
    if (exists) return;
    onChange([...keywords, value]);
  };

  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-on-surface">{label}</label>
      <div className="flex min-h-11 flex-wrap items-center gap-1.5 rounded-xl border border-outline-variant/20 bg-surface-container-low px-3 py-2 focus-within:border-primary/40 focus-within:ring-2 focus-within:ring-primary/20">
        {keywords.map((keyword) => (
          <span
            key={keyword}
            className="inline-flex items-center gap-1 rounded-md bg-surface-container-highest px-2 py-0.5 text-xs text-on-surface"
          >
            {keyword}
            <button
              type="button"
              aria-label={`Remove ${keyword}`}
              onClick={() => onChange(keywords.filter((k) => k !== keyword))}
              className="text-on-surface-variant transition hover:text-on-surface"
            >
              <span className="material-symbols-outlined text-[14px]">close</span>
            </button>
          </span>
        ))}
        <input
          type="text"
          placeholder={keywords.length === 0 ? placeholder : ""}
          className="min-w-[10rem] flex-1 bg-transparent py-0.5 text-sm text-on-surface outline-none placeholder:text-on-surface-variant/70"
          onKeyDown={(e) => {
            if (e.key !== "Enter") return;
            e.preventDefault();
            addKeyword(e.currentTarget.value);
            e.currentTarget.value = "";
          }}
          onBlur={(e) => {
            addKeyword(e.currentTarget.value);
            e.currentTarget.value = "";
          }}
        />
      </div>
    </div>
  );
}
