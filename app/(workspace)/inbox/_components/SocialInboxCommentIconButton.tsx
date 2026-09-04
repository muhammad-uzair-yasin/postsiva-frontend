"use client";

import {
  useCallback,
  useRef,
  useState,
  type MouseEvent,
  type ReactElement,
} from "react";
import { createPortal } from "react-dom";

interface SocialInboxCommentIconButtonProps {
  readonly icon: string;
  readonly label: string;
  /** Descriptive copy for the hover tooltip. */
  readonly title: string;
  readonly ariaLabel?: string;
  readonly disabled?: boolean;
  readonly variant?: "default" | "destructive";
  readonly onClick: (e: MouseEvent<HTMLButtonElement>) => void;
}

function InboxActionTooltipPortal({
  anchor,
  text,
  visible,
}: {
  readonly anchor: DOMRect | null;
  readonly text: string;
  readonly visible: boolean;
}): ReactElement | null {
  if (!visible || !anchor || typeof document === "undefined") {
    return null;
  }

  const top = anchor.top - 8;
  const left = anchor.left + anchor.width / 2;

  return createPortal(
    <div
      role="tooltip"
      className="pointer-events-none fixed z-[220] max-w-[min(18rem,calc(100vw-1.5rem))] -translate-x-1/2 -translate-y-full rounded-lg border border-primary/25 bg-surface-container-highest px-2.5 py-1.5 text-center text-[11px] font-medium leading-snug text-on-surface shadow-[0_8px_24px_-6px_rgba(0,0,0,0.55)]"
      style={{ top, left }}
    >
      {text}
      <span
        className="absolute left-1/2 top-full h-0 w-0 -translate-x-1/2 border-x-[6px] border-t-[6px] border-x-transparent border-t-primary/25"
        aria-hidden
      />
      <span
        className="absolute left-1/2 top-[calc(100%-1px)] h-0 w-0 -translate-x-1/2 border-x-[5px] border-t-[5px] border-x-transparent border-t-surface-container-highest"
        aria-hidden
      />
    </div>,
    document.body,
  );
}

/** Icon + short label; styled tooltip on hover (portaled so it is not clipped by cards). */
export function SocialInboxCommentIconButton({
  icon,
  label,
  title,
  ariaLabel,
  disabled = false,
  variant = "default",
  onClick,
}: SocialInboxCommentIconButtonProps): ReactElement {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [tooltipVisible, setTooltipVisible] = useState(false);
  const [anchorRect, setAnchorRect] = useState<DOMRect | null>(null);

  const showTooltip = useCallback(() => {
    if (disabled) {
      return;
    }
    const el = buttonRef.current;
    if (!el) {
      return;
    }
    setAnchorRect(el.getBoundingClientRect());
    setTooltipVisible(true);
  }, [disabled]);

  const hideTooltip = useCallback(() => {
    setTooltipVisible(false);
  }, []);

  const toneClass =
    variant === "destructive"
      ? "hover:bg-error/10 hover:text-error"
      : "hover:bg-primary/10 hover:text-primary";

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        disabled={disabled}
        aria-label={ariaLabel ?? title}
        className={`group/btn relative inline-flex h-8 max-w-[9rem] shrink-0 items-center gap-1 rounded-lg px-1.5 text-on-surface-variant transition-colors disabled:opacity-40 sm:px-2 ${toneClass}`}
        onClick={onClick}
        onMouseEnter={showTooltip}
        onMouseLeave={hideTooltip}
        onFocus={showTooltip}
        onBlur={hideTooltip}
      >
        <span className="material-symbols-outlined shrink-0 text-[17px]" aria-hidden>
          {icon}
        </span>
        <span className="hidden truncate text-[10px] font-semibold sm:inline">{label}</span>
      </button>
      <InboxActionTooltipPortal
        anchor={anchorRect}
        text={title}
        visible={tooltipVisible}
      />
    </>
  );
}
