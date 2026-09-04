import type { Variants } from "framer-motion";

export const inboxListContainer: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.055,
      delayChildren: 0.05,
    },
  },
};

export const inboxListItem: Variants = {
  hidden: { opacity: 0, y: 14 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 380, damping: 30 },
  },
};

export const inboxPostRowItem: Variants = {
  hidden: { opacity: 0, x: -14 },
  show: {
    opacity: 1,
    x: 0,
    transition: { type: "spring", stiffness: 400, damping: 32 },
  },
};

export const inboxFadeSlide: Variants = {
  initial: { opacity: 0, y: 8 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 320, damping: 28 },
  },
  exit: {
    opacity: 0,
    y: -6,
    transition: { duration: 0.2 },
  },
};
