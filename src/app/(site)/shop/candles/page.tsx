import type { Metadata } from 'next'
import { ComingSoonProduct } from '@/components/shop/coming-soon-product'
import { MerchCategoryListing } from '@/components/shop/merch-category-listing'
import { getMerchProductsByCategory } from '@/lib/sanity/merch'

export const metadata: Metadata = {
  title: 'Candles',
  description: 'Beeswax candles from Gert Lush Honey.',
  alternates: { canonical: '/shop/candles' },
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
      description="A range of beeswax candles and decorations, some made by us and some from the same producer supplying our soap and lip balm. Sizing and pricing are confirmed, but photography and stock aren't ready yet, so nothing's listed for sale."
      details={
        <ul className="text-porcelain/70 mt-4 list-disc space-y-1 pl-5 text-sm">
          <li>Rolled candle, small — 10cm — £2.25</li>
          <li>Rolled candle, large — 20.5cm — £5.00</li>
          <li>Beehive candle, small — 30mm H &times; 25mm W — £4</li>
          <li>Beehive candle, large — 50mm H &times; 38mm W — £6</li>
          <li>Bee bars (raw beeswax) — £3.50</li>
          <li>Bees &amp; Flowers pillar candle — from £12.50</li>
          <li>Ghost candle — 7.5cm &times; 7cm — from £10</li>
          <li>
            Handmade bee-decorated plate, small — approx. 45mm diameter — £3.50 (£2.50 when bought
            alongside a candle)
          </li>
          <li>
            Handmade bee-decorated plate, large — approx. 70mm diameter — £5.50 (£4.50 when bought
            alongside a candle)
          </li>
        </ul>
      }
      waitlistSubject="Candles waiting list"
    />
  )
}
