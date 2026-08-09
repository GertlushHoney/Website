import { describe, expect, it } from 'vitest'
import { env, hasSanityCredentials, hasShopifyCredentials } from './env'

describe('env', () => {
  it('boots without throwing when no commerce/CMS credentials are set', () => {
    expect(env).toBeDefined()
  })

  it('reports mocked-data mode when Shopify credentials are absent', () => {
    expect(hasShopifyCredentials).toBe(false)
  })

  it('reports mocked-data mode when Sanity credentials are absent', () => {
    expect(hasSanityCredentials).toBe(false)
  })
})
