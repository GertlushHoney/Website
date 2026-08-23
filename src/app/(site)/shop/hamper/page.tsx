import type { Metadata } from 'next'
import { ComingSoonProduct } from '@/components/shop/coming-soon-product'
import { MerchCategoryListing } from '@/components/shop/merch-category-listing'
import { getMerchProductsByCategory } from '@/lib/sanity/merch'

export const metadata: Metadata = {
  title: 'Gift Hampers',
  description: 'Gert Lush Honey gift hampers.',
  alternates: { canonical: '/shop/hamper' },
}

export default async function HamperPage() {
  const products = await getMerchProductsByCategory('hamper')

  if (products.length > 0) {
    return <MerchCategoryListing categoryLabel="Gift Hampers" products={products} />
  }

  return (
    <ComingSoonProduct
      eyebrow="Shop · Hampers"
      title="Gift hampers."
      description="Once there's enough of a range alongside Bee S3, we'll put together proper gift hampers. For now there's only one honey to put in a box, so we're holding off rather than padding one out."
      waitlistSubject="Gift hamper waiting list"
    />
  )
}
