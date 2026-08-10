import type { Metadata } from 'next'
import Image from 'next/image'

export const metadata: Metadata = {
  title: 'Gifts',
  description: 'Gift boxes and tasting sets from Gert Lush Honey — on the way.',
}

export default function GiftsPage() {
  return (
    <div className="mx-auto max-w-5xl px-6 py-16">
      <p className="text-honey-amber text-sm font-semibold tracking-wide uppercase">Gifts</p>
      <h1 className="text-porcelain mt-3 max-w-2xl text-4xl font-bold tracking-tight text-balance">
        Give someone something lush.
      </h1>
      <p className="text-porcelain/70 mt-4 max-w-xl text-base">
        Gift boxes and tasting sets are on the way as more postcode honeys join Gert Lush —
        nothing here is ready to sell as a gift yet, so we&apos;re not dressing up the regular
        honey as one. The Bee Day Experience below is further along, and we&apos;re happy to talk
        through corporate or event gifting today.
      </p>

      <div className="border-ink-line bg-honeycomb-surface mt-12 grid max-w-3xl overflow-hidden rounded-2xl border sm:grid-cols-2">
        <div className="relative min-h-[220px]">
          <Image
            src="/images/source/bramble-farm-view.jpg"
            alt="Bramble Farm, Bristol's Northern Slopes"
            fill
            sizes="(min-width: 640px) 50vw, 100vw"
            className="object-cover"
          />
        </div>
        <div className="p-8">
          <p className="text-comb-gold text-sm font-semibold tracking-wide uppercase">
            A different kind of gift
          </p>
          <h2 className="text-porcelain mt-2 text-2xl font-bold tracking-tight">
            Bee Day Experience at Bramble Farm
          </h2>
          <p className="text-porcelain/70 mt-4 text-sm">
            We&apos;re working on a hands-on day with Adam, the beekeeper behind Bee S3, at the
            real apiary on Bristol&apos;s Northern Slopes — pricing, dates and what&apos;s included
            aren&apos;t confirmed yet, so we&apos;re not selling it as a gift experience until it
            is.
          </p>
          <a
            href="mailto:gertlushhoney@outlook.com?subject=Bee%20Day%20Experience%20-%20register%20interest&body=I'd like to hear when the Bee Day Experience at Bramble Farm is available."
            className="border-porcelain/30 text-porcelain hover:border-porcelain focus-visible:outline-honey-amber mt-6 inline-block rounded-full border px-6 py-2.5 text-sm font-semibold focus-visible:outline focus-visible:outline-offset-4"
          >
            Register your interest
          </a>
        </div>
      </div>

      <div className="border-ink-line bg-honeycomb-surface mt-8 max-w-2xl rounded-2xl border p-8">
        <p className="text-comb-gold text-sm font-semibold tracking-wide uppercase">
          Corporate &amp; event gifting
        </p>
        <h2 className="text-porcelain mt-2 text-2xl font-bold tracking-tight">
          Planning something bigger?
        </h2>
        <p className="text-porcelain/70 mt-4 text-sm">
          Volume orders for corporate gifts, weddings or events aren&apos;t formally set up yet, but
          get in touch and we&apos;ll work out what&apos;s possible.
        </p>
        <a
          href="mailto:gertlushhoney@outlook.com?subject=Corporate%20or%20event%20gifting%20enquiry"
          className="bg-honey-amber text-ink focus-visible:outline-porcelain mt-6 inline-block rounded-full px-6 py-2.5 text-sm font-semibold focus-visible:outline focus-visible:outline-offset-4"
        >
          Request a gifting proposal
        </a>
      </div>
    </div>
  )
}
