import type { Metadata } from 'next'
import { ComingSoonProduct } from '@/components/shop/coming-soon-product'

export const metadata: Metadata = {
  title: 'Gift Hampers',
  description: 'Gert Lush Honey gift hampers — coming soon.',
}

export default function HamperPage() {
  return (
    <ComingSoonProduct
      eyebrow="Shop · Hampers"
      title="Gift hampers."
      description="Once there's enough of a range alongside Bee S3, we'll put together proper gift hampers. For now there's only one honey to put in a box, so we're holding off rather than padding one out."
      waitlistSubject="Gift hamper waiting list"
    />
  )
}
