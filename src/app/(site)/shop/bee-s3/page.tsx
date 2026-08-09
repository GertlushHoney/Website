import type { Metadata } from 'next'
import Image from 'next/image'
import { ProductTabs } from '@/components/product/product-tabs'
import { PurchaseOptions } from '@/components/product/purchase-options'
import { getProductByTitle } from '@/lib/shopify/product'

export const metadata: Metadata = {
  title: 'Bee S3',
  description:
    "Bee S3 — pure honey from the Northern Slopes, Bristol. Gert Lush Honey's first postcode honey.",
}

// Falls back to this static price if Shopify isn't configured, the product
// search finds nothing, or the request fails — see
// src/lib/shopify/product.ts. Keep in sync with the real Shopify price so
// the two never visibly disagree.
const FALLBACK_UNIT_PRICE = 8

export default async function BeeS3ProductPage() {
  const product = await getProductByTitle('BEES3')

  return (
    <div className="mx-auto max-w-5xl px-6 py-16">
      <div className="grid gap-12 lg:grid-cols-2">
        <div className="from-ink-surface to-ink relative min-h-[420px] rounded-2xl bg-gradient-to-b">
          <div
            className="absolute inset-0 rounded-2xl"
            style={{
              backgroundImage:
                'radial-gradient(circle at 50% 45%, rgba(217,150,20,0.16), transparent 60%)',
            }}
          />
          <Image
            src="/images/source/bee-s3-jar-single-professional-blended.png"
            alt="A jar of Bee S3 honey, pure honey from the Northern Slopes, 12oz / 280ml"
            fill
            priority
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="object-contain p-10 drop-shadow-[0_30px_60px_rgba(0,0,0,0.55)]"
          />
        </div>

        <div className="flex flex-col justify-center">
          <p className="text-honey-amber text-sm font-semibold tracking-wide uppercase">
            Gert Lush Honey
          </p>
          <p className="font-display text-comb-gold mt-2 text-3xl italic">Bee S3</p>
          <h1 className="text-porcelain mt-2 text-3xl font-bold tracking-tight text-balance">
            Pure honey from the Northern Slopes.
          </h1>

          <dl className="mt-8 space-y-3">
            <div className="border-ink-line flex gap-4 border-t pt-3">
              <dt className="text-porcelain/50 w-28 shrink-0 text-sm">Weight</dt>
              <dd className="text-porcelain/90 text-sm">12oz / 280ml</dd>
            </div>
            <div className="border-ink-line flex gap-4 border-t pt-3">
              <dt className="text-porcelain/50 w-28 shrink-0 text-sm">Origin</dt>
              <dd className="text-porcelain/90 text-sm">Bristol, UK</dd>
            </div>
            <div className="border-ink-line flex gap-4 border-t pt-3">
              <dt className="text-porcelain/50 w-28 shrink-0 text-sm">Delivery</dt>
              <dd className="text-porcelain/90 text-sm">Royal Mail Tracked 48 &middot; £4.99</dd>
            </div>
          </dl>

          <PurchaseOptions
            productName="Bee S3"
            unitPrice={product?.price ?? FALLBACK_UNIT_PRICE}
            subscriptionUnitPrice={7}
            deliveryPrice={4.99}
            variantId={product?.availableForSale ? product.variantId : null}
            stockCount={product ? product.quantityAvailable : null}
          />
        </div>
      </div>

      <div className="mt-16">
        <ProductTabs
          tabs={[
            {
              id: 'origin',
              label: "Where it's from",
              content: (
                <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
                  <div className="relative min-h-[280px] overflow-hidden rounded-xl">
                    <Image
                      src="/images/source/northern-slopes.jpg"
                      alt="View across Bristol from the Northern Slopes greenspace"
                      fill
                      sizes="(min-width: 1024px) 50vw, 100vw"
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <h2 className="text-porcelain text-2xl font-bold tracking-tight">
                      The Northern Slopes, Bristol
                    </h2>
                    <p className="text-porcelain/70 mt-4 text-base">
                      Bee S3 is harvested from hives kept on the Northern Slopes, a real Bristol
                      greenspace overlooking the city — and the postcode, BS3, that gave the jar its
                      name.
                    </p>
                    <p className="text-porcelain/70 mt-4 text-base">
                      Country of origin: United Kingdom. As with all Gert Lush postcode honey, the
                      exact hive location is kept general rather than pinpointed, to protect the
                      site and the bees.
                    </p>
                  </div>
                </div>
              ),
            },
            {
              id: 'beekeeper',
              label: 'The beekeeper',
              content: (
                <div className="max-w-2xl">
                  <p className="text-honey-amber text-sm font-semibold tracking-wide uppercase">
                    Meet the beekeeper
                  </p>
                  <h2 className="text-porcelain mt-2 text-2xl font-bold tracking-tight">
                    Behind every jar of Bee S3: Adam
                  </h2>
                  <div className="text-porcelain/80 mt-4 space-y-4 text-base">
                    <p>
                      Gert Lush Honey started with one beekeeper, Adam, who&apos;s still behind
                      every jar of Bee S3 today. He started beekeeping in 2015 while working at a
                      boarding
                      school — after admitting to an experienced beekeeper that he was
                      &quot;petrified&quot; of bees, the advice back was simple: buy a beehive. He
                      said there was no chance. A couple of months later, he bought his first hive
                      in a winter sale.
                    </p>
                    <p>
                      With a mentor&apos;s help and an Introduction to Beekeeping course with
                      Somerset Central Division, he was quickly hooked. More than ten years on, he
                      still loves the excitement of opening a hive and never quite knowing what
                      he&apos;s going to find — beekeeping keeps teaching him something new, and the
                      bees don&apos;t always follow the textbook.
                    </p>
                    <p>
                      In 2019 the bees moved to Bramble Farm on Bristol&apos;s Northern Slopes, a
                      community farm that feels like a piece of countryside hidden in the middle of
                      the city. Today there are around ten colonies, with his wife and children
                      involved at every stage.
                    </p>
                    <p>
                      Beekeeping is his escape from a working life in technology and education — but
                      Gert Lush Honey brings those two worlds together. The aim is simple:
                      great-tasting honey, supporting local beekeepers, and celebrating the people,
                      bees and places behind every jar.
                    </p>
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
                    <h2 className="text-porcelain text-xl font-bold tracking-tight">Why Bee S3</h2>
                    <ul className="text-porcelain/70 mt-3 list-disc space-y-1 pl-5 text-sm">
                      <li>Small-batch — hand-jarred, not mass-produced</li>
                      <li>Traceable to one named beekeeper and one Bristol postcode</li>
                      <li>Nothing added — just honey</li>
                      <li>
                        Gert Lush controls every jar from intake to sale, so quality is consistent
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h2 className="text-porcelain text-xl font-bold tracking-tight">
                      How to enjoy it
                    </h2>
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
                      behaves. If your jar sets solid, stand it (lid on) in a bowl of warm water for
                      a few minutes and it&apos;ll return to liquid.
                    </p>
                  </div>
                </div>
              ),
            },
            {
              id: 'history',
              label: 'Season by season',
              content: (
                <div className="max-w-3xl">
                  <h2 className="text-porcelain text-xl font-bold tracking-tight">
                    Same hives, different honey every year
                  </h2>
                  <p className="text-porcelain/70 mt-3 max-w-2xl text-sm">
                    Bee S3 isn&apos;t blended to taste the same every time. What the bees forage
                    changes with the weather and the season, so the colour of the honey — straight
                    from that year&apos;s harvest, before labelling — genuinely varies year to year.
                  </p>
                  <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    {[
                      {
                        year: '2023',
                        src: '/images/source/jar-history-2023.jpg',
                        note: 'A rich amber-copper set.',
                      },
                      {
                        year: '2024',
                        src: null,
                        note: 'Photo still to come.',
                      },
                      {
                        year: '2025',
                        src: '/images/source/jar-history-2025.jpg',
                        note: 'The darkest harvest yet.',
                      },
                      {
                        year: '2026',
                        src: '/images/source/jar-history-2026.jpg',
                        note: 'Pale and light this season.',
                      },
                    ].map((season) => (
                      <div key={season.year}>
                        <div className="from-ink-surface to-ink relative aspect-square overflow-hidden rounded-xl bg-gradient-to-b">
                          {season.src ? (
                            <Image
                              src={season.src}
                              alt={`Bee S3 honey straight from the ${season.year} harvest`}
                              fill
                              sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                              className="object-cover"
                            />
                          ) : (
                            <div className="text-porcelain/40 flex h-full items-center justify-center p-4 text-center text-xs">
                              Photo coming soon
                            </div>
                          )}
                        </div>
                        <p className="text-porcelain mt-3 text-sm font-semibold">{season.year}</p>
                        <p className="text-porcelain/60 mt-0.5 text-xs">{season.note}</p>
                      </div>
                    ))}
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
                    ['Net quantity', '12oz / 280ml'],
                    ['Country of origin', 'United Kingdom'],
                    ['Ingredients', 'Honey. Nothing added.'],
                    ['Storage', 'Store in a cool, dry place away from direct sunlight.'],
                    ['Best before / batch', 'Printed on the jar lid.'],
                    [
                      'Delivery',
                      'Royal Mail Tracked 48, £4.99 flat rate (tracked, typically 2–3 working days).',
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
          ]}
        />
      </div>
    </div>
  )
}
