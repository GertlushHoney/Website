import type { Metadata } from 'next'
import Link from 'next/link'
import { ComingSoonProduct } from '@/components/shop/coming-soon-product'
import { MerchCategoryListing } from '@/components/shop/merch-category-listing'
import { getMerchProductsByCategory } from '@/lib/sanity/merch'

export const metadata: Metadata = {
  title: 'Soap',
  description: 'Honey and beeswax soap from Gert Lush Honey.',
  alternates: { canonical: '/shop/soap' },
}

export default async function SoapPage() {
  const products = await getMerchProductsByCategory('soap')

  if (products.length > 0) {
    return <MerchCategoryListing categoryLabel="Soap" products={products} />
  }

  return (
    <ComingSoonProduct
      eyebrow="Shop · Soap"
      title="Honey and beeswax soap."
      description="A cold-process soap made with honey, beeswax, and a blend of mango butter, shea butter and plant oils. The recipe and pricing are confirmed, but final packaging and labelling aren't, so it isn't in stock yet."
      details={
        <>
          <ul className="text-porcelain/70 mt-4 list-disc space-y-1 pl-5 text-sm">
            <li>Four scents to start: Lavender &amp; Rosemary, Lemongrass, Honey &amp; Oats (Unscented), Orange &amp; Black Pepper</li>
            <li>Full bar, minimum 80g — £6</li>
            <li>Half bar, minimum 30g — £3.50 (also available as wedding favours)</li>
          </ul>
          <p className="text-porcelain/50 mt-3 text-sm">
            Planning a wedding?{' '}
            <Link href="/weddings-events" className="text-comb-gold underline underline-offset-2">
              See wedding favours
            </Link>
            .
          </p>
        </>
      }
      waitlistSubject="Soap waiting list"
    />
  )
}
