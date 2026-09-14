import { beforeEach, describe, expect, it, vi } from 'vitest'

// incrementSessionPlacesBooked is the core fix for "REVIEW EXPERIENCE
// OVERBOOKING" (2026-09-13) — a fresh read-check-write on every attempt,
// guarded by Sanity's own optimistic-concurrency primitive (ifRevisionId),
// so two customers racing for the same last place can never both succeed.
// This mocks the write client directly so each scenario (capacity refused,
// a genuine revision conflict that must retry, sustained contention that
// must eventually give up loudly) can be driven precisely.

type FakeDoc = { _rev: string; placesTotal: number; placesBooked: number }

function buildFakeClient(doc: FakeDoc, options: { failCommitsUntilRev?: string } = {}) {
  const fetch = vi.fn(async () => ({
    _rev: doc._rev,
    session: { placesTotal: doc.placesTotal, placesBooked: doc.placesBooked },
  }))

  const commit = vi.fn(async function (this: { rev: string }) {
    if (options.failCommitsUntilRev && this.rev !== options.failCommitsUntilRev) {
      const conflict = new Error('The document has been changed by another client') as Error & {
        statusCode: number
      }
      conflict.statusCode = 409
      throw conflict
    }
    doc.placesBooked += 1 // the amount doesn't matter for these tests; just marks a commit happened
    doc._rev = `${doc._rev}-next`
    return {}
  })

  const patch = vi.fn((_docId: string) => {
    let rev = ''
    const builder = {
      ifRevisionId(r: string) {
        rev = r
        return builder
      },
      inc(_fields: Record<string, number>) {
        return builder
      },
      commit: () => commit.call({ rev }),
    }
    return builder
  })

  return { fetch, patch, commit }
}

vi.mock('@/lib/sanity/write-client', () => ({
  isSanityWriteConfigured: vi.fn(() => true),
  getSanityWriteClient: vi.fn(),
}))

describe('incrementSessionPlacesBooked', () => {
  beforeEach(() => {
    vi.resetModules()
    vi.clearAllMocks()
  })

  it('books successfully when there is enough capacity', async () => {
    const { getSanityWriteClient } = await import('@/lib/sanity/write-client')
    const client = buildFakeClient({ _rev: 'rev-1', placesTotal: 10, placesBooked: 8 })
    vi.mocked(getSanityWriteClient).mockReturnValue(client as never)

    const { incrementSessionPlacesBooked } = await import('./experience-booking')
    const result = await incrementSessionPlacesBooked('doc-1', 'session-1', 2)

    expect(result).toEqual({ outcome: 'booked' })
    expect(client.patch).toHaveBeenCalledTimes(1)
  })

  it('refuses without ever attempting a write when the request exceeds what is actually left (3 jars × 2 = 6, only 4 remain)', async () => {
    const { getSanityWriteClient } = await import('@/lib/sanity/write-client')
    // placesTotal 10, placesBooked 6 → 4 remaining, but 6 requested.
    const client = buildFakeClient({ _rev: 'rev-1', placesTotal: 10, placesBooked: 6 })
    vi.mocked(getSanityWriteClient).mockReturnValue(client as never)

    const { incrementSessionPlacesBooked } = await import('./experience-booking')
    const result = await incrementSessionPlacesBooked('doc-1', 'session-1', 6)

    expect(result).toEqual({ outcome: 'insufficient_capacity', placesRequested: 6, placesRemaining: 4 })
    expect(client.patch).not.toHaveBeenCalled()
  })

  it('retries after a revision conflict and succeeds once it re-reads fresh data that still has room', async () => {
    const { getSanityWriteClient } = await import('@/lib/sanity/write-client')
    // The first commit attempt (against rev-1) is rejected as a conflict,
    // simulating another booking having won the race in between; only a
    // commit against the *next* revision succeeds.
    const client = buildFakeClient(
      { _rev: 'rev-1', placesTotal: 10, placesBooked: 9 },
      { failCommitsUntilRev: 'rev-1-next' }
    )
    // After the first (failed) attempt, the underlying doc must reflect
    // what actually happened — simulate the concurrent booking landing.
    let reads = 0
    client.fetch.mockImplementation(async () => {
      reads += 1
      if (reads === 1) return { _rev: 'rev-1', session: { placesTotal: 10, placesBooked: 9 } }
      // Someone else's booking committed between our two reads.
      return { _rev: 'rev-1-next', session: { placesTotal: 10, placesBooked: 9 } }
    })
    vi.mocked(getSanityWriteClient).mockReturnValue(client as never)

    const { incrementSessionPlacesBooked } = await import('./experience-booking')
    const result = await incrementSessionPlacesBooked('doc-1', 'session-1', 1)

    expect(result).toEqual({ outcome: 'booked' })
    expect(client.fetch).toHaveBeenCalledTimes(2)
    expect(client.patch).toHaveBeenCalledTimes(2) // one rejected attempt, one that succeeded
  })

  it('throws (never silently gives up) once retries are exhausted under sustained conflict', async () => {
    const { getSanityWriteClient } = await import('@/lib/sanity/write-client')
    // Every single commit attempt is rejected as a conflict, and the fake
    // re-read always returns the same revision — sustained contention that
    // never resolves within the retry budget.
    const client = buildFakeClient(
      { _rev: 'rev-1', placesTotal: 10, placesBooked: 5 },
      { failCommitsUntilRev: 'this-revision-never-matches' }
    )
    vi.mocked(getSanityWriteClient).mockReturnValue(client as never)

    const { incrementSessionPlacesBooked } = await import('./experience-booking')
    await expect(incrementSessionPlacesBooked('doc-1', 'session-1', 1)).rejects.toThrow(/exhausted/i)
  })

  it('propagates a genuine (non-conflict) error immediately, without retrying', async () => {
    const { getSanityWriteClient } = await import('@/lib/sanity/write-client')
    const client = buildFakeClient({ _rev: 'rev-1', placesTotal: 10, placesBooked: 5 })
    client.commit.mockRejectedValue(new Error('network error'))
    vi.mocked(getSanityWriteClient).mockReturnValue(client as never)

    const { incrementSessionPlacesBooked } = await import('./experience-booking')
    await expect(incrementSessionPlacesBooked('doc-1', 'session-1', 1)).rejects.toThrow('network error')
    expect(client.fetch).toHaveBeenCalledTimes(1) // no retry for a non-conflict error
  })
})
