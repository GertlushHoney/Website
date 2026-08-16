import { createClient } from 'next-sanity'
import type { SanityClient } from '@sanity/client'
import { apiVersion, dataset, projectId } from '@/sanity/env'

// Separate from client.ts's read-only client and its own token
// (SANITY_API_READ_TOKEN) — this one needs create permission, so it gets
// its own narrowly-scoped SANITY_API_WRITE_TOKEN rather than widening the
// read token's permissions. Same reasoning as the Shopify Admin API split
// in src/lib/shopify/admin-client.ts. Used only by submit-review.ts.
export function isSanityWriteConfigured(): boolean {
  return Boolean(projectId && process.env.SANITY_API_WRITE_TOKEN)
}

let client: SanityClient | null = null

export function getSanityWriteClient(): SanityClient {
  if (!isSanityWriteConfigured()) {
    throw new Error('Sanity write access is not configured')
  }
  if (!client) {
    client = createClient({
      projectId,
      dataset,
      apiVersion,
      token: process.env.SANITY_API_WRITE_TOKEN,
      useCdn: false,
    })
  }
  return client
}
