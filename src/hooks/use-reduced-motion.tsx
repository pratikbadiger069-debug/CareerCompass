import { useEffect, useState } from "react";

/**
 * Returns `true` when the user's OS or browser is configured to
 * prefer reduced motion (accessibility setting).
 *
 * Usage:
 * ```ts
 * const prefersReduced = usePrefersReducedMotion();
 * ```
 */
export function usePrefersReducedMotion(): boolean {
  const [prefersReduced, setPrefersReduced] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  });

  useEffect(() => {
    const mql = window.matchMedia("(prefers-reduced-motion: reduce)");

    function onChange(e: MediaQueryListEvent) {
      setPrefersReduced(e.matches);
    }

    mql.addEventListener("change", onChange);
    // Sync in case SSR value differed
    setPrefersReduced(mql.matches);

    return () => mql.removeEventListener("change", onChange);
  }, []);

  return prefersReduced;
}
