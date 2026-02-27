/**
 * Server-rendered splash screen — no "use client" needed.
 *
 * Rendered as part of the initial HTML, so it appears on the very first paint
 * BEFORE React hydration. All visibility logic and auto-hide use pure CSS:
 *   • `@media (display-mode: standalone)` controls PWA-only visibility
 *   • CSS `animation` with `forwards` fill auto-fades and hides after ~2.5s
 *
 * This eliminates the flash of static content before JS loads.
 */
export function SplashScreen() {
  return (
    <div className="splash-screen" aria-hidden="true">
      {/* Ambient glow effects */}
      <div className="splash-glow splash-glow-1" />
      <div className="splash-glow splash-glow-2" />

      {/* Floating particles — deterministic positions */}
      <div className="splash-particles">
        <div
          className="splash-particle"
          style={{
            left: "15%",
            animationDelay: "0.2s",
            animationDuration: "1.8s",
          }}
        />
        <div
          className="splash-particle"
          style={{
            left: "25%",
            animationDelay: "0.8s",
            animationDuration: "2.1s",
          }}
        />
        <div
          className="splash-particle"
          style={{
            left: "35%",
            animationDelay: "0.1s",
            animationDuration: "1.6s",
          }}
        />
        <div
          className="splash-particle"
          style={{
            left: "45%",
            animationDelay: "1.1s",
            animationDuration: "2.3s",
          }}
        />
        <div
          className="splash-particle"
          style={{
            left: "55%",
            animationDelay: "0.5s",
            animationDuration: "1.9s",
          }}
        />
        <div
          className="splash-particle"
          style={{
            left: "65%",
            animationDelay: "1.3s",
            animationDuration: "2.0s",
          }}
        />
        <div
          className="splash-particle"
          style={{
            left: "72%",
            animationDelay: "0.3s",
            animationDuration: "1.7s",
          }}
        />
        <div
          className="splash-particle"
          style={{
            left: "80%",
            animationDelay: "0.9s",
            animationDuration: "2.2s",
          }}
        />
        <div
          className="splash-particle"
          style={{
            left: "20%",
            animationDelay: "1.0s",
            animationDuration: "1.5s",
          }}
        />
        <div
          className="splash-particle"
          style={{
            left: "40%",
            animationDelay: "0.6s",
            animationDuration: "2.4s",
          }}
        />
        <div
          className="splash-particle"
          style={{
            left: "60%",
            animationDelay: "1.2s",
            animationDuration: "1.8s",
          }}
        />
        <div
          className="splash-particle"
          style={{
            left: "85%",
            animationDelay: "0.4s",
            animationDuration: "2.0s",
          }}
        />
      </div>

      {/* Logo + Text */}
      <div className="splash-content">
        <div className="splash-icon">
          <svg
            viewBox="0 0 36 36"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M8 16L10 32H26L28 16H8Z"
              fill="#E50914"
              className="splash-svg-bucket"
            />
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
            <rect x="7" y="15" width="22" height="2.5" rx="1" fill="#CC0812" />
          </svg>
          <div className="splash-ring" />
          <div className="splash-ring splash-ring-2" />
        </div>

        <h1 className="splash-title">
          <span className="splash-title-miny">Miny</span>
          <span className="splash-title-cine">Cine</span>
        </h1>
        <p className="splash-tagline">Xem phim chất lượng cao</p>
      </div>
    </div>
  );
}
