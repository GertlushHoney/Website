// Shared between the hamper product page (building the per-jar honey
// picker) and the order-paid webhook (working out what to deduct) — kept
// in one place so both sides agree on the hamper title format and the
// "Honey selection" cart attribute's encoding.

// Must match the product titles actually created in Shopify for each
// hamper size — "Hamper - N Jar Honey" — so a new size (e.g. an 8-jar
// hamper) works automatically without a code change, as long as it's
// named the same way.
const HAMPER_TITLE_PATTERN = /^Hamper - (\d+) Jar Honey$/i

export function parseHamperJarCount(productTitle: string): number | null {
  const match = productTitle.match(HAMPER_TITLE_PATTERN)
  return match ? Number(match[1]) : null
}

export type HoneyTally = { honeyName: string; jars: number }

// The "Choose your own" cart attribute is a human-readable summary (shown
// as-is on the real Shopify order, so it needs to make sense to whoever's
// packing it), e.g. "2x Bee S3, 1x Bee S4" — not JSON, but still a fixed
// enough format for parseHoneySelection to read back reliably.
export function formatHoneySelection(tally: HoneyTally[]): string {
  return tally.map(({ honeyName, jars }) => `${jars}x ${honeyName}`).join(', ')
}

export function parseHoneySelection(value: string): HoneyTally[] {
  const tally: HoneyTally[] = []
  for (const part of value.split(',')) {
    const match = part.trim().match(/^(\d+)x\s+(.+)$/)
    if (match) {
      tally.push({ honeyName: match[2].trim(), jars: Number(match[1]) })
    }
  }
  return tally
}

// Tallies a customer's per-jar honey picks (one entry per jar, may repeat
// the same honey) into { honeyName, jars } groups — what actually gets
// sent as the cart attribute and, later, what the webhook deducts.
export function tallyJarSelections(honeyPerJar: string[]): HoneyTally[] {
  const counts = new Map<string, number>()
  for (const honeyName of honeyPerJar) {
    counts.set(honeyName, (counts.get(honeyName) ?? 0) + 1)
  }
  return Array.from(counts, ([honeyName, jars]) => ({ honeyName, jars }))
}
