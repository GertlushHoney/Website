import type { Metadata } from 'next'
import Image from 'next/image'
import { MerchCategoryListing } from '@/components/shop/merch-category-listing'
import { BackToCategoryLink } from '@/components/shop/back-to-category-link'
import { getMerchProductsByCategory } from '@/lib/sanity/merch'

export const metadata: Metadata = {
  title: 'Experiences',
  description: 'Bee Day Experience at Bramble Farm, and other hands-on experiences from Gert Lush Honey.',
}

// Same pattern as candles/soap/hamper/lip-balm: a real merchProduct with
// category "experiences" (e.g. a priced, bookable Bee Day Experience) would
// show here automatically via MerchCategoryListing. Until one exists, this
// falls back to the honest "register interest" card below — moved here
// from the old /gifts page (removed 2026-08-10, folded into this category
// tile plus the Stockists page for corporate/event gifting).
export default async function ExperiencesPage() {
  const products = await getMerchProductsByCategory('experiences')

  if (products.length > 0) {
    return <MerchCategoryListing categoryLabel="Experiences" products={products} />
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <BackToCategoryLink href="/shop" label="Shop" />

      <p className="text-honey-amber mt-6 text-sm font-semibold tracking-wide uppercase">
        Shop &middot; Experiences
      </p>
      <h1 className="text-porcelain mt-3 text-4xl font-bold tracking-tight text-balance">
        A different kind of gift.
      </h1>

      <div className="border-ink-line bg-honeycomb-surface mt-10 grid overflow-hidden rounded-2xl border sm:grid-cols-2">
        <div className="relative min-h-[220px]">
          <Image
            src="/images/source/bramble-farm-view.jpg"
            alt="Bramble Farm, Bristol's Northern Slopes"
            fill
            sizes="(min-width: 640px) 50vw, 100vw"
            className="object-cover"
          />
        </div>
        <div className="p-8">
          <p className="text-comb-gold text-sm font-semibold tracking-wide uppercase">
            Not for sale yet
          </p>
          <h2 className="text-porcelain mt-2 text-2xl font-bold tracking-tight">
            Bee Day Experience at Bramble Farm
          </h2>
          <p className="text-porcelain/70 mt-4 text-sm">
            We&apos;re working on a hands-on day with Adam, the beekeeper behind Bee S3, at the
            real apiary on Bristol&apos;s Northern Slopes — pricing, dates and what&apos;s
            included aren&apos;t confirmed yet, so we&apos;re not selling it as a gift experience
            until it is.
          </p>
          <a
            href="mailto:gertlushhoney@outlook.com?subject=Bee%20Day%20Experience%20-%20register%20interest&body=I'd like to hear when the Bee Day Experience at Bramble Farm is available."
            className="border-porcelain/40 text-porcelain hover:border-porcelain focus-visible:outline-honey-amber mt-6 inline-block rounded-full border px-6 py-2.5 text-sm font-semibold focus-visible:outline focus-visible:outline-offset-4"
          >
            Register your interest
          </a>
        </div>
      </div>
    </div>
  )
}
