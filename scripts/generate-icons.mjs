/**
 * Generate PWA icons from SVG (popcorn design).
 * Run: node scripts/generate-icons.mjs
 *
 * Uses sharp if available, otherwise creates SVGs for manual conversion.
 */
import { writeFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const outDir = resolve(__dirname, "../public/icons");

// ─── Popcorn SVG building blocks ───
function popcornKernels(scale, offsetX, offsetY) {
  const kernels = [
    { cx: 13, cy: 12, r: 4.5, fill: "#FFF8DC" },
    { cx: 23, cy: 12, r: 4.5, fill: "#FFF8DC" },
    { cx: 18, cy: 10, r: 5, fill: "#FFFDE7" },
    { cx: 10, cy: 14, r: 3.5, fill: "#FFF3CD" },
    { cx: 26, cy: 14, r: 3.5, fill: "#FFF3CD" },
    { cx: 15, cy: 8, r: 3.5, fill: "#FFFDE7" },
    { cx: 21, cy: 8, r: 3.5, fill: "#FFF8DC" },
    { cx: 18, cy: 14, r: 4, fill: "#FFFDE7" },
  ];
  return kernels
    .map(
      (k) =>
        `<circle cx="${k.cx * scale + offsetX}" cy="${k.cy * scale + offsetY}" r="${k.r * scale}" fill="${k.fill}"/>`,
    )
    .join("\n    ");
}

function popcornBucket(scale, offsetX, offsetY) {
  const x1 = 8 * scale + offsetX;
  const y1 = 16 * scale + offsetY;
  const x2 = 10 * scale + offsetX;
  const y2 = 32 * scale + offsetY;
  const x3 = 26 * scale + offsetX;
  const x4 = 28 * scale + offsetX;

  const stripe1x1 = 12 * scale + offsetX;
  const stripe1x2 = 13.5 * scale + offsetX;
  const stripe2x = 18 * scale + offsetX;
  const stripe3x1 = 24 * scale + offsetX;
  const stripe3x2 = 22.5 * scale + offsetX;

  const rimX = 7 * scale + offsetX;
  const rimY = 15 * scale + offsetY;
  const rimW = 22 * scale;
  const rimH = 2.5 * scale;

  return `<path d="M${x1} ${y1}L${x2} ${y2}H${x3}L${x4} ${y1}H${x1}Z" fill="#E50914"/>
    <path d="M${stripe1x1} ${y1}L${stripe1x2} ${y2}" stroke="white" stroke-width="${0.8 * scale}" stroke-opacity="0.3"/>
    <path d="M${stripe2x} ${y1}V${y2}" stroke="white" stroke-width="${0.8 * scale}" stroke-opacity="0.3"/>
    <path d="M${stripe3x1} ${y1}L${stripe3x2} ${y2}" stroke="white" stroke-width="${0.8 * scale}" stroke-opacity="0.3"/>
    <rect x="${rimX}" y="${rimY}" width="${rimW}" height="${rimH}" rx="${1 * scale}" fill="#CC0812"/>`;
}

// ─── Regular icon: popcorn on black bg ───
function regularIconSvg(size) {
  const pad = Math.round(size * 0.1);
  const innerSize = size - pad * 2;
  const scale = innerSize / 36;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" rx="${Math.round(size * 0.18)}" fill="#1a1a1a"/>
  <g>
    ${popcornKernels(scale, pad, pad)}
    ${popcornBucket(scale, pad, pad)}
  </g>
</svg>`;
}

// ─── Maskable icon: popcorn on red bg, safe zone aware ───
function maskableIconSvg(size) {
  const safeInset = size * 0.1;
  const safeSize = size * 0.8;
  const scale = safeSize / 36;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" fill="#E50914"/>
  <g>
    ${popcornKernels(scale, safeInset, safeInset)}
    ${popcornBucket(scale, safeInset, safeInset)}
  </g>
</svg>`;
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
