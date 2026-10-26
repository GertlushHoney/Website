import { NextResponse, type NextRequest } from 'next/server'
import { revalidatePath } from 'next/cache'
import { featherToPng, UnreadableImageError } from '@/lib/images/feather'
import { getSanityWriteClient, isSanityWriteConfigured } from '@/lib/sanity/write-client'
import { isShopifyConfigured, shopifyFetch } from '@/lib/shopify/client'
import { isShopifyAdminConfigured } from '@/lib/shopify/admin-client'
import { syncShippingWeight } from '@/lib/shopify/admin-shipping'
import {
  buildProductDocument,
  slugify,
  validateNewProduct,
  type NewProductInput,
} from '@/lib/tools/new-product'

// sharp needs real Node APIs (native bindings) — must not run on the Edge.
export const runtime = 'nodejs'

// Backs /tools/new-product. Gated by the same STUDIO_PASSWORD as the rest of
// /tools (see src/middleware.ts) — it writes real documents to the live
// Sanity dataset, so it must never be reachable unauthenticated.
//
// Shopify stays the source of truth for everything it already holds (title,
// photo, handle): the browser only ever sends a handle, and the server
// looks the rest up itself, so nothing the client sends can point at an
// arbitrary image URL or an unlisted product.
const MAX_IMAGE_BYTES = 15 * 1024 * 1024

type ShopifyListing = {
  handle: string
  title: string
  imageUrl: string | null
  weightGrams: number | null
}

type RawProduct = {
  handle: string
  title: string
  featuredImage: { url: string } | null
  variants: { nodes: { weight: number | null; weightUnit: string | null }[] }
}

const LISTING_FIELDS = `handle title featuredImage { url } variants(first: 1) { nodes { weight weightUnit } }`

function toListing(raw: RawProduct): ShopifyListing {
  const variant = raw.variants.nodes[0]
  const weightGrams = variant?.weightUnit === 'GRAMS' && variant.weight ? variant.weight : null
  return {
    handle: raw.handle,
    title: raw.title,
    imageUrl: raw.featuredImage?.url ?? null,
    weightGrams,
  }
}

async function fetchShopifyProducts(): Promise<ShopifyListing[]> {
  const data = await shopifyFetch<{ products: { nodes: RawProduct[] } }>({
    query: `{ products(first: 100) { nodes { ${LISTING_FIELDS} } } }`,
    cache: 'no-store',
  })
  return data.products.nodes.map(toListing)
}

async function fetchShopifyProduct(handle: string): Promise<ShopifyListing | null> {
  const data = await shopifyFetch<{ product: RawProduct | null }>({
    query: `query P($handle: String!) { product(handle: $handle) { ${LISTING_FIELDS} } }`,
    variables: { handle },
    cache: 'no-store',
  })
  return data.product ? toListing(data.product) : null
}

async function fetchSanityState() {
  const client = getSanityWriteClient()
  return client.fetch<{
    linkedHandles: string[]
    slugs: string[]
    beekeepers: { _id: string; name: string }[]
  }>(
    `{
      "linkedHandles": *[_type in ["honeyProduct", "merchProduct"]].shopifyHandle,
      "slugs": *[_type in ["honeyProduct", "merchProduct"]].slug.current,
      "beekeepers": *[_type == "beekeeper"] | order(name asc) { _id, name }
    }`
  )
}

function notConfigured() {
  if (!isShopifyConfigured()) return 'Shopify is not configured.'
  if (!isSanityWriteConfigured()) return 'Sanity write access is not configured.'
  return null
}

// Products that exist in Shopify (and are visible to the site, i.e. on the
// Headless channel) but aren't linked to a Sanity document yet.
export async function GET() {
  const problem = notConfigured()
  if (problem) return NextResponse.json({ error: problem }, { status: 400 })

  try {
    const [shopify, sanity] = await Promise.all([fetchShopifyProducts(), fetchSanityState()])
    const linked = new Set(sanity.linkedHandles)
    return NextResponse.json({
      candidates: shopify.filter((p) => !linked.has(p.handle)),
      beekeepers: sanity.beekeepers,
    })
  } catch (error) {
    console.error('new-product list failed:', error)
    return NextResponse.json({ error: "Couldn't load products — please try again." }, { status: 500 })
  }
}

function coerceInput(body: unknown): NewProductInput | null {
  if (!body || typeof body !== 'object') return null
  const b = body as Record<string, unknown>
  const str = (v: unknown) => (typeof v === 'string' ? v : '')
  const grams = b.shippingWeightGrams
  return {
    kind: b.kind === 'honey' || b.kind === 'merch' ? b.kind : ('' as never),
    shopifyHandle: str(b.shopifyHandle),
    name: str(b.name),
    tagline: str(b.tagline),
    description: str(b.description),
    weight: str(b.weight),
    shippingWeightGrams: typeof grams === 'number' ? grams : null,
    active: b.active === true,
    feather: b.feather === true,
    postcodeCode: str(b.postcodeCode),
    beekeeperId: str(b.beekeeperId),
    category: str(b.category),
  }
}

async function downloadShopifyImage(url: string): Promise<Buffer> {
  // The URL came from Shopify's own API response above, but check anyway.
  const parsed = new URL(url)
  if (parsed.protocol !== 'https:' || parsed.hostname !== 'cdn.shopify.com') {
    throw new Error('Unexpected image host')
  }
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Image download failed: ${res.status}`)
  const declared = Number(res.headers.get('content-length') ?? 0)
  if (declared > MAX_IMAGE_BYTES) throw new Error('Image too large')
  const buffer = Buffer.from(await res.arrayBuffer())
  if (buffer.length > MAX_IMAGE_BYTES) throw new Error('Image too large')
  return buffer
}

export async function POST(request: NextRequest) {
  const problem = notConfigured()
  if (problem) return NextResponse.json({ error: problem }, { status: 400 })

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 })
  }
  const input = coerceInput(body)
  if (!input) return NextResponse.json({ error: 'Invalid request.' }, { status: 400 })

  try {
    const sanity = await fetchSanityState()
    const invalid = validateNewProduct(input, new Set(sanity.beekeepers.map((b) => b._id)))
    if (invalid) return NextResponse.json({ error: invalid }, { status: 400 })

    if (sanity.linkedHandles.includes(input.shopifyHandle.trim())) {
      return NextResponse.json({ error: 'That product is already on the site.' }, { status: 400 })
    }

    const shopify = await fetchShopifyProduct(input.shopifyHandle.trim())
    if (!shopify) {
      return NextResponse.json(
        {
          error:
            "The site can't see that Shopify product. Check it is published to the Headless sales channel.",
        },
        { status: 400 }
      )
    }
    if (!shopify.imageUrl) {
      return NextResponse.json(
        { error: 'Add a photo to the product in Shopify first — it is used as the main photo.' },
        { status: 400 }
      )
    }

    let slug = slugify(input.name)
    if (!slug) return NextResponse.json({ error: 'Enter a name using letters or numbers.' }, { status: 400 })
    const taken = new Set(sanity.slugs)
    const baseSlug = slug
    for (let n = 2; taken.has(slug); n++) slug = `${baseSlug}-${n}`

    let image = await downloadShopifyImage(shopify.imageUrl)
    // Product photos uploaded to Shopify are normally already edge-softened
    // (the same image is used in both places), so only soften again when
    // asked.
    let filename = `${slug}.${new URL(shopify.imageUrl).pathname.split('.').pop() || 'jpg'}`
    if (input.feather) {
      image = await featherToPng(image)
      filename = `${slug}.png`
    }

    const client = getSanityWriteClient()
    const asset = await client.assets.upload('image', image, { filename })
    const document = buildProductDocument(input, slug, asset._id)
    const created = await client.create(document as { _type: string })

    const warnings: string[] = []
    if (input.shippingWeightGrams) {
      if (!isShopifyAdminConfigured()) {
        warnings.push('Shipping weight was saved in Sanity but not sent to Shopify (Admin API not configured).')
      } else {
        const sync = await syncShippingWeight(input.shopifyHandle.trim(), input.shippingWeightGrams)
        if (sync.status !== 'synced') {
          warnings.push('Shipping weight was saved in Sanity but could not be sent to Shopify — run the weight sync tool.')
        }
      }
    }

    revalidatePath('/shop', 'layout')
    revalidatePath('/postcode-honey')

    const links = [{ label: 'Product page', href: `/shop/${slug}` }]
    if (input.kind === 'honey') {
      links.push({ label: 'Honey listing', href: '/shop/honey' }, { label: 'Postcode map', href: '/postcode-honey' })
    } else {
      links.push({ label: 'Category page', href: `/shop/${input.category}` })
    }
    return NextResponse.json({ ok: true, id: created._id, slug, active: input.active, links, warnings })
  } catch (error) {
    if (error instanceof UnreadableImageError) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    console.error('new-product create failed:', error)
    return NextResponse.json({ error: "Couldn't create the product — please try again." }, { status: 500 })
  }
}
