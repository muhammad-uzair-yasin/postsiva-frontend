"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import {
  useCallback,
  useLayoutEffect,
  useEffect,
  useRef,
  useState,
  type ReactElement,
} from "react";

import {
  clampPivaFabPosition,
  readPivaFabPosition,
  writePivaFabPosition,
  type PivaFabPosition,
} from "@/lib/workspace/pivaFabPositionStorage";

import { WorkspaceAgentCapabilityBubble } from "./WorkspaceAgentCapabilityBubble";
import { WORKSPACE_AGENT_FAB_HOVER_MESSAGE } from "./workspaceAgentCapabilityHints";

interface WorkspaceAgentFabLauncherProps {
  onOpen: () => void;
  /** Timed tip bubble — rendered on the FAB so it moves with drag. */
  capabilityMessage?: string | null;
}

const DRAG_THRESHOLD_PX = 2;

export function WorkspaceAgentFabLauncher({
  onOpen,
  capabilityMessage = null,
}: WorkspaceAgentFabLauncherProps): ReactElement {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const dragged = useRef(false);
  const dragging = useRef(false);
  const dragStart = useRef<{
    pointerId: number;
    pointerX: number;
    pointerY: number;
    startX: number;
    startY: number;
  } | null>(null);
  const reduceMotion = useReducedMotion();
  const [position, setPosition] = useState<PivaFabPosition>({ x: 0, y: 0 });
  const [ready, setReady] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const latestPosition = useRef<PivaFabPosition>(position);

  useLayoutEffect(() => {
    const next = readPivaFabPosition();
    latestPosition.current = next;
    setPosition(next);
    setReady(true);
  }, []);

  useEffect(() => {
    latestPosition.current = position;
  }, [position]);

  useEffect(() => {
    const onResize = (): void => {
      setPosition((current) => {
        const clamped = writePivaFabPosition(current);
        latestPosition.current = clamped;
        return clamped;
      });
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const applyDragOffset = useCallback((dx: number, dy: number): void => {
    const el = rootRef.current;
    if (!el) {
      return;
    }
    el.style.transform = `translate3d(${dx}px, ${dy}px, 0)`;
  }, []);

  const handlePointerDown = useCallback(
    (event: React.PointerEvent<HTMLDivElement>): void => {
      if (event.button !== 0) {
        return;
      }
      dragged.current = false;
      dragging.current = true;
      dragStart.current = {
        pointerId: event.pointerId,
        pointerX: event.clientX,
        pointerY: event.clientY,
        startX: latestPosition.current.x,
        startY: latestPosition.current.y,
      };
      event.currentTarget.setPointerCapture(event.pointerId);
    },
    [],
  );

  const handlePointerMove = useCallback(
    (event: React.PointerEvent<HTMLDivElement>): void => {
      const start = dragStart.current;
      if (!start || start.pointerId !== event.pointerId || !dragging.current) {
        return;
      }
      const deltaX = event.clientX - start.pointerX;
      const deltaY = event.clientY - start.pointerY;
      if (
        !dragged.current &&
        (Math.abs(deltaX) > DRAG_THRESHOLD_PX ||
          Math.abs(deltaY) > DRAG_THRESHOLD_PX)
      ) {
        dragged.current = true;
        setIsDragging(true);
      }
      const next = clampPivaFabPosition({
        x: start.startX + deltaX,
        y: start.startY + deltaY,
      });
      latestPosition.current = next;
      // GPU transform during drag — no React re-render per move.
      applyDragOffset(next.x - start.startX, next.y - start.startY);
    },
    [applyDragOffset],
  );

  const endDrag = useCallback(
    (event: React.PointerEvent<HTMLDivElement>): void => {
      const start = dragStart.current;
      if (!start || start.pointerId !== event.pointerId) {
        return;
      }
      dragStart.current = null;
      dragging.current = false;
      if (event.currentTarget.hasPointerCapture(event.pointerId)) {
        event.currentTarget.releasePointerCapture(event.pointerId);
      }
      const shouldOpen = !dragged.current;
      const clamped = writePivaFabPosition(latestPosition.current);
      latestPosition.current = clamped;
      const el = rootRef.current;
      if (el) {
        // Commit left/top before clearing translate to avoid a one-frame snap.
        el.style.left = `${clamped.x}px`;
        el.style.top = `${clamped.y}px`;
        el.style.transform = "";
      }
      setPosition(clamped);
      setIsDragging(false);
      if (shouldOpen) {
        onOpen();
      }
      window.setTimeout(() => {
        dragged.current = false;
      }, 100);
    },
    [onOpen],
  );

  return (
    <div
      ref={rootRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      className={`group fixed z-[130] touch-none select-none ${
        isDragging ? "cursor-grabbing" : "cursor-grab"
      }`}
      style={{
        left: position.x,
        top: position.y,
        visibility: ready ? "visible" : "hidden",
        willChange: isDragging ? "transform" : "auto",
        zIndex: isDragging ? 140 : 130,
      }}
    >
      <motion.div
        className="relative"
        whileHover={isDragging || reduceMotion ? undefined : { scale: 1.06 }}
        animate={
          isDragging || reduceMotion
            ? { y: 0, scale: isDragging ? 1.08 : 1 }
            : { y: [0, -6, 0], scale: 1 }
        }
        transition={
          isDragging
            ? { type: "spring", stiffness: 420, damping: 28, mass: 0.6 }
            : reduceMotion
              ? { duration: 0 }
              : {
                  y: { repeat: Infinity, duration: 3, ease: "easeInOut" },
                  scale: { type: "spring", stiffness: 400, damping: 24 },
                }
        }
      >
        <WorkspaceAgentCapabilityBubble
          message={capabilityMessage}
          reduceMotion={reduceMotion}
          preferBelow={position.y < 112}
        />
        <div
          id="workspace-agent-fab-hover-tooltip"
          role="tooltip"
          className={`pointer-events-none absolute right-[calc(100%+0.75rem)] top-1/2 z-0 w-max max-w-[min(18rem,calc(100vw-6rem))] -translate-y-1/2 rounded-2xl border border-white/12 bg-[#13151f]/95 px-3.5 py-2.5 text-[11px] leading-snug text-white shadow-[0_12px_40px_-8px_rgba(0,0,0,0.65)] backdrop-blur-md transition-opacity duration-200 ease-out motion-reduce:transition-none sm:text-xs ${
            isDragging || capabilityMessage
              ? "opacity-0"
              : "opacity-0 group-hover:opacity-100 group-focus-within:opacity-100"
          }`}
        >
          <span
            className="absolute -right-2 top-1/2 h-4 w-4 -translate-y-1/2 rotate-45 border-r border-t border-white/12 bg-[#13151f]/95"
            aria-hidden
          />
          <p className="text-[10px] font-bold uppercase tracking-wide text-sky-400">
            Piva — Your AI Companion
          </p>
          <p className="mt-1 text-white/60">{WORKSPACE_AGENT_FAB_HOVER_MESSAGE}</p>
        </div>
        <button
          type="button"
          onClick={(event) => event.preventDefault()}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              onOpen();
            }
          }}
          className={`workspace-agent-fab-btn relative z-[1] flex h-16 w-16 items-center justify-center rounded-full border-2 border-[#0058bc]/40 bg-[#0f1117] p-1.5 text-white shadow-[0_8px_32px_-8px_rgba(0,88,188,0.55)] sm:h-20 sm:w-20 sm:p-2.5 ${
            isDragging
              ? "cursor-grabbing shadow-[0_16px_40px_-8px_rgba(0,88,188,0.75)]"
              : "cursor-grab"
          }`}
          aria-label="Open Piva — Your AI Companion chat"
        >
          <span className="workspace-agent-fab-icon pointer-events-none relative flex h-full min-h-0 w-full min-w-0 items-center justify-center overflow-hidden rounded-full">
            <Image
              src="/images/new_piva1.png"
              alt=""
              width={256}
              height={256}
              draggable={false}
              className="max-h-full max-w-full object-contain object-center drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)]"
              sizes="(max-width: 640px) 80px, 96px"
            />
          </span>
        </button>
      </motion.div>
    </div>
  );
}
