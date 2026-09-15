import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest'
import { NextRequest } from 'next/server'

// Covers the security-header policy added in "ADD SECURITY HEADER POLICY"
// (2026-09-15) alongside the pre-existing Basic Auth gates it now sits
// next to. middleware.ts reads its env vars into module-level consts at
// import time (matching how it actually runs — Vercel doesn't change env
// vars mid-instance), so toggling the gates between tests needs
// vi.resetModules() + a fresh dynamic import each time, not just
// reassigning process.env before calling an already-imported middleware.
const ENV_KEYS = [
  'SITE_PASSWORD_USER',
  'SITE_PASSWORD',
  'STUDIO_PASSWORD_USER',
  'STUDIO_PASSWORD',
] as const

let savedEnv: Record<string, string | undefined>

beforeEach(() => {
  savedEnv = Object.fromEntries(ENV_KEYS.map((key) => [key, process.env[key]]))
  for (const key of ENV_KEYS) delete process.env[key]
  vi.resetModules()
})

afterEach(() => {
  for (const key of ENV_KEYS) {
    if (savedEnv[key] === undefined) delete process.env[key]
    else process.env[key] = savedEnv[key]
  }
})

async function loadMiddleware() {
  return (await import('./middleware')).middleware
}

function request(path: string, init?: ConstructorParameters<typeof NextRequest>[1]) {
  return new NextRequest(new URL(path, 'https://gertlushhoney.co.uk'), init)
}

// The nonce middleware.ts hands to the *response* CSP header must be the
// exact same value it forwards to the *request* (readable by Server
// Components via headers().get('x-nonce')) — otherwise JsonLd's nonce
// wouldn't match what the browser actually enforces and every JSON-LD
// block would be silently stripped. NextResponse.next({ request: {
// headers } }) surfaces the forwarded value on the response as
// `x-middleware-request-x-nonce`, which is how this is checked without a
// full Next.js server.
function forwardedNonce(response: Response): string | null {
  return response.headers.get('x-middleware-request-x-nonce')
}

function cspNonce(response: Response): string | null {
  const csp = response.headers.get('Content-Security-Policy')
  return csp?.match(/'nonce-([^']+)'/)?.[1] ?? null
}

describe('security headers (every route)', () => {
  test('sets the baseline headers on an ungated public page', async () => {
    const middleware = await loadMiddleware()
    const response = middleware(request('/shop'))
    expect(response.headers.get('X-Content-Type-Options')).toBe('nosniff')
    expect(response.headers.get('X-Frame-Options')).toBe('DENY')
    expect(response.headers.get('Referrer-Policy')).toBe('strict-origin-when-cross-origin')
    expect(response.headers.get('Permissions-Policy')).toContain('camera=()')
    expect(response.headers.get('Strict-Transport-Security')).toContain('max-age=63072000')
  })

  test('skips HSTS and upgrade-insecure-requests on a plain-http request', async () => {
    // Real regression, found by actually testing against WebKit (not
    // guessed): sending `upgrade-insecure-requests` unconditionally broke
    // every JS/CSS chunk load on the plain-HTTP local dev server under
    // Safari's engine specifically — see the comment on
    // contentSecurityPolicy in middleware.ts.
    const middleware = await loadMiddleware()
    const response = middleware(new NextRequest(new URL('/shop', 'http://gertlushhoney.co.uk')))
    expect(response.headers.get('Strict-Transport-Security')).toBeNull()
    expect(response.headers.get('Content-Security-Policy')).not.toContain(
      'upgrade-insecure-requests'
    )
  })

  test('sends upgrade-insecure-requests on a real https request', async () => {
    const middleware = await loadMiddleware()
    const response = middleware(request('/shop'))
    expect(response.headers.get('Content-Security-Policy')).toContain('upgrade-insecure-requests')
  })

  test('applies headers even on a 401 response from the site-wide gate', async () => {
    process.env.SITE_PASSWORD_USER = 'user'
    process.env.SITE_PASSWORD = 'pass'
    const middleware = await loadMiddleware()
    const response = middleware(request('/shop'))
    expect(response.status).toBe(401)
    expect(response.headers.get('X-Content-Type-Options')).toBe('nosniff')
    expect(response.headers.get('Content-Security-Policy')).toContain("default-src 'self'")
  })

  test('lets a correctly authenticated site-wide request through with headers intact', async () => {
    process.env.SITE_PASSWORD_USER = 'user'
    process.env.SITE_PASSWORD = 'pass'
    const middleware = await loadMiddleware()
    const response = middleware(
      request('/shop', { headers: { authorization: `Basic ${btoa('user:pass')}` } })
    )
    expect(response.status).not.toBe(401)
    expect(response.headers.get('X-Content-Type-Options')).toBe('nosniff')
  })
})

describe('Content-Security-Policy on the public site', () => {
  test('carries a nonce that matches the one forwarded to the page render', async () => {
    const middleware = await loadMiddleware()
    const response = middleware(request('/shop/bee-s3'))
    const csp = response.headers.get('Content-Security-Policy')
    expect(csp).toContain("script-src 'self' 'nonce-")
    expect(csp).toContain("frame-ancestors 'none'")
    expect(csp).toContain("object-src 'none'")
    expect(csp).toContain('https://cdn.sanity.io')
    expect(csp).toContain('https://cdn.shopify.com')

    const nonce = cspNonce(response)
    expect(nonce).toBeTruthy()
    expect(forwardedNonce(response)).toBe(nonce)
  })

  test('issues a different nonce per request', async () => {
    const middleware = await loadMiddleware()
    const first = cspNonce(middleware(request('/shop')))
    const second = cspNonce(middleware(request('/shop')))
    expect(first).not.toBe(second)
  })

  test('still sets a CSP on an unauthenticated webhook path', async () => {
    const middleware = await loadMiddleware()
    const response = middleware(request('/api/webhooks/shopify/order-paid'))
    expect(response.headers.get('Content-Security-Policy')).toContain("default-src 'self'")
  })

  test('never allows unsafe-eval outside development', async () => {
    const middleware = await loadMiddleware()
    const response = middleware(request('/shop'))
    expect(response.headers.get('Content-Security-Policy')).not.toContain('unsafe-eval')
  })

  test('allows unsafe-eval only in development, for Fast Refresh/React dev-mode eval', async () => {
    const originalNodeEnv = process.env.NODE_ENV
    vi.stubEnv('NODE_ENV', 'development')
    const middleware = await loadMiddleware()
    const response = middleware(request('/shop'))
    expect(response.headers.get('Content-Security-Policy')).toContain("'unsafe-eval'")
    vi.stubEnv('NODE_ENV', originalNodeEnv ?? 'test')
  })

  test('never allows the Vercel Analytics debug script domain outside development', async () => {
    const middleware = await loadMiddleware()
    const response = middleware(request('/shop'))
    expect(response.headers.get('Content-Security-Policy')).not.toContain('va.vercel-scripts.com')
  })

  test('allows the Vercel Analytics debug script domain only in development', async () => {
    // @vercel/analytics's <Analytics/> loads this real external script only
    // under `next dev` (confirmed by reading its source, and live in a
    // browser) — production always uses this site's own
    // /_vercel/insights/script.js instead. Without this, every local dev
    // pageload logs a CSP violation for a script that never sends real
    // data anyway.
    const originalNodeEnv = process.env.NODE_ENV
    vi.stubEnv('NODE_ENV', 'development')
    const middleware = await loadMiddleware()
    const response = middleware(request('/shop'))
    expect(response.headers.get('Content-Security-Policy')).toContain(
      'https://va.vercel-scripts.com'
    )
    vi.stubEnv('NODE_ENV', originalNodeEnv ?? 'test')
  })
})

describe('Content-Security-Policy exemption for /studio and /tools', () => {
  test('sends no CSP for /studio, but keeps the other security headers', async () => {
    const middleware = await loadMiddleware()
    const response = middleware(request('/studio'))
    expect(response.headers.get('Content-Security-Policy')).toBeNull()
    expect(response.headers.get('X-Content-Type-Options')).toBe('nosniff')
    expect(response.headers.get('X-Frame-Options')).toBe('DENY')
  })

  test('sends no CSP for /tools/feather-image', async () => {
    const middleware = await loadMiddleware()
    const response = middleware(request('/tools/feather-image'))
    expect(response.headers.get('Content-Security-Policy')).toBeNull()
  })

  test('sends no CSP for the gated /api/feather-image backend', async () => {
    const middleware = await loadMiddleware()
    const response = middleware(request('/api/feather-image'))
    expect(response.headers.get('Content-Security-Policy')).toBeNull()
  })

  test('still 401s an unauthenticated /studio request once the studio gate is configured, without a CSP', async () => {
    process.env.STUDIO_PASSWORD_USER = 'user'
    process.env.STUDIO_PASSWORD = 'pass'
    const middleware = await loadMiddleware()
    const response = middleware(request('/studio'))
    expect(response.status).toBe(401)
    expect(response.headers.get('Content-Security-Policy')).toBeNull()
    expect(response.headers.get('X-Content-Type-Options')).toBe('nosniff')
  })
})
