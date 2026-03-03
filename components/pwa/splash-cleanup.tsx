"use client";

import { useEffect } from "react";

/** Removes splash screen from DOM after its CSS animation completes */
export function SplashCleanup() {
  useEffect(() => {
    const html = document.documentElement;
    if (!html.classList.contains("splash-active")) return;

    const timer = setTimeout(() => {
      html.classList.remove("splash-active");
      html.classList.add("splash-done");
      const el = document.querySelector<HTMLElement>(".splash-screen");
      if (el) {
        el.style.display = "none";
      }
    }, 3700); // 3s delay + 0.6s fade + 100ms buffer

    return () => clearTimeout(timer);
  }, []);

  return null;
}
