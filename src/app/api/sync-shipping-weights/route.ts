import { NextResponse } from 'next/server'
import { getHoneyProducts } from '@/lib/sanity/products'
import { getAllMerchProducts } from '@/lib/sanity/merch'
import { syncShippingWeight, type ShippingWeightSyncResult } from '@/lib/shopify/admin-shipping'
import { isShopifyAdminConfigured } from '@/lib/shopify/admin-client'

// Backs the /tools/sync-shipping-weights page — pushes every active
// product's "Shipping weight (g)" (see honeyProduct.ts / merchProduct.ts)
// to Shopify's real inventory item weight, so a weight-based delivery
// rate has something accurate to calculate against. Gated by the same
// STUDIO_PASSWORD as the rest of /tools (see middleware.ts).
export async function POST() {
  if (!isShopifyAdminConfigured()) {
    return NextResponse.json({ error: 'Shopify Admin API is not configured.' }, { status: 400 })
  }

  const [honeyProducts, merchProducts] = await Promise.all([
    getHoneyProducts(),
    getAllMerchProducts(),
  ])

  const candidates = [
    ...honeyProducts.map((p) => ({ handle: p.shopifyHandle, name: p.name, grams: p.shippingWeightGrams })),
    ...merchProducts.map((p) => ({ handle: p.shopifyHandle, name: p.name, grams: p.shippingWeightGrams })),
  ]

  const skipped = candidates
    .filter((p) => p.grams == null || p.grams <= 0)
    .map((p) => ({ handle: p.handle, name: p.name, status: 'skipped' as const }))

  const toSync = candidates.filter((p) => p.grams != null && p.grams > 0)

  const results: (ShippingWeightSyncResult & { name: string })[] = []
  for (const product of toSync) {
    const result = await syncShippingWeight(product.handle, product.grams!)
    results.push({ ...result, name: product.name })
  }

  return NextResponse.json({ results, skipped })
}
