import Link from 'next/link'
import { footerNav } from '@/lib/navigation'

export function SiteFooter() {
  return (
    <footer className="bg-honeycomb-surface border-ink-line text-porcelain mt-24 border-t">
      <div className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:grid-cols-5">
          {Object.entries(footerNav).map(([heading, links]) => (
            <div key={heading}>
              <h2 className="text-comb-gold text-xs font-semibold tracking-wide uppercase">
                {heading}
              </h2>
              <ul className="mt-4 space-y-2">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-porcelain/80 hover:text-porcelain focus-visible:outline-comb-gold text-sm focus-visible:outline focus-visible:outline-offset-2"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <p className="text-porcelain/60 mt-16 text-xs">
          Gert Lush Honey. Bristol honey. Proper lush.
        </p>
      </div>
    </footer>
  )
}
