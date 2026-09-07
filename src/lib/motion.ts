import type { Variants, TargetAndTransition } from "framer-motion";

/* ────────────────────────────────────────────────────────────────────────── */
/*  Reusable Framer-Motion animation variants                                */
/*                                                                           */
/*  Import these throughout the app:                                         */
/*    import { fadeUp, staggerContainer, ... } from "@/lib/motion";          */
/*                                                                           */
/*  Every export has an accessibility-aware counterpart via                   */
/*  `getReducedVariant()` that collapses to instant/no-op when               */
/*  the user prefers reduced motion.                                         */
/* ────────────────────────────────────────────────────────────────────────── */

/* ── fadeUp ───────────────────────────────────────────────────────────────
 * Content entering on scroll or page load.
 * hidden → visible: opacity 0 → 1, y: 20 → 0
 */
export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" },
  },
};

/** Reduced-motion version: instant, no transform. */
export const fadeUpReduced: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.01 },
  },
};

/* ── staggerContainer ─────────────────────────────────────────────────────
 * Parent variant for lists / grids of cards.
 * Staggers children by 0.1 s.
 */
export const staggerContainer: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

/** Reduced-motion version: no stagger. */
export const staggerContainerReduced: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0,
    },
  },
};

/* ── scaleOnHover ─────────────────────────────────────────────────────────
 * For buttons and clickable cards.
 * whileHover: scale 1.02 · whileTap: scale 0.98
 */
export const scaleOnHover = {
  whileHover: { scale: 1.02 } as TargetAndTransition,
  whileTap: { scale: 0.98 } as TargetAndTransition,
  transition: { type: "spring", stiffness: 400, damping: 20 },
};

/** Reduced-motion version: no scaling. */
export const scaleOnHoverReduced = {
  whileHover: {} as TargetAndTransition,
  whileTap: {} as TargetAndTransition,
  transition: { duration: 0 },
};

/* ── cardHover ────────────────────────────────────────────────────────────
 * whileHover: translateY -4px + increased shadow.
 */
export const cardHover = {
  whileHover: {
    y: -4,
    boxShadow: "0 12px 28px -6px oklch(0.802 0.137 76.5 / 15%)",
    transition: { type: "spring", stiffness: 300, damping: 20 },
  } as TargetAndTransition,
};

/** Reduced-motion version: subtle shadow only, no translateY. */
export const cardHoverReduced = {
  whileHover: {
    boxShadow: "0 4px 12px -2px oklch(0.802 0.137 76.5 / 10%)",
    transition: { duration: 0.01 },
  } as TargetAndTransition,
};

/* ── Helpers ──────────────────────────────────────────────────────────────
 * Pick the right variant based on the reduced-motion preference.
 */

/** Returns `fadeUp` or its reduced counterpart. */
export function getFadeUp(prefersReduced: boolean): Variants {
  return prefersReduced ? fadeUpReduced : fadeUp;
}

/** Returns `staggerContainer` or its reduced counterpart. */
export function getStaggerContainer(prefersReduced: boolean): Variants {
  return prefersReduced ? staggerContainerReduced : staggerContainer;
}

/** Returns `scaleOnHover` props or its reduced counterpart. */
export function getScaleOnHover(prefersReduced: boolean) {
  return prefersReduced ? scaleOnHoverReduced : scaleOnHover;
}

/** Returns `cardHover` props or its reduced counterpart. */
export function getCardHover(prefersReduced: boolean) {
  return prefersReduced ? cardHoverReduced : cardHover;
}
