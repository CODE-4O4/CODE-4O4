#!/usr/bin/env node

/**
 * Generate PWA icons for Android/iOS
 * 
 * This script creates a simple branded icon for the PWA.
 * For production, replace with your actual logo/design.
 */

const fs = require('fs');
const path = require('path');

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

// Simple SVG template with CODE 4O4 branding
const generateSVG = (size) => `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <!-- Background -->
  <rect width="${size}" height="${size}" fill="#06b6d4" rx="${size * 0.2}"/>
  
  <!-- CODE text -->
  <text 
    x="50%" 
    y="40%" 
    font-family="system-ui, -apple-system, sans-serif" 
    font-size="${size * 0.25}" 
    font-weight="bold" 
    fill="white" 
    text-anchor="middle" 
    dominant-baseline="middle">CODE</text>
  
  <!-- 4O4 text -->
  <text 
    x="50%" 
    y="65%" 
    font-family="system-ui, -apple-system, sans-serif" 
    font-size="${size * 0.28}" 
    font-weight="bold" 
    fill="white" 
    text-anchor="middle" 
    dominant-baseline="middle">4O4</text>
</svg>`;

const publicDir = path.join(__dirname, '../public');

console.log('🎨 Generating PWA icons...\n');

sizes.forEach(size => {
  const filename = `icon-${size}x${size}.png`;
  const svgFilename = `icon-${size}x${size}.svg`;
  const svgPath = path.join(publicDir, svgFilename);
  const svgContent = generateSVG(size);
  
  // Write SVG file
  fs.writeFileSync(svgPath, svgContent);
  console.log(`✅ Created ${svgFilename}`);
});

console.log('\n📱 PWA icons generated successfully!');
console.log('\n⚠️  Note: These are SVG files. For best compatibility:');
console.log('   1. Convert them to PNG using an online tool or image editor');
console.log('   2. Or use a package like "sharp" for automated conversion');
console.log('   3. Replace the SVG files with PNG files of the same name\n');
