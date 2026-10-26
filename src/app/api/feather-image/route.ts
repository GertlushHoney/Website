import { NextResponse, type NextRequest } from 'next/server'
import { featherToPng, UnreadableImageError } from '@/lib/images/feather'

// sharp needs real Node APIs (native bindings) — must not run on the Edge
// runtime.
export const runtime = 'nodejs'

// Backs the /tools/feather-image page — the masking itself lives in
// src/lib/images/feather.ts (shared with /tools/new-product).
const MAX_FILE_BYTES = 15 * 1024 * 1024 // 15MB — generous for a phone photo, not unbounded

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

  try {
    const outputBuffer = await featherToPng(inputBuffer, start, end)
    return new NextResponse(new Uint8Array(outputBuffer), {
      headers: {
        'Content-Type': 'image/png',
        'Content-Disposition': 'inline; filename="feathered.png"',
      },
    })
  } catch (err) {
    if (err instanceof UnreadableImageError) {
      return NextResponse.json({ error: err.message }, { status: 400 })
    }
    console.error('feather-image processing failed:', err)
    return NextResponse.json(
      { error: 'Something went wrong processing that image.' },
      { status: 500 }
    )
  }
}
