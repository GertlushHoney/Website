import { NextRequest, NextResponse } from 'next/server'

// Temporary pre-launch gate (added 2026-08-14) — the site is live on Vercel
// with real Sanity content and a real Shopify checkout, but not ready for
// real visitors yet. Every page requires this shared username/password via
// standard HTTP Basic Auth (a native browser login prompt) until removed.
// Remove this pair (and the SITE_PASSWORD* env vars) when ready to launch
// publicly — the separate /studio gate below stays regardless.
const USERNAME = process.env.SITE_PASSWORD_USER
const PASSWORD = process.env.SITE_PASSWORD

// Permanent /studio gate (added 2026-08-16), independent of the pre-launch
// gate above. Sanity Studio already has its own real login — nobody can
// edit content without a genuine Sanity account added to the project — but
// this adds a second layer in front of the /studio URL itself, and keeps
// working even after SITE_PASSWORD is removed at public launch.
//
// /tools/feather-image and its /api/feather-image backend (added 2026-08-19)
// share this same gate rather than getting their own — that internal photo
// helper has no auth of its own (see docs/launch-checklist.md point 8), so
// it needs to stay behind something permanent too, not just the temporary
// site-wide gate. /api/sync-shipping-weights (added 2026-09-06) is the same
// story for the /tools/sync-shipping-weights helper — it writes real data
// to the live Shopify store, so it must never be reachable unauthenticated.
const STUDIO_USERNAME = process.env.STUDIO_PASSWORD_USER
const STUDIO_PASSWORD = process.env.STUDIO_PASSWORD
const STUDIO_GATED_PREFIXES = [
  '/studio',
  '/tools',
  '/api/feather-image',
  '/api/sync-shipping-weights',
]

function isAuthorized(request: NextRequest, username: string, password: string): boolean {
  const auth = request.headers.get('authorization')
  if (!auth?.startsWith('Basic ')) return false
  const [user, pass] = atob(auth.slice(6)).split(':')
  return user === username && pass === password
}

function authRequired(realm: string) {
  return new NextResponse('Authentication required', {
    status: 401,
    headers: { 'WWW-Authenticate': `Basic realm="${realm}"` },
  })
}

// Webhook endpoints (added 2026-09-04, hamper stock sync) — Shopify calls
// these directly and can't supply the site-wide Basic Auth credentials, so
// they're excluded from both gates. Their real security boundary is each
// route verifying Shopify's HMAC signature itself, not this middleware.
const UNGATED_PREFIXES = ['/api/webhooks']

// Headers applied to every response, gate or no gate — none of these
// interfere with how any page's own JS/CSS behaves, so there's no reason to
// scope them per-route the way the CSP below has to be. See "ADD SECURITY
// HEADER POLICY" audit, 2026-09-15.
const PERMISSIONS_POLICY =
  'camera=(), microphone=(), geolocation=(), payment=(), usb=(), magnetometer=(), gyroscope=(), accelerometer=()'

// Real, live external origins the *public* site actually loads resources
// from — kept as one list so the CSP below and any future audit can be
// checked against the same source of truth, rather than guessed at.
// Checked against the code, not copied from a generic template:
//   - cdn.sanity.io / cdn.shopify.com: <Image> remote patterns
//     (next.config.ts) — the browser only ever requests same-origin
//     /_next/image itself, but these are kept in img-src as a deliberate
//     safety margin in case an image is ever rendered unoptimized.
//   - No other script/style/connect third party is loaded client-side:
//     fonts are self-hosted via next/font/google (no fonts.googleapis.com
//     request at runtime), Vercel Web Analytics serves its script from
//     this site's own /_vercel/insights/script.js in production, and every
//     Shopify/Sanity data fetch happens server-side (Server Actions/RSC),
//     never as a browser-side request to their domains. Checkout is a
//     plain <a href> navigation to Shopify's own domain, which isn't
//     something a CSP on *this* origin governs.
function contentSecurityPolicy(nonce: string, isHttps: boolean): string {
  // `next dev` (Fast Refresh, React's dev-mode component-stack
  // reconstruction) genuinely calls eval() — a strict script-src blocks it
  // outright in the browser, flooding the console with "eval() is not
  // supported" errors that have nothing to do with a real CSP violation.
  // React's own error text confirms production never calls eval(), so
  // this relaxation is dev-only and never ships. See "ADD SECURITY HEADER
  // POLICY" audit, 2026-09-15.
  //
  // @vercel/analytics behaves the same way for a different reason: its
  // <Analytics/> component only ever requests this site's own
  // /_vercel/insights/script.js in production (confirmed by reading
  // node_modules/@vercel/analytics/dist/next/index.mjs) — but under
  // `next dev` it unconditionally loads a real external debug script from
  // va.vercel-scripts.com instead, with no prop to opt out of that URL
  // choice. Confirmed live: without this, every local dev pageload logs a
  // blocked-by-CSP console error for a script that was never going to send
  // real data anyway ("Debug mode... No requests will be sent to the
  // server").
  const isDev = process.env.NODE_ENV === 'development'
  const devEval = isDev ? " 'unsafe-eval'" : ''
  const devVercelAnalyticsDebugScript = isDev ? ' https://va.vercel-scripts.com' : ''
  return [
    "default-src 'self'",
    // No 'strict-dynamic': every script this app loads is same-origin, so
    // 'self' already covers Next/Turbopack's dynamically-injected chunk
    // scripts without needing strict-dynamic's trust-propagation model —
    // one less moving part, and just as effective for a same-origin-only
    // app like this one.
    `script-src 'self' 'nonce-${nonce}'${devEval}${devVercelAnalyticsDebugScript}`,
    // Inline `style="..."` attributes are used throughout the shop
    // carousel/tile components (dynamic transform/width values computed
    // per render) — CSP has no practical nonce/hash mechanism for style
    // *attributes* the way it does for <script>/<style> elements, so
    // 'unsafe-inline' here is the standard, deliberate trade-off (Next.js's
    // own CSP guide does the same): a much lower-severity relaxation than
    // allowing it for scripts, which is what actually matters for XSS.
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' blob: data: https://cdn.sanity.io https://cdn.shopify.com",
    "font-src 'self'",
    "connect-src 'self'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    // Only over an already-HTTPS connection — sending this unconditionally
    // broke every subresource load under real WebKit (Playwright's
    // mobile-safari project, testing against the plain-HTTP local dev
    // server): Safari's engine takes "upgrade to https" literally even for
    // localhost, where nothing is listening on 443, and every JS/CSS
    // chunk failed with an SSL error — no hydration, no working buttons,
    // the splash screen stuck forever. Chromium special-cases localhost as
    // a secure context and never hit this. Matching the HSTS condition
    // below means production (always real HTTPS) is unaffected, and local
    // HTTP dev/test never sends a directive it can't honour. See "ADD
    // SECURITY HEADER POLICY" audit, 2026-09-15.
    ...(isHttps ? ['upgrade-insecure-requests'] : []),
  ].join('; ')
}

function applySecurityHeaders(response: NextResponse, request: NextRequest, nonce: string) {
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set('Permissions-Policy', PERMISSIONS_POLICY)
  const isHttps = request.nextUrl.protocol === 'https:'
  if (isHttps) {
    // No `preload` — submitting to the browser preload list is effectively
    // permanent and best left as a deliberate later step, not a default
    // baked in here.
    response.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains')
  }

  // /studio and /tools deliberately get every header above but NOT the CSP
  // below. Sanity Studio is a large third-party admin SPA (real-time
  // collaboration, direct asset uploads, its own styling engine) with CSP
  // requirements this codebase doesn't own and can't verify — getting it
  // wrong would silently break the client's actual content-editing tool,
  // which is a worse outcome than the marginal risk here. Both paths
  // already sit behind their own separate Basic Auth gate (see
  // STUDIO_GATED_PREFIXES above), which is the real defence for this
  // internal-only surface — not customer-facing, never linked from the
  // public site.
  const isStudioOrTools = STUDIO_GATED_PREFIXES.some((prefix) =>
    request.nextUrl.pathname.startsWith(prefix)
  )
  if (!isStudioOrTools) {
    response.headers.set('Content-Security-Policy', contentSecurityPolicy(nonce, isHttps))
  }

  return response
}

export function middleware(request: NextRequest) {
  // One nonce per request, forwarded to the page render via a request
  // header so our own inline <script> tags (JsonLd, the homepage
  // Organization block) can read the exact same value Next.js reads off
  // the response header below to nonce its own framework scripts. See
  // src/components/seo/json-ld.tsx.
  const nonce = btoa(crypto.randomUUID())
  const forwardedHeaders = new Headers(request.headers)
  forwardedHeaders.set('x-nonce', nonce)
  const next = () => NextResponse.next({ request: { headers: forwardedHeaders } })

  if (UNGATED_PREFIXES.some((prefix) => request.nextUrl.pathname.startsWith(prefix))) {
    return applySecurityHeaders(next(), request, nonce)
  }

  if (STUDIO_GATED_PREFIXES.some((prefix) => request.nextUrl.pathname.startsWith(prefix))) {
    if (!STUDIO_USERNAME || !STUDIO_PASSWORD) return applySecurityHeaders(next(), request, nonce)
    if (isAuthorized(request, STUDIO_USERNAME, STUDIO_PASSWORD)) {
      return applySecurityHeaders(next(), request, nonce)
    }
    return applySecurityHeaders(authRequired('Gert Lush Honey - studio'), request, nonce)
  }

  if (!USERNAME || !PASSWORD) return applySecurityHeaders(next(), request, nonce)
  if (isAuthorized(request, USERNAME, PASSWORD)) return applySecurityHeaders(next(), request, nonce)
  return applySecurityHeaders(authRequired('Gert Lush Honey - private preview'), request, nonce)
}

export const config = {
  // /images is excluded too — next/image fetches local files from this path
  // internally (not through /_next/image) to optimize them, uncredentialed;
  // without this exclusion every local <Image> 401s and "isn't a valid
  // image". Leaving raw photos ungated is harmless — they carry no page
  // content on their own.
  matcher: ['/((?!_next/static|_next/image|images/|favicon.ico).*)'],
}
