import type { Metadata } from 'next'
import { ComingSoonProduct } from '@/components/shop/coming-soon-product'

export const metadata: Metadata = {
  title: 'Soap',
  description: 'Honey and beeswax soap from Gert Lush Honey — coming soon.',
}

export default function SoapPage() {
  return (
    <ComingSoonProduct
      eyebrow="Shop · Soap"
      title="Honey and beeswax soap."
      description="A soap using honey and beeswax is in development — recipe, pricing and photos aren't finalised, so we're not listing it as a product until it is."
      waitlistSubject="Soap waiting list"
    />
  )
}
