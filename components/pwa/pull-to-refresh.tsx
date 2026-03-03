"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw } from "lucide-react";

const THRESHOLD = 80;
const MAX_PULL = 128;

export function PullToRefresh() {
  const router = useRouter();
  const [pullY, setPullY] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const startY = useRef(0);
  const active = useRef(false);

  const onTouchStart = useCallback(
    (e: TouchEvent) => {
      if (window.scrollY > 0 || refreshing) return;
      startY.current = e.touches[0].clientY;
      active.current = true;
    },
    [refreshing],
  );

  const onTouchMove = useCallback(
    (e: TouchEvent) => {
      if (!active.current || refreshing) return;

      const delta = e.touches[0].clientY - startY.current;

      // Only activate when pulling DOWN from the very top
      if (delta <= 0 || window.scrollY > 0) {
        if (pullY > 0) setPullY(0);
        return;
      }

      const dampened = Math.min(delta * 0.4, MAX_PULL);
      setPullY(dampened);

      // Prevent native overscroll once we're clearly pulling
      if (dampened > 10 && e.cancelable) e.preventDefault();
    },
    [refreshing, pullY],
  );

  const onTouchEnd = useCallback(() => {
    if (!active.current) return;
    active.current = false;

    if (pullY >= THRESHOLD && !refreshing) {
      setRefreshing(true);
      router.refresh();
      setTimeout(() => {
        setRefreshing(false);
        setPullY(0);
      }, 1000);
    } else {
      setPullY(0);
    }
  }, [pullY, refreshing, router]);

  useEffect(() => {
    if (!("ontouchstart" in window)) return;

    document.addEventListener("touchstart", onTouchStart, { passive: true });
    document.addEventListener("touchmove", onTouchMove, { passive: false });
    document.addEventListener("touchend", onTouchEnd);

    return () => {
      document.removeEventListener("touchstart", onTouchStart);
      document.removeEventListener("touchmove", onTouchMove);
      document.removeEventListener("touchend", onTouchEnd);
    };
  }, [onTouchStart, onTouchMove, onTouchEnd]);

  if (pullY === 0 && !refreshing) return null;

  const progress = Math.min(pullY / THRESHOLD, 1);

  return (
    <div
      className="fixed top-0 left-0 right-0 z-[100] flex justify-center pointer-events-none transition-[padding] duration-200"
      style={{ paddingTop: pullY }}
    >
      <div
        className={`flex items-center justify-center w-9 h-9 rounded-full bg-black/80 border border-white/20 shadow-lg ${
          refreshing ? "animate-spin" : ""
        }`}
        style={{
          opacity: progress,
          transform: refreshing ? undefined : `rotate(${pullY * 4}deg)`,
        }}
      >
        <RefreshCw className="w-4 h-4 text-white" />
      </div>
    </div>
  );
}
