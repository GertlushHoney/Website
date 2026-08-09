import { Hero } from '@/components/homepage/hero'
import { FeaturedProduct } from '@/components/homepage/featured-product'
import { PostcodeHoney } from '@/components/homepage/postcode-honey'

// Dark/moody theme, brand-generic narrative (2026-08-07 direction change) —
// not the full 12-section homepage in Development Plan Phase 4 yet.
// See /docs/implementation-roadmap.md.
export default function Home() {
  return (
    <>
      <Hero />
      <FeaturedProduct />
      <PostcodeHoney />
    </>
  )
}
