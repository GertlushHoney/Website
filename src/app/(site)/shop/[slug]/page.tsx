import type { Metadata } from 'next'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { PortableText } from 'next-sanity'
import { ProductTabs } from '@/components/product/product-tabs'
import { PurchaseOptions } from '@/components/product/purchase-options'
import { ReviewsSection } from '@/components/product/reviews-section'
import { MerchProductPage } from '@/components/shop/merch-product-page'
import { BackToCategoryLink } from '@/components/shop/back-to-category-link'
import Link from 'next/link'
import { getHoneyProductBySlug } from '@/lib/sanity/products'
import { getMerchProductBySlug } from '@/lib/sanity/merch'
import { urlForImage } from '@/lib/sanity/image'
import { getProductByHandle } from '@/lib/shopify/product'
import { getAreaNameForCode } from '@/lib/postcode-areas'
import { JsonLd } from '@/components/seo/json-ld'
import { breadcrumbJsonLd, productJsonLd } from '@/lib/seo/json-ld'

// Tries a honeyProduct first (postcode honey, the common case), then a
// merchProduct (candles/soap/etc, each with its own real slug rather than a
// fixed category slug — see /shop/{candles,hamper,soap,lip-balm} for the
// category listing pages). One shared URL space, two possible document
// types behind it.
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const canonical = { alternates: { canonical: `/shop/${slug}` } }
  const honeyProduct = await getHoneyProductBySlug(slug)
  if (honeyProduct) {
    return { title: honeyProduct.name, description: honeyProduct.tagline, ...canonical }
  }
  const merchProduct = await getMerchProductBySlug(slug)
  if (merchProduct) {
    return { title: merchProduct.name, description: merchProduct.tagline, ...canonical }
  }
  return { title: 'Shop' }
}

export default async function ShopProductPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const product = await getHoneyProductBySlug(slug)
  if (!product) {
    const merchProduct = await getMerchProductBySlug(slug)
    if (merchProduct) return <MerchProductPage product={merchProduct} />
    notFound()
  }

  const shopifyProduct = await getProductByHandle(product.shopifyHandle)
  const heroImageUrl = urlForImage(product.heroImage ?? undefined)?.width(1200).height(1200).url()
  const areaName = getAreaNameForCode(product.postcodeCode)

  const tabs = [
    {
      id: 'origin',
      label: "Where it's from",
      content: (
        <div className="max-w-2xl">
          <h2 className="text-porcelain text-2xl font-bold tracking-tight">
            {areaName ? `${areaName} (${product.postcodeCode})` : product.postcodeCode}
          </h2>
          <div className="text-porcelain/70 mt-4 space-y-4 text-base">
            <PortableText value={product.originStory} />
          </div>
          <p className="text-porcelain/70 mt-4 text-base">
            Country of origin: United Kingdom. As with all Gert Lush postcode honey, the exact
            hive location is kept general rather than pinpointed, to protect the site and the
            bees.
          </p>
        </div>
      ),
    },
    product.tastingProfile &&
      Object.values(product.tastingProfile).some(Boolean) && {
        id: 'tasting-profile',
        label: 'Tasting profile',
        content: (
          <div className="max-w-2xl">
            <h2 className="text-porcelain text-2xl font-bold tracking-tight">
              What {product.name} actually tastes like
            </h2>
            <p className="text-porcelain/60 mt-2 text-sm">
              Based on this specific batch — honey varies year to year, so this is {product.name},
              not honey in general.
            </p>
            <dl className="mt-6 space-y-3">
              {(
                [
                  ['Flavour', product.tastingProfile?.flavour],
                  ['Colour', product.tastingProfile?.colour],
                  ['Texture', product.tastingProfile?.texture],
                  ['Harvest', product.tastingProfile?.harvestSeason],
                  ['Landscape', product.tastingProfile?.landscape],
                  ['Great with', product.tastingProfile?.greatWith],
                ] as [string, string | null | undefined][]
              )
                .filter(([, value]) => Boolean(value))
                .map(([label, value]) => (
                  <div key={label} className="border-ink-line flex gap-4 border-t pt-3">
                    <dt className="text-porcelain/50 w-28 shrink-0 text-sm">{label}</dt>
                    <dd className="text-porcelain/90 text-sm">{value}</dd>
                  </div>
                ))}
            </dl>
          </div>
        ),
      },
    product.beekeeper && {
      id: 'beekeeper',
      label: 'The beekeeper',
      content: (
        <div className="max-w-2xl">
          <p className="text-honey-amber text-sm font-semibold tracking-wide uppercase">
            Meet the beekeeper
          </p>
          <h2 className="text-porcelain mt-2 text-2xl font-bold tracking-tight">
            Behind every jar of {product.name}: {product.beekeeper.name}
          </h2>
          <div className="text-porcelain/80 mt-4 space-y-4 text-base">
            <PortableText value={product.beekeeper.bio} />
          </div>
        </div>
      ),
    },
    {
      id: 'more-info',
      label: 'More information',
      content: (
        <div className="grid max-w-3xl gap-10 sm:grid-cols-2">
          <div>
            <h2 className="text-porcelain text-xl font-bold tracking-tight">Why {product.name}</h2>
            <ul className="text-porcelain/70 mt-3 list-disc space-y-1 pl-5 text-sm">
              <li>Small-batch — hand-jarred, not mass-produced</li>
              <li>
                Traceable to
                {product.beekeeper ? ` ${product.beekeeper.name} and` : ''} the {product.postcodeCode}{' '}
                postcode
              </li>
              <li>Nothing added — just honey</li>
              <li>Gert Lush controls every jar from intake to sale, so quality is consistent</li>
            </ul>
          </div>
          <div>
            <h2 className="text-porcelain text-xl font-bold tracking-tight">How to enjoy it</h2>
            <ul className="text-porcelain/70 mt-3 list-disc space-y-1 pl-5 text-sm">
              <li>Spread on warm toast or crumpets</li>
              <li>Stirred into porridge, yoghurt or tea</li>
              <li>Drizzled over cheese, especially something sharp or salty</li>
              <li>As a natural sweetener in baking or dressings</li>
            </ul>
          </div>
          <div className="sm:col-span-2">
            <h2 className="text-porcelain text-xl font-bold tracking-tight">
              About crystallisation
            </h2>
            <p className="text-porcelain/70 mt-3 text-sm">
              Honey crystallises naturally over time — it&apos;s not a fault, just how honey
              behaves. If your jar sets solid, stand it (lid on) in a bowl of warm water for a few
              minutes and it&apos;ll return to liquid.
            </p>
          </div>
        </div>
      ),
    },
    product.seasons.length > 0 && {
      id: 'seasons',
      label: 'Season by season',
      content: (
        <div className="max-w-3xl">
          <h2 className="text-porcelain text-xl font-bold tracking-tight">
            Same hives, different honey every year
          </h2>
          <p className="text-porcelain/70 mt-3 max-w-2xl text-sm">
            {product.name} isn&apos;t blended to taste the same every time. What the bees forage
            changes with the weather and the season, so the colour of the honey — straight from
            that year&apos;s harvest, before labelling — genuinely varies year to year.
          </p>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {product.seasons.map((season) => {
              const seasonImageUrl = urlForImage(season.photo ?? undefined)
                ?.width(400)
                .height(400)
                .url()
              return (
                <div key={season.year}>
                  <div className="from-ink-surface to-ink relative aspect-square overflow-hidden rounded-xl bg-gradient-to-b">
                    {seasonImageUrl ? (
                      <Image
                        src={seasonImageUrl}
                        alt={`${product.name} honey straight from the ${season.year} harvest`}
                        fill
                        sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                        className="object-cover"
                      />
                    ) : (
                      <div className="text-porcelain/50 flex h-full items-center justify-center p-4 text-center text-xs">
                        Photo coming soon
                      </div>
                    )}
                  </div>
                  <p className="text-porcelain mt-3 text-sm font-semibold">{season.year}</p>
                  {season.note && <p className="text-porcelain/60 mt-0.5 text-xs">{season.note}</p>}
                </div>
              )
            })}
          </div>
        </div>
      ),
    },
    {
      id: 'details',
      label: 'Details',
      content: (
        <dl className="max-w-2xl space-y-3">
          {[
            ['Name of food', 'Honey'],
            ['Net quantity', product.weight],
            ['Country of origin', 'United Kingdom'],
            ['Ingredients', 'Honey. Nothing added.'],
            ['Storage', 'Store in a cool, dry place away from direct sunlight.'],
            ['Best before / batch', 'Printed on the jar lid.'],
            [
              'Delivery',
              `Royal Mail Tracked 48, £${product.deliveryPrice.toFixed(2)} flat rate (tracked, typically 2–3 working days).`,
            ],
            ['Important', 'Not suitable for children under 12 months.'],
          ].map(([label, value]) => (
            <div key={label} className="border-ink-line flex gap-4 border-t pt-3">
              <dt className="text-porcelain/50 w-40 shrink-0 text-sm">{label}</dt>
              <dd className="text-porcelain/90 text-sm">{value}</dd>
            </div>
          ))}
        </dl>
      ),
    },
  ].filter(Boolean) as { id: string; label: string; content: React.ReactNode }[]

  const isSoldOut =
    shopifyProduct?.quantityAvailable !== null &&
    shopifyProduct?.quantityAvailable !== undefined &&
    shopifyProduct.quantityAvailable <= 0

  return (
    <div className="mx-auto max-w-5xl px-6 py-16">
      <JsonLd
        data={productJsonLd({
          name: product.name,
          description: product.tagline,
          imageUrl: heroImageUrl ?? null,
          slug: product.slug,
          price: shopifyProduct?.price ?? null,
          availability: isSoldOut ? 'OutOfStock' : 'InStock',
        })}
      />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: 'Home', path: '/' },
          { name: 'Shop', path: '/shop' },
          { name: 'Honey', path: '/shop/honey' },
          { name: product.name, path: `/shop/${product.slug}` },
        ])}
      />
      <BackToCategoryLink href="/shop/honey" label="Honey" />

      <div className="mt-8 grid gap-12 lg:grid-cols-2">
        <div className="from-ink-surface to-ink relative min-h-[420px] rounded-2xl bg-gradient-to-b">
          <div
            className="absolute inset-0 rounded-2xl"
            style={{
              backgroundImage:
                'radial-gradient(circle at 50% 45%, rgba(217,150,20,0.16), transparent 60%)',
            }}
          />
          {heroImageUrl && (
            <Image
              src={heroImageUrl}
              alt={`A jar of ${product.name} honey, ${product.tagline}`}
              fill
              priority
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="object-contain p-10 drop-shadow-[0_30px_60px_rgba(0,0,0,0.55)]"
            />
          )}
        </div>

        <div className="flex flex-col justify-center">
          <p className="text-honey-amber text-sm font-semibold tracking-wide uppercase">
            Gert Lush Honey
          </p>
          <p className="font-display text-comb-gold mt-2 text-3xl italic">{product.name}</p>
          <h1 className="text-porcelain mt-2 text-3xl font-bold tracking-tight text-balance">
            {product.tagline}
          </h1>

          <dl className="mt-8 space-y-3">
            <div className="border-ink-line flex gap-4 border-t pt-3">
              <dt className="text-porcelain/50 w-28 shrink-0 text-sm">Weight</dt>
              <dd className="text-porcelain/90 text-sm">{product.weight}</dd>
            </div>
            <div className="border-ink-line flex gap-4 border-t pt-3">
              <dt className="text-porcelain/50 w-28 shrink-0 text-sm">Origin</dt>
              <dd className="text-porcelain/90 text-sm">{areaName ?? product.postcodeCode}, UK</dd>
            </div>
            <div className="border-ink-line flex gap-4 border-t pt-3">
              <dt className="text-porcelain/50 w-28 shrink-0 text-sm">Delivery</dt>
              <dd className="text-porcelain/90 text-sm">
                Royal Mail Tracked 48 &middot; £{product.deliveryPrice.toFixed(2)}
              </dd>
            </div>
          </dl>

          {product.beekeeper && (
            <Link
              href={`/beekeepers/${product.beekeeper.slug}`}
              className="border-ink-line bg-honeycomb-surface hover:border-honey-amber focus-visible:outline-honey-amber group mt-6 flex items-center justify-between gap-4 rounded-xl border p-4 transition focus-visible:outline focus-visible:outline-offset-2"
            >
              <span className="text-porcelain text-sm">
                Produced by{' '}
                <span className="text-comb-gold font-semibold">{product.beekeeper.name}</span>
              </span>
              <span className="text-comb-gold shrink-0 text-sm font-semibold">
                Meet the beekeeper{' '}
                <span aria-hidden="true" className="inline-block transition group-hover:translate-x-0.5">
                  →
                </span>
              </span>
            </Link>
          )}

          {shopifyProduct ? (
            <PurchaseOptions
              productName={product.name}
              productHandle={product.shopifyHandle}
              unitPrice={shopifyProduct.price}
              subscriptionUnitPrice={product.subscriptionPrice ?? undefined}
              subscriptionSellingPlanId={shopifyProduct.subscriptionSellingPlanId}
              deliveryPrice={product.deliveryPrice}
              variantId={shopifyProduct.availableForSale ? shopifyProduct.variantId : null}
              stockCount={shopifyProduct.quantityAvailable}
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

      <div className="mt-16">
        <ProductTabs tabs={tabs} />
      </div>

      <ReviewsSection productSlug={product.slug} productName={product.name} />
    </div>
  )
}
