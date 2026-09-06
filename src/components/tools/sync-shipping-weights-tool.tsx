'use client'

import { useState } from 'react'

type ResultRow =
  | { handle: string; name: string; status: 'synced' }
  | { handle: string; name: string; status: 'not-found' }
  | { handle: string; name: string; status: 'error'; message: string }

type SkippedRow = { handle: string; name: string; status: 'skipped' }

type ApiResponse = { results: ResultRow[]; skipped: SkippedRow[] }

function statusLabel(row: ResultRow | SkippedRow) {
  switch (row.status) {
    case 'synced':
      return { text: 'Synced', className: 'text-green-400' }
    case 'not-found':
      return { text: 'No matching Shopify product', className: 'text-honey-amber' }
    case 'error':
      return { text: `Error: ${row.message}`, className: 'text-red-400' }
    case 'skipped':
      return { text: 'No shipping weight set — skipped', className: 'text-porcelain/40' }
  }
}

// Front end for /api/sync-shipping-weights — pushes every active
// product's "Shipping weight (g)" (set in Sanity Studio) to Shopify's
// real inventory item weight, so a weight-based delivery rate has an
// accurate number to calculate against. Run this again any time weights
// change in Studio — there's no live webhook for it yet.
export function SyncShippingWeightsTool() {
  const [isRunning, setIsRunning] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [response, setResponse] = useState<ApiResponse | null>(null)

  async function runSync() {
    setIsRunning(true)
    setError(null)
    setResponse(null)
    try {
      const res = await fetch('/api/sync-shipping-weights', { method: 'POST' })
      const body = await res.json()
      if (!res.ok) throw new Error(body?.error ?? 'Something went wrong.')
      setResponse(body)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.')
    } finally {
      setIsRunning(false)
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <h1 className="text-porcelain text-2xl font-bold tracking-tight">
        Sync shipping weights to Shopify
      </h1>
      <p className="text-porcelain/60 mt-2 text-sm">
        Pushes every active product&apos;s &ldquo;Shipping weight (g)&rdquo; field (set in Sanity
        Studio) to Shopify&apos;s real inventory weight, so a weight-based delivery rate has an
        accurate number to calculate against. Run this again any time you add or change a weight
        in Studio.
      </p>

      <button
        type="button"
        onClick={runSync}
        disabled={isRunning}
        className="bg-honey-amber text-ink focus-visible:outline-porcelain mt-6 rounded-full px-6 py-2.5 text-sm font-semibold focus-visible:outline focus-visible:outline-offset-4 disabled:opacity-50"
      >
        {isRunning ? 'Syncing…' : 'Sync now'}
      </button>

      {error && (
        <p className="text-red-400 mt-4 text-sm" role="alert">
          {error}
        </p>
      )}

      {response && (
        <div className="mt-8 space-y-6">
          <div>
            <p className="text-porcelain text-sm font-semibold">
              {response.results.length} product{response.results.length === 1 ? '' : 's'} synced
            </p>
            <ul className="border-ink-line mt-2 divide-y rounded-xl border">
              {response.results.map((row) => {
                const label = statusLabel(row)
                return (
                  <li key={row.handle} className="flex items-center justify-between gap-3 p-3 text-sm">
                    <span className="text-porcelain">{row.name}</span>
                    <span className={label.className}>{label.text}</span>
                  </li>
                )
              })}
              {response.results.length === 0 && (
                <li className="text-porcelain/50 p-3 text-sm">Nothing had a shipping weight set.</li>
              )}
            </ul>
          </div>

          {response.skipped.length > 0 && (
            <div>
              <p className="text-porcelain/60 text-sm font-semibold">
                {response.skipped.length} skipped (no shipping weight set)
              </p>
              <ul className="border-ink-line mt-2 divide-y rounded-xl border">
                {response.skipped.map((row) => (
                  <li key={row.handle} className="flex items-center justify-between gap-3 p-3 text-sm">
                    <span className="text-porcelain/70">{row.name}</span>
                    <span className="text-porcelain/40">{row.handle}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
