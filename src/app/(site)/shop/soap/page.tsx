import type { Metadata } from 'next'
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
      description="A soap using honey and beeswax is in development — recipe, pricing and photos aren't finalised, so we're not listing it as a product until it is."
      waitlistSubject="Soap waiting list"
    />
  )
}
