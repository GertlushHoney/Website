#!/usr/bin/env node
// Feathers a product photo's edges to transparent via a radial alpha mask,
// so it blends into a page's dark gradient background instead of showing a
// hard rectangle edge — the same treatment used on the Bee S3 hero/product
// jar shots (see docs/brand-alignment-board.md, "Photography enhancement").
//
// Usage:
//   node scripts/feather-product-image.mjs <input> <output> [--start=0.6] [--end=1.0]
//
// --start: radius (0-1, fraction of the ellipse) where the fade begins.
//          Below this, the image is fully opaque. Default 0.6.
// --end:   radius (0-1) where the image is fully transparent. Default 1.0.
//
// Requires a fairly plain, uncluttered background around the subject —
// this fades the photo's own edges, it doesn't remove a background first.
// For a busy background, run through background removal (Higgsfield
// image_background_remover or similar) before this script.

import sharp from 'sharp'

const [, , inputPath, outputPath, ...flags] = process.argv

function flagValue(name, fallback) {
  const flag = flags.find((f) => f.startsWith(`--${name}=`))
  return flag ? Number(flag.split('=')[1]) : fallback
}

if (!inputPath || !outputPath) {
  console.error('Usage: node scripts/feather-product-image.mjs <input> <output> [--start=0.6] [--end=1.0]')
  process.exit(1)
}

const start = flagValue('start', 0.6)
const end = flagValue('end', 1.0)

const image = sharp(inputPath)
const { width, height } = await image.metadata()

if (!width || !height) {
  console.error(`Could not read dimensions of ${inputPath}`)
  process.exit(1)
}

// An ellipse matching the image's own aspect ratio (not a circle), so a
// landscape or portrait photo doesn't get clipped unevenly on its shorter
// axis.
const maskSvg = `
<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="fade" cx="50%" cy="50%" r="50%">
      <stop offset="${start * 100}%" stop-color="white" stop-opacity="1" />
      <stop offset="${end * 100}%" stop-color="white" stop-opacity="0" />
    </radialGradient>
  </defs>
  <ellipse cx="${width / 2}" cy="${height / 2}" rx="${width / 2}" ry="${height / 2}" fill="url(#fade)" />
</svg>
`

await sharp(inputPath)
  .ensureAlpha()
  .composite([{ input: Buffer.from(maskSvg), blend: 'dest-in' }])
  .png()
  .toFile(outputPath)

console.log(`Feathered image written to ${outputPath} (${width}x${height}, fade ${start}-${end})`)
