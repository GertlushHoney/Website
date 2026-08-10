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
//
// The mask is built from raw pixel maths, not an SVG radial gradient —
// deliberately, after the SVG version failed inside Next's server runtime
// with "Input buffer contains unsupported image format" (the sharp/libvips
// binary resolved there didn't have SVG rasterisation available, even
// though the same package works fine from a plain `node` process like this
// script). Raw pixels have no such dependency, so the same logic is used
// in src/app/api/feather-image/route.ts (the web-tool version) — keep both
// in sync if this changes.

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
// axis. Distance 0 = centre, 1 = touching the ellipse boundary.
function buildRadialFadeMask(w, h, fadeStart, fadeEnd) {
  const channels = 4
  const data = Buffer.alloc(w * h * channels)
  const cx = w / 2
  const cy = h / 2
  const span = fadeEnd - fadeStart || 1e-6 // avoid divide-by-zero if start === end

  for (let y = 0; y < h; y++) {
    const ny = (y - cy) / cy
    for (let x = 0; x < w; x++) {
      const nx = (x - cx) / cx
      const dist = Math.sqrt(nx * nx + ny * ny)
      let alpha
      if (dist <= fadeStart) alpha = 255
      else if (dist >= fadeEnd) alpha = 0
      else alpha = Math.round(255 * (1 - (dist - fadeStart) / span))

      const idx = (y * w + x) * channels
      data[idx] = 255
      data[idx + 1] = 255
      data[idx + 2] = 255
      data[idx + 3] = alpha
    }
  }
  return data
}

const maskData = buildRadialFadeMask(width, height, start, end)

await sharp(inputPath)
  .ensureAlpha()
  .composite([{ input: maskData, raw: { width, height, channels: 4 }, blend: 'dest-in' }])
  .png()
  .toFile(outputPath)

console.log(`Feathered image written to ${outputPath} (${width}x${height}, fade ${start}-${end})`)
