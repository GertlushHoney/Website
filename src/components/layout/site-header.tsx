import Image from 'next/image'
import Link from 'next/link'
import { primaryNav } from '@/lib/navigation'

export function SiteHeader() {
  return (
    <header className="border-ink-line bg-ink/85 sticky top-0 z-40 border-b backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-6 py-3">
        <Link
          href="/"
          className="focus-visible:outline-honey-amber flex shrink-0 items-center gap-2.5 focus-visible:outline focus-visible:outline-offset-4"
        >
          <Image
            src="/images/brand/hexagon-transparent.png"
            alt=""
            width={581}
            height={638}
            priority
            className="h-8 w-auto"
          />
          <span className="font-display text-comb-gold text-lg tracking-wide whitespace-nowrap uppercase">
            Gert Lush Honey
          </span>
        </Link>

        <nav aria-label="Primary" className="hidden md:block">
          <ul className="flex items-center gap-7">
            {primaryNav.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="text-porcelain/70 hover:text-porcelain focus-visible:outline-honey-amber text-[13px] font-medium focus-visible:outline focus-visible:outline-offset-2"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="text-porcelain/70 flex items-center gap-4 text-[13px] font-medium">
          <button
            type="button"
            aria-label="Search"
            className="hover:text-porcelain focus-visible:outline-honey-amber rounded-full focus-visible:outline focus-visible:outline-offset-2"
          >
            Search
          </button>
          <button
            type="button"
            aria-label="Basket, 0 items"
            className="hover:text-porcelain focus-visible:outline-honey-amber rounded-full focus-visible:outline focus-visible:outline-offset-2"
          >
            Basket
          </button>
        </div>
      </div>
    </header>
  )
}
