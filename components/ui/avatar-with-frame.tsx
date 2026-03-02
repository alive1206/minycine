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

// SVG scene size — slightly larger than frame for border decorations
const sceneSizeMap = {
  sm: 58,
  md: 82,
  lg: 114,
};

function renderFrameScene(
  decoration: FrameDecoration,
  size: "sm" | "md" | "lg",
) {
  const s = sceneSizeMap[size];

  switch (decoration) {
    // ─── Huyết Kiếm: crossed swords + blood energy on outer rim ───
    case "blood-sword":
      return (
        <svg
          className="frame-scene frame-scene-huyet-kiem"
          width={s}
          height={s}
          viewBox="0 0 100 100"
          fill="none"
        >
          {/* Outer border ring */}
          <circle
            cx="50"
            cy="50"
            r="46"
            stroke="var(--frame-color-1)"
            strokeWidth="1.5"
            fill="none"
            opacity="0.6"
          />
          <circle
            cx="50"
            cy="50"
            r="44"
            stroke="var(--frame-color-2)"
            strokeWidth="0.5"
            fill="none"
            opacity="0.3"
          />
          {/* Crossed swords at top */}
          <g className="sword-cross" opacity="0.85">
            <line x1="42" y1="2" x2="50" y2="12" stroke="var(--frame-color-1)" strokeWidth="1.8" strokeLinecap="round" />
            <line x1="58" y1="2" x2="50" y2="12" stroke="var(--frame-color-1)" strokeWidth="1.8" strokeLinecap="round" />
            {/* Sword hilts */}
            <line x1="40" y1="1" x2="44" y2="3" stroke="var(--frame-color-2)" strokeWidth="2.5" strokeLinecap="round" />
            <line x1="60" y1="1" x2="56" y2="3" stroke="var(--frame-color-2)" strokeWidth="2.5" strokeLinecap="round" />
          </g>
          {/* Small sword marks at cardinal points */}
          {[90, 180, 270].map((angle, i) => {
            const rad = (angle * Math.PI) / 180;
            const cx = 50 + 46 * Math.cos(rad);
            const cy = 50 + 46 * Math.sin(rad);
            return (
              <g key={i} opacity="0.7">
                <line
                  x1={cx - 3 * Math.cos(rad)}
                  y1={cy - 3 * Math.sin(rad)}
                  x2={cx + 3 * Math.cos(rad)}
                  y2={cy + 3 * Math.sin(rad)}
                  stroke="var(--frame-color-2)"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </g>
            );
          })}
          {/* Blood energy wisps flowing along outer edge */}
          {[
            { start: 30, end: 80, d: "0s" },
            { start: 120, end: 170, d: "1s" },
            { start: 200, end: 250, d: "2s" },
            { start: 300, end: 340, d: "0.5s" },
          ].map((wisp, i) => {
            const r = 46;
            const startRad = (wisp.start * Math.PI) / 180;
            const endRad = (wisp.end * Math.PI) / 180;
            const x1 = 50 + r * Math.cos(startRad);
            const y1 = 50 + r * Math.sin(startRad);
            const x2 = 50 + r * Math.cos(endRad);
            const y2 = 50 + r * Math.sin(endRad);
            return (
              <path
                key={i}
                className="blood-wisp"
                style={{ animationDelay: wisp.d }}
                d={`M${x1},${y1} A${r},${r} 0 0,1 ${x2},${y2}`}
                stroke="var(--frame-color-1)"
                strokeWidth="2"
                strokeLinecap="round"
                fill="none"
                opacity="0.5"
              />
            );
          })}
        </svg>
      );

    // ─── Thanh Long: dragon coiling around outer rim ───
    case "azure-dragon":
      return (
        <svg
          className="frame-scene frame-scene-thanh-long"
          width={s}
          height={s}
          viewBox="0 0 100 100"
          fill="none"
        >
          {/* Ornate outer ring */}
          <circle
            cx="50"
            cy="50"
            r="46"
            stroke="var(--frame-color-1)"
            strokeWidth="1.2"
            fill="none"
            opacity="0.5"
          />
          {/* Dragon body — sinuous S-curve along outer rim */}
          <path
            className="dragon-body"
            d="M50 4 C65 4, 80 12, 90 25 C96 34, 96 46, 92 56 C88 66, 78 76, 68 82 C58 88, 45 92, 35 88 C25 84, 18 74, 12 62 C6 50, 4 38, 10 26 C16 14, 30 6, 50 4"
            stroke="var(--frame-color-1)"
            strokeWidth="2.5"
            fill="none"
            opacity="0.7"
            strokeLinecap="round"
          />
          {/* Dragon glow */}
          <path
            d="M50 4 C65 4, 80 12, 90 25 C96 34, 96 46, 92 56 C88 66, 78 76, 68 82 C58 88, 45 92, 35 88 C25 84, 18 74, 12 62 C6 50, 4 38, 10 26 C16 14, 30 6, 50 4"
            stroke="var(--frame-color-1)"
            strokeWidth="5"
            fill="none"
            opacity="0.15"
            strokeLinecap="round"
          />
          {/* Dragon head at top */}
          <circle cx="50" cy="4" r="3.5" fill="var(--frame-color-1)" opacity="0.9" />
          {/* Eyes */}
          <circle cx="48.5" cy="3.5" r="0.8" fill="var(--frame-color-2)" />
          <circle cx="51.5" cy="3.5" r="0.8" fill="var(--frame-color-2)" />
          {/* Horns */}
          <line x1="47" y1="2" x2="44" y2="0" stroke="var(--frame-color-2)" strokeWidth="1.2" strokeLinecap="round" />
          <line x1="53" y1="2" x2="56" y2="0" stroke="var(--frame-color-2)" strokeWidth="1.2" strokeLinecap="round" />
          {/* Whiskers */}
          <path d="M47 5 C44 7, 40 6, 37 8" stroke="var(--frame-color-2)" strokeWidth="0.6" fill="none" opacity="0.5" />
          <path d="M53 5 C56 7, 60 6, 63 8" stroke="var(--frame-color-2)" strokeWidth="0.6" fill="none" opacity="0.5" />
          {/* Cloud motifs at edges */}
          {[
            { cx: 88, cy: 30 },
            { cx: 12, cy: 70 },
            { cx: 75, cy: 85 },
          ].map((c, i) => (
            <g key={i} className="dragon-cloud" opacity="0.25" style={{ animationDelay: `${i * 1.5}s` }}>
              <ellipse cx={c.cx} cy={c.cy} rx="5" ry="2.5" fill="var(--frame-color-2)" />
              <ellipse cx={c.cx - 3} cy={c.cy - 1} rx="3.5" ry="2" fill="var(--frame-color-2)" />
            </g>
          ))}
          {/* Scales along body */}
          {[
            { x: 78, y: 14 }, { x: 94, y: 40 }, { x: 82, y: 70 },
            { x: 55, y: 90 }, { x: 28, y: 86 }, { x: 10, y: 55 },
            { x: 8, y: 30 }, { x: 28, y: 8 },
          ].map((sc, i) => (
            <path
              key={i}
              d={`M${sc.x} ${sc.y - 1.5} L${sc.x + 1.2} ${sc.y} L${sc.x} ${sc.y + 1.5} L${sc.x - 1.2} ${sc.y} Z`}
              fill="var(--frame-color-2)"
              opacity="0.4"
            />
          ))}
        </svg>
      );

    // ─── Bạch Hổ: silver tiger stripes + claw marks ───
    case "white-tiger":
      return (
        <svg
          className="frame-scene frame-scene-bach-ho"
          width={s}
          height={s}
          viewBox="0 0 100 100"
          fill="none"
        >
          {/* Outer border ring */}
          <circle
            cx="50"
            cy="50"
            r="46"
            stroke="var(--frame-color-1)"
            strokeWidth="1.8"
            fill="none"
            opacity="0.5"
          />
          <circle
            cx="50"
            cy="50"
            r="44"
            stroke="var(--frame-color-2)"
            strokeWidth="0.5"
            fill="none"
            opacity="0.2"
          />
          {/* Tiger stripe patterns along outer rim */}
          {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => {
            const rad = (angle * Math.PI) / 180;
            const r1 = 42;
            const r2 = 48;
            const cx = 50 + ((r1 + r2) / 2) * Math.cos(rad);
            const cy = 50 + ((r1 + r2) / 2) * Math.sin(rad);
            const perpX = -Math.sin(rad) * 4;
            const perpY = Math.cos(rad) * 4;
            return (
              <line
                key={i}
                className="tiger-stripe"
                style={{ animationDelay: `${i * 0.3}s` }}
                x1={cx - perpX}
                y1={cy - perpY}
                x2={cx + perpX}
                y2={cy + perpY}
                stroke="var(--frame-color-1)"
                strokeWidth="1.5"
                strokeLinecap="round"
                opacity="0.5"
              />
            );
          })}
          {/* Claw marks at 4 corners */}
          {[
            { x: 50, y: 2, rot: 0 },
            { x: 98, y: 50, rot: 90 },
            { x: 50, y: 98, rot: 180 },
            { x: 2, y: 50, rot: 270 },
          ].map((claw, i) => (
            <g
              key={i}
              className="tiger-claw"
              style={{ animationDelay: `${i * 0.5}s` }}
              transform={`translate(${claw.x}, ${claw.y}) rotate(${claw.rot})`}
              opacity="0.7"
            >
              <line x1="-3" y1="-2" x2="0" y2="3" stroke="var(--frame-color-1)" strokeWidth="1.5" strokeLinecap="round" />
              <line x1="0" y1="-3" x2="0" y2="3" stroke="var(--frame-color-1)" strokeWidth="1.5" strokeLinecap="round" />
              <line x1="3" y1="-2" x2="0" y2="3" stroke="var(--frame-color-1)" strokeWidth="1.5" strokeLinecap="round" />
            </g>
          ))}
          {/* Icy mist particles at edges */}
          {[
            { cx: 20, cy: 10, d: "0s" },
            { cx: 85, cy: 22, d: "1s" },
            { cx: 90, cy: 75, d: "2s" },
            { cx: 15, cy: 88, d: "1.5s" },
            { cx: 50, cy: 3, d: "0.5s" },
            { cx: 50, cy: 97, d: "2.5s" },
          ].map((p, i) => (
            <circle
              key={i}
              className="ice-mist"
              style={{ animationDelay: p.d }}
              cx={p.cx}
              cy={p.cy}
              r="1.5"
              fill="var(--frame-color-2)"
              opacity="0.4"
            />
          ))}
        </svg>
      );

    // ─── Phượng Vũ: phoenix feathers + flame particles on outer rim ───
    case "phoenix-dance":
      return (
        <svg
          className="frame-scene frame-scene-phuong-vu"
          width={s}
          height={s}
          viewBox="0 0 100 100"
          fill="none"
        >
          {/* Outer border ring */}
          <circle
            cx="50"
            cy="50"
            r="46"
            stroke="var(--frame-color-1)"
            strokeWidth="1.5"
            fill="none"
            opacity="0.5"
          />
          {/* Phoenix feather arcs wrapping the rim */}
          {[0, 60, 120, 180, 240, 300].map((angle, i) => {
            const startRad = (angle * Math.PI) / 180;
            const endRad = ((angle + 50) * Math.PI) / 180;
            const r = 46;
            const x1 = 50 + r * Math.cos(startRad);
            const y1 = 50 + r * Math.sin(startRad);
            const x2 = 50 + r * Math.cos(endRad);
            const y2 = 50 + r * Math.sin(endRad);
            return (
              <path
                key={i}
                className="phoenix-feather"
                style={{ animationDelay: `${i * 0.4}s` }}
                d={`M${x1},${y1} A${r},${r} 0 0,1 ${x2},${y2}`}
                stroke={i % 2 === 0 ? "var(--frame-color-1)" : "var(--frame-color-2)"}
                strokeWidth="2"
                strokeLinecap="round"
                fill="none"
                opacity="0.6"
              />
            );
          })}
          {/* Phoenix head crest at top */}
          <g className="phoenix-crest" opacity="0.8">
            <circle cx="50" cy="4" r="2.5" fill="var(--frame-color-1)" />
            <line x1="47" y1="3" x2="44" y2="0" stroke="var(--frame-color-2)" strokeWidth="1.2" strokeLinecap="round" />
            <line x1="50" y1="2" x2="50" y2="-1" stroke="var(--frame-color-2)" strokeWidth="1.2" strokeLinecap="round" />
            <line x1="53" y1="3" x2="56" y2="0" stroke="var(--frame-color-2)" strokeWidth="1.2" strokeLinecap="round" />
          </g>
          {/* Flame particles around outer edge */}
          {[
            { cx: 25, cy: 8, d: "0s" },
            { cx: 85, cy: 20, d: "0.6s" },
            { cx: 95, cy: 55, d: "1.2s" },
            { cx: 78, cy: 88, d: "1.8s" },
            { cx: 22, cy: 88, d: "2.4s" },
            { cx: 5, cy: 55, d: "3s" },
            { cx: 15, cy: 20, d: "3.6s" },
          ].map((p, i) => (
            <ellipse
              key={i}
              className="flame-particle"
              style={{ animationDelay: p.d }}
              cx={p.cx}
              cy={p.cy}
              rx="1.5"
              ry="2.5"
              fill="var(--frame-color-1)"
              opacity="0.5"
            />
          ))}
        </svg>
      );

    // ─── Hắc Nguyệt: crescent moons + stars + dark runes ───
    case "dark-moon":
      return (
        <svg
          className="frame-scene frame-scene-hac-nguyet"
          width={s}
          height={s}
          viewBox="0 0 100 100"
          fill="none"
        >
          {/* Outer border ring */}
          <circle
            cx="50"
            cy="50"
            r="46"
            stroke="var(--frame-color-1)"
            strokeWidth="1"
            fill="none"
            opacity="0.4"
          />
          <circle
            cx="50"
            cy="50"
            r="48"
            stroke="var(--frame-color-2)"
            strokeWidth="0.5"
            fill="none"
            opacity="0.2"
          />
          {/* Crescent moon at top */}
          <g className="crescent-moon" opacity="0.8">
            <path
              d="M50 2 A6 6 0 1 0 50 14 A4.5 4.5 0 1 1 50 2"
              fill="var(--frame-color-1)"
            />
          </g>
          {/* Small crescent at bottom */}
          <g className="crescent-moon-sm" opacity="0.5" transform="rotate(180 50 50)">
            <path
              d="M50 2 A4 4 0 1 0 50 10 A3 3 0 1 1 50 2"
              fill="var(--frame-color-2)"
            />
          </g>
          {/* Stars scattered along outer edge */}
          {[
            { cx: 20, cy: 12, r: 1.5, d: "0s" },
            { cx: 80, cy: 12, r: 1.2, d: "0.5s" },
            { cx: 95, cy: 45, r: 1.8, d: "1s" },
            { cx: 90, cy: 75, r: 1, d: "1.5s" },
            { cx: 10, cy: 75, r: 1.3, d: "2s" },
            { cx: 5, cy: 45, r: 1.5, d: "2.5s" },
            { cx: 35, cy: 95, r: 1.2, d: "3s" },
            { cx: 65, cy: 95, r: 1, d: "0.8s" },
          ].map((star, i) => (
            <circle
              key={i}
              className="moon-star"
              style={{ animationDelay: star.d }}
              cx={star.cx}
              cy={star.cy}
              r={star.r}
              fill="var(--frame-color-1)"
              opacity="0.6"
            />
          ))}
          {/* Dark runes at cardinal points */}
          {[
            { x: 96, y: 50, d: "0s" },
            { x: 50, y: 96, d: "1s" },
            { x: 4, y: 50, d: "2s" },
          ].map((rune, i) => (
            <g
              key={i}
              className="dark-rune"
              style={{ animationDelay: rune.d }}
              opacity="0.5"
            >
              <circle cx={rune.x} cy={rune.y} r="2.5" stroke="var(--frame-color-2)" strokeWidth="0.8" fill="none" />
              <line x1={rune.x - 1.5} y1={rune.y} x2={rune.x + 1.5} y2={rune.y} stroke="var(--frame-color-2)" strokeWidth="0.8" />
              <line x1={rune.x} y1={rune.y - 1.5} x2={rune.x} y2={rune.y + 1.5} stroke="var(--frame-color-2)" strokeWidth="0.8" />
            </g>
          ))}
          {/* Dark energy wisp arcs */}
          {[
            { start: 40, end: 80, d: "0s" },
            { start: 150, end: 200, d: "1.5s" },
            { start: 260, end: 310, d: "3s" },
          ].map((wisp, i) => {
            const r = 47;
            const startRad = (wisp.start * Math.PI) / 180;
            const endRad = (wisp.end * Math.PI) / 180;
            const x1 = 50 + r * Math.cos(startRad);
            const y1 = 50 + r * Math.sin(startRad);
            const x2 = 50 + r * Math.cos(endRad);
            const y2 = 50 + r * Math.sin(endRad);
            return (
              <path
                key={i}
                className="dark-wisp"
                style={{ animationDelay: wisp.d }}
                d={`M${x1},${y1} A${r},${r} 0 0,1 ${x2},${y2}`}
                stroke="var(--frame-color-2)"
                strokeWidth="1.5"
                strokeLinecap="round"
                fill="none"
                opacity="0.3"
              />
            );
          })}
        </svg>
      );

    // ─── Kim Cương: gold mandala + vajra patterns ───
    case "diamond-vajra":
      return (
        <svg
          className="frame-scene frame-scene-kim-cuong"
          width={s}
          height={s}
          viewBox="0 0 100 100"
          fill="none"
        >
          {/* Double outer ring */}
          <circle
            cx="50"
            cy="50"
            r="46"
            stroke="var(--frame-color-1)"
            strokeWidth="1.5"
            fill="none"
            opacity="0.6"
          />
          <circle
            cx="50"
            cy="50"
            r="48"
            stroke="var(--frame-color-1)"
            strokeWidth="0.5"
            fill="none"
            opacity="0.3"
          />
          {/* Mandala geometric pattern — 12 petal arcs */}
          {Array.from({ length: 12 }).map((_, i) => {
            const angle = i * 30;
            const rad = (angle * Math.PI) / 180;
            const r = 46;
            const cx = 50 + r * Math.cos(rad);
            const cy = 50 + r * Math.sin(rad);
            return (
              <g key={i} opacity="0.6">
                <circle
                  cx={cx}
                  cy={cy}
                  r="2"
                  fill="var(--frame-color-1)"
                />
                <circle
                  cx={cx}
                  cy={cy}
                  r="3.5"
                  stroke="var(--frame-color-2)"
                  strokeWidth="0.5"
                  fill="none"
                  opacity="0.4"
                />
              </g>
            );
          })}
          {/* Vajra diamond shapes at 4 cardinal points */}
          {[0, 90, 180, 270].map((angle, i) => {
            const rad = (angle * Math.PI) / 180;
            const cx = 50 + 46 * Math.cos(rad);
            const cy = 50 + 46 * Math.sin(rad);
            return (
              <g key={i} className="vajra-diamond" style={{ animationDelay: `${i * 0.5}s` }} opacity="0.8">
                <path
                  d={`M${cx} ${cy - 4} L${cx + 2.5} ${cy} L${cx} ${cy + 4} L${cx - 2.5} ${cy} Z`}
                  fill="var(--frame-color-1)"
                  stroke="var(--frame-color-2)"
                  strokeWidth="0.5"
                />
              </g>
            );
          })}
          {/* Connecting lines between cardinal vajras */}
          {[0, 90, 180, 270].map((angle, i) => {
            const nextAngle = (angle + 90) % 360;
            const r = 46;
            const rad1 = (angle * Math.PI) / 180;
            const rad2 = (nextAngle * Math.PI) / 180;
            const x1 = 50 + r * Math.cos(rad1);
            const y1 = 50 + r * Math.sin(rad1);
            const x2 = 50 + r * Math.cos(rad2);
            const y2 = 50 + r * Math.sin(rad2);
            return (
              <path
                key={i}
                d={`M${x1},${y1} A${r},${r} 0 0,1 ${x2},${y2}`}
                stroke="var(--frame-color-1)"
                strokeWidth="1"
                strokeDasharray="3 3"
                fill="none"
                opacity="0.3"
              />
            );
          })}
        </svg>
      );

    // ─── Thủy Mặc: ink brush strokes + bamboo leaves ───
    case "ink-wash":
      return (
        <svg
          className="frame-scene frame-scene-thuy-mac"
          width={s}
          height={s}
          viewBox="0 0 100 100"
          fill="none"
        >
          {/* Ink brush stroke border — irregular circle */}
          <path
            className="ink-border"
            d="M50 4 C62 3, 78 8, 88 18 C95 26, 98 38, 97 50 C96 62, 92 76, 82 85 C72 94, 60 97, 50 97 C38 97, 24 92, 16 82 C8 72, 4 60, 4 50 C4 38, 8 24, 18 16 C28 8, 40 3, 50 4"
            stroke="var(--frame-color-1)"
            strokeWidth="2"
            fill="none"
            opacity="0.6"
            strokeLinecap="round"
          />
          {/* Second thin ink stroke */}
          <path
            d="M50 6 C60 5, 74 10, 84 20 C92 28, 94 40, 94 50 C94 62, 88 74, 78 82 C68 90, 58 94, 50 94 C40 94, 28 88, 20 78 C12 68, 7 58, 7 50 C7 40, 12 28, 22 20 C32 12, 42 7, 50 6"
            stroke="var(--frame-color-2)"
            strokeWidth="0.8"
            fill="none"
            opacity="0.3"
            strokeLinecap="round"
          />
          {/* Ink splatter dots along the border */}
          {[
            { cx: 75, cy: 8, r: 2 },
            { cx: 95, cy: 35, r: 1.5 },
            { cx: 88, cy: 80, r: 2.2 },
            { cx: 12, cy: 80, r: 1.8 },
            { cx: 5, cy: 35, r: 2 },
            { cx: 30, cy: 5, r: 1.5 },
          ].map((dot, i) => (
            <circle
              key={i}
              className="ink-splatter"
              style={{ animationDelay: `${i * 0.5}s` }}
              cx={dot.cx}
              cy={dot.cy}
              r={dot.r}
              fill="var(--frame-color-1)"
              opacity="0.4"
            />
          ))}
          {/* Bamboo leaf silhouettes at edges */}
          {[
            { x: 85, y: 15, rot: 30 },
            { x: 90, y: 65, rot: -20 },
            { x: 15, y: 85, rot: 45 },
            { x: 10, y: 30, rot: -40 },
          ].map((leaf, i) => (
            <ellipse
              key={i}
              className="bamboo-leaf"
              style={{ animationDelay: `${i * 0.8}s` }}
              cx={leaf.x}
              cy={leaf.y}
              rx="1.5"
              ry="4"
              fill="var(--frame-color-1)"
              opacity="0.4"
              transform={`rotate(${leaf.rot} ${leaf.x} ${leaf.y})`}
            />
          ))}
          {/* Calligraphy brush marks */}
          <line x1="42" y1="2" x2="58" y2="2" stroke="var(--frame-color-1)" strokeWidth="2" strokeLinecap="round" opacity="0.5" />
          <line x1="42" y1="98" x2="58" y2="98" stroke="var(--frame-color-1)" strokeWidth="2" strokeLinecap="round" opacity="0.5" />
        </svg>
      );

    // ─── Thiên Mệnh: celestial clouds + Chinese knots + seal chars ───
    case "heavenly-mandate":
      return (
        <svg
          className="frame-scene frame-scene-thien-menh"
          width={s}
          height={s}
          viewBox="0 0 100 100"
          fill="none"
        >
          {/* Triple outer ring */}
          <circle
            cx="50"
            cy="50"
            r="46"
            stroke="var(--frame-color-1)"
            strokeWidth="1.5"
            fill="none"
            opacity="0.6"
          />
          <circle
            cx="50"
            cy="50"
            r="48"
            stroke="var(--frame-color-2)"
            strokeWidth="0.8"
            fill="none"
            opacity="0.3"
          />
          <circle
            cx="50"
            cy="50"
            r="44"
            stroke="var(--frame-color-1)"
            strokeWidth="0.5"
            fill="none"
            opacity="0.2"
          />
          {/* Chinese knot pattern at cardinal points */}
          {[0, 90, 180, 270].map((angle, i) => {
            const rad = (angle * Math.PI) / 180;
            const cx = 50 + 46 * Math.cos(rad);
            const cy = 50 + 46 * Math.sin(rad);
            return (
              <g key={i} className="celestial-knot" style={{ animationDelay: `${i * 0.6}s` }} opacity="0.7">
                {/* Diamond knot shape */}
                <path
                  d={`M${cx} ${cy - 3} L${cx + 2} ${cy - 1} L${cx + 2} ${cy + 1} L${cx} ${cy + 3} L${cx - 2} ${cy + 1} L${cx - 2} ${cy - 1} Z`}
                  stroke="var(--frame-color-1)"
                  strokeWidth="0.8"
                  fill="var(--frame-color-1)"
                  fillOpacity="0.3"
                />
                {/* Inner diamond */}
                <path
                  d={`M${cx} ${cy - 1.5} L${cx + 1} ${cy} L${cx} ${cy + 1.5} L${cx - 1} ${cy} Z`}
                  fill="var(--frame-color-2)"
                  opacity="0.8"
                />
              </g>
            );
          })}
          {/* Celestial cloud wisps */}
          {[
            { cx: 25, cy: 8 },
            { cx: 78, cy: 10 },
            { cx: 92, cy: 60 },
            { cx: 75, cy: 92 },
            { cx: 25, cy: 92 },
            { cx: 8, cy: 60 },
          ].map((cloud, i) => (
            <g key={i} className="celestial-cloud" style={{ animationDelay: `${i * 0.8}s` }} opacity="0.3">
              <ellipse cx={cloud.cx} cy={cloud.cy} rx="5" ry="2" fill="var(--frame-color-1)" />
              <ellipse cx={cloud.cx - 2} cy={cloud.cy - 1} rx="3" ry="1.5" fill="var(--frame-color-2)" />
            </g>
          ))}
          {/* Seal characters at intercardinal points */}
          {[45, 135, 225, 315].map((angle, i) => {
            const rad = (angle * Math.PI) / 180;
            const cx = 50 + 46 * Math.cos(rad);
            const cy = 50 + 46 * Math.sin(rad);
            return (
              <g key={i} className="seal-char" style={{ animationDelay: `${i * 0.5}s` }} opacity="0.5">
                <rect
                  x={cx - 2.5}
                  y={cy - 2.5}
                  width="5"
                  height="5"
                  stroke="var(--frame-color-1)"
                  strokeWidth="0.6"
                  fill="none"
                  rx="0.5"
                />
                {/* Simple seal line inside */}
                <line x1={cx - 1} y1={cy} x2={cx + 1} y2={cy} stroke="var(--frame-color-2)" strokeWidth="0.8" />
                <line x1={cx} y1={cy - 1} x2={cx} y2={cy + 1} stroke="var(--frame-color-2)" strokeWidth="0.8" />
              </g>
            );
          })}
          {/* Floating energy orbs */}
          {[
            { cx: 50, cy: 2, d: "0s" },
            { cx: 98, cy: 50, d: "1s" },
            { cx: 50, cy: 98, d: "2s" },
            { cx: 2, cy: 50, d: "3s" },
          ].map((orb, i) => (
            <circle
              key={i}
              className="mandate-orb"
              style={{ animationDelay: orb.d }}
              cx={orb.cx}
              cy={orb.cy}
              r="2"
              fill="var(--frame-color-1)"
              opacity="0.6"
            />
          ))}
        </svg>
      );
  }
}

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
      {/* SVG scene overlay — decorations only on outer border */}
      {renderFrameScene(frame.decoration, size)}
    </div>
  );
};
