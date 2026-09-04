"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";

const itemMotionClass =
  "transition-transform duration-300 ease-out motion-safe:hover:-translate-y-1 motion-safe:active:translate-y-0";

interface WorkspaceDashboardNavLinkProps {
  href: string;
  icon: string;
  label: string;
  active: boolean;
  labelClassName: string;
}

export function WorkspaceDashboardNavLink({
  href,
  icon,
  label,
  active,
  labelClassName,
}: WorkspaceDashboardNavLinkProps): React.ReactElement {
  const reduceMotion = useReducedMotion();

  return (
    <Link
      href={href}
      className={`relative z-0 flex w-[4.5rem] flex-col items-center justify-center rounded-xl py-2 sm:w-[4.75rem] md:w-[5rem] ${itemMotionClass} ${
        active ? "text-primary" : "group text-on-surface-variant/60 hover:text-primary"
      }`}
      aria-current={active ? "page" : undefined}
    >
      {active ? (
        <motion.span
          layoutId="workspace-bottom-nav-active-pill"
          className="absolute inset-0 z-0 rounded-xl bg-primary/12 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] ring-1 ring-primary/25"
          transition={
            reduceMotion
              ? { duration: 0 }
              : { type: "spring", stiffness: 420, damping: 34 }
          }
        />
      ) : null}
      <motion.span
        className={`material-symbols-outlined relative z-10 text-[1.9rem] transition-colors duration-300 sm:text-[2.1rem] ${
          active ? "text-primary" : "text-on-surface-variant/60 group-hover:text-primary"
        }`}
        style={active ? { fontVariationSettings: "'FILL' 1" } : undefined}
        whileTap={reduceMotion ? undefined : { scale: 0.88 }}
        transition={{ type: "spring", stiffness: 500, damping: 28 }}
      >
        {icon}
      </motion.span>
      <span
        className={`relative z-10 mt-1.5 font-bold uppercase transition-colors duration-300 ${labelClassName} ${
          active ? "text-primary" : "text-on-surface-variant/50 group-hover:text-on-surface"
        }`}
      >
        {label}
      </span>
    </Link>
  );
}

export { itemMotionClass };
