import Image from 'next/image'
import Link from 'next/link'
import { primaryNav } from '@/lib/navigation'
import { BasketButton } from '@/components/cart/basket-button'
import { SearchOverlay } from '@/components/layout/search-overlay'
import { MobileNav } from '@/components/layout/mobile-nav'
import { getSearchIndex } from '@/lib/search'

export async function SiteHeader() {
  const searchIndex = await getSearchIndex()

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
          <ul className="flex items-center gap-2">
            {primaryNav.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="border-porcelain/40 bg-porcelain/10 text-porcelain hover:bg-porcelain/20 hover:border-porcelain focus-visible:outline-honey-amber rounded-full border px-3.5 py-1.5 text-[13px] font-medium whitespace-nowrap transition focus-visible:outline focus-visible:outline-offset-2"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="text-porcelain/70 flex items-center gap-4 text-[13px] font-medium">
          <SearchOverlay items={searchIndex} />
          <BasketButton />
          <MobileNav />
        </div>
      </div>
    </header>
  )
}
