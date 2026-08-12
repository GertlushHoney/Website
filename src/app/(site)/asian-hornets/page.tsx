import type { Metadata } from 'next'
import Image from 'next/image'
import { BackToCategoryLink } from '@/components/shop/back-to-category-link'

export const metadata: Metadata = {
  title: 'Asian Hornets',
  description:
    'What the yellow-legged (Asian) hornet is, why it threatens British honeybees, and how to report a sighting.',
}

export default function AsianHornetsPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <BackToCategoryLink href="/information" label="Information" />

      <p className="text-honey-amber mt-6 text-sm font-semibold tracking-wide uppercase">
        Protecting British bees
      </p>
      <h1 className="text-porcelain mt-3 text-4xl font-bold tracking-tight text-balance">
        Asian hornets — and why reporting them matters.
      </h1>
      <p className="text-porcelain/70 mt-4 text-base">
        Every jar of Gert Lush Honey depends on healthy honeybee colonies. The yellow-legged
        hornet, usually called the Asian hornet, is the single biggest threat to those colonies
        currently facing UK beekeepers — and the public reporting sightings early is what keeps it
        in check.
      </p>

      <div className="relative mt-10 aspect-[16/9] overflow-hidden rounded-2xl">
        <Image
          src="/images/source/asian-hornet-2026.jpg"
          alt="Close-up of a male Asian hornet (Vespa velutina) head, showing its dark body, orange face and yellow-tipped legs"
          fill
          sizes="(min-width: 768px) 680px, 100vw"
          className="object-cover"
        />
      </div>
      <p className="text-porcelain/50 mt-2 text-xs">
        A male Asian hornet (Vespa velutina). Female workers or queens are more commonly seen than
        males. Photo: Gilles San Martin, via Flickr,{' '}
        <a
          href="https://creativecommons.org/licenses/by-sa/2.0/"
          target="_blank"
          rel="noopener noreferrer"
          className="underline underline-offset-2"
        >
          CC BY-SA 2.0
        </a>
        .
      </p>

      <div className="text-porcelain/80 mt-10 space-y-8 text-base">
        <section>
          <h2 className="text-porcelain text-xl font-bold tracking-tight">
            Why it&apos;s a serious problem
          </h2>
          <p className="mt-3">
            Asian hornets hunt in a very specific and damaging way: they hover outside a beehive
            entrance and pick off worker bees as they come and go. A hive under sustained attack
            can become too afraid to forage, and colonies can collapse within weeks. UK honeybees
            haven&apos;t evolved the defences some Asian honeybee species have against this
            predator, which is why early detection and removal of nests is treated as a national
            priority, coordinated by the Animal and Plant Health Agency&apos;s National Bee Unit
            and the GB Non-Native Species Secretariat (NNSS).
          </p>
        </section>

        <section>
          <h2 className="text-porcelain text-xl font-bold tracking-tight">
            How to tell it apart from a normal hornet
          </h2>
          <p className="mt-3">
            It&apos;s smaller than our native European hornet. Look for:
          </p>
          <ul className="mt-3 list-disc space-y-1 pl-5 text-sm">
            <li>A dark brown or black body, almost velvety in appearance</li>
            <li>Yellow tips on the legs — the feature that gives it its official name</li>
            <li>A yellow-orange face</li>
            <li>One distinctly orange band near the end of the abdomen, with narrow yellow edges on the other segments</li>
          </ul>
          <p className="text-porcelain/60 mt-3 text-sm">
            If you&apos;re not sure, report it anyway with a photo — that&apos;s exactly what the
            identification step in the app and reporting form is for. It&apos;s far better to
            report a native hornet by mistake than to miss a real one.
          </p>
        </section>

        <section>
          <h2 className="text-porcelain text-xl font-bold tracking-tight">
            What to do if you think you&apos;ve seen one
          </h2>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm">
            <li>
              <span className="text-porcelain font-medium">Never approach or disturb a nest.</span>{' '}
              Nests are sometimes high in trees and hard to spot, and disturbing one is dangerous —
              leave removal to trained professionals.
            </li>
            <li>Take a photo if it&apos;s safe to do so, and note exactly where you saw it.</li>
            <li>Report it straight away — don&apos;t wait to be certain.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-porcelain text-xl font-bold tracking-tight">Report a sighting</h2>
          <p className="mt-3">
            Reports go into the same national alert system either way — use whichever&apos;s
            easiest for you:
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <a
              href="https://apps.apple.com/gb/app/asian-hornet-watch/id1161238813"
              target="_blank"
              rel="noopener noreferrer"
              className="border-ink-line hover:border-honey-amber focus-visible:outline-honey-amber flex items-center gap-3 rounded-xl border p-4 text-sm font-semibold focus-visible:outline focus-visible:outline-offset-2"
            >
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                width="22"
                height="22"
                fill="currentColor"
                className="shrink-0"
              >
                <path d="M16.7 12.4c0-2.4 2-3.6 2.1-3.6-1.1-1.7-2.9-1.9-3.5-1.9-1.5-.2-2.9.9-3.6.9-.8 0-1.9-.9-3.2-.8-1.6 0-3.1.9-4 2.4-1.7 3-.4 7.4 1.2 9.8.8 1.2 1.8 2.5 3 2.4 1.2 0 1.7-.8 3.1-.8s1.9.8 3.2.8c1.3 0 2.2-1.2 3-2.4.6-.9 1-1.7 1.4-2.7-2.5-1-2.7-3.4-2.7-4.1zM14 4.5c.6-.8 1-1.9.9-3-1 0-2.1.6-2.8 1.4-.6.7-1.1 1.8-1 2.9 1.1.1 2.2-.6 2.9-1.3z" />
              </svg>
              <span>Asian Hornet Watch — App Store (iPhone)</span>
            </a>
            <a
              href="https://play.google.com/store/apps/details?id=uk.ac.ceh.hornets"
              target="_blank"
              rel="noopener noreferrer"
              className="border-ink-line hover:border-honey-amber focus-visible:outline-honey-amber flex items-center gap-3 rounded-xl border p-4 text-sm font-semibold focus-visible:outline focus-visible:outline-offset-2"
            >
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                width="22"
                height="22"
                fill="currentColor"
                className="shrink-0"
              >
                <path d="M4.2 2.9c-.3.3-.5.7-.5 1.3v15.6c0 .6.2 1 .5 1.3l.1.1L13 12.1v-.2L4.3 2.8l-.1.1z" />
                <path d="M15.9 15L13 12.1v-.2l2.9-2.9 6.4 3.6c.6.4.6 1.1 0 1.5L15.9 15z" opacity=".7" />
                <path d="M15.9 15l-2.9-3-9.6 9.6c.4.4 1 .4 1.6 0L15.9 15z" opacity=".5" />
                <path d="M15.9 9.1l-9-5c-.6-.4-1.2-.4-1.6 0l9.6 9.6 3-2.7z" opacity=".9" />
              </svg>
              <span>Asian Hornet Watch — Google Play (Android)</span>
            </a>
          </div>
          <p className="text-porcelain/70 mt-4 text-sm">
            You can also report online via the{' '}
            <a
              href="https://www.nonnativespecies.org/non-native-species/recording"
              target="_blank"
              rel="noopener noreferrer"
              className="text-comb-gold underline underline-offset-2"
            >
              GB Non-Native Species Secretariat recording form
            </a>{' '}
            or by emailing a photo and location to{' '}
            <a
              href="mailto:alertnonnative@ceh.ac.uk"
              className="text-comb-gold underline underline-offset-2"
            >
              alertnonnative@ceh.ac.uk
            </a>
            . The app, developed by the UK Centre for Ecology &amp; Hydrology for Defra, is the
            quickest way and includes photo-based identification help.
          </p>
        </section>

        <p className="text-porcelain/50 text-xs">
          Sources: UK Centre for Ecology &amp; Hydrology (Asian Hornet Watch), GB Non-Native
          Species Secretariat, APHA National Bee Unit.
        </p>
      </div>
    </div>
  )
}
