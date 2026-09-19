"use client";

import { useEffect, type RefObject } from "react";
import Lenis from "lenis";

export function useStudioMotion(
  rootRef: RefObject<HTMLElement | null>,
  enabled: boolean,
) {
  useEffect(() => {
    if (!enabled) return;
    const lenis = new Lenis({
      autoRaf: true,
      lerp: 0.085,
      smoothWheel: true,
      syncTouch: false,
      anchors: true,
      prevent: (element) =>
        Boolean(
          element.closest(".lead-chat, .discount-pop, dialog"),
        ),
    });
    return () => lenis.destroy();
  }, [enabled]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root || !enabled) return;
    let frame = 0;
    let active: HTMLElement | null = null;
    let point = { x: 0, y: 0 };
    const reset = () => {
      if (active) {
        active.style.setProperty("--pointer-x", "0");
        active.style.setProperty("--pointer-y", "0");
        active = null;
      }
    };
    const move = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;
      const target = (event.target as Element).closest<HTMLElement>(
        "[data-tilt]",
      );
      if (target !== active) reset();
      active = target;
      point = { x: event.clientX, y: event.clientY };
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        if (!active) return;
        const box = active.getBoundingClientRect();
        active.style.setProperty(
          "--pointer-x",
          String((point.x - box.left) / box.width - 0.5),
        );
        active.style.setProperty(
          "--pointer-y",
          String((point.y - box.top) / box.height - 0.5),
        );
      });
    };
    root.addEventListener("pointermove", move, { passive: true });
    root.addEventListener("pointerleave", reset);
    return () => {
      root.removeEventListener("pointermove", move);
      root.removeEventListener("pointerleave", reset);
      cancelAnimationFrame(frame);
      reset();
    };
  }, [enabled, rootRef]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    let frame = 0;
    const links = Array.from(
      root.querySelectorAll<HTMLAnchorElement>(".floating-nav a"),
    ).filter((link) => link.hash.length > 1);
    const sections = links.map((link) => {
      const section = document.getElementById(
        decodeURIComponent(link.hash.slice(1)),
      );
      return section && root.contains(section) ? section : null;
    });
    const update = () => {
      frame = 0;
      let current = -1;
      sections.forEach((section, index) => {
        if (section && section.getBoundingClientRect().top <= 180)
          current = index;
      });
      links.forEach((link, index) => {
        if (index === current) link.setAttribute("aria-current", "location");
        else link.removeAttribute("aria-current");
      });
      const height = document.documentElement.scrollHeight - innerHeight;
      root.style.setProperty(
        "--scroll-progress",
        String(height > 0 ? scrollY / height : 0),
      );
    };
    const scroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    window.addEventListener("scroll", scroll, { passive: true });
    update();
    return () => {
      window.removeEventListener("scroll", scroll);
      cancelAnimationFrame(frame);
    };
  }, [rootRef]);
}
