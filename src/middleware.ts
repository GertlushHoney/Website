import { NextRequest, NextResponse } from 'next/server'

// Temporary pre-launch gate (added 2026-08-14) — the site is live on Vercel
// with real Sanity content and a real Shopify checkout, but not ready for
// real visitors yet. Every page requires this shared username/password via
// standard HTTP Basic Auth (a native browser login prompt) until removed.
// Remove this whole file (and the SITE_PASSWORD* env vars) when ready to
// launch publicly.
const USERNAME = process.env.SITE_PASSWORD_USER
const PASSWORD = process.env.SITE_PASSWORD

export function middleware(request: NextRequest) {
  if (!USERNAME || !PASSWORD) return NextResponse.next()

  const auth = request.headers.get('authorization')
  if (auth?.startsWith('Basic ')) {
    const [user, pass] = atob(auth.slice(6)).split(':')
    if (user === USERNAME && pass === PASSWORD) {
      return NextResponse.next()
    }
  }

  return new NextResponse('Authentication required', {
    status: 401,
    headers: { 'WWW-Authenticate': 'Basic realm="Gert Lush Honey - private preview"' },
  })
}

export const config = {
  // /images is excluded too — next/image fetches local files from this path
  // internally (not through /_next/image) to optimize them, uncredentialed;
  // without this exclusion every local <Image> 401s and "isn't a valid
  // image". Leaving raw photos ungated is harmless — they carry no page
  // content on their own.
  matcher: ['/((?!_next/static|_next/image|images/|favicon.ico).*)'],
}
