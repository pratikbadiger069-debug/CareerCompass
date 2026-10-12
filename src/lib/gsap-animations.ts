/**
 * CareerCompass — Aeline-inspired GSAP animation utilities.
 *
 * Mirrors the animation patterns used by aeline.webflow.io:
 *  - Hero entrance: stagger fade + slide from below
 *  - Scroll-triggered fade-up reveals
 *  - Scroll-triggered opacity animations
 *  - Tag / section badge slide-in from left
 *  - Title word-by-word stagger
 *  - Card hover magnetic effect
 *  - Infinite marquee loop
 */

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/* ─────────────────────────────────────────────────────────────────────────────
   HERO ENTRANCE (plays once on page load)
   ──────────────────────────────────────────────────────────────────────────── */

/**
 * Animate hero elements in on page load.
 * @param targets  CSS selector or array of elements
 */
export function animateHeroEntrance(targets: string | Element | Element[]) {
  gsap.fromTo(
    targets,
    { y: 40, opacity: 0 },
    {
      y: 0,
      opacity: 1,
      duration: 0.9,
      ease: "power3.out",
      stagger: 0.12,
      clearProps: "all",
    },
  );
}

/**
 * Hero background parallax: subtly shifts on scroll.
 */
export function initHeroBgParallax(target: string | Element) {
  ScrollTrigger.create({
    trigger: "body",
    start: "top top",
    end: "40% top",
    scrub: 1.5,
    onUpdate: (self) => {
      gsap.set(target, { y: self.progress * 80, opacity: 1 - self.progress * 0.3 });
    },
  });
}

/* ─────────────────────────────────────────────────────────────────────────────
   SCROLL REVEAL ANIMATIONS
   ──────────────────────────────────────────────────────────────────────────── */

/** Fade + slide-up on scroll (Aeline `animation="scroll"` pattern). */
export function revealOnScroll(
  trigger: string | Element,
  targets?: string | Element | NodeListOf<Element>,
  options?: {
    y?: number;
    duration?: number;
    stagger?: number;
    start?: string;
    delay?: number;
  },
) {
  const {
    y = 30,
    duration = 0.75,
    stagger = 0.08,
    start = "top 88%",
    delay = 0,
  } = options ?? {};

  gsap.fromTo(
    targets ?? trigger,
    { y, opacity: 0 },
    {
      y: 0,
      opacity: 1,
      duration,
      ease: "power3.out",
      stagger,
      delay,
      scrollTrigger: {
        trigger,
        start,
        toggleActions: "play none none none",
      },
    },
  );
}

/** Opacity-only reveal (Aeline `animation="opacity"` pattern for cards). */
export function revealOpacity(
  trigger: string | Element,
  targets?: string | Element | NodeListOf<Element>,
  options?: { stagger?: number; duration?: number; start?: string },
) {
  const { stagger = 0.1, duration = 0.8, start = "top 85%" } = options ?? {};

  gsap.fromTo(
    targets ?? trigger,
    { opacity: 0, y: 20 },
    {
      opacity: 1,
      y: 0,
      duration,
      ease: "power2.out",
      stagger,
      scrollTrigger: {
        trigger,
        start,
        toggleActions: "play none none none",
      },
    },
  );
}

/** Slide-in from right (Aeline `animation="right"` pattern). */
export function revealFromRight(
  trigger: string | Element,
  targets?: string | Element | NodeListOf<Element>,
  options?: { duration?: number; stagger?: number },
) {
  const { duration = 0.8, stagger = 0.1 } = options ?? {};
  gsap.fromTo(
    targets ?? trigger,
    { x: 50, opacity: 0 },
    {
      x: 0,
      opacity: 1,
      duration,
      ease: "power3.out",
      stagger,
      scrollTrigger: {
        trigger,
        start: "top 88%",
        toggleActions: "play none none none",
      },
    },
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   WORD-BY-WORD TITLE STAGGER (Aeline `animation="title"` pattern)
   ──────────────────────────────────────────────────────────────────────────── */

export function animateTitleWords(
  trigger: string | Element,
  wordSelector: string = ".title-word",
) {
  gsap.fromTo(
    `${typeof trigger === "string" ? trigger : ""} ${wordSelector}`,
    { y: "110%", opacity: 0 },
    {
      y: "0%",
      opacity: 1,
      duration: 0.7,
      ease: "power3.out",
      stagger: 0.06,
      scrollTrigger: {
        trigger,
        start: "top 85%",
        toggleActions: "play none none none",
      },
    },
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   COUNTER ANIMATION
   ──────────────────────────────────────────────────────────────────────────── */

export function animateCounter(
  el: Element,
  endValue: number,
  options?: { duration?: number; prefix?: string; suffix?: string },
) {
  const { duration = 2.2, prefix = "", suffix = "" } = options ?? {};
  const obj = { val: 0 };
  gsap.to(obj, {
    val: endValue,
    duration,
    ease: "power2.out",
    scrollTrigger: {
      trigger: el,
      start: "top 85%",
      toggleActions: "play none none none",
    },
    onUpdate: () => {
      el.textContent = `${prefix}${Math.round(obj.val).toLocaleString()}${suffix}`;
    },
  });
}

/* ─────────────────────────────────────────────────────────────────────────────
   CARD MAGNETIC HOVER (Aeline premium feel)
   ──────────────────────────────────────────────────────────────────────────── */

export function addMagneticHover(el: HTMLElement, strength = 0.25) {
  const handleMove = (e: MouseEvent) => {
    const rect = el.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = (e.clientX - cx) * strength;
    const dy = (e.clientY - cy) * strength;
    gsap.to(el, { x: dx, y: dy, duration: 0.4, ease: "power2.out" });
  };
  const handleLeave = () => {
    gsap.to(el, { x: 0, y: 0, duration: 0.6, ease: "elastic.out(1,0.5)" });
  };
  el.addEventListener("mousemove", handleMove);
  el.addEventListener("mouseleave", handleLeave);
  return () => {
    el.removeEventListener("mousemove", handleMove);
    el.removeEventListener("mouseleave", handleLeave);
  };
}

/* ─────────────────────────────────────────────────────────────────────────────
   BUTTON ARROW HOVER (Aeline arrow button pattern)
   ──────────────────────────────────────────────────────────────────────────── */

export function addArrowButtonHover(btn: HTMLElement) {
  const arrow = btn.querySelector<HTMLElement>(".btn-arrow-icon");
  const bg = btn.querySelector<HTMLElement>(".btn-arrow-bg");
  if (!arrow || !bg) return;

  const enter = () => {
    gsap.to(arrow, { x: 4, y: -4, duration: 0.3, ease: "power2.out" });
    gsap.to(bg, { scaleX: 1, duration: 0.3, ease: "power2.out", transformOrigin: "left center" });
  };
  const leave = () => {
    gsap.to(arrow, { x: 0, y: 0, duration: 0.4, ease: "power2.out" });
    gsap.to(bg, { scaleX: 0, duration: 0.3, ease: "power2.out", transformOrigin: "left center" });
  };
  btn.addEventListener("mouseenter", enter);
  btn.addEventListener("mouseleave", leave);
  return () => {
    btn.removeEventListener("mouseenter", enter);
    btn.removeEventListener("mouseleave", leave);
  };
}

/* ─────────────────────────────────────────────────────────────────────────────
   PROGRESS BAR ANIMATION
   ──────────────────────────────────────────────────────────────────────────── */

export function animateProgressBar(
  trigger: Element,
  fill: Element,
  percent: number,
) {
  gsap.fromTo(
    fill,
    { scaleX: 0 },
    {
      scaleX: percent / 100,
      duration: 1.5,
      ease: "power3.out",
      transformOrigin: "left center",
      scrollTrigger: {
        trigger,
        start: "top 85%",
        toggleActions: "play none none none",
      },
    },
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   NAVBAR SCROLL BEHAVIOUR
   ──────────────────────────────────────────────────────────────────────────── */

export function initNavbarScroll(navEl: HTMLElement) {
  ScrollTrigger.create({
    start: "top -60",
    onUpdate: (self) => {
      if (self.scroll() > 60) {
        navEl.classList.add("nav-scrolled");
      } else {
        navEl.classList.remove("nav-scrolled");
      }
    },
  });
}

/* ─────────────────────────────────────────────────────────────────────────────
   CLEANUP helper — call in useEffect return
   ──────────────────────────────────────────────────────────────────────────── */

export function killScrollTriggers() {
  ScrollTrigger.getAll().forEach((t) => t.kill());
}
