import type { Metadata } from 'next'
import { ComingSoonProduct } from '@/components/shop/coming-soon-product'
import { MerchCategoryListing } from '@/components/shop/merch-category-listing'
import { getMerchProductsByCategory } from '@/lib/sanity/merch'

export const metadata: Metadata = {
  title: 'Candles',
  description: 'Beeswax candles from Gert Lush Honey.',
}

export default async function CandlesPage() {
  const products = await getMerchProductsByCategory('candles')

  if (products.length > 0) {
    return <MerchCategoryListing categoryLabel="Candles" products={products} />
  }

  return (
    <ComingSoonProduct
      eyebrow="Shop · Candles"
      title="Beeswax candles."
      description="We're developing a range of beeswax candles to sit alongside the honey — the details (sizing, scent, pricing) aren't confirmed yet, so nothing's listed until it's real."
      waitlistSubject="Candles waiting list"
    />
  )
}
