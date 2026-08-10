import Image from 'next/image'
import { PortableText } from 'next-sanity'
import { PurchaseOptions } from '@/components/product/purchase-options'
import { urlForImage } from '@/lib/sanity/image'
import { getProductByHandle } from '@/lib/shopify/product'
import { MERCH_CATEGORY_LABELS, type MerchProduct } from '@/lib/sanity/merch'

// Shared real-product layout for candles/soap/hamper/lip-balm once each
// actually has a matching, active Sanity document — see each category's
// page.tsx for the "not real yet" fallback.
export async function MerchProductPage({ product }: { product: MerchProduct }) {
  const shopifyProduct = await getProductByHandle(product.shopifyHandle)
  const imageUrl = urlForImage(product.heroImage ?? undefined)?.width(1000).height(1000).url()

  return (
    <div className="mx-auto max-w-5xl px-6 py-16">
      <div className="grid gap-12 lg:grid-cols-2">
        <div className="from-ink-surface to-ink relative min-h-[420px] rounded-2xl bg-gradient-to-b">
          {imageUrl && (
            <Image
              src={imageUrl}
              alt={product.name}
              fill
              priority
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="object-contain p-10 drop-shadow-[0_30px_60px_rgba(0,0,0,0.55)]"
            />
          )}
        </div>

        <div className="flex flex-col justify-center">
          <p className="text-honey-amber text-sm font-semibold tracking-wide uppercase">
            Shop &middot; {MERCH_CATEGORY_LABELS[product.category]}
          </p>
          <p className="font-display text-comb-gold mt-2 text-3xl italic">{product.name}</p>
          <h1 className="text-porcelain mt-2 text-3xl font-bold tracking-tight text-balance">
            {product.tagline}
          </h1>

          <div className="text-porcelain/70 mt-6 space-y-4 text-base">
            <PortableText value={product.description} />
          </div>

          {shopifyProduct ? (
            <PurchaseOptions
              productName={product.name}
              unitPrice={shopifyProduct.price}
              deliveryPrice={product.deliveryPrice}
              variantId={shopifyProduct.availableForSale ? shopifyProduct.variantId : null}
              stockCount={shopifyProduct.quantityAvailable}
            />
          ) : (
            <p className="border-ink-line bg-honeycomb-surface text-porcelain/70 mt-8 rounded-xl border p-5 text-sm">
              Pricing is temporarily unavailable — please{' '}
              <a
                href="mailto:gertlushhoney@outlook.com"
                className="text-comb-gold underline underline-offset-2"
              >
                email us
              </a>{' '}
              if you&apos;d like to order {product.name}.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
