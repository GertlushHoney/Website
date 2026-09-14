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
        {/* Gert Lush is Bristol-based, but the honey itself comes from
            independent beekeepers across Britain, not only Bristol — this
            must never read as a claim that every jar was produced there.
            See "FIX BRISTOL VS NATIONAL PROVENANCE LANGUAGE" audit,
            2026-09-13. "Packed in Bristol" is accurate: Gert Lush itself
            handles intake, jarring and branding centrally (see
            /become-a-supplier) even though the honey is harvested by the
            beekeeper wherever they are. */}
        <p className="text-porcelain/60 mt-16 text-xs">
          Based and packed in Bristol. Honey from independent British beekeepers.
        </p>
        <p className="text-porcelain/50 mt-4 text-xs">
          &copy; {new Date().getFullYear()} GERT LUSH HONEY
          <br className="sm:hidden" />
          <span className="hidden sm:inline"> &middot; </span>
          Based and packed in Bristol &bull; All rights reserved
        </p>
      </div>
    </footer>
  )
}
