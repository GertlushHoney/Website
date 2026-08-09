import { createClient } from 'next-sanity'
import type { SanityClient, QueryParams } from '@sanity/client'
import { apiVersion, dataset, projectId } from '@/sanity/env'

export function isSanityConfigured(): boolean {
  return Boolean(projectId)
}

// createClient throws if projectId is missing, so this can't be constructed
// eagerly at module scope — pages that don't use Sanity would crash on
// import if it's not configured yet. Built lazily instead, matching the
// "never break the page" pattern in src/lib/shopify/client.ts.
let client: SanityClient | null = null

function getClient(): SanityClient {
  if (!projectId) {
    throw new Error('Sanity is not configured')
  }
  if (!client) {
    // useCdn: false + a read token, so a freshly-published edit in Studio
    // shows up immediately rather than waiting on the CDN's cache — content
    // here changes rarely enough (beekeeper profiles, not live stock) that
    // the slight latency cost doesn't matter.
    client = createClient({
      projectId,
      dataset,
      apiVersion,
      token: process.env.SANITY_API_READ_TOKEN,
      useCdn: false,
    })
  }
  return client
}

export async function sanityFetch<T>(query: string, params: QueryParams = {}): Promise<T | null> {
  if (!isSanityConfigured()) return null
  try {
    return await getClient().fetch<T>(query, params)
  } catch (error) {
    console.error('Sanity fetch failed:', error)
    return null
  }
}
