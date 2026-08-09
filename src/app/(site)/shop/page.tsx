import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Shop',
  description: 'Gert Lush Honey postcode honey, and what else is coming.',
}

export default function ShopPage() {
  return (
    <div className="mx-auto max-w-5xl px-6 py-16">
      <h1 className="text-porcelain text-3xl font-bold tracking-tight">Shop</h1>
      <p className="text-porcelain/60 mt-2 max-w-lg text-sm">
        One postcode honey so far — more will join as new beekeepers come on board.
      </p>

      <Link
        href="/shop/bee-s3"
        className="border-ink-line bg-honeycomb-surface focus-visible:outline-honey-amber group mt-10 grid max-w-md gap-0 overflow-hidden rounded-2xl border transition focus-visible:outline focus-visible:outline-offset-4"
      >
        <div className="from-ink-surface to-ink relative aspect-square bg-gradient-to-b">
          <Image
            src="/images/source/bee-s3-jar-single-professional-blended.png"
            alt="A jar of Bee S3 honey"
            fill
            sizes="400px"
            className="object-contain p-10 transition group-hover:scale-105"
          />
        </div>
        <div className="p-6">
          <p className="font-display text-comb-gold text-lg italic">Bee S3</p>
          <p className="text-porcelain mt-1 text-sm font-semibold">
            Pure honey from the Northern Slopes
          </p>
          <p className="text-porcelain/50 mt-1 text-sm">12oz / 280ml &middot; Bristol, UK</p>
          <p className="text-porcelain mt-3 text-base font-semibold">£8.00</p>
        </div>
      </Link>

      <h2 className="text-porcelain mt-16 text-xl font-bold tracking-tight">Coming soon</h2>
      <p className="text-porcelain/60 mt-1 max-w-lg text-sm">
        More than honey, eventually — nothing here is for sale until it&apos;s real.
      </p>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { href: '/shop/candles', label: 'Candles' },
          { href: '/shop/hamper', label: 'Gift Hampers' },
          { href: '/shop/soap', label: 'Soap' },
          { href: '/shop/lip-balm', label: 'Lip Balm' },
        ].map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="border-ink-line bg-honeycomb-surface hover:border-honey-amber focus-visible:outline-honey-amber rounded-xl border p-5 text-sm font-semibold transition focus-visible:outline focus-visible:outline-offset-2"
          >
            <span className="text-porcelain">{item.label}</span>
            <span className="text-porcelain/50 mt-1 block text-xs font-normal">Coming soon</span>
          </Link>
        ))}
      </div>
    </div>
  )
}
