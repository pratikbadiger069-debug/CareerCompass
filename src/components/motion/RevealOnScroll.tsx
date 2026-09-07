import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { getFadeUp } from "@/lib/motion";
import { usePrefersReducedMotion } from "@/hooks/use-reduced-motion";

interface RevealOnScrollProps {
  children: ReactNode;
  /** Extra CSS class names for the wrapper div. */
  className?: string;
  /**
   * Fraction of the element that must be visible before the animation
   * triggers. Defaults to `0.15` (15 %).
   */
  amount?: number;
}

/**
 * Wraps its children in a `<motion.div>` that fades-up into view
 * the first time it enters the viewport.
 *
 * - Uses `whileInView` + `viewport={{ once: true }}` so the
 *   animation only plays once per page visit.
 * - Respects `prefers-reduced-motion`: when enabled the content
 *   appears instantly with no transform.
 *
 * ```tsx
 * <RevealOnScroll>
 *   <Card>…</Card>
 * </RevealOnScroll>
 * ```
 */
export function RevealOnScroll({
  children,
  className,
  amount = 0.15,
}: RevealOnScrollProps) {
  const prefersReduced = usePrefersReducedMotion();
  const variants = getFadeUp(prefersReduced);

  return (
    <motion.div
      variants={variants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
