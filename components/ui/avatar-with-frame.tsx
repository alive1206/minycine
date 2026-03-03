import { Avatar } from "@heroui/react";
import { getFrameById, type FrameDecoration } from "@/lib/avatar-frames";

interface AvatarWithFrameProps {
  name: string;
  src?: string;
  frameId?: string | null;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeMap = {
  sm: "w-9 h-9",
  md: "w-14 h-14",
  lg: "w-20 h-20",
};

const frameSizeMap = {
  sm: "w-[46px] h-[46px]",
  md: "w-[66px] h-[66px]",
  lg: "w-[94px] h-[94px]",
};

const sceneSizeMap = {
  sm: 72,
  md: 104,
  lg: 144,
};

/* ── SVG helpers ─────────────────────────────────────── */

/** Evenly-spaced sparkle positions around a circle */
function sparklePositions(count: number, radius: number) {
  return Array.from({ length: count }).map((_, i) => {
    const angle = ((i * 360) / count + 15) * (Math.PI / 180);
    return {
      x: 60 + radius * Math.cos(angle),
      y: 60 + radius * Math.sin(angle),
    };
  });
}

/** Point on circle at given degree angle */
function pos(angleDeg: number, radius: number) {
  const rad = (angleDeg * Math.PI) / 180;
  return { x: 60 + radius * Math.cos(rad), y: 60 + radius * Math.sin(rad) };
}

/** Sparkle dots ring */
function Sparkles({
  count,
  radius,
  color,
  size = 1.2,
}: {
  count: number;
  radius: number;
  color: string;
  size?: number;
}) {
  return (
    <>
      {sparklePositions(count, radius).map((p, i) => (
        <circle
          key={i}
          className="sparkle-dot"
          style={{ animationDelay: `${i * (2 / count)}s` }}
          cx={p.x}
          cy={p.y}
          r={size}
          fill={color}
        />
      ))}
    </>
  );
}

/** Diamond-shaped gem */
function Gem({
  angleDeg,
  radius,
  gemSize = 5,
  delay = 0,
}: {
  angleDeg: number;
  radius: number;
  gemSize?: number;
  delay?: number;
}) {
  const p = pos(angleDeg, radius);
  const w = gemSize * 0.6;
  return (
    <g className="gem-shape" style={{ animationDelay: `${delay}s` }}>
      <circle
        cx={p.x}
        cy={p.y}
        r={gemSize * 1.8}
        fill="var(--frame-accent)"
        opacity="0.12"
      />
      <polygon
        points={`${p.x},${p.y - gemSize} ${p.x + w},${p.y} ${p.x},${p.y + gemSize} ${p.x - w},${p.y}`}
        fill="var(--frame-accent)"
      />
      <polygon
        points={`${p.x},${p.y - gemSize} ${p.x + w},${p.y} ${p.x},${p.y}`}
        fill="white"
        opacity="0.3"
      />
    </g>
  );
}

/** Pair of wing/leaf shapes at top, meant to be rotated */
function WingPair({ angle }: { angle: number }) {
  return (
    <g transform={`rotate(${angle} 60 60)`}>
      <path
        className="wing-leaf"
        d="M53,19 C47,10 39,3 34,10 C40,6 49,15 53,21 Z"
        fill="#c9a82e"
        opacity="0.85"
      />
      <path
        d="M53,19 C47,10 39,3 34,10"
        stroke="#ffe485"
        strokeWidth="0.5"
        fill="none"
        opacity="0.5"
      />
      <path
        className="wing-leaf"
        d="M67,19 C73,10 81,3 86,10 C80,6 71,15 67,21 Z"
        fill="#c9a82e"
        opacity="0.85"
      />
      <path
        d="M67,19 C73,10 81,3 86,10"
        stroke="#ffe485"
        strokeWidth="0.5"
        fill="none"
        opacity="0.5"
      />
    </g>
  );
}

/** Crown spike shape at top, meant to be rotated */
function CrownSpike({ angle, delay = 0 }: { angle: number; delay?: number }) {
  return (
    <g
      className="crown-spike"
      transform={`rotate(${angle} 60 60)`}
      style={{ animationDelay: `${delay}s` }}
    >
      <path d="M60,4 L55,19 L60,16 L65,19 Z" fill="#c9a82e" />
      <path d="M60,4 L65,19 L60,16 Z" fill="#ffe485" opacity="0.4" />
      <circle cx="60" cy="5" r="1.2" fill="#ffe485" opacity="0.8" />
    </g>
  );
}

/* ── Frame scene renderer ────────────────────────────── */

function renderFrameScene(
  decoration: FrameDecoration,
  size: "sm" | "md" | "lg",
) {
  const s = sceneSizeMap[size];
  const vb = "0 0 120 120";

  switch (decoration) {
    // ─── Tier 1: Platinum Ring — simple silver metallic ring ───
    case "platinum-ring":
      return (
        <svg
          className="frame-scene"
          width={s}
          height={s}
          viewBox={vb}
          fill="none"
        >
          <circle
            cx="60"
            cy="60"
            r="48"
            stroke="#b8a8c8"
            strokeWidth="0.8"
            opacity="0.3"
          />
          <Sparkles count={6} radius={46} color="#e8e0f0" />
          {[0, 120, 240].map((a, i) => {
            const p = pos(a, 44);
            return (
              <circle
                key={i}
                className="sparkle-dot"
                style={{ animationDelay: `${i * 0.7}s` }}
                cx={p.x}
                cy={p.y}
                r="2"
                fill="white"
                opacity="0.2"
              />
            );
          })}
        </svg>
      );

    // ─── Tier 1: Gold Ring — gold metallic with ball accent ───
    case "gold-ring":
      return (
        <svg
          className="frame-scene"
          width={s}
          height={s}
          viewBox={vb}
          fill="none"
        >
          <circle
            cx="60"
            cy="60"
            r="48"
            stroke="#c9a82e"
            strokeWidth="0.8"
            opacity="0.3"
          />
          {/* Gold ball at top */}
          <circle className="gold-ball" cx="60" cy="16" r="3" fill="#f5d76e" />
          <circle cx="59" cy="15" r="1" fill="white" opacity="0.4" />
          <Sparkles count={8} radius={46} color="#ffe485" />
        </svg>
      );

    // ─── Tier 1+: Emerald Gem — gold ring + green gem accent ───
    case "emerald-gem":
      return (
        <svg
          className="frame-scene"
          width={s}
          height={s}
          viewBox={vb}
          fill="none"
        >
          {/* Accent inner ring */}
          <circle
            cx="60"
            cy="60"
            r="40"
            stroke="var(--frame-accent)"
            strokeWidth="2"
            opacity="0.4"
            className="accent-ring-seg"
          />
          {/* Gold ball at top */}
          <circle className="gold-ball" cx="60" cy="16" r="2.5" fill="#f5d76e" />
          {/* Emerald gem at bottom */}
          <Gem angleDeg={90} radius={44} gemSize={5.5} />
          {/* Small triangle accent above gem */}
          <polygon
            points="60,93 57,98 63,98"
            fill="var(--frame-accent)"
            opacity="0.6"
          />
          <Sparkles count={6} radius={46} color="#ffe485" />
        </svg>
      );

    // ─── Tier 2: Wing frames (shared structure, colors via CSS vars) ───
    case "amethyst-wings":
    case "sapphire-wings":
    case "rose-wings":
      return (
        <svg
          className="frame-scene"
          width={s}
          height={s}
          viewBox={vb}
          fill="none"
        >
          {/* Wing pairs at 4 cardinal points */}
          {[0, 90, 180, 270].map((a) => (
            <WingPair key={a} angle={a} />
          ))}
          {/* Accent inner ring segments */}
          <circle
            cx="60"
            cy="60"
            r="39"
            stroke="var(--frame-accent)"
            strokeWidth="2"
            opacity="0.35"
            className="accent-ring-seg"
          />
          {/* Gems at 4 cardinal points */}
          {[-90, 0, 90, 180].map((a, i) => (
            <Gem key={a} angleDeg={a} radius={44} gemSize={5} delay={i * 0.3} />
          ))}
          <Sparkles count={8} radius={48} color="#ffe485" size={1} />
        </svg>
      );

    // ─── Tier 3: Dragon Crown — gold spikes + red gems ───
    case "dragon-crown":
      return (
        <svg
          className="frame-scene"
          width={s}
          height={s}
          viewBox={vb}
          fill="none"
        >
          {/* 8 crown spikes */}
          {Array.from({ length: 8 }).map((_, i) => (
            <CrownSpike key={i} angle={i * 45} delay={i * 0.2} />
          ))}
          {/* White wing-tip accents at intercardinal points */}
          {[45, 135, 225, 315].map((a, i) => {
            const p = pos(a, 52);
            return (
              <circle
                key={i}
                cx={p.x}
                cy={p.y}
                r="2.5"
                fill="white"
                opacity="0.45"
                className="sparkle-dot"
                style={{ animationDelay: `${i * 0.5}s` }}
              />
            );
          })}
          {/* Gems at cardinal points */}
          {[-90, 0, 90, 180].map((a, i) => (
            <Gem key={a} angleDeg={a} radius={44} gemSize={5} delay={i * 0.3} />
          ))}
          {/* Inner gold ring */}
          <circle
            cx="60"
            cy="60"
            r="38"
            stroke="#c9a82e"
            strokeWidth="1"
            opacity="0.25"
          />
          <Sparkles count={10} radius={48} color="#ffe485" size={1} />
        </svg>
      );

    // ─── Tier 4: Imperial Violet — purple + gold elaborate ───
    case "imperial-violet":
      return (
        <svg
          className="frame-scene"
          width={s}
          height={s}
          viewBox={vb}
          fill="none"
        >
          {/* Purple inner glow rings */}
          <circle
            cx="60"
            cy="60"
            r="38"
            stroke="var(--frame-accent)"
            strokeWidth="3"
            opacity="0.2"
          />
          <circle
            cx="60"
            cy="60"
            r="36"
            stroke="var(--frame-accent)"
            strokeWidth="1"
            opacity="0.12"
          />
          {/* 8 crown spikes (taller) */}
          {Array.from({ length: 8 }).map((_, i) => (
            <g
              key={i}
              className="crown-spike"
              transform={`rotate(${i * 45} 60 60)`}
              style={{ animationDelay: `${i * 0.15}s` }}
            >
              <path d="M60,2 L54,18 L60,14 L66,18 Z" fill="#c9a82e" />
              <path d="M60,2 L66,18 L60,14 Z" fill="#ffe485" opacity="0.4" />
              <circle cx="60" cy="3.5" r="1.5" fill="#ffe485" opacity="0.8" />
            </g>
          ))}
          {/* Small wing pairs at intercardinal points */}
          {[45, 135, 225, 315].map((a) => (
            <g key={a} transform={`rotate(${a} 60 60)`}>
              <path
                className="wing-leaf"
                d="M55,20 C50,14 44,8 40,14 C44,10 52,17 55,21 Z"
                fill="#c9a82e"
                opacity="0.65"
              />
              <path
                className="wing-leaf"
                d="M65,20 C70,14 76,8 80,14 C76,10 68,17 65,21 Z"
                fill="#c9a82e"
                opacity="0.65"
              />
            </g>
          ))}
          {/* Purple gems at cardinals */}
          {[-90, 0, 90, 180].map((a, i) => (
            <Gem
              key={a}
              angleDeg={a}
              radius={44}
              gemSize={6}
              delay={i * 0.25}
            />
          ))}
          {/* Elaborate top crown piece */}
          <g className="crown-spike" opacity="0.9">
            <path d="M60,-1 L55,8 L60,5 L65,8 Z" fill="#f5d76e" />
            <circle cx="60" cy="0" r="2.2" fill="var(--frame-accent)" />
            <circle cx="60" cy="0" r="1" fill="white" opacity="0.4" />
          </g>
          <Sparkles count={12} radius={50} color="#ffe485" size={1.1} />
        </svg>
      );
  }
}

/* ── Main component ──────────────────────────────────── */

export const AvatarWithFrame = ({
  name,
  src,
  frameId,
  size = "md",
  className = "",
}: AvatarWithFrameProps) => {
  const frame = getFrameById(frameId ?? null);

  if (!frame) {
    return (
      <Avatar
        name={name.charAt(0).toUpperCase()}
        src={src || undefined}
        classNames={{
          base: `${src ? "bg-transparent" : "bg-primary"} ${sizeMap[size]} ${className}`,
          name: "text-white font-bold",
        }}
      />
    );
  }

  return (
    <div
      className={`avatar-frame-wrapper ${frame.cssClass} ${frameSizeMap[size]} ${className}`}
    >
      <Avatar
        name={name.charAt(0).toUpperCase()}
        src={src || undefined}
        classNames={{
          base: `${src ? "bg-transparent" : "bg-primary"} ${sizeMap[size]}`,
          name: "text-white font-bold",
        }}
      />
      {renderFrameScene(frame.decoration, size)}
    </div>
  );
};
