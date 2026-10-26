import sharp from 'sharp'

// The radial-alpha-mask "feather" treatment for product photos — shared by
// the /api/feather-image backend and the /tools/new-product tool. Mirrors
// scripts/feather-product-image.mjs (the CLI version, which runs standalone
// outside the Next build) — keep the masking maths in sync if either changes.
//
// The mask is raw pixel data, not an SVG radial gradient — an SVG version
// was tried first and failed inside Next's server runtime with "Input buffer
// contains unsupported image format": the sharp/libvips binary resolved
// there didn't have SVG rasterisation available, even though the identical
// package works fine from a plain `node` process. Raw pixels have no such
// dependency. Needs real Node APIs — never import from Edge code.
function buildRadialFadeMask(width: number, height: number, fadeStart: number, fadeEnd: number) {
  const channels = 4
  const data = Buffer.alloc(width * height * channels)
  const cx = width / 2
  const cy = height / 2
  const span = fadeEnd - fadeStart || 1e-6

  for (let y = 0; y < height; y++) {
    const ny = (y - cy) / cy
    for (let x = 0; x < width; x++) {
      const nx = (x - cx) / cx
      const dist = Math.sqrt(nx * nx + ny * ny)
      let alpha: number
      if (dist <= fadeStart) alpha = 255
      else if (dist >= fadeEnd) alpha = 0
      else alpha = Math.round(255 * (1 - (dist - fadeStart) / span))

      const idx = (y * width + x) * channels
      data[idx] = 255
      data[idx + 1] = 255
      data[idx + 2] = 255
      data[idx + 3] = alpha
    }
  }
  return data
}

export class UnreadableImageError extends Error {}

// Returns a PNG (needs the alpha channel) with the photo's own edges faded
// to transparent. Throws UnreadableImageError if sharp can't read the input.
export async function featherToPng(
  input: Buffer,
  fadeStart = 0.6,
  fadeEnd = 1.0
): Promise<Buffer> {
  let width: number | undefined
  let height: number | undefined
  try {
    ;({ width, height } = await sharp(input).metadata())
  } catch {
    throw new UnreadableImageError('Could not read that image — is it a valid photo file?')
  }
  if (!width || !height) {
    throw new UnreadableImageError('Could not read that image’s dimensions.')
  }

  const maskData = buildRadialFadeMask(width, height, fadeStart, fadeEnd)
  return sharp(input)
    .ensureAlpha()
    .composite([{ input: maskData, raw: { width, height, channels: 4 }, blend: 'dest-in' }])
    .png()
    .toBuffer()
}
