/**
 * Generate PWA icons from SVG.
 * Run: node scripts/generate-icons.mjs
 *
 * Uses sharp if available, otherwise creates SVGs for manual conversion.
 */
import { writeFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const outDir = resolve(__dirname, "../public/icons");

// ─── Regular icon: full design on black bg, no transparency ───
function regularIconSvg(size) {
  const pad = Math.round(size * 0.06); // 6% padding
  const s = size - pad * 2; // inner square size
  const r = Math.round(s * 0.22); // border radius
  const scale = s / 32;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" fill="#000"/>
  <g transform="translate(${pad},${pad})">
    <rect width="${s}" height="${s}" rx="${r}" fill="#E50914"/>
    ${filmPerfs(scale, s)}
    <polygon points="${12 * scale},${9 * scale} ${22 * scale},${16 * scale} ${12 * scale},${23 * scale}" fill="white"/>
  </g>
</svg>`;
}

// ─── Maskable icon: full bleed red bg, centered design ───
function maskableIconSvg(size) {
  const scale = size / 36;
  // Safe zone is center 80% — icon content must be within
  const safeInset = size * 0.1;
  const safeSize = size * 0.8;
  const innerScale = safeSize / 32;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" fill="#E50914"/>
  <g transform="translate(${safeInset},${safeInset})">
    ${filmPerfs(innerScale, safeSize)}
    <polygon points="${12 * innerScale},${9 * innerScale} ${22 * innerScale},${16 * innerScale} ${12 * innerScale},${23 * innerScale}" fill="white"/>
  </g>
</svg>`;
}

function filmPerfs(scale, boxSize) {
  const perfW = 2.5 * scale;
  const perfR = 0.5 * scale;
  const leftX = 3 * scale;
  const rightX = boxSize - 3 * scale - perfW;
  const ys = [5, 11, 17, 23].map((y) => y * scale);
  const fill = "rgba(0,0,0,0.3)";

  return ys
    .flatMap((y) => [
      `<rect x="${leftX}" y="${y}" width="${perfW}" height="${perfW}" rx="${perfR}" fill="${fill}"/>`,
      `<rect x="${rightX}" y="${y}" width="${perfW}" height="${perfW}" rx="${perfR}" fill="${fill}"/>`,
    ])
    .join("\n    ");
}

// Generate SVGs
const sizes = [192, 512];

for (const size of sizes) {
  const svg = regularIconSvg(size);
  writeFileSync(resolve(outDir, `icon-${size}.svg`), svg);
  console.log(`✓ icon-${size}.svg`);
}

const maskableSvg = maskableIconSvg(512);
writeFileSync(resolve(outDir, `icon-maskable-512.svg`), maskableSvg);
console.log(`✓ icon-maskable-512.svg`);

// Try to convert to PNG using sharp
try {
  const sharp = (await import("sharp")).default;

  for (const size of sizes) {
    const svg = regularIconSvg(size);
    await sharp(Buffer.from(svg))
      .resize(size, size)
      .png()
      .toFile(resolve(outDir, `icon-${size}.png`));
    console.log(`✓ icon-${size}.png`);
  }

  await sharp(Buffer.from(maskableIconSvg(512)))
    .resize(512, 512)
    .png()
    .toFile(resolve(outDir, `icon-maskable-512.png`));
  console.log(`✓ icon-maskable-512.png`);

  console.log("\n🎉 All PNG icons generated!");
} catch (e) {
  console.log("\n⚠ sharp not found. Installing...");
  const { execSync } = await import("child_process");
  execSync("npm install --no-save sharp", {
    cwd: resolve(__dirname, ".."),
    stdio: "inherit",
  });

  const sharp = (await import("sharp")).default;

  for (const size of sizes) {
    const svg = regularIconSvg(size);
    await sharp(Buffer.from(svg))
      .resize(size, size)
      .png()
      .toFile(resolve(outDir, `icon-${size}.png`));
    console.log(`✓ icon-${size}.png`);
  }

  await sharp(Buffer.from(maskableIconSvg(512)))
    .resize(512, 512)
    .png()
    .toFile(resolve(outDir, `icon-maskable-512.png`));
  console.log(`✓ icon-maskable-512.png`);

  console.log("\n🎉 All PNG icons generated!");
}
