import type { Metadata } from 'next'
import { ComingSoonProduct } from '@/components/shop/coming-soon-product'

export const metadata: Metadata = {
  title: 'Candles',
  description: 'Beeswax candles from Gert Lush Honey — coming soon.',
}

export default function CandlesPage() {
  return (
    <ComingSoonProduct
      eyebrow="Shop · Candles"
      title="Beeswax candles."
      description="We're developing a range of beeswax candles to sit alongside the honey — the details (sizing, scent, pricing) aren't confirmed yet, so nothing's listed until it's real."
      waitlistSubject="Candles waiting list"
    />
  )
}
