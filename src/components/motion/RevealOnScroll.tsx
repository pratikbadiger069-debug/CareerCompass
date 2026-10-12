/**
 * RevealOnScroll — Aeline-style scroll reveal using GSAP + ScrollTrigger.
 *
 * Falls back to immediate render when `prefers-reduced-motion` is active.
 */
import { useEffect, useRef, type ReactNode } from "react";

interface RevealOnScrollProps {
  children: ReactNode;
  className?: string;
  /** Delay before animation starts (seconds). Default 0. */
  delay?: number;
  /** Direction of slide-in. Default "up". */
  direction?: "up" | "right" | "left" | "none";
  /** Stagger if direct children should stagger in. Default false. */
  stagger?: boolean;
  as?: "div" | "li" | "section" | "article";
}

export function RevealOnScroll({
  children,
  className,
  delay = 0,
  direction = "up",
  stagger = false,
  as: Tag = "div",
}: RevealOnScrollProps) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    // Respect prefers-reduced-motion
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let ctx: ReturnType<typeof import("gsap").gsap.context> | undefined;

    Promise.all([import("gsap"), import("gsap/ScrollTrigger")]).then(([{ gsap }, { ScrollTrigger }]) => {
      gsap.registerPlugin(ScrollTrigger);

      if (!ref.current) return;

      const fromVars: { opacity: number; y?: number; x?: number } = { opacity: 0 };
      if (direction === "up") fromVars.y = 30;
      if (direction === "right") fromVars.x = -30;
      if (direction === "left") fromVars.x = 30;

      const toVars: Record<string, unknown> = {
        opacity: 1,
        y: 0,
        x: 0,
        duration: 0.75,
        delay,
        ease: "power3.out",
        scrollTrigger: {
          trigger: ref.current,
          start: "top 88%",
          toggleActions: "play none none none",
        },
      };

      ctx = gsap.context(() => {
        if (stagger) {
          const kids = Array.from(ref.current!.children) as Element[];
          gsap.fromTo(kids, fromVars, { ...toVars, stagger: 0.1 });
        } else {
          gsap.fromTo(ref.current!, fromVars, toVars);
        }
      });
    });

    return () => {
      ctx?.revert();
    };
  }, [delay, direction, stagger]);

  return (
    <Tag ref={ref as never} className={className}>
      {children}
    </Tag>
  );
}
