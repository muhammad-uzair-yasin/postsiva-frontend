import { useCallback } from "react";

import type { WordPressComposerFields } from "@/lib/post-composer/buildComposerPostJobs";

/** Strip AI suggestions before publish/schedule — user must pick tags/categories manually. */
export function usePrepareWordPressTermsForPublish(): (
  fields: WordPressComposerFields,
) => Promise<WordPressComposerFields> {
  return useCallback(
    async (fields: WordPressComposerFields): Promise<WordPressComposerFields> => ({
      ...fields,
      suggestedCategoryNames: [],
      suggestedTagNames: [],
    }),
    [],
  );
}
