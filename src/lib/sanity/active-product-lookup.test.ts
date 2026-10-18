import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/lib/sanity/client', () => ({
  sanityFetch: vi.fn(),
}))
// The module under test only needs next-sanity's `groq` tag, a pass-through
// re-export of the tiny standalone `groq` package. Loading the real
// next-sanity barrel (Studio, live preview, visual editing) inside the first
// test cost several seconds on a cold full-suite run — enough to hit the 5s
// timeout — so it's swapped for the real `groq` alone.
vi.mock('next-sanity', async () => ({ groq: (await import('groq')).default }))

describe('getActiveProductsByShopifyHandles', () => {
  beforeEach(() => {
    vi.resetModules()
    vi.clearAllMocks()
  })

  it('returns an empty array without querying Sanity when no handles are given', async () => {
    const { sanityFetch } = await import('./client')
    const { getActiveProductsByShopifyHandles } = await import('./active-product-lookup')

    const result = await getActiveProductsByShopifyHandles([])

    expect(result).toEqual([])
    expect(sanityFetch).not.toHaveBeenCalled()
  })

  it('resolves matching honey and merch products from one batch each', async () => {
    const { sanityFetch } = await import('./client')
    vi.mocked(sanityFetch)
      .mockResolvedValueOnce([{ name: 'Bee S3', slug: 'bee-s3' }]) // honeyProduct query
      .mockResolvedValueOnce([{ name: 'Beeswax Candle', slug: 'beeswax-candle-skep-and-bees' }]) // merchProduct query
    const { getActiveProductsByShopifyHandles } = await import('./active-product-lookup')

    const result = await getActiveProductsByShopifyHandles(['bee-s3', 'beewax-candle-skep-and-bees'])

    expect(result).toEqual([
      { name: 'Bee S3', slug: 'bee-s3' },
      { name: 'Beeswax Candle', slug: 'beeswax-candle-skep-and-bees' },
    ])
  })

  it('never sends more than the capped number of handles to Sanity, deduped', async () => {
    const { sanityFetch } = await import('./client')
    vi.mocked(sanityFetch).mockResolvedValue([])
    const { getActiveProductsByShopifyHandles } = await import('./active-product-lookup')

    const manyHandles = ['a', 'a', 'b', 'c', 'd', 'e', 'f', 'g']
    await getActiveProductsByShopifyHandles(manyHandles)

    const [, honeyParams] = vi.mocked(sanityFetch).mock.calls[0]!
    expect((honeyParams as { handles: string[] }).handles.length).toBeLessThanOrEqual(5)
    expect((honeyParams as { handles: string[] }).handles).not.toContain('g')
  })

  it('returns nothing for a handle that does not resolve to any real active product', async () => {
    const { sanityFetch } = await import('./client')
    vi.mocked(sanityFetch).mockResolvedValue([])
    const { getActiveProductsByShopifyHandles } = await import('./active-product-lookup')

    const result = await getActiveProductsByShopifyHandles(['not-a-real-product'])

    expect(result).toEqual([])
  })
})
