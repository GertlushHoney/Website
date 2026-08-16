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
const STUDIO_USERNAME = process.env.STUDIO_PASSWORD_USER
const STUDIO_PASSWORD = process.env.STUDIO_PASSWORD

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

export function middleware(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith('/studio')) {
    if (!STUDIO_USERNAME || !STUDIO_PASSWORD) return NextResponse.next()
    if (isAuthorized(request, STUDIO_USERNAME, STUDIO_PASSWORD)) return NextResponse.next()
    return authRequired('Gert Lush Honey - studio')
  }

  if (!USERNAME || !PASSWORD) return NextResponse.next()
  if (isAuthorized(request, USERNAME, PASSWORD)) return NextResponse.next()
  return authRequired('Gert Lush Honey - private preview')
}

export const config = {
  // /images is excluded too — next/image fetches local files from this path
  // internally (not through /_next/image) to optimize them, uncredentialed;
  // without this exclusion every local <Image> 401s and "isn't a valid
  // image". Leaving raw photos ungated is harmless — they carry no page
  // content on their own.
  matcher: ['/((?!_next/static|_next/image|images/|favicon.ico).*)'],
}
