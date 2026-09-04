"use client";

import { useSyncExternalStore, type ReactElement } from "react";
import { createPortal } from "react-dom";

import type { WordPressMediaItem } from "@/lib/social/wordpressMediaApi";

const subscribeToClient = () => () => undefined;

export function PostSchedulerWordPressMediaPickerModal({
  visible,
  items,
  loading,
  onClose,
  onPick,
  onBack,
}: {
  visible: boolean;
  items: WordPressMediaItem[];
  loading: boolean;
  onClose: () => void;
  onPick: (item: WordPressMediaItem) => void;
  onBack?: () => void;
}): ReactElement | null {
  const mounted = useSyncExternalStore(
    subscribeToClient,
    () => true,
    () => false,
  );
  if (!visible || !mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[1300] bg-black/60">
      <button type="button" className="absolute inset-0 cursor-default" aria-label="Close" onClick={onClose} />
      <div className="pointer-events-none fixed left-1/2 top-1/2 w-full max-w-3xl -translate-x-1/2 -translate-y-1/2 px-5">
        <div className="pointer-events-auto max-h-[80vh] overflow-hidden rounded-2xl border border-outline-variant/20 bg-surface-container-high shadow-2xl">
          <div className="flex items-center justify-between border-b border-outline-variant/15 px-5 py-4">
            <div className="flex min-w-0 items-center gap-2">
              {onBack ? (
                <button
                  type="button"
                  onClick={onBack}
                  aria-label="Back"
                  className="grid h-8 w-8 shrink-0 place-items-center rounded-md text-on-surface-variant transition-colors hover:bg-surface-container"
                >
                  <span className="material-symbols-outlined text-[20px]" aria-hidden>
                    arrow_back
                  </span>
                </button>
              ) : null}
              <h2 className="text-base font-bold text-on-surface">WordPress media library</h2>
            </div>
            <button type="button" onClick={onClose} className="grid h-8 w-8 place-items-center rounded-md text-on-surface-variant hover:bg-surface-container">
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          </div>
          <div className="max-h-[calc(80vh-4rem)] overflow-y-auto p-5">
            {loading ? (
              <p className="text-sm text-on-surface-variant">Loading media...</p>
            ) : items.filter((item) => item.source_url).length === 0 ? (
              <p className="text-sm text-on-surface-variant">No WordPress media found.</p>
            ) : (
              <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                {items.filter((item) => item.source_url).map((item) => {
                  const isVideo = item.mime_type?.startsWith("video/") ?? false;
                  return (
                    <button key={item.id} type="button" onClick={() => { onPick(item); onClose(); }} className="group overflow-hidden rounded-xl border border-outline-variant/20 bg-surface text-left transition hover:border-secondary/45">
                      <div className="grid aspect-video place-items-center bg-surface-container text-secondary">
                        {isVideo ? (
                          <span className="material-symbols-outlined text-3xl">videocam</span>
                        ) : (
                          // eslint-disable-next-line @next/next/no-img-element -- WordPress media URL
                          <img src={item.source_url ?? ""} alt="" className="h-full w-full object-cover" />
                        )}
                      </div>
                      <p className="truncate px-3 py-2 text-xs text-on-surface-variant">{item.title || item.slug || `Media ${item.id}`}</p>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
