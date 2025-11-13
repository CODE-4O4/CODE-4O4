#!/usr/bin/env node

/**
 * Generate PWA icons for Android/iOS
 *
 * Usage:
 *   - Option A (recommended): Use your provided high-res source image.
 *       1) npm install sharp --save-dev
 *       2) node scripts/generate-icons.js path/to/source.png
 *
 *   - Option B (fallback): No source image provided. This script will generate simple SVG placeholders
 *       in `public/` (good for testing, but convert to PNG for production).
 */

const fs = require('fs');
const path = require('path');

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
const publicDir = path.join(__dirname, '..', 'public');

async function generateFromSource(source) {
  // Try to use sharp if available
  let sharp;
  try {
    sharp = require('sharp');
  } catch (e) {
    console.error('⚠️  sharp is not installed. Install it with: npm install sharp --save-dev');
    process.exit(1);
  }

  if (!fs.existsSync(source)) {
    console.error('Source image not found:', source);
    process.exit(1);
  }

  if (!fs.existsSync(publicDir)) fs.mkdirSync(publicDir, { recursive: true });

  for (const s of sizes) {
    const outName = `app-icon-${s}.png`;
    const outPath = path.join(publicDir, outName);
    try {
      await sharp(source).resize(s, s, { fit: 'cover' }).png({ quality: 90 }).toFile(outPath);
      console.log('✅', outName);
    } catch (err) {
      console.error('Failed to write', outName, err);
    }
  }

  // Also create favicons
  try {
    await sharp(source).resize(32, 32).png().toFile(path.join(publicDir, 'favicon-32x32.png'));
    await sharp(source).resize(16, 16).png().toFile(path.join(publicDir, 'favicon-16x16.png'));
    console.log('✅ favicon-32x32.png, favicon-16x16.png');
  } catch (e) {
    // ignore
  }

  // apple touch icon
  try {
    await sharp(source).resize(180, 180).png().toFile(path.join(publicDir, 'apple-touch-icon-180.png'));
    console.log('✅ apple-touch-icon-180.png');
  } catch (e) {}

  // maskable
  try {
    await sharp(source).resize(512, 512).png().toFile(path.join(publicDir, 'maskable-icon-512.png'));
    console.log('✅ maskable-icon-512.png');
  } catch (e) {}

  console.log('\nAll icons written to public/. Commit them and redeploy.');
}

function generateSVGPlaceholder() {
  const generateSVG = (size) => `<?xml version="1.0" encoding="UTF-8"?>\n<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">\n  <rect width="${size}" height="${size}" fill="#111"/>\n  <text x="50%" y="50%" font-family="system-ui, -apple-system, sans-serif" font-size="${Math.round(size * 0.18)}" fill="#ff7a00" text-anchor="middle" dominant-baseline="middle">CODE 4O4</text>\n</svg>`;

  if (!fs.existsSync(publicDir)) fs.mkdirSync(publicDir, { recursive: true });

  sizes.forEach(size => {
    const svgFilename = `app-icon-${size}.svg`;
    const svgPath = path.join(publicDir, svgFilename);
    fs.writeFileSync(svgPath, generateSVG(size));
    console.log('✅ Created', svgFilename);
  });

  // Also create simple favicons as SVGs
  ['favicon-32x32.svg', 'favicon-16x16.svg', 'apple-touch-icon-180.svg', 'maskable-icon-512.svg'].forEach(name => {
    const p = path.join(publicDir, name);
    fs.writeFileSync(p, generateSVG(name.includes('512') ? 512 : 180));
    console.log('✅ Created', name);
  });

  console.log('\nPlaceholder SVG icons are in public/ — convert to PNG for best compatibility.');
}

const src = process.argv[2];
if (src) {
  generateFromSource(src).catch((e) => { console.error(e); process.exit(1); });
} else {
  generateSVGPlaceholder();
}
