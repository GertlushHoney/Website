import type { Metadata } from 'next'
import { ComingSoonProduct } from '@/components/shop/coming-soon-product'
import { MerchCategoryListing } from '@/components/shop/merch-category-listing'
import { getMerchProductsByCategory } from '@/lib/sanity/merch'

export const metadata: Metadata = {
  title: 'Lip Balm',
  description: 'Beeswax lip balm from Gert Lush Honey.',
  alternates: { canonical: '/shop/lip-balm' },
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
      description="Made with beeswax, jojoba oil and a blend of shea and cocoa butter. The recipe and pricing are confirmed, but final packaging and labelling aren't, so it isn't in stock yet."
      details={
        <ul className="text-porcelain/70 mt-4 list-disc space-y-1 pl-5 text-sm">
          <li>Four flavours to start: Sweet Orange, Unscented with Honey, Lavender, Rose</li>
          <li>Minimum 13g tin — £5</li>
        </ul>
      }
      waitlistSubject="Lip balm waiting list"
    />
  )
}
