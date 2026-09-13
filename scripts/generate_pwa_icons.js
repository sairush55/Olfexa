const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const publicDir = path.join(__dirname, '..', 'public');
const iconsDir = path.join(publicDir, 'icons');

if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir);
}
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir);
}

function getSvg(size, paddingPercent = 0.15) {
  const pad = size * paddingPercent;
  const contentSize = size - (pad * 2);
  
  return `
  <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
    <rect width="${size}" height="${size}" rx="${size * 0.22}" fill="#064e3b" />
    <g transform="translate(${pad}, ${pad}) scale(${contentSize / 40})">
      <!-- Outer precision aperture ring -->
      <circle cx="20" cy="20" r="17" stroke="#34d399" stroke-width="1.75" stroke-dasharray="4 2.5" opacity="0.6" />
      <!-- Internal continuous lens ring -->
      <circle cx="20" cy="20" r="12.5" stroke="#ffffff" stroke-width="1.6" opacity="0.95" />
      <!-- Sinuous fragrance dispersion wave -->
      <path d="M12 24C14.5 24 16 16 20 16C24 16 25.5 24 28 24" stroke="#6ee7b7" stroke-width="2.5" stroke-linecap="round" />
      <!-- Central analytical focal node -->
      <circle cx="20" cy="20" r="2.4" fill="#ffffff" />
    </g>
  </svg>
  `;
}

function getMaskableSvg(size) {
  // Maskable icon requires safe area (safe zone is central 80%)
  return getSvg(size, 0.25);
}

async function generate() {
  console.log('Generating PWA icons...');
  
  // 192x192
  await sharp(Buffer.from(getSvg(192)))
    .png()
    .toFile(path.join(iconsDir, 'icon-192x192.png'));
  console.log('Created icon-192x192.png');

  // 512x512
  await sharp(Buffer.from(getSvg(512)))
    .png()
    .toFile(path.join(iconsDir, 'icon-512x512.png'));
  console.log('Created icon-512x512.png');

  // Maskable 512x512
  await sharp(Buffer.from(getMaskableSvg(512)))
    .png()
    .toFile(path.join(iconsDir, 'icon-maskable-512x512.png'));
  console.log('Created icon-maskable-512x512.png');

  // Apple touch icon 180x180
  await sharp(Buffer.from(getSvg(180, 0.12)))
    .png()
    .toFile(path.join(iconsDir, 'apple-touch-icon.png'));
  console.log('Created apple-touch-icon.png');

  // Favicon.ico / png
  await sharp(Buffer.from(getSvg(48, 0.1)))
    .png()
    .toFile(path.join(iconsDir, 'favicon.png'));
  console.log('Created favicon.png');

  console.log('All PWA icons generated successfully!');
}

generate().catch(err => {
  console.error('Error generating icons:', err);
  process.exit(1);
});
