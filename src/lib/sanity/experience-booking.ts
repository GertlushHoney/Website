import { groq } from 'next-sanity'
import { sanityFetch } from './client'
import { getSanityWriteClient, isSanityWriteConfigured } from './write-client'
import type { ExperienceSession } from './merch'

type ExperienceMatch = {
  docId: string
  session: ExperienceSession
}

// Finds which Experience has a session on the given date — used by the
// order-paid webhook to know which Sanity document/session to credit a
// booking to. Matches by date alone: fine while there's a single active
// experience (the only one wanted right now), but would need the
// Shopify product handle disambiguated too if a second experience with
// overlapping dates is ever added.
export async function findExperienceSessionByDate(
  dateISO: string
): Promise<ExperienceMatch | null> {
  const result = await sanityFetch<{ _id: string; sessions: ExperienceSession[] }[]>(
    groq`*[_type == "merchProduct" && category == "experiences" && active == true && count(sessions[date == $date]) > 0] {
      _id,
      sessions[date == $date]
    }`,
    { date: dateISO }
  )
  const match = result?.[0]
  const session = match?.sessions?.[0]
  if (!match || !session) return null
  return { docId: match._id, session }
}

// Bounded — under real contention (two people booking the last place at
// the same moment) this should resolve within one or two attempts; a
// number this high is only ever reached under sustained, unusual
// contention, and exists so a burst of concurrent requests degrades into
// a clearly-logged transient failure (see below) rather than retrying
// forever inside a single webhook invocation.
const MAX_RETRIES = 5

export type BookingResult =
  | { outcome: 'booked' }
  | { outcome: 'insufficient_capacity'; placesRequested: number; placesRemaining: number }

// A Sanity mutation guarded by `ifRevisionId` fails with a 409 when the
// document has changed since the revision was read — that, and only
// that, means "someone else wrote first, re-read and try again." Any
// other failure (network blip, auth, Sanity being down) is a genuine
// infrastructure problem, not a race, and must propagate as a real
// exception so the caller (the order-paid webhook) treats it as
// transient and retries the whole delivery later, rather than this
// function silently swallowing it as "just try again."
function isRevisionConflict(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false
  const statusCode =
    'statusCode' in error && typeof (error as { statusCode?: unknown }).statusCode === 'number'
      ? (error as { statusCode: number }).statusCode
      : 'response' in error &&
          typeof (error as { response?: { statusCode?: unknown } }).response?.statusCode === 'number'
        ? (error as { response: { statusCode: number } }).response.statusCode
        : undefined
  if (statusCode === 409) return true
  return error instanceof Error && /revision/i.test(error.message)
}

// The core fix for "REVIEW EXPERIENCE OVERBOOKING" (2026-09-13): this used
// to be a bare `.inc()` with no capacity check at all — two customers who
// both saw "1 place remaining" and both paid would both get counted,
// silently pushing placesBooked past placesTotal with no record that
// anything had gone wrong.
//
// This now does a fresh read-check-write on every attempt, guarded by
// Sanity's own optimistic-concurrency primitive (`ifRevisionId`):
//   1. Read the document's current `_rev` and this session's real
//      placesTotal/placesBooked right now — never trust a value read
//      before this call, since another booking may have landed since.
//   2. If `by` doesn't fit in what's actually left, refuse immediately —
//      this is a genuine "sold out" outcome, not a retry candidate,
//      because retrying the identical request resolves the same way
//      every time. The caller is responsible for treating this as a real
//      conflict needing human attention (the customer already paid).
//   3. Otherwise, attempt the increment conditioned on that exact
//      revision. Sanity rejects the write (409) if the document changed
//      between steps 1 and 3 — i.e. another booking won the race — in
//      which case this loops back to step 1 with fresh data rather than
//      blindly retrying the same stale numbers.
//
// Two people racing for the same last place therefore can never both
// succeed: the second one's write is rejected by Sanity itself, forcing
// a re-read that now correctly sees zero places left.
export async function incrementSessionPlacesBooked(
  docId: string,
  sessionKey: string,
  by: number
): Promise<BookingResult> {
  if (!isSanityWriteConfigured()) {
    throw new Error('incrementSessionPlacesBooked: Sanity write access is not configured')
  }
  const client = getSanityWriteClient()

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    const doc = await client.fetch<{
      _rev: string
      session: { placesTotal: number; placesBooked: number } | null
    } | null>(
      groq`*[_id == $docId][0]{
        _rev,
        "session": sessions[_key == $sessionKey][0]{ placesTotal, placesBooked }
      }`,
      { docId, sessionKey }
    )
    if (!doc || !doc.session) {
      throw new Error(
        `incrementSessionPlacesBooked: session ${sessionKey} not found on document ${docId}`
      )
    }

    const placesRemaining = Math.max(0, doc.session.placesTotal - doc.session.placesBooked)
    if (by > placesRemaining) {
      return { outcome: 'insufficient_capacity', placesRequested: by, placesRemaining }
    }

    try {
      await client
        .patch(docId)
        .ifRevisionId(doc._rev)
        .inc({ [`sessions[_key=="${sessionKey}"].placesBooked`]: by })
        .commit()
      return { outcome: 'booked' }
    } catch (error) {
      if (!isRevisionConflict(error)) throw error
      // Someone else's booking committed first — loop back and re-read.
    }
  }

  throw new Error(
    `incrementSessionPlacesBooked: exhausted ${MAX_RETRIES} attempts for session ${sessionKey} under contention`
  )
}

// A durable, Studio-visible record of a genuine overbooking conflict —
// the customer's payment already succeeded (Shopify has been paid) but
// there was no place left to actually give them. This can't be fixed by
// retrying the webhook, so it isn't: it's recorded here for a human to
// refund or otherwise accommodate, plus logged loudly by the caller. See
// docs/technical-architecture.md, "Experience booking concurrency".
export async function recordBookingConflict(details: {
  orderId: number
  orderName: string
  productTitle: string
  sessionDate: string
  placesRequested: number
  placesRemaining: number
}): Promise<void> {
  if (!isSanityWriteConfigured()) return
  await getSanityWriteClient().create({
    _type: 'experienceBookingConflict',
    ...details,
    detectedAt: new Date().toISOString(),
  })
}
