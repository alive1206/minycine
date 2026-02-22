"use client";

import { useState, useCallback, useEffect, useRef } from "react";

export function useCarouselScroll() {
  const [scrollEl, setScrollEl] = useState<HTMLDivElement | null>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  // Callback ref: fires when the element mounts/unmounts
  const scrollRef = useCallback((node: HTMLDivElement | null) => {
    setScrollEl(node);
  }, []);

  // Keep a stable ref for use in scroll/click handlers
  const elRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    elRef.current = scrollEl;
  }, [scrollEl]);

  const checkScroll = useCallback(() => {
    const el = elRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }, []);

  useEffect(() => {
    if (!scrollEl) return;

    checkScroll();

    // Re-check when container resizes
    const resizeObs = new ResizeObserver(checkScroll);
    resizeObs.observe(scrollEl);

    // Re-check when children change (movies load asynchronously)
    const mutationObs = new MutationObserver(checkScroll);
    mutationObs.observe(scrollEl, { childList: true, subtree: true });

    return () => {
      resizeObs.disconnect();
      mutationObs.disconnect();
    };
  }, [scrollEl, checkScroll]);

  const scrollLeft = useCallback(() => {
    const el = elRef.current;
    if (!el) return;
    el.scrollBy({ left: -el.clientWidth * 0.8, behavior: "smooth" });
  }, []);

  const scrollRight = useCallback(() => {
    const el = elRef.current;
    if (!el) return;
    el.scrollBy({ left: el.clientWidth * 0.8, behavior: "smooth" });
  }, []);

  return {
    scrollRef,
    canScrollLeft,
    canScrollRight,
    scrollLeft,
    scrollRight,
    onScroll: checkScroll,
  };
}
