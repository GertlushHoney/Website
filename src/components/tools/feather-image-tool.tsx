'use client'

import { useCallback, useRef, useState } from 'react'

// Simple, non-technical-friendly front end for scripts/feather-product-
// image.mjs's treatment (POSTs to /api/feather-image, which runs the same
// masking logic via sharp). Drop a photo in, adjust the fade if needed,
// download the result.
export function FeatherImageTool() {
  const [originalUrl, setOriginalUrl] = useState<string | null>(null)
  const [resultUrl, setResultUrl] = useState<string | null>(null)
  const [fileName, setFileName] = useState<string | null>(null)
  const [start, setStart] = useState(60)
  const [end, setEnd] = useState(100)
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isDraggingOver, setIsDraggingOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const currentFileRef = useRef<File | null>(null)

  function handleFile(file: File) {
    if (!file.type.startsWith('image/')) {
      setError('That doesn’t look like an image file.')
      return
    }
    setError(null)
    setResultUrl(null)
    currentFileRef.current = file
    setFileName(file.name)
    setOriginalUrl(URL.createObjectURL(file))
  }

  const runFeather = useCallback(async () => {
    const file = currentFileRef.current
    if (!file) return

    setIsProcessing(true)
    setError(null)
    try {
      const formData = new FormData()
      formData.append('image', file)
      formData.append('start', String(start / 100))
      formData.append('end', String(end / 100))

      const res = await fetch('/api/feather-image', { method: 'POST', body: formData })
      if (!res.ok) {
        const body = await res.json().catch(() => null)
        throw new Error(body?.error ?? 'Something went wrong.')
      }
      const blob = await res.blob()
      setResultUrl(URL.createObjectURL(blob))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.')
    } finally {
      setIsProcessing(false)
    }
  }, [start, end])

  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <p className="text-honey-amber text-sm font-semibold tracking-wide uppercase">
        Internal tool
      </p>
      <h1 className="text-porcelain mt-3 text-3xl font-bold tracking-tight">
        Soften a product photo&apos;s edges
      </h1>
      <p className="text-porcelain/70 mt-3 max-w-xl text-sm">
        Fades a photo&apos;s edges to see-through, so it blends into the site&apos;s dark
        background instead of sitting in a hard-edged box — the same look as the Bee S3 jar
        photos. Works best on a photo with a plain, uncluttered background.
      </p>

      <div
        role="button"
        tabIndex={0}
        onClick={() => fileInputRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') fileInputRef.current?.click()
        }}
        onDragOver={(e) => {
          e.preventDefault()
          setIsDraggingOver(true)
        }}
        onDragLeave={() => setIsDraggingOver(false)}
        onDrop={(e) => {
          e.preventDefault()
          setIsDraggingOver(false)
          const file = e.dataTransfer.files[0]
          if (file) handleFile(file)
        }}
        className={`border-ink-line bg-honeycomb-surface focus-visible:outline-honey-amber mt-8 flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-12 text-center transition focus-visible:outline focus-visible:outline-offset-2 ${
          isDraggingOver ? 'border-honey-amber bg-ink-surface' : 'hover:border-honey-amber/60'
        }`}
      >
        <p className="text-porcelain text-sm font-semibold">
          {fileName ?? 'Drop a photo here, or click to choose one'}
        </p>
        <p className="text-porcelain/50 mt-1 text-xs">JPG or PNG, up to 15MB</p>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="sr-only"
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) handleFile(file)
          }}
        />
      </div>

      {originalUrl && (
        <>
          <div className="mt-8 grid gap-6 sm:grid-cols-2">
            <div>
              <p className="text-porcelain/60 mb-2 text-xs font-semibold tracking-wide uppercase">
                Before
              </p>
              {/* Plain <img>, not next/image — these are client-side blob URLs, not static assets. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={originalUrl}
                alt="Original, unprocessed"
                className="border-ink-line w-full rounded-xl border"
              />
            </div>
            <div>
              <p className="text-porcelain/60 mb-2 text-xs font-semibold tracking-wide uppercase">
                After
              </p>
              <div className="from-ink-surface to-ink border-ink-line flex aspect-square items-center justify-center rounded-xl border bg-gradient-to-b">
                {resultUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={resultUrl}
                    alt="Feathered result"
                    className="h-full w-full object-contain"
                  />
                ) : (
                  <p className="text-porcelain/50 px-6 text-center text-xs">
                    {isProcessing ? 'Processing…' : 'Click "Soften edges" below to preview'}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="border-ink-line bg-honeycomb-surface mt-8 rounded-2xl border p-6">
            <label className="text-porcelain flex items-center justify-between text-sm font-semibold">
              Fade starts
              <span className="text-porcelain/60 font-normal">{start}%</span>
            </label>
            <input
              type="range"
              min={0}
              max={95}
              value={start}
              onChange={(e) => setStart(Math.min(Number(e.target.value), end - 1))}
              className="accent-honey-amber mt-2 w-full"
            />
            <p className="text-porcelain/50 mt-1 text-xs">
              How far from the centre the photo stays fully solid before it starts fading. Lower = a
              bigger soft edge.
            </p>

            <label className="text-porcelain mt-5 flex items-center justify-between text-sm font-semibold">
              Fade ends
              <span className="text-porcelain/60 font-normal">{end}%</span>
            </label>
            <input
              type="range"
              min={5}
              max={100}
              value={end}
              onChange={(e) => setEnd(Math.max(Number(e.target.value), start + 1))}
              className="accent-honey-amber mt-2 w-full"
            />
            <p className="text-porcelain/50 mt-1 text-xs">
              How far out the photo is completely see-through. 100% = only the very corners.
            </p>

            {error && (
              <p className="text-honey-amber mt-4 text-sm" role="alert">
                {error}
              </p>
            )}

            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={runFeather}
                disabled={isProcessing}
                className="bg-honey-amber text-ink focus-visible:outline-porcelain rounded-full px-6 py-2.5 text-sm font-semibold focus-visible:outline focus-visible:outline-offset-4 disabled:opacity-60"
              >
                {isProcessing ? 'Softening…' : resultUrl ? 'Preview again' : 'Soften edges'}
              </button>
              {resultUrl && (
                <a
                  href={resultUrl}
                  download={
                    fileName ? `${fileName.replace(/\.[^.]+$/, '')}-feathered.png` : 'feathered.png'
                  }
                  className="border-porcelain/40 text-porcelain hover:border-porcelain focus-visible:outline-honey-amber rounded-full border px-6 py-2.5 text-sm font-semibold focus-visible:outline focus-visible:outline-offset-4"
                >
                  Download
                </a>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
