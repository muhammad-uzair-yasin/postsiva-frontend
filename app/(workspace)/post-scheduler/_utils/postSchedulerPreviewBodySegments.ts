export interface PostSchedulerPreviewBodySegment {
  readonly highlight: boolean;
  readonly value: string;
}

export function splitPreviewBodySegments(
  source: string,
): readonly PostSchedulerPreviewBodySegment[] {
  const re =
    /(https?:\/\/[^\s<>"{}|\\^`[\]]+|@[\w.]+|#[^\s#]+)/gi;
  const matches = [...source.matchAll(re)];
  if (matches.length === 0) {
    return [{ highlight: false, value: source }];
  }
  const out: PostSchedulerPreviewBodySegment[] = [];
  let last = 0;
  for (const m of matches) {
    const i = m.index ?? 0;
    const token = m[0];
    if (i > last) {
      out.push({ highlight: false, value: source.slice(last, i) });
    }
    out.push({ highlight: true, value: token });
    last = i + token.length;
  }
  if (last < source.length) {
    out.push({ highlight: false, value: source.slice(last) });
  }
  return out;
}
