import type { Metadata } from 'next'
import Link from 'next/link'
import { BackToCategoryLink } from '@/components/shop/back-to-category-link'

export const metadata: Metadata = {
  title: 'Becoming a Beekeeper',
  description:
    'Thinking of keeping bees? A practical guide to getting started — local associations, courses, costs, equipment, and the route to Master Beekeeper.',
  alternates: { canonical: '/becoming-a-beekeeper' },
}

const ASSOCIATIONS = [
  {
    nation: 'England',
    name: 'British Beekeepers Association (BBKA)',
    description:
      'Represents beekeepers across England through local county associations, divisions and branches.',
    href: 'https://www.bbka.org.uk/find-beekeeping-near-you',
  },
  {
    nation: 'Wales',
    name: "Welsh Beekeepers' Association (WBKA)",
    description: 'Affiliated local associations throughout Wales.',
    href: 'https://wbka.com/member-associations/',
  },
  {
    nation: 'Scotland',
    name: "Scottish Beekeepers' Association (SBA)",
    description: 'Affiliated local beekeeping associations across Scotland.',
    href: 'https://scottishbeekeepers.org.uk/about-the-sba/abas/',
  },
  {
    nation: 'Northern Ireland',
    name: "Ulster Beekeepers' Association (UBKA)",
    description: 'Represents local associations throughout Northern Ireland.',
    href: 'https://ubka.org/about/local-associations/',
  },
] as const

const ASSOCIATION_BENEFITS = [
  "Beginners' courses",
  'Practical apiary sessions',
  'Talks and demonstrations',
  'Mentoring from experienced beekeepers',
  'Help sourcing bees',
  'Equipment hire or loan',
  'Honey extraction equipment',
  'Social events',
  'Training towards advanced qualifications',
  'Insurance as part of your membership',
]

const COURSE_TOPICS = [
  'The life cycle of the honey bee',
  'How a colony works: the queen, workers and drones',
  'Opening and inspecting a hive',
  'Recognising brood and what a healthy colony looks like',
  'Swarm prevention and control',
  'Varroa management and common pests and diseases',
  'Feeding bees and preparing colonies for winter',
  'Honey harvesting',
  'The equipment you actually need',
]

const INSURANCE_TYPES = [
  {
    title: 'Public Liability Insurance',
    description:
      'Protection if your beekeeping activities accidentally cause injury to another person or damage to somebody else’s property. BBKA membership through an affiliated association, for example, includes substantial third-party public liability cover.',
  },
  {
    title: 'Product Liability Insurance',
    description:
      'Particularly useful once you start selling or giving away honey or other hive products.',
  },
  {
    title: 'Bee Disease Insurance',
    description:
      'Sometimes casually called "hive insurance", though it isn’t the same as household insurance covering a hive against any damage. It’s principally intended to compensate for colonies, frames or equipment that have to be destroyed following certain serious notifiable bee diseases.',
  },
]

const COSTS = [
  { item: 'Hive, frames and foundation', range: '£200–£400+' },
  { item: 'Bee suit, gloves, smoker and hive tool', range: '£80–£150' },
  { item: 'Nucleus colony of bees', range: '£290–£375+' },
  { item: 'Feeders and other small equipment', range: '£50–£100' },
]

const SALE_TYPES = [
  'Winter sales',
  'January sales',
  'Clearance equipment',
  'Factory seconds',
  'Flat-pack hives',
  'Show offers',
]

const SUPPLIERS = [
  { name: 'Thorne Beekeeping', href: 'https://www.thorne.co.uk/' },
  { name: 'National Bee Supplies', href: 'https://www.beekeeping.co.uk/' },
  { name: 'Abelo', href: 'https://www.abelo.co.uk/' },
]

const HIVE_TYPES = [
  'British National',
  'Commercial',
  'Smith',
  'Langstroth',
  'WBC',
  'Various polystyrene hive systems',
]

const MASTER_PATHWAY = [
  {
    title: "Beginners' course",
    description:
      'Where most people begin. Learn the fundamentals through your local association and gain practical experience handling bees.',
  },
  {
    title: 'BBKA Basic Assessment',
    description:
      'Often the first formal beekeeping qualification, demonstrating the fundamental practical skills needed to manage a colony safely and responsibly.',
  },
  {
    title: 'General Husbandry',
    description: 'A more advanced assessment of your practical ability to manage honey-bee colonies.',
  },
  {
    title: 'Advanced Husbandry',
    description: 'Takes practical beekeeping skills to a much higher level.',
  },
  {
    title: 'Master Beekeeper',
    description:
      'Combines a high level of theoretical understanding with advanced practical beekeeping ability — for many people, a journey lasting several years.',
  },
] as const

const THEORY_MODULES = [
  { n: '1', title: 'Honey Bee Management' },
  { n: '2', title: 'Honey Bee Products and Forage' },
  { n: '3', title: 'Honey Bee Pests, Diseases and Poisoning' },
  { n: '5', title: 'Honey Bee Biology' },
  { n: '6', title: 'Honey Bee Behaviour' },
  { n: '7', title: 'Selection and Breeding of Honey Bees' },
  { n: '8', title: 'Beekeeping Management, Health and History' },
]

const ROUTE_STEPS = [
  'Find your local Beekeeping Association',
  'Become a member — take advantage of the training, support and insurance membership can provide',
  "Take a beginners' course",
  'Spend some time handling bees — make sure you actually enjoy working with them',
  'Find an experienced mentor',
  'Decide which hive type to use, preferably after talking to your mentor and local association',
  'Watch the winter supplier sales — buy equipment gradually and look for flat-pack, seconds and offers',
  'Build your hive and frames over winter',
  'Arrange a nucleus colony for spring, ideally from a reputable local beekeeper',
  'Register your bees with BeeBase',
  'Enjoy your first season',
  'Keep learning — and if you really love it, perhaps one day become a Master Beekeeper',
]

export default function BecomingABeekeeperPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <BackToCategoryLink href="/information" label="Information" />

      <p className="text-honey-amber mt-6 text-sm font-semibold tracking-wide uppercase">
        For aspiring beekeepers
      </p>
      <h1 className="text-porcelain mt-3 text-4xl font-bold tracking-tight text-balance">
        Thinking of becoming a beekeeper?
      </h1>
      <p className="text-porcelain/70 mt-4 text-base">
        Beekeeping is one of those hobbies that can very quickly become a passion. There&apos;s
        something quite special about opening a hive, understanding what&apos;s happening inside
        the colony, and eventually enjoying honey produced by bees you&apos;ve cared for yourself.
        But where do you start?
      </p>

      <div className="text-porcelain/80 mt-12 space-y-14 text-base">
        {/* Local association */}
        <section>
          <h2 className="text-porcelain text-xl font-bold tracking-tight">
            Start with your local association
          </h2>
          <p className="mt-3">
            Probably the best advice for anyone thinking about keeping bees:{' '}
            <span className="text-porcelain font-medium">
              don&apos;t start by buying a hive — start by joining your local Beekeepers&apos;
              Association or Division.
            </span>
          </p>
          <p className="mt-3">
            Across the UK there are hundreds of local beekeeping associations, divisions and
            branches, often run by experienced local beekeepers — one of the best resources
            available to somebody just starting out. Most offer some combination of:
          </p>
          <ul className="mt-4 grid list-disc gap-x-6 gap-y-1.5 pl-5 text-sm sm:grid-cols-2">
            {ASSOCIATION_BENEFITS.map((benefit) => (
              <li key={benefit}>{benefit}</li>
            ))}
          </ul>
          <p className="text-porcelain/70 mt-4 text-sm">
            Perhaps most importantly, you become part of a community of people who have probably
            already experienced whatever problem you eventually encounter. Having an experienced
            beekeeper you can call when you open your hive and think &quot;I&apos;m not sure what
            I&apos;m looking at here&quot; can be invaluable during your first season.
          </p>
        </section>

        {/* Find your association */}
        <section>
          <h2 className="text-porcelain text-xl font-bold tracking-tight">
            Find your local association
          </h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {ASSOCIATIONS.map((a) => (
              <div
                key={a.nation}
                className="border-ink-line bg-honeycomb-surface flex flex-col rounded-2xl border p-5"
              >
                <p className="text-comb-gold text-xs font-semibold tracking-wide uppercase">
                  {a.nation}
                </p>
                <p className="text-porcelain mt-1.5 text-sm font-semibold">{a.name}</p>
                <p className="text-porcelain/70 mt-2 flex-1 text-sm">{a.description}</p>
                <a
                  href={a.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-comb-gold hover:text-honey-amber mt-4 inline-flex items-center gap-1 text-sm font-semibold"
                >
                  Find your nearest association <span aria-hidden="true">&rarr;</span>
                </a>
              </div>
            ))}
          </div>
        </section>

        {/* Beginners' course */}
        <section>
          <h2 className="text-porcelain text-xl font-bold tracking-tight">
            Take a beginners&apos; course
          </h2>
          <p className="mt-3">
            Before buying your bees, one of the best investments you can make is a good
            beginners&apos; beekeeping course. Most local associations run them over winter or
            early spring, combining classroom sessions with practical experience in an association
            apiary once the weather warms up. A good course should introduce you to:
          </p>
          <ul className="mt-4 grid list-disc gap-x-6 gap-y-1.5 pl-5 text-sm sm:grid-cols-2">
            {COURSE_TOPICS.map((topic) => (
              <li key={topic}>{topic}</li>
            ))}
          </ul>
          <p className="text-porcelain/70 mt-4 text-sm">
            More importantly, a practical course gives you the opportunity to handle bees before
            spending hundreds of pounds on your own equipment. Don&apos;t worry if you&apos;re
            nervous about bees when you begin — plenty of experienced beekeepers started out
            feeling exactly the same way.
          </p>
        </section>

        {/* Mentor */}
        <section>
          <h2 className="text-porcelain text-xl font-bold tracking-tight">Find a mentor</h2>
          <p className="mt-3">
            One of the biggest advantages of joining your local association is meeting
            experienced beekeepers. If possible, find someone willing to mentor you through your
            first season. Books, websites and videos are extremely useful, but nothing quite
            replaces having an experienced beekeeper standing beside you when something unexpected
            appears inside the hive.
          </p>
          <p className="text-porcelain/70 mt-3 text-sm">
            Every colony behaves slightly differently and every season presents new challenges.
            Even beekeepers who have kept bees for decades will tell you they&apos;re still
            learning.
          </p>
        </section>

        {/* Insurance */}
        <section>
          <h2 className="text-porcelain text-xl font-bold tracking-tight">
            Insurance — another great reason to join
          </h2>
          <p className="mt-3">
            Another significant advantage of joining a local association is that insurance is
            often included as part of your annual membership, so you don&apos;t normally need to
            arrange it separately. Depending on the association and national organisation,
            membership may include:
          </p>
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            {INSURANCE_TYPES.map((type) => (
              <div key={type.title} className="border-ink-line rounded-2xl border p-5">
                <p className="text-porcelain text-sm font-semibold">{type.title}</p>
                <p className="text-porcelain/70 mt-2 text-sm">{type.description}</p>
              </div>
            ))}
          </div>
          <p className="text-porcelain/70 mt-4 text-sm">
            Precise arrangements vary between associations and between England, Wales, Scotland
            and Northern Ireland, so always check what your particular association includes.
            Taken together — training, mentoring, equipment, support and insurance — association
            membership can represent extremely good value.
          </p>
        </section>

        {/* Costs */}
        <section>
          <h2 className="text-porcelain text-xl font-bold tracking-tight">
            How much does it cost to start beekeeping?
          </h2>
          <p className="mt-3">
            Beekeeping does require an initial investment, but you don&apos;t need to buy
            everything at once. Prices vary significantly depending on whether you choose cedar,
            pine or polystyrene equipment, and whether you buy assembled, flat-packed, new,
            second-quality or sale-priced. As a general UK starting point:
          </p>
          <div className="border-ink-line mt-4 overflow-hidden rounded-2xl border">
            {COSTS.map((cost, i) => (
              <div
                key={cost.item}
                className={`flex items-center justify-between gap-4 px-5 py-3.5 text-sm ${
                  i > 0 ? 'border-ink-line border-t' : ''
                }`}
              >
                <span className="text-porcelain/80">{cost.item}</span>
                <span className="text-porcelain shrink-0 font-semibold">{cost.range}</span>
              </div>
            ))}
            <div className="bg-ink-surface border-honey-amber/30 flex items-center justify-between gap-4 border-t px-5 py-4">
              <span className="text-comb-gold text-sm font-semibold">
                Sensible starting budget
              </span>
              <span className="text-comb-gold text-base font-bold">£600–£900</span>
            </div>
          </div>
          <p className="text-porcelain/70 mt-4 text-sm">
            You can certainly spend considerably more, particularly with premium cedar equipment
            bought fully assembled — but you don&apos;t need every gadget in the catalogue when
            you start.
          </p>
        </section>

        {/* Timing and sales */}
        <section>
          <h2 className="text-porcelain text-xl font-bold tracking-tight">Don&apos;t pay full price</h2>
          <p className="mt-3">
            One of the best times to decide you want to become a beekeeper is actually autumn or
            winter — your bees don&apos;t normally need to arrive until spring. That gives you
            months to join your association, complete a beginners&apos; course, meet experienced
            beekeepers, decide what type of hive you want, build your equipment, and watch for
            supplier sales:
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {SALE_TYPES.map((type) => (
              <span
                key={type}
                className="border-ink-line text-porcelain/70 rounded-full border px-3.5 py-1.5 text-xs font-medium"
              >
                {type}
              </span>
            ))}
          </div>
          <p className="text-porcelain/70 mt-4 text-sm">
            Buying your hive and frames flat-packed can save a considerable amount of money —
            building your own frames over winter is something of a beekeeping tradition. Your
            local association may also organise bulk purchases or know of good local suppliers.
            A few UK suppliers worth watching:
          </p>
          <div className="mt-3 flex flex-wrap gap-3">
            {SUPPLIERS.map((s) => (
              <a
                key={s.name}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                className="border-ink-line hover:border-honey-amber text-porcelain focus-visible:outline-honey-amber rounded-full border px-4 py-2 text-sm font-semibold focus-visible:outline focus-visible:outline-offset-2"
              >
                {s.name}
              </a>
            ))}
          </div>
          <div className="border-honey-amber/30 bg-honeycomb-surface mt-6 rounded-2xl border p-5">
            <p className="text-comb-gold text-xs font-semibold tracking-wide uppercase">
              A word about second-hand equipment
            </p>
            <p className="text-porcelain/80 mt-2 text-sm">
              Second-hand equipment can be excellent value, but take advice before buying used
              brood boxes, frames or comb — some serious bee diseases can be transferred through
              contaminated equipment. If you&apos;re unsure, ask an experienced beekeeper or your
              local association before putting second-hand equipment anywhere near your bees.
            </p>
          </div>
        </section>

        {/* Hive choice */}
        <section>
          <h2 className="text-porcelain text-xl font-bold tracking-tight">
            Which hive should I buy?
          </h2>
          <p className="mt-3">
            Don&apos;t buy your hive until you&apos;ve spoken to your local association. There are
            several hive designs commonly used in Britain, including:
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {HIVE_TYPES.map((type) => (
              <span
                key={type}
                className="border-ink-line text-porcelain/70 rounded-full border px-3.5 py-1.5 text-xs font-medium"
              >
                {type}
              </span>
            ))}
          </div>
          <p className="mt-4 text-sm">
            The British National is one of the most widely used designs in England, but that
            doesn&apos;t automatically make it the best choice for everybody. One of the smartest
            things a beginner can do is use the same hive system as their mentor and local
            association — advice is easier to obtain, frames may be interchangeable, spare
            equipment may be easier to borrow, and local bees are more likely to already be on
            compatible frames.
          </p>
          <p className="text-porcelain mt-3 text-sm font-semibold">Ask first. Buy second.</p>
        </section>

        {/* Buying bees */}
        <section>
          <h2 className="text-porcelain text-xl font-bold tracking-tight">Buying your first bees</h2>
          <p className="mt-3">
            Most beginners start with a nucleus colony, normally shortened to a &quot;nuc&quot; —
            a small established honey-bee colony containing a laying queen, worker bees, brood,
            food stores and several frames of drawn comb. It can then be transferred into your
            full-sized hive and allowed to grow.
          </p>
          <p className="text-porcelain/70 mt-3 text-sm">
            Don&apos;t simply buy the cheapest bees you can find online. Your local association
            will often know reputable local beekeepers who produce nucleus colonies — buying
            locally can mean locally adapted bees, and, importantly, somebody you can talk to
            afterwards if you have questions. It&apos;s sensible to arrange your nuc during winter
            or early spring, as good local colonies can sell out.
          </p>
        </section>

        {/* Extractor */}
        <section>
          <h2 className="text-porcelain text-xl font-bold tracking-tight">
            Do I need a honey extractor?
          </h2>
          <p className="mt-3">
            Not initially. A stainless-steel honey extractor can be expensive, and there&apos;s no
            guarantee your first colony will produce a significant surplus during its first
            season. Many associations own honey extraction equipment that members can borrow or
            hire — some even have dedicated extraction facilities. Ask your association before
            spending several hundred pounds on equipment you may only use for a few days every
            year.
          </p>
        </section>

        {/* BeeBase */}
        <section>
          <div className="border-ink-line bg-honeycomb-surface rounded-2xl border p-6 sm:p-8">
            <p className="text-comb-gold text-xs font-semibold tracking-wide uppercase">
              Once you have bees
            </p>
            <h2 className="text-porcelain mt-2 text-xl font-bold tracking-tight">
              Register your bees with BeeBase
            </h2>
            <p className="text-porcelain/70 mt-3 text-sm">
              Register your apiary with BeeBase, operated by the National Bee Unit — it&apos;s
              free, provides important information about honey-bee health, and allows bee
              inspectors to contact beekeepers if serious pests or diseases are found nearby. An
              extremely useful resource for every beekeeper.
            </p>
            <a
              href="https://www.nationalbeeunit.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-honey-amber text-ink focus-visible:outline-porcelain mt-5 inline-block rounded-full px-6 py-2.5 text-sm font-semibold focus-visible:outline focus-visible:outline-offset-4"
            >
              Register on BeeBase
            </a>
          </div>
        </section>

        {/* Master Beekeeper pathway */}
        <section>
          <h2 className="text-porcelain text-xl font-bold tracking-tight">
            Really caught the beekeeping bug?
          </h2>
          <p className="mt-3">
            Perhaps you started because you wanted one hive at the bottom of the garden. Then you
            bought another. Then another. Then you found yourself reading about queen breeding at
            midnight — welcome to beekeeping. One of the wonderful things about it is that
            there&apos;s always something else to learn. You don&apos;t have to complete any
            formal qualifications to enjoy beekeeping, but the BBKA runs a comprehensive education
            and examination programme for those who really catch the bug.
          </p>

          <div className="mt-8">
            {MASTER_PATHWAY.map((stage, i) => (
              <div key={stage.title} className="relative flex gap-4 pb-8 last:pb-0">
                {i < MASTER_PATHWAY.length - 1 && (
                  <span className="bg-ink-line absolute top-7 left-[11px] h-full w-px" aria-hidden="true" />
                )}
                <span className="border-honey-amber bg-ink relative z-10 mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2">
                  <span className="bg-honey-amber h-2 w-2 rounded-full" />
                </span>
                <div>
                  <p className="text-porcelain text-sm font-semibold">{stage.title}</p>
                  <p className="text-porcelain/70 mt-1 text-sm">{stage.description}</p>
                </div>
              </div>
            ))}
          </div>

          <p className="mt-2">
            Alongside the practical route, written examinations let you explore the science and
            theory behind beekeeping:
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {THEORY_MODULES.map((mod) => (
              <div
                key={mod.n}
                className="border-ink-line flex items-center gap-3 rounded-xl border px-4 py-3"
              >
                <span className="bg-ink-surface text-comb-gold flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold">
                  {mod.n}
                </span>
                <span className="text-porcelain/80 text-sm">{mod.title}</span>
              </div>
            ))}
          </div>
          <p className="text-porcelain/70 mt-4 text-sm">
            These subjects take you far beyond simply knowing how to inspect a hive — you begin
            to understand why bees behave as they do. It isn&apos;t something you need to decide
            on when you buy your first hive; for many people it becomes a journey lasting several
            years. And that&apos;s one of the wonderful things about beekeeping: you can start
            with a beginners&apos; course and one small colony, and years later find yourself
            studying honey-bee biology, raising queens, mentoring beginners, teaching courses, or
            even becoming a Master Beekeeper.
          </p>
          <a
            href="https://www.bbka.org.uk/pages/category/education-and-exams"
            target="_blank"
            rel="noopener noreferrer"
            className="text-comb-gold hover:text-honey-amber mt-3 inline-flex items-center gap-1 text-sm font-semibold"
          >
            BBKA Education and Examinations <span aria-hidden="true">&rarr;</span>
          </a>
        </section>

        {/* Best route */}
        <section>
          <h2 className="text-porcelain text-xl font-bold tracking-tight">
            The best route into beekeeping
          </h2>
          <p className="mt-3">
            If you&apos;re thinking about becoming a beekeeper, you don&apos;t need to buy
            everything tomorrow. A much better route:
          </p>
          <ol className="border-ink-line mt-4 space-y-3 border-t pt-4">
            {ROUTE_STEPS.map((step, i) => (
              <li key={step} className="flex items-start gap-3 text-sm">
                <span className="bg-honey-amber text-ink mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs font-bold">
                  {i + 1}
                </span>
                <span className="text-porcelain/80">{step}</span>
              </li>
            ))}
          </ol>
        </section>

        {/* Final advice */}
        <section className="border-honey-amber/40 bg-honeycomb-surface rounded-2xl border p-6 text-center sm:p-8">
          <p className="text-comb-gold text-xs font-semibold tracking-wide uppercase">
            One final piece of advice
          </p>
          <p className="text-porcelain mt-3 text-lg font-semibold text-balance">
            Don&apos;t rush to buy the bees. Join your local association first.
          </p>
          <p className="text-porcelain/70 mt-2 text-sm">
            Learn from the people around you. Take the beginners&apos; course. Find a mentor. Buy
            your equipment carefully. Then get your bees.
          </p>
          <p className="text-porcelain/70 mt-4 text-sm">
            Beekeeping is something you can still be learning about decades after opening your
            first hive — and that&apos;s a big part of what makes it so fascinating.
          </p>
        </section>
      </div>

      <div className="border-ink-line mt-14 border-t pt-8">
        <p className="text-porcelain/50 text-sm">
          Fancy keeping bees yourself and eventually supplying honey to us? See{' '}
          <Link href="/become-a-supplier" className="text-comb-gold underline underline-offset-2">
            Become a Supplier
          </Link>
          . Worried about Asian hornets threatening your colony?{' '}
          <Link href="/asian-hornets" className="text-comb-gold underline underline-offset-2">
            Here&apos;s what to look for
          </Link>
          .
        </p>
      </div>
    </div>
  )
}
