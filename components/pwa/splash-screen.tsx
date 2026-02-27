"use client";

import { useState, useEffect, useMemo } from "react";

/** Pre-computed particle positions to avoid impure Math.random() in render */
const PARTICLES = [
  { left: "15%", delay: "0.2s", duration: "1.8s" },
  { left: "25%", delay: "0.8s", duration: "2.1s" },
  { left: "35%", delay: "0.1s", duration: "1.6s" },
  { left: "45%", delay: "1.1s", duration: "2.3s" },
  { left: "55%", delay: "0.5s", duration: "1.9s" },
  { left: "65%", delay: "1.3s", duration: "2.0s" },
  { left: "72%", delay: "0.3s", duration: "1.7s" },
  { left: "80%", delay: "0.9s", duration: "2.2s" },
  { left: "20%", delay: "1.0s", duration: "1.5s" },
  { left: "40%", delay: "0.6s", duration: "2.4s" },
  { left: "60%", delay: "1.2s", duration: "1.8s" },
  { left: "85%", delay: "0.4s", duration: "2.0s" },
];

/**
 * Premium animated splash screen for PWA standalone mode.
 * Shows a cinematic intro with the MinyCine popcorn logo when the app launches,
 * then fades out after the animation completes.
 */
export function SplashScreen() {
  const isStandalone = useMemo(() => {
    if (typeof window === "undefined") return false;
    return (
      window.matchMedia("(display-mode: standalone)").matches ||
      ("standalone" in window.navigator &&
        (window.navigator as unknown as { standalone: boolean }).standalone)
    );
  }, []);

  const [isVisible, setIsVisible] = useState(isStandalone);
  const [isFading, setIsFading] = useState(false);

  useEffect(() => {
    if (!isStandalone) return;

    // Start fade-out after animation plays
    const fadeTimer = setTimeout(() => {
      setIsFading(true);
    }, 2200);

    // Remove from DOM after fade completes
    const removeTimer = setTimeout(() => {
      setIsVisible(false);
    }, 2800);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(removeTimer);
    };
  }, [isStandalone]);

  if (!isVisible) return null;

  return (
    <div
      className={`splash-screen ${isFading ? "splash-fade-out" : ""}`}
      aria-hidden="true"
    >
      {/* Ambient glow effects */}
      <div className="splash-glow splash-glow-1" />
      <div className="splash-glow splash-glow-2" />

      {/* Floating particles */}
      <div className="splash-particles">
        {PARTICLES.map((p, i) => (
          <div
            key={i}
            className="splash-particle"
            style={{
              left: p.left,
              animationDelay: p.delay,
              animationDuration: p.duration,
            }}
          />
        ))}
      </div>

      {/* Logo + Text container */}
      <div className="splash-content">
        {/* Popcorn icon inline SVG for full animation control */}
        <div className="splash-icon">
          <svg
            width="96"
            height="96"
            viewBox="0 0 36 36"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Bucket */}
            <path
              d="M8 16L10 32H26L28 16H8Z"
              fill="#E50914"
              className="splash-svg-bucket"
            />
            {/* Stripes */}
            <path
              d="M12 16L13.5 32"
              stroke="white"
              strokeWidth="0.8"
              strokeOpacity="0.3"
            />
            <path
              d="M18 16V32"
              stroke="white"
              strokeWidth="0.8"
              strokeOpacity="0.3"
            />
            <path
              d="M24 16L22.5 32"
              stroke="white"
              strokeWidth="0.8"
              strokeOpacity="0.3"
            />
            {/* Popcorn kernels */}
            <circle
              cx="13"
              cy="12"
              r="4.5"
              fill="#FFF8DC"
              className="splash-svg-kernel k1"
            />
            <circle
              cx="23"
              cy="12"
              r="4.5"
              fill="#FFF8DC"
              className="splash-svg-kernel k2"
            />
            <circle
              cx="18"
              cy="10"
              r="5"
              fill="#FFFDE7"
              className="splash-svg-kernel k3"
            />
            <circle
              cx="10"
              cy="14"
              r="3.5"
              fill="#FFF3CD"
              className="splash-svg-kernel k4"
            />
            <circle
              cx="26"
              cy="14"
              r="3.5"
              fill="#FFF3CD"
              className="splash-svg-kernel k5"
            />
            <circle
              cx="15"
              cy="8"
              r="3.5"
              fill="#FFFDE7"
              className="splash-svg-kernel k6"
            />
            <circle
              cx="21"
              cy="8"
              r="3.5"
              fill="#FFF8DC"
              className="splash-svg-kernel k7"
            />
            <circle
              cx="18"
              cy="14"
              r="4"
              fill="#FFFDE7"
              className="splash-svg-kernel k8"
            />
            {/* Rim */}
            <rect x="7" y="15" width="22" height="2.5" rx="1" fill="#CC0812" />
          </svg>

          {/* Ring pulse behind icon */}
          <div className="splash-ring" />
          <div className="splash-ring splash-ring-2" />
        </div>

        {/* Title */}
        <h1 className="splash-title">
          <span className="splash-title-miny">Miny</span>
          <span className="splash-title-cine">Cine</span>
        </h1>

        {/* Tagline */}
        <p className="splash-tagline">Xem phim chất lượng cao</p>
      </div>
    </div>
  );
}
