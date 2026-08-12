import Image from 'next/image'
import Link from 'next/link'

// Jar image is the "Professional - Single Jar BeeS3.png" studio render, with
// its edges feathered to transparent (see /docs/brand-alignment-board.md) so
// its own photographed background blends into this section's dark gradient
// instead of showing a hard rectangle. Label text on it is accurate and
// legible, unlike the matching stack render. Copy is deliberately
// brand-generic (not Northern-Slopes-specific): Gert Lush is a Bristol-based
// company selling postcode honey sourced from independent beekeepers across
// Britain, not a single-origin product.
export function Hero() {
  return (
    <section className="border-ink-line grid items-stretch border-b lg:grid-cols-2">
      <div className="flex flex-col justify-center px-6 py-20 lg:px-16 lg:py-0">
        <p className="text-honey-amber text-sm font-semibold tracking-wide uppercase">
          Gert Lush Honey &middot; Postcode Honey
        </p>
        <h1 className="mt-4 max-w-xl text-5xl font-bold tracking-tight text-balance sm:text-6xl lg:text-7xl">
          Honey with a postcode.
        </h1>
        <p className="text-porcelain/70 mt-6 max-w-md text-lg">
          Small-batch honey selected from independent beekeepers across Britain. Based in Bristol.
          Sourced by postcode.
        </p>
        <div className="mt-10 flex flex-wrap items-center gap-3">
          <Link
            href="/shop/honey"
            className="bg-honey-amber text-ink focus-visible:outline-porcelain rounded-full px-6 py-2.5 text-sm font-semibold focus-visible:outline focus-visible:outline-offset-4"
          >
            Shop the latest harvest
          </Link>
          <Link
            href="/postcode-honey"
            className="border-porcelain/40 text-porcelain hover:border-porcelain focus-visible:outline-honey-amber rounded-full border px-6 py-2.5 text-sm font-semibold focus-visible:outline focus-visible:outline-offset-4"
          >
            Discover postcode honey
          </Link>
        </div>
      </div>

      <div className="from-ink-surface to-ink relative min-h-[420px] overflow-hidden bg-gradient-to-b lg:min-h-[640px]">
        <div
          className="via-honey-amber/10 absolute inset-0 bg-radial from-transparent to-transparent"
          style={{
            backgroundImage:
              'radial-gradient(circle at 50% 45%, rgba(217,150,20,0.16), transparent 60%)',
          }}
        />
        <Image
          src="/images/source/bee-s3-jar-single-professional-blended.png"
          alt="A jar of Bee S3 honey, Gert Lush Honey's Bristol postcode honey, 12oz / 280ml"
          fill
          priority
          sizes="(min-width: 1024px) 50vw, 100vw"
          className="object-contain p-10 drop-shadow-[0_30px_60px_rgba(0,0,0,0.55)] lg:p-16"
        />
      </div>
    </section>
  )
}
