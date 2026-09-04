"use client";

import { useMemo, useState } from "react";

import { HelpHubHero } from "@/components/help/HelpHubHero";
import { HelpHubSearchResults } from "@/components/help/HelpHubSearchResults";
import { HelpHubTopics } from "@/components/help/HelpHubTopics";
import { getHelpCategories, searchHelpArticles } from "@/lib/help/helpQueries";

export function HelpHubPage(): React.ReactElement {
  const [query, setQuery] = useState("");
  const categories = getHelpCategories();
  const results = useMemo(() => searchHelpArticles(query), [query]);
  const showResults = query.trim().length > 0;

  return (
    <main className="flex-grow">
      <HelpHubHero query={query} onQueryChange={setQuery} />
      {showResults ? (
        <HelpHubSearchResults
          query={query}
          results={results}
          categories={categories}
          onClear={() => setQuery("")}
          onSuggestSearch={setQuery}
        />
      ) : null}
      <HelpHubTopics />
    </main>
  );
}
