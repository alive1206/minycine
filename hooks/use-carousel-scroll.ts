"use client";

import { useRef, useState, useCallback, useEffect } from "react";

export function useCarouselScroll() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    checkScroll();

    // Re-check when container resizes
    const resizeObs = new ResizeObserver(checkScroll);
    resizeObs.observe(el);

    // Re-check when children change (movies load asynchronously)
    const mutationObs = new MutationObserver(checkScroll);
    mutationObs.observe(el, { childList: true, subtree: true });

    return () => {
      resizeObs.disconnect();
      mutationObs.disconnect();
    };
  }, [checkScroll]);

  const scrollLeft = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: -el.clientWidth * 0.8, behavior: "smooth" });
  }, []);

  const scrollRight = useCallback(() => {
    const el = scrollRef.current;
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
