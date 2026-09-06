import Link from 'next/link'
import type { UpcomingExperienceSession } from '@/lib/sanity/merch'

const DAY_LABELS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']
const MONTH_LABELS = [
  'JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC',
]

// Regular-hexagon clip-path (point at top-centre/bottom-centre, flat
// vertical sides) — echoes the hexagon mark on the real jar label rather
// than a plain calendar grid, which would be mostly empty at this handful
// of dates a year.
const HEXAGON_CLIP = 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)'

// Every upcoming date across every active Experience, one per hexagon —
// clicking a date goes straight to that date's own experience page rather
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

      <div className="mt-10 flex flex-wrap justify-center gap-x-6 gap-y-12">
        {sessions.map((session, index) => {
          const date = new Date(`${session.date}T00:00:00`)
          return (
            <Link
              key={session.key}
              href={`/shop/${session.productSlug}`}
              className={`group flex w-[140px] flex-col items-center gap-3 ${
                index % 2 === 1 ? 'sm:mt-10' : ''
              }`}
            >
              <div
                style={{ clipPath: HEXAGON_CLIP }}
                className="border-honey-amber/50 bg-honeycomb-surface group-hover:border-comb-gold group-focus-visible:border-comb-gold flex h-[160px] w-[140px] flex-col items-center justify-center border-2 text-center transition group-hover:scale-105"
              >
                <span className="text-honey-amber text-xs font-semibold tracking-widest">
                  {DAY_LABELS[date.getDay()]}
                </span>
                <span className="font-display text-comb-gold text-4xl leading-none font-bold">
                  {date.getDate()}
                </span>
                <span className="text-porcelain/70 mt-1 text-xs font-semibold tracking-widest">
                  {MONTH_LABELS[date.getMonth()]} {date.getFullYear()}
                </span>
              </div>

              <div className="text-center">
                <p className="text-porcelain text-sm font-semibold">{session.productName}</p>
                <p className="text-porcelain/60 text-xs">
                  {session.placesRemaining > 0
                    ? `${session.placesRemaining} place${session.placesRemaining === 1 ? '' : 's'} left`
                    : 'Fully booked'}
                </p>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
