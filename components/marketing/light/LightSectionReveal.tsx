"use client";

import { cn } from "@/lib/cn";
import {
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";
import { useRef } from "react";

interface LightSectionRevealProps {
  readonly children: React.ReactNode;
  readonly className?: string;
  readonly index?: number;
}

/** Scroll-linked depth reveal: down moves inward, up returns through the same path. */
export function LightSectionReveal({
  children,
  className,
  index = 0,
}: LightSectionRevealProps): React.ReactElement {
  const reduceMotion = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 94%", "center 48%", "end 10%"],
  });
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 92,
    damping: 26,
    mass: 0.42,
  });
  const drift = index % 2 === 0 ? -18 : 18;
  const opacity = useTransform(smoothProgress, [0, 0.34, 0.72, 1], [0.24, 0.82, 1, 0.42]);
  const scale = useTransform(smoothProgress, [0, 0.58, 1], [0.82, 1.015, 0.92]);
  const y = useTransform(smoothProgress, [0, 0.58, 1], [96, 0, -72]);
  const x = useTransform(smoothProgress, [0, 0.58, 1], [drift, 0, -drift * 0.4]);
  const rotateX = useTransform(smoothProgress, [0, 0.58, 1], [6, 0, -4]);
  const z = useTransform(smoothProgress, [0, 0.58, 1], [-180, 0, 120]);
  const filter = useTransform(
    smoothProgress,
    [0, 0.5, 1],
    ["blur(18px)", "blur(0px)", "blur(10px)"],
  );

  return (
    <motion.div
      ref={ref}
      style={
        reduceMotion
          ? undefined
          : {
              opacity,
              scale,
              y,
              x,
              rotateX,
              z,
              filter,
              transformPerspective: 1200,
              transformStyle: "preserve-3d",
            }
      }
      className={cn(className)}
    >
      {children}
    </motion.div>
  );
}
