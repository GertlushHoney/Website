import type { ReactNode } from 'react'
import '../globals.css'

// Independent root layout for internal tools (currently just the image
// feathering helper) — same reasoning as /studio's layout: an internal
// tool, not a public site page, so it deliberately skips
// SiteHeader/SiteFooter/Splash/CookiePreferences. Does share the site's
// Tailwind styles/dark theme so it doesn't look like a different product.
//
// IMPORTANT: this whole /tools section has no authentication. It's meant
// for local/dev use only (the honey-jar image helper). Remove or protect
// it with real auth before this site ever goes live — see
// docs/launch-checklist.md.
export default function ToolsLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="antialiased">
      <body className="bg-ink text-porcelain min-h-screen font-sans">{children}</body>
    </html>
  )
}
