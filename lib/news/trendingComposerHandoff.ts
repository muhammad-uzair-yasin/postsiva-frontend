/** In-memory handoff: Trending post → open composer drawer and generate caption. */

export interface TrendingComposerHandoff {
  readonly id: string;
  readonly post_url: string;
  readonly post_title: string;
  readonly post_snippet: string | null;
  readonly post_image: string | null;
  readonly source_platform: string;
  readonly author: string | null;
  readonly view_count: number | null;
  readonly like_count: number | null;
  readonly comment_count: number | null;
  readonly share_count: number | null;
  readonly accountId: string;
  readonly platform: string;
  readonly account_name: string | null;
}

let pending: TrendingComposerHandoff | null = null;

export function setTrendingComposerHandoff(handoff: TrendingComposerHandoff): void {
  pending = handoff;
}

export function takeTrendingComposerHandoff(): TrendingComposerHandoff | null {
  const h = pending;
  pending = null;
  return h;
}

export function peekTrendingComposerHandoff(): TrendingComposerHandoff | null {
  return pending;
}
