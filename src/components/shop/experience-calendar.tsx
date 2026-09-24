import Link from 'next/link'
import type { UpcomingExperienceSession } from '@/lib/sanity/merch'

const DAY_LABELS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']
const MONTH_LABELS = [
  'JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC',
]

// Tile grid, one per upcoming date across every active Experience — matches
// the card convention used on the other shop category pages (see
// MerchCategoryListing) rather than the hexagon calendar this replaced.
// Clicking a date goes straight to that date's own experience page rather
// than a category grid, since each date belongs to a specific bookable
// product.
export function ExperienceCalendar({ sessions }: { sessions: UpcomingExperienceSession[] }) {
  const years = Array.from(new Set(sessions.map((session) => session.date.slice(0, 4))))
  const summary =
    years.length <= 1
      ? `${sessions.length} experience${sessions.length === 1 ? '' : 's'} planned in ${
          years[0] ?? new Date().getFullYear()
        }`
      : `${sessions.length} experiences planned across ${years[0]}–${years[years.length - 1]}`

  return (
    <div>
      <p className="text-comb-gold text-center text-sm font-semibold tracking-wide uppercase">
        {summary}
      </p>

      <div className="mt-8 grid gap-6 sm:grid-cols-2">
        {sessions.map((session) => {
          const date = new Date(`${session.date}T00:00:00`)
          return (
            <Link
              key={session.key}
              href={`/shop/${session.productSlug}`}
              className="border-ink-line bg-honeycomb-surface hover:border-honey-amber focus-visible:outline-honey-amber group flex items-center gap-5 overflow-hidden rounded-2xl border p-6 transition focus-visible:outline focus-visible:outline-offset-4"
            >
              <div className="border-honey-amber/50 bg-ink-surface group-hover:border-comb-gold flex h-20 w-20 shrink-0 flex-col items-center justify-center rounded-xl border-2 text-center transition">
                <span className="text-honey-amber text-xs font-semibold tracking-widest">
                  {DAY_LABELS[date.getDay()]}
                </span>
                <span className="font-display text-comb-gold text-3xl leading-none font-bold">
                  {date.getDate()}
                </span>
                <span className="text-porcelain/70 mt-1 text-[10px] font-semibold tracking-widest">
                  {MONTH_LABELS[date.getMonth()]} {date.getFullYear()}
                </span>
              </div>

              <div>
                <p className="text-porcelain text-base font-semibold">{session.productName}</p>
                <p className="text-porcelain/60 mt-1 text-sm">
                  {session.placesRemaining > 0
                    ? `${session.placesRemaining} place${session.placesRemaining === 1 ? '' : 's'} left`
                    : 'Fully booked'}
                </p>
                <span className="text-comb-gold mt-2 inline-block text-sm font-semibold">
                  View details &rarr;
                </span>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
