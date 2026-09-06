import Image from 'next/image'
import { PortableText } from 'next-sanity'
import { PurchaseOptions } from '@/components/product/purchase-options'
import { ReviewsSection, Stars } from '@/components/product/reviews-section'
import { getApprovedReviews, averageRating } from '@/lib/sanity/reviews'
import { BackToCategoryLink } from '@/components/shop/back-to-category-link'
import { urlForImage } from '@/lib/sanity/image'
import { getProductByHandle } from '@/lib/shopify/product'
import { MERCH_CATEGORY_LABELS, type MerchProduct } from '@/lib/sanity/merch'
import { getHoneyProducts } from '@/lib/sanity/products'
import { parseHamperJarCount } from '@/lib/hamper'
import { JsonLd } from '@/components/seo/json-ld'
import { breadcrumbJsonLd, productJsonLd } from '@/lib/seo/json-ld'

// Shared real-product layout for candles/soap/hamper/lip-balm once each
// actually has a matching, active Sanity document — see each category's
// page.tsx for the "not real yet" fallback.
export async function MerchProductPage({ product }: { product: MerchProduct }) {
  const [shopifyProduct, honeyProducts, reviews] = await Promise.all([
    getProductByHandle(product.shopifyHandle),
    // Only a hamper's "Choose your own" variant needs this — fetched
    // unconditionally anyway since it's a single cheap Sanity query, and
    // keeps this component simple rather than branching per category.
    getHoneyProducts(),
    getApprovedReviews(product.slug),
  ])
  const imageUrl = urlForImage(product.heroImage ?? undefined)?.width(1000).height(1000).url()
  const averageReviewRating = averageRating(reviews)

  // Live stock per honey, for the per-jar picker's "out of stock" gating —
  // same lookup the order-paid webhook does, just read-only here. Only
  // fetched/used for hampers, but cheap enough not to bother branching the
  // Promise.all above on category.
  const honeyJarOptions =
    product.category === 'hamper'
      ? await Promise.all(
          honeyProducts.map(async (honey) => ({
            name: honey.name,
            quantityAvailable: (await getProductByHandle(honey.shopifyHandle))?.quantityAvailable ?? 0,
          }))
        )
      : undefined
  const hamperJarCount =
    product.category === 'hamper' ? (parseHamperJarCount(product.name) ?? undefined) : undefined

  // An Experience's real limit is each session's remaining places, not the
  // Shopify product's own (untracked) stock — see PurchaseOptions.
  const experienceSessions =
    product.category === 'experiences' && product.sessions
      ? product.sessions.map((session) => ({
          key: session._key,
          date: session.date,
          placesRemaining: Math.max(0, session.placesTotal - session.placesBooked),
        }))
      : undefined

  const categoryLabel = MERCH_CATEGORY_LABELS[product.category]
  const isSoldOut = experienceSessions
    ? experienceSessions.every((session) => session.placesRemaining <= 0)
    : shopifyProduct?.quantityAvailable !== null &&
      shopifyProduct?.quantityAvailable !== undefined &&
      shopifyProduct.quantityAvailable <= 0

  return (
    <div className="mx-auto max-w-5xl px-6 py-16">
      <JsonLd
        data={productJsonLd({
          name: product.name,
          description: product.tagline,
          imageUrl: imageUrl ?? null,
          slug: product.slug,
          price: shopifyProduct?.price ?? null,
          availability: isSoldOut ? 'OutOfStock' : 'InStock',
        })}
      />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: 'Home', path: '/' },
          { name: 'Shop', path: '/shop' },
          { name: categoryLabel, path: `/shop/${product.category}` },
          { name: product.name, path: `/shop/${product.slug}` },
        ])}
      />
      <BackToCategoryLink href={`/shop/${product.category}`} label={categoryLabel} />

      <div className="mt-8 grid gap-12 lg:grid-cols-2">
        <div className="flex flex-col gap-4 self-start">
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

          {averageReviewRating !== null ? (
            <p className="text-porcelain/70 flex items-center justify-center gap-2 text-sm">
              <span className="text-3xl">
                <Stars rating={Math.round(averageReviewRating)} />
              </span>
              <span className="text-porcelain font-semibold">
                {averageReviewRating.toFixed(1)}
              </span>
              out of 5 ({reviews.length} review{reviews.length === 1 ? '' : 's'})
            </p>
          ) : (
            <p className="text-porcelain/50 text-center text-3xl">
              <Stars rating={0} />
            </p>
          )}
        </div>

        <div className="flex flex-col justify-center">
          <p className="text-honey-amber text-sm font-semibold tracking-wide uppercase">
            Shop &middot; {categoryLabel}
          </p>
          <p className="font-display text-comb-gold mt-2 text-3xl italic">{product.name}</p>
          <h1 className="text-porcelain mt-2 text-3xl font-bold tracking-tight text-balance">
            {product.tagline}
          </h1>

          <div className="text-porcelain/70 mt-6 space-y-4 text-base">
            <PortableText value={product.description} />
          </div>

          {product.weight && (
            <dl className="mt-6 space-y-3">
              <div className="border-ink-line flex gap-4 border-t pt-3">
                <dt className="text-porcelain/50 w-28 shrink-0 text-sm">Size / weight</dt>
                <dd className="text-porcelain/90 text-sm">{product.weight}</dd>
              </div>
            </dl>
          )}

          {shopifyProduct ? (
            <PurchaseOptions
              productName={product.name}
              productHandle={product.shopifyHandle}
              unitPrice={shopifyProduct.price}
              unitLabel="item"
              variantId={shopifyProduct.availableForSale ? shopifyProduct.variantId : null}
              stockCount={shopifyProduct.quantityAvailable}
              variants={shopifyProduct.variants}
              variantGroupLabel={
                product.category === 'hamper' ? 'Choose your honey' : 'Choose an option'
              }
              honeyJarOptions={honeyJarOptions}
              hamperJarCount={hamperJarCount}
              experienceSessions={experienceSessions}
              beekeeper={product.beekeeper}
            />
          ) : (
            <p className="border-ink-line bg-honeycomb-surface text-porcelain/70 mt-8 rounded-xl border p-5 text-sm">
              Pricing is temporarily unavailable — please{' '}
              <a
                href="mailto:sales@gertlushhoney.co.uk"
                className="text-comb-gold underline underline-offset-2"
              >
                email us
              </a>{' '}
              if you&apos;d like to order {product.name}.
            </p>
          )}
        </div>
      </div>

      <ReviewsSection productSlug={product.slug} productName={product.name} />
    </div>
  )
}
