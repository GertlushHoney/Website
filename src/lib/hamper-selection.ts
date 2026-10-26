import type { HoneyTally } from './hamper'

// Kept apart from hamper.ts (which the order-paid webhook's tests replace
// wholesale with a stand-in) so this check always runs for real, both in
// production and in those tests.
//
// A "Choose your own" hamper's "Honey selection" is free text a customer (or a
// script skipping the storefront) controls. The webhook already checks that
// each honey named is a real, active one; this checks the selection as a
// whole against what was actually bought, before any stock is deducted: the
// jars chosen must add up to exactly the hamper's size. Otherwise a crafted
// "1x Bee S3" against a 3-jar hamper would deduct one jar of stock for a
// hamper that physically needs three, quietly corrupting the stock count.

export type SelectionCheck =
  | { ok: true; tally: HoneyTally[] }
  | { ok: false; reason: string }

// Returns the selection with duplicate honeys merged (so one honey named
// twice becomes one deduction, not two operations sharing an id), or the
// reason it can't be trusted. Rejects, rather than repairs, anything off —
// zero, negative or fractional counts, an empty selection, or a total that
// isn't exactly `jarsPerHamper`.
export function validateHamperSelection(tally: HoneyTally[], jarsPerHamper: number): SelectionCheck {
  if (!Number.isSafeInteger(jarsPerHamper) || jarsPerHamper < 1) {
    return { ok: false, reason: 'the hamper size is not a valid jar count' }
  }
  if (tally.length === 0) {
    return { ok: false, reason: 'no honey could be matched to this hamper' }
  }

  const merged = new Map<string, number>()
  for (const { honeyName, jars } of tally) {
    if (!honeyName.trim()) {
      return { ok: false, reason: 'a selection has no honey name' }
    }
    if (!Number.isSafeInteger(jars) || jars < 1) {
      return { ok: false, reason: `"${honeyName}" has an invalid jar count (${String(jars)})` }
    }
    merged.set(honeyName, (merged.get(honeyName) ?? 0) + jars)
  }

  let total = 0
  for (const jars of merged.values()) total += jars
  if (total !== jarsPerHamper) {
    return {
      ok: false,
      reason: `${total} jar(s) were selected but this hamper holds exactly ${jarsPerHamper}`,
    }
  }

  return {
    ok: true,
    tally: Array.from(merged, ([honeyName, jars]) => ({ honeyName, jars })),
  }
}
