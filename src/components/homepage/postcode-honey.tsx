import Image from 'next/image'
import Link from 'next/link'

// The hexagon-cluster illustration (public/images/source/postcode-
// hexagon-cluster.png) is an AI-generated graphic in the brand's own
// dark/gold palette, shaped like the island of Great Britain — each hexagon
// standing in for a postcode area, not a traced/licensed map. The glowing
// hexagon sits in the South West (where Gert Lush Honey is based today),
// matching the Britain-wide "many postcodes" copy.
export function PostcodeHoney() {
  return (
    <section className="border-ink-line bg-honeycomb-surface grid items-stretch border-b lg:grid-cols-2">
      <div className="flex flex-col justify-center px-6 py-16 lg:px-16">
        <p className="text-comb-gold text-sm font-semibold tracking-wide uppercase">
          Postcode Honey
        </p>
        <h2 className="text-porcelain mt-3 text-4xl font-bold tracking-tight text-balance">
          One brand. Many postcodes.
        </h2>
        <p className="text-porcelain/70 mt-4 max-w-md text-base">
          Gert Lush Honey is based in Bristol, but every jar is sourced from an independent
          beekeeper somewhere specific — their postcode, their season, their harvest. Bee S3 is our
          first. It won&apos;t be our last.
        </p>
        <Link
          href="/postcode-honey"
          className="border-porcelain/40 text-porcelain hover:border-porcelain focus-visible:outline-honey-amber mt-8 inline-block w-fit rounded-full border px-6 py-2.5 text-sm font-semibold focus-visible:outline focus-visible:outline-offset-4"
        >
          Explore postcode honey
        </Link>
      </div>

      <div className="relative flex min-h-[360px] items-center justify-center px-10 py-12 lg:min-h-[560px]">
        <Image
          src="/images/source/postcode-hexagon-cluster.png"
          alt="A cluster of glowing gold hexagon cells shaped like the island of Great Britain, standing in for postcode areas"
          width={900}
          height={1200}
          sizes="(min-width: 1024px) 40vw, 70vw"
          className="h-full max-h-[520px] w-auto object-contain"
          style={{
            // Fades the image's hard rectangular edge into the section's own
            // background instead of sitting on the page as a visible box —
            // the PNG's near-black corners are close to bg-honeycomb-surface
            // but never an exact match, so a mask blends it seamlessly.
            maskImage: 'radial-gradient(ellipse 62% 62% at 50% 50%, black 45%, transparent 92%)',
            WebkitMaskImage: 'radial-gradient(ellipse 62% 62% at 50% 50%, black 45%, transparent 92%)',
          }}
        />
      </div>
    </section>
  )
}
