import { postcodeAreaNames } from '@/lib/postcode-areas'
import { bristolDistricts } from '@/lib/bristol-districts'
import { bathDistricts } from '@/lib/bath-districts'

// Pure helpers behind /tools/new-product (the API route is the thin wrapper):
// turns the handful of fields only this site needs into the Sanity document
// that product-creation-sop.md used to have you fill in by hand. Everything
// that already exists in Shopify (title, image, price, handle) is read from
// Shopify instead of retyped.

export const MERCH_CATEGORIES = ['candles', 'hamper', 'soap', 'lip-balm'] as const

export type NewProductInput = {
  kind: 'honey' | 'merch'
  shopifyHandle: string
  name: string
  tagline: string
  // Honey: the "Where it's from" story. Merch: the product description.
  // Plain text — a blank line starts a new paragraph.
  description: string
  // Display size, e.g. "12oz / 280ml" — required for honey.
  weight: string
  shippingWeightGrams: number | null
  active: boolean
  feather: boolean
  postcodeCode?: string
  beekeeperId?: string
  category?: string
}

const NAME_MAX = 120
const TAGLINE_MAX = 200
const WEIGHT_MAX = 60
const DESCRIPTION_MAX = 5000

export function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 96)
}

function isRealPostcodeCode(code: string): boolean {
  if (code in postcodeAreaNames) return true
  return [...bristolDistricts, ...bathDistricts].some((d) => d.code === code)
}

// Returns a human-readable problem, or null if the input is acceptable.
// `beekeeperIds` is the set of real beekeeper document ids — the server
// passes in what it fetched, so a made-up id can't reach the document.
export function validateNewProduct(input: NewProductInput, beekeeperIds: Set<string>): string | null {
  if (input.kind !== 'honey' && input.kind !== 'merch') return 'Choose honey or merch.'
  if (!input.shopifyHandle.trim()) return 'Choose the Shopify product.'
  if (!input.name.trim()) return 'Enter a name.'
  if (input.name.length > NAME_MAX) return `Name is too long (${NAME_MAX} characters max).`
  if (!input.tagline.trim()) return 'Enter a tagline.'
  if (input.tagline.length > TAGLINE_MAX) return `Tagline is too long (${TAGLINE_MAX} characters max).`
  if (!input.description.trim()) {
    return input.kind === 'honey' ? 'Enter the "where it’s from" story.' : 'Enter a description.'
  }
  if (input.description.length > DESCRIPTION_MAX) {
    return `Text is too long (${DESCRIPTION_MAX} characters max).`
  }
  if (input.weight.length > WEIGHT_MAX) return `Size is too long (${WEIGHT_MAX} characters max).`
  if (
    input.shippingWeightGrams !== null &&
    (!Number.isFinite(input.shippingWeightGrams) || input.shippingWeightGrams <= 0 || input.shippingWeightGrams > 100000)
  ) {
    return 'Shipping weight must be a positive number of grams.'
  }

  if (input.kind === 'honey') {
    if (!input.weight.trim()) return 'Enter the jar size, e.g. "12oz / 280ml".'
    const code = (input.postcodeCode ?? '').trim().toUpperCase()
    if (!isRealPostcodeCode(code)) {
      return 'Enter a real postcode area (e.g. M) or, for Bristol/Bath, a district (e.g. BS4).'
    }
    if (!input.beekeeperId || !beekeeperIds.has(input.beekeeperId)) {
      return 'Choose the beekeeper.'
    }
  } else if (!(MERCH_CATEGORIES as readonly string[]).includes(input.category ?? '')) {
    return 'Choose a category.'
  }
  return null
}

// Plain text → Sanity portable text: one block per paragraph (blank-line
// separated), line breaks inside a paragraph kept as spaces.
export function textToBlocks(text: string): {
  _type: 'block'
  _key: string
  style: 'normal'
  markDefs: never[]
  children: { _type: 'span'; _key: string; text: string; marks: never[] }[]
}[] {
  return text
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.replace(/\s*\n\s*/g, ' ').trim())
    .filter(Boolean)
    .map((paragraph, i) => ({
      _type: 'block' as const,
      _key: `p${i}`,
      style: 'normal' as const,
      markDefs: [],
      children: [{ _type: 'span' as const, _key: `s${i}`, text: paragraph, marks: [] }],
    }))
}

export function buildProductDocument(
  input: NewProductInput,
  slug: string,
  imageAssetId: string
): Record<string, unknown> {
  const common = {
    name: input.name.trim(),
    slug: { _type: 'slug', current: slug },
    tagline: input.tagline.trim(),
    shopifyHandle: input.shopifyHandle.trim(),
    heroImage: { _type: 'image', asset: { _type: 'reference', _ref: imageAssetId } },
    weight: input.weight.trim() || undefined,
    shippingWeightGrams: input.shippingWeightGrams ?? undefined,
    active: input.active,
  }

  if (input.kind === 'honey') {
    return {
      _type: 'honeyProduct',
      ...common,
      postcodeCode: (input.postcodeCode ?? '').trim().toUpperCase(),
      beekeeper: { _type: 'reference', _ref: input.beekeeperId },
      originStory: textToBlocks(input.description),
    }
  }
  return {
    _type: 'merchProduct',
    ...common,
    category: input.category,
    description: textToBlocks(input.description),
  }
}
