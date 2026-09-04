import type { WordPressTerm } from "@/lib/social/wordpressTaxonomyApi";

export function normalizeWordPressTermName(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/&amp;/g, "&")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function parseWordPressTermSuggestions(suggestions: unknown): string[] {
  if (!Array.isArray(suggestions)) {
    return [];
  }
  return Array.from(
    new Set(
      suggestions
        .filter((item): item is string => typeof item === "string" && item.trim().length > 0)
        .map((item) => item.trim()),
    ),
  );
}

export function termIdsByName(
  suggestions: unknown,
  terms: readonly WordPressTerm[],
): number[] {
  const names = parseWordPressTermSuggestions(suggestions);
  if (names.length === 0 || terms.length === 0) {
    return [];
  }
  const byName = buildTermNameIndex(terms);
  return Array.from(
    new Set(
      names
        .map((name) => byName.get(normalizeWordPressTermName(name)))
        .filter((id): id is number => typeof id === "number"),
    ),
  );
}

function buildTermNameIndex(terms: readonly WordPressTerm[]): Map<string, number> {
  const byName = new Map<string, number>();
  terms.forEach((term) => {
    [term.name, term.slug].forEach((value) => {
      if (typeof value !== "string" || !value.trim()) {
        return;
      }
      byName.set(normalizeWordPressTermName(value), term.id);
    });
  });
  return byName;
}

/**
 * Map AI-suggested category/tag names to WordPress term ids for names that already
 * exist on the site. Does not create terms — users add categories/tags manually.
 */
export async function resolveWordPressTermIdsByName(
  suggestions: unknown,
  terms: readonly WordPressTerm[],
): Promise<number[]> {
  return termIdsByName(suggestions, terms);
}

/** @deprecated Suggestions are UI-only; publish uses manually selected term ids. */
export async function resolveWordPressTermsForPublish(input: {
  readonly selectedCategoryIds: readonly number[];
  readonly selectedTagIds: readonly number[];
  readonly suggestedCategoryNames: readonly string[];
  readonly suggestedTagNames: readonly string[];
  readonly categories: readonly WordPressTerm[];
  readonly tags: readonly WordPressTerm[];
}): Promise<{ categories: number[]; tags: number[] }> {
  const [fromSuggestionsCategories, fromSuggestionsTags] = await Promise.all([
    resolveWordPressTermIdsByName(input.suggestedCategoryNames, input.categories),
    resolveWordPressTermIdsByName(input.suggestedTagNames, input.tags),
  ]);

  return {
    categories: Array.from(
      new Set([...input.selectedCategoryIds, ...fromSuggestionsCategories]),
    ),
    tags: Array.from(new Set([...input.selectedTagIds, ...fromSuggestionsTags])),
  };
}
