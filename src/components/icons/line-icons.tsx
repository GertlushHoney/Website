// Shared inline line-art icons — simple geometric SVGs in the site's own
// dark/gold palette (currentColor), not the reference mockup's colours,
// just its icon-plus-caption layout. Consolidated 2026-08-28 from
// what-is-gert-lush.tsx and gert-lush-standard-strip.tsx, which had each
// grown their own copies, so trust-row.tsx isn't a third copy.
type IconProps = { className?: string }

const defaultClassName = 'mx-auto h-11 w-11'

export function BeekeeperIcon({ className = defaultClassName }: IconProps) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <ellipse cx="24" cy="15" rx="14" ry="4" />
      <path d="M14 15 Q24 6 34 15" />
      <path d="M17 19 Q24 23 31 19" />
      <path d="M17 19 L17 35 M21.5 19 L21.5 37 M24 19 L24 38 M26.5 19 L26.5 37 M31 19 L31 35" />
    </svg>
  )
}

export function JarIcon({ className = defaultClassName }: IconProps) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <rect x="14" y="8" width="20" height="6" rx="2" />
      <path d="M16 14 L14 20 L14 38 Q14 40 16 40 L32 40 Q34 40 34 38 L34 20 L32 14" />
      <rect x="18" y="23" width="12" height="9" rx="1" />
    </svg>
  )
}

export function HomeIcon({ className = defaultClassName }: IconProps) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M10 22 L24 10 L38 22" />
      <path d="M14 19 L14 38 L34 38 L34 19" />
      <rect x="21" y="28" width="6" height="10" />
    </svg>
  )
}

export function ShieldCheckIcon({ className = 'mx-auto h-14 w-14' }: IconProps) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M24 5 L39 11 L39 23 Q39 36 24 43 Q9 36 9 23 L9 11 Z" />
      <path d="M16 23 L21.5 28.5 L32 17" />
    </svg>
  )
}

export function LocationPinIcon({ className = defaultClassName }: IconProps) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M24 6 C16 6 10 12.5 10 20.5 C10 31 24 42 24 42 C24 42 38 31 38 20.5 C38 12.5 32 6 24 6 Z" />
      <circle cx="24" cy="19.5" r="5.5" />
    </svg>
  )
}

export function DeliveryTruckIcon({ className = defaultClassName }: IconProps) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <rect x="4" y="16" width="23" height="16" rx="1" />
      <path d="M27 21 L36 21 L43 28 L43 32 L27 32" />
      <circle cx="14" cy="35" r="3.5" />
      <circle cx="35" cy="35" r="3.5" />
    </svg>
  )
}
