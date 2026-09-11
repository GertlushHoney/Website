// A simple decision tree distilling the criteria already explained in prose
// elsewhere on this page (pesticide use, single vs double flowers, colour
// and flowering season) into a quick yes/no check — not a new set of
// rules, just the same ones laid out as a flowchart.
export function BeeFriendlyFlowchart() {
  return (
    <svg
      viewBox="0 0 620 560"
      role="img"
      aria-label="Flowchart: is this plant good for bees? Step 1, has it been treated with pesticides or neonicotinoids — if yes, avoid it regardless of anything else. If no, step 2: is it a single, open flower rather than a double or pom-pom variety — if no, skip it, doubles often offer little pollen or nectar. If yes, step 3: is it blue, purple, yellow, white or orange, and does it flower February to March or October to November — if yes, it's a perfect choice that fills a genuine seasonal gap. If no, it's still a good choice bees will use happily."
      className="h-auto w-full"
    >
      <defs>
        <marker
          id="bff-arrow"
          viewBox="0 0 10 10"
          refX="8"
          refY="5"
          markerWidth="7"
          markerHeight="7"
          orient="auto-start-reverse"
        >
          <path d="M0,0 L10,5 L0,10 Z" fill="var(--color-comb-gold)" />
        </marker>
      </defs>

      {/* Connectors */}
      <path
        d="M160,110 L160,155"
        stroke="var(--color-ink-line)"
        strokeWidth="1.5"
        fill="none"
        markerEnd="url(#bff-arrow)"
      />
      <text x="176" y="138" className="fill-porcelain/50 text-[13px]">
        No
      </text>

      <path
        d="M300,65 L335,65"
        stroke="var(--color-honey-amber)"
        strokeWidth="1.5"
        fill="none"
        markerEnd="url(#bff-arrow)"
      />
      <text x="305" y="55" className="fill-honey-amber text-[13px] font-semibold">
        Yes
      </text>

      <path
        d="M160,250 L160,295"
        stroke="var(--color-ink-line)"
        strokeWidth="1.5"
        fill="none"
        markerEnd="url(#bff-arrow)"
      />
      <text x="176" y="278" className="fill-porcelain/50 text-[13px]">
        Yes
      </text>

      <path
        d="M300,205 L335,205"
        stroke="var(--color-honey-amber)"
        strokeWidth="1.5"
        fill="none"
        markerEnd="url(#bff-arrow)"
      />
      <text x="308" y="195" className="fill-honey-amber text-[13px] font-semibold">
        No
      </text>

      <path
        d="M160,400 L160,435"
        stroke="var(--color-ink-line)"
        strokeWidth="1.5"
        fill="none"
        markerEnd="url(#bff-arrow)"
      />
      <text x="176" y="422" className="fill-porcelain/50 text-[13px]">
        No
      </text>

      <path
        d="M300,350 L335,350"
        stroke="var(--color-comb-gold)"
        strokeWidth="1.5"
        fill="none"
        markerEnd="url(#bff-arrow)"
      />
      <text x="308" y="340" className="fill-comb-gold text-[13px] font-semibold">
        Yes
      </text>

      {/* Q1 */}
      <rect
        x="20"
        y="20"
        width="280"
        height="90"
        rx="12"
        className="fill-ink-surface stroke-ink-line"
        strokeWidth="1"
      />
      <text x="160" y="52" textAnchor="middle" className="fill-porcelain text-[14px] font-semibold">
        Has it been treated with
      </text>
      <text x="160" y="72" textAnchor="middle" className="fill-porcelain text-[14px] font-semibold">
        pesticides or neonicotinoids?
      </text>

      {/* Outcome A */}
      <rect
        x="340"
        y="20"
        width="260"
        height="90"
        rx="12"
        className="fill-honeycomb-surface stroke-honey-amber/50"
        strokeWidth="1"
      />
      <text x="470" y="48" textAnchor="middle" className="fill-honey-amber text-[13px] font-bold uppercase tracking-wide">
        Avoid it
      </text>
      <text x="470" y="70" textAnchor="middle" className="fill-porcelain/80 text-[12.5px]">
        Harmful to bees regardless
      </text>
      <text x="470" y="86" textAnchor="middle" className="fill-porcelain/80 text-[12.5px]">
        of anything else below.
      </text>

      {/* Q2 */}
      <rect
        x="20"
        y="160"
        width="280"
        height="90"
        rx="12"
        className="fill-ink-surface stroke-ink-line"
        strokeWidth="1"
      />
      <text x="160" y="192" textAnchor="middle" className="fill-porcelain text-[14px] font-semibold">
        Is it a single, open flower —
      </text>
      <text x="160" y="212" textAnchor="middle" className="fill-porcelain text-[14px] font-semibold">
        not a double or pom-pom variety?
      </text>

      {/* Outcome B */}
      <rect
        x="340"
        y="160"
        width="260"
        height="90"
        rx="12"
        className="fill-honeycomb-surface stroke-honey-amber/50"
        strokeWidth="1"
      />
      <text x="470" y="188" textAnchor="middle" className="fill-honey-amber text-[13px] font-bold uppercase tracking-wide">
        Skip if you can
      </text>
      <text x="470" y="210" textAnchor="middle" className="fill-porcelain/80 text-[12.5px]">
        Doubles often offer little
      </text>
      <text x="470" y="226" textAnchor="middle" className="fill-porcelain/80 text-[12.5px]">
        pollen or nectar.
      </text>

      {/* Q3 */}
      <rect
        x="20"
        y="300"
        width="280"
        height="100"
        rx="12"
        className="fill-ink-surface stroke-ink-line"
        strokeWidth="1"
      />
      <text x="160" y="330" textAnchor="middle" className="fill-porcelain text-[14px] font-semibold">
        Is it blue, purple, yellow, white
      </text>
      <text x="160" y="350" textAnchor="middle" className="fill-porcelain text-[14px] font-semibold">
        or orange, and does it flower
      </text>
      <text x="160" y="370" textAnchor="middle" className="fill-porcelain text-[14px] font-semibold">
        Feb&ndash;Mar or Oct&ndash;Nov?
      </text>

      {/* Outcome C */}
      <rect
        x="340"
        y="300"
        width="260"
        height="100"
        rx="12"
        className="fill-honeycomb-surface stroke-comb-gold/60"
        strokeWidth="1.5"
      />
      <text x="470" y="332" textAnchor="middle" className="fill-comb-gold text-[13px] font-bold uppercase tracking-wide">
        Perfect choice
      </text>
      <text x="470" y="354" textAnchor="middle" className="fill-porcelain/80 text-[12.5px]">
        Fills a genuine gap when
      </text>
      <text x="470" y="370" textAnchor="middle" className="fill-porcelain/80 text-[12.5px]">
        little else is flowering.
      </text>

      {/* Outcome D */}
      <rect
        x="20"
        y="440"
        width="280"
        height="90"
        rx="12"
        className="fill-honeycomb-surface stroke-comb-gold/40"
        strokeWidth="1"
      />
      <text x="160" y="478" textAnchor="middle" className="fill-comb-gold text-[13px] font-bold uppercase tracking-wide">
        Good choice
      </text>
      <text x="160" y="500" textAnchor="middle" className="fill-porcelain/80 text-[12.5px]">
        Bees will still use it happily.
      </text>
    </svg>
  )
}
