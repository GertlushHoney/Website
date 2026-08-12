import Link from 'next/link'

// Deliberately generic and Britain-wide, not Bristol/Northern-Slopes-specific
// — Gert Lush Honey is based in Bristol but sources postcode honey from
// independent beekeepers nationally. The dot pattern is decorative, not a
// literal map (no real postcode/location data exists yet to plot honestly).
export function PostcodeHoney() {
  return (
    <section className="border-ink-line relative overflow-hidden border-b py-28">
      <svg
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 h-full w-full opacity-40"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <radialGradient id="dot-fade" cx="50%" cy="50%" r="70%">
            <stop offset="0%" stopColor="var(--color-comb-gold)" stopOpacity="0.9" />
            <stop offset="100%" stopColor="var(--color-comb-gold)" stopOpacity="0" />
          </radialGradient>
        </defs>
        {[
          [12, 22],
          [28, 12],
          [46, 28],
          [64, 16],
          [80, 30],
          [18, 55],
          [38, 62],
          [58, 50],
          [74, 60],
          [90, 45],
          [24, 82],
          [52, 78],
          [70, 84],
        ].map(([x, y]) => (
          <circle key={`${x}-${y}`} cx={`${x}%`} cy={`${y}%`} r="3" fill="url(#dot-fade)" />
        ))}
      </svg>

      <div className="relative mx-auto max-w-2xl px-6 text-center">
        <p className="text-comb-gold text-sm font-semibold tracking-wide uppercase">
          Postcode Honey
        </p>
        <h2 className="text-porcelain mt-3 text-4xl font-bold tracking-tight text-balance">
          One brand. Many postcodes.
        </h2>
        <p className="text-porcelain/70 mx-auto mt-4 max-w-md text-base">
          Gert Lush Honey is based in Bristol, but every jar is sourced from an independent
          beekeeper somewhere specific — their postcode, their season, their harvest. Bee S3 is our
          first. It won&apos;t be our last.
        </p>
        <Link
          href="/postcode-honey"
          className="border-porcelain/40 text-porcelain hover:border-porcelain focus-visible:outline-honey-amber mt-8 inline-block rounded-full border px-6 py-2.5 text-sm font-semibold focus-visible:outline focus-visible:outline-offset-4"
        >
          Explore postcode honey
        </Link>
      </div>
    </section>
  )
}
