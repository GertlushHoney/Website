import type { Metadata } from 'next'
import { ComingSoonProduct } from '@/components/shop/coming-soon-product'
import { MerchCategoryListing } from '@/components/shop/merch-category-listing'
import { getMerchProductsByCategory } from '@/lib/sanity/merch'

export const metadata: Metadata = {
  title: 'Lip Balm',
  description: 'Beeswax lip balm from Gert Lush Honey.',
}

export default async function LipBalmPage() {
  const products = await getMerchProductsByCategory('lip-balm')

  if (products.length > 0) {
    return <MerchCategoryListing categoryLabel="Lip Balm" products={products} />
  }

  return (
    <ComingSoonProduct
      eyebrow="Shop · Lip Balm"
      title="Beeswax lip balm."
      description="A beeswax lip balm is on the list of products we'd like to make — nothing's confirmed on ingredients or price yet, so we're not selling it before it exists."
      waitlistSubject="Lip balm waiting list"
    />
  )
}
