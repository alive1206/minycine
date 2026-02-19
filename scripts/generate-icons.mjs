/**
 * Generate PWA icons from SVG favicon using sharp.
 * Usage: node scripts/generate-icons.mjs
 */
import sharp from "sharp";
import { mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, "..");
const outputDir = join(rootDir, "public/icons");

mkdirSync(outputDir, { recursive: true });

// Standard icon SVG (with rounded corners as in original)
const svgIcon = `<svg width="512" height="512" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect x="2" y="2" width="32" height="32" rx="8" fill="#E50914"/>
  <rect x="5" y="7" width="2.5" height="2.5" rx="0.5" fill="rgba(0,0,0,0.3)"/>
  <rect x="5" y="13" width="2.5" height="2.5" rx="0.5" fill="rgba(0,0,0,0.3)"/>
  <rect x="5" y="19" width="2.5" height="2.5" rx="0.5" fill="rgba(0,0,0,0.3)"/>
  <rect x="5" y="25" width="2.5" height="2.5" rx="0.5" fill="rgba(0,0,0,0.3)"/>
  <rect x="28.5" y="7" width="2.5" height="2.5" rx="0.5" fill="rgba(0,0,0,0.3)"/>
  <rect x="28.5" y="13" width="2.5" height="2.5" rx="0.5" fill="rgba(0,0,0,0.3)"/>
  <rect x="28.5" y="19" width="2.5" height="2.5" rx="0.5" fill="rgba(0,0,0,0.3)"/>
  <rect x="28.5" y="25" width="2.5" height="2.5" rx="0.5" fill="rgba(0,0,0,0.3)"/>
  <path d="M15 11L26 18L15 25V11Z" fill="white"/>
</svg>`;

// Maskable icon: full bleed red background, icon centered in safe zone
const svgMaskable = `<svg width="512" height="512" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="512" height="512" fill="#E50914"/>
  <rect x="148" y="170" width="30" height="30" rx="4" fill="rgba(0,0,0,0.3)"/>
  <rect x="148" y="220" width="30" height="30" rx="4" fill="rgba(0,0,0,0.3)"/>
  <rect x="148" y="270" width="30" height="30" rx="4" fill="rgba(0,0,0,0.3)"/>
  <rect x="148" y="320" width="30" height="30" rx="4" fill="rgba(0,0,0,0.3)"/>
  <rect x="334" y="170" width="30" height="30" rx="4" fill="rgba(0,0,0,0.3)"/>
  <rect x="334" y="220" width="30" height="30" rx="4" fill="rgba(0,0,0,0.3)"/>
  <rect x="334" y="270" width="30" height="30" rx="4" fill="rgba(0,0,0,0.3)"/>
  <rect x="334" y="320" width="30" height="30" rx="4" fill="rgba(0,0,0,0.3)"/>
  <path d="M220 180L330 256L220 332V180Z" fill="white"/>
</svg>`;

const sizes = [
  { name: "icon-192.png", size: 192, svg: svgIcon },
  { name: "icon-512.png", size: 512, svg: svgIcon },
  { name: "icon-maskable-512.png", size: 512, svg: svgMaskable },
];

for (const { name, size, svg } of sizes) {
  await sharp(Buffer.from(svg))
    .resize(size, size)
    .png()
    .toFile(join(outputDir, name));
  console.log(`✅ Generated ${name} (${size}x${size})`);
}

console.log("\n🎉 All PWA icons generated in public/icons/");
