const KEY = "postsiva_ai_watcher_enabled_ids";

function load(): Set<string> {
  try {
    const raw = sessionStorage.getItem(KEY);
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch {
    return new Set();
  }
}

function save(ids: Set<string>): void {
  try { sessionStorage.setItem(KEY, JSON.stringify([...ids])); } catch {}
}

export function markAiWatcherEnabled(postId: string): void {
  const ids = load();
  ids.add(postId);
  save(ids);
}

export function isAiWatcherEnabledLocally(postId: string): boolean {
  return load().has(postId);
}
