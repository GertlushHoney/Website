import type { ReactNode } from 'react'

// Independent root layout for the embedded Sanity Studio — deliberately
// does NOT render SiteHeader/SiteFooter/Splash/CookiePreferences/
// DisableContextMenu (see src/app/(site)/layout.tsx for those). Studio is
// an editor tool, not a public site page. Route groups let /studio and
// /(site)/* each have their own <html>/<body> — see
// https://nextjs.org/docs/app/api-reference/file-conventions/route-groups.
export default function StudioLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
