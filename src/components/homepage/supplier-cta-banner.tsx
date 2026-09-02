import Image from 'next/image'
import Link from 'next/link'

// PREVIEW (2026-08-27) — the real Become a Supplier flow already exists at
// /become-a-supplier, buried under Information today. This just gives it
// homepage prominence; no new copy claims beyond what that page already
// makes. Photo is a real one from Adam's own apiary (Media/Experiences —
// originally shot for the Bee Day Experience page), not stock.
export function SupplierCtaBanner() {
  return (
    <section className="border-ink-line grid items-stretch border-b lg:grid-cols-2">
      <div className="relative order-2 min-h-[320px] lg:order-1 lg:min-h-[420px]">
        <Image
          src="/images/source/beekeeping-experience-bramble-farm.jpg"
          alt="Beekeepers inspecting a frame at the hives on Bramble Farm"
          fill
          sizes="(min-width: 1024px) 50vw, 100vw"
          className="object-cover"
        />
        <div className="to-ink-surface absolute inset-0 hidden bg-gradient-to-r from-transparent lg:block" />
      </div>

      <div className="bg-honeycomb-surface order-1 flex flex-col justify-center px-6 py-16 lg:order-2 lg:px-16">
        <h2 className="text-porcelain text-3xl font-bold tracking-tight text-balance">
          Love keeping bees. Don&apos;t love selling honey?
        </h2>
        <p className="text-porcelain/70 mt-4 max-w-md text-base">
          If you&apos;re an independent beekeeper with surplus honey, we&apos;d like to hear from
          you — we handle jarring, branding and sale, and you stay credited as the beekeeper
          behind the batch.
        </p>
        <Link
          href="/become-a-supplier"
          className="bg-honey-amber text-ink focus-visible:outline-porcelain mt-8 inline-block w-fit rounded-full px-6 py-2.5 text-sm font-semibold focus-visible:outline focus-visible:outline-offset-4"
        >
          Become a supplier
        </Link>
      </div>
    </section>
  )
}
