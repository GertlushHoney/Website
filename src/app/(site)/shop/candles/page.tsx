import type { Metadata } from 'next'
import { ComingSoonProduct } from '@/components/shop/coming-soon-product'
import { MerchProductPage } from '@/components/shop/merch-product-page'
import { getMerchProductBySlug } from '@/lib/sanity/merch'

export const metadata: Metadata = {
  title: 'Candles',
  description: 'Beeswax candles from Gert Lush Honey.',
}

export default async function CandlesPage() {
  const product = await getMerchProductBySlug('candles')

  if (product) {
    return <MerchProductPage product={product} />
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
