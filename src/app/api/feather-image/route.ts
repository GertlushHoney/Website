import { NextResponse, type NextRequest } from 'next/server'
import sharp from 'sharp'

// sharp needs real Node APIs (native bindings) — must not run on the Edge
// runtime.
export const runtime = 'nodejs'

// Backs the /tools/feather-image page — same radial-alpha-mask treatment
// as scripts/feather-product-image.mjs (the CLI version), reimplemented
// here rather than shared, since the CLI script runs standalone via plain
// `node` outside the Next build. Keep the masking maths in sync if either
// changes.
//
// The mask is raw pixel data, not an SVG radial gradient — an SVG version
// was tried first and failed here specifically with "Input buffer contains
// unsupported image format": the sharp/libvips binary resolved inside
// Next's server runtime didn't have SVG rasterisation available, even
// though the identical package works fine from a plain `node` process.
// Raw pixels have no such dependency.
const MAX_FILE_BYTES = 15 * 1024 * 1024 // 15MB — generous for a phone photo, not unbounded

// See scripts/feather-product-image.mjs for the mirror of this function.
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

export async function POST(request: NextRequest) {
  const formData = await request.formData()
  const file = formData.get('image')
  const start = Number(formData.get('start') ?? 0.6)
  const end = Number(formData.get('end') ?? 1.0)

  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'No image was uploaded.' }, { status: 400 })
  }
  if (!file.type.startsWith('image/')) {
    return NextResponse.json({ error: 'That file doesn’t look like an image.' }, { status: 400 })
  }
  if (file.size > MAX_FILE_BYTES) {
    return NextResponse.json({ error: 'That image is too large (15MB max).' }, { status: 400 })
  }
  if (!Number.isFinite(start) || !Number.isFinite(end) || start < 0 || end > 1 || start > end) {
    return NextResponse.json({ error: 'Invalid fade settings.' }, { status: 400 })
  }

  const inputBuffer = Buffer.from(await file.arrayBuffer())

  let width: number | undefined
  let height: number | undefined
  try {
    ;({ width, height } = await sharp(inputBuffer).metadata())
  } catch {
    return NextResponse.json(
      { error: 'Could not read that image — is it a valid photo file?' },
      { status: 400 }
    )
  }
  if (!width || !height) {
    return NextResponse.json({ error: 'Could not read that image’s dimensions.' }, { status: 400 })
  }

  const maskData = buildRadialFadeMask(width, height, start, end)

  try {
    const outputBuffer = await sharp(inputBuffer)
      .ensureAlpha()
      .composite([{ input: maskData, raw: { width, height, channels: 4 }, blend: 'dest-in' }])
      .png()
      .toBuffer()

    return new NextResponse(new Uint8Array(outputBuffer), {
      headers: {
        'Content-Type': 'image/png',
        'Content-Disposition': 'inline; filename="feathered.png"',
      },
    })
  } catch (err) {
    console.error('feather-image processing failed:', err)
    return NextResponse.json(
      { error: 'Something went wrong processing that image.' },
      { status: 500 }
    )
  }
}
