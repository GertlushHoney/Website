import Link from 'next/link'
import { BackToCategoryLink } from '@/components/shop/back-to-category-link'

// Shared shell for shop categories that don't have real products yet — same
// "honest, no invented pricing" pattern as /stockists. Each category page
// supplies its own copy; nothing here asserts ingredients, pricing or a
// launch date that hasn't been confirmed.
export function ComingSoonProduct({
  eyebrow,
  title,
  description,
  waitlistSubject,
}: {
  eyebrow: string
  title: string
  description: string
  waitlistSubject: string
}) {
  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <BackToCategoryLink href="/shop" label="Shop" />

      <p className="text-honey-amber mt-6 text-sm font-semibold tracking-wide uppercase">
        {eyebrow}
      </p>
      <h1 className="text-porcelain mt-3 text-4xl font-bold tracking-tight text-balance">
        {title}
      </h1>
      <p className="text-porcelain/70 mt-4 text-base">{description}</p>

      <div className="border-ink-line bg-honeycomb-surface mt-10 rounded-2xl border p-8">
        <p className="text-comb-gold text-sm font-semibold tracking-wide uppercase">
          Not for sale yet
        </p>
        <p className="text-porcelain/70 mt-4 text-sm">
          We&apos;d rather tell you honestly that this isn&apos;t ready than list a price or photo
          before it&apos;s real. Leave your email and we&apos;ll let you know the moment it
          launches.
        </p>
        <a
          href={`mailto:gertlushhoney@outlook.com?subject=${encodeURIComponent(waitlistSubject)}`}
          className="bg-honey-amber text-ink focus-visible:outline-porcelain mt-6 inline-block rounded-full px-6 py-2.5 text-sm font-semibold focus-visible:outline focus-visible:outline-offset-4"
        >
          Let me know when it&apos;s ready
        </a>
      </div>

      <p className="text-porcelain/50 mt-8 text-sm">
        In the meantime,{' '}
        <Link href="/shop/bee-s3" className="text-comb-gold underline underline-offset-2">
          Bee S3 honey
        </Link>{' '}
        is available now.
      </p>
    </div>
  )
}
