import { describe, expect, it } from 'vitest'
import { resolveSiteUrlFrom } from './site-config'

const REAL = 'https://www.gertlushhoney.co.uk'

describe('resolveSiteUrlFrom', () => {
  it('uses a good address as its origin', () => {
    expect(resolveSiteUrlFrom('https://www.gertlushhoney.co.uk')).toBe(REAL)
    expect(resolveSiteUrlFrom('https://www.gertlushhoney.co.uk/')).toBe(REAL)
    expect(resolveSiteUrlFrom('http://localhost:3000')).toBe('http://localhost:3000')
  })

  it('falls back to the real domain when nothing is set', () => {
    expect(resolveSiteUrlFrom(undefined)).toBe(REAL)
    expect(resolveSiteUrlFrom('')).toBe(REAL)
  })

  it('falls back when the scheme is missing or the value is not a URL', () => {
    expect(resolveSiteUrlFrom('www.gertlushhoney.co.uk')).toBe(REAL)
    expect(resolveSiteUrlFrom('not a url')).toBe(REAL)
  })

  it('falls back when the address was pasted twice, which would have made https://www.gertlushhoney.co.ukhttps', () => {
    expect(resolveSiteUrlFrom('https://www.gertlushhoney.co.ukhttps://www.gertlushhoney.co.uk')).toBe(REAL)
  })
})
