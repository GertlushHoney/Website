import { groq } from 'next-sanity'
import { sanityFetch } from './client'
import { getSanityWriteClient, isSanityWriteConfigured } from './write-client'
import { isAlreadyExistsConflict } from './webhook-operations'
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
  // This exact operation (by its deterministic id) already ran — either a
  // previous delivery genuinely completed it, or a near-simultaneous
  // duplicate delivery won the atomic create race a moment before this
  // call. Either way, nothing here mutates anything; the caller should
  // treat it exactly like "skip, already done."
  | { outcome: 'alreadyCompleted' }

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
// Extended for "Make Shopify order-paid processing fully idempotent"
// (2026-09-14) to also be safe against the *same* booking being attempted
// twice — a redelivered webhook after a partial failure, or two
// near-simultaneous duplicate deliveries. `operationId` is a deterministic
// id (see webhook-operations.ts) derived from the webhook delivery, the
// line item, and this session — never a random UUID, so the exact same
// logical operation always recomputes the exact same id.
//
// Per attempt:
//   0. (First attempt only, conceptually.) If a webhookOperation document
//      already exists at `operationId`, this exact operation already ran
//      — return `alreadyCompleted` without touching the session doc at
//      all. This is the common case: a webhook retried after a *different*
//      line item failed, where this booking already genuinely succeeded
//      last time.
//   1. Read the document's current `_rev` and this session's real
//      placesTotal/placesBooked right now — never trust a value read
//      before this call, since another booking may have landed since.
//   2. If `by` doesn't fit in what's actually left, refuse immediately —
//      a genuine "sold out" outcome, not a retry candidate (retrying the
//      identical request resolves the same way every time). Recorded via
//      the same operationId so a later retry of this exact operation
//      finds the marker at step 0 and skips instead of re-detecting (and
//      the caller re-recording) the identical conflict.
//   3. Otherwise, attempt to *atomically* create the operation marker and
//      apply the increment in one Sanity transaction, the increment still
//      conditioned on the exact revision read in step 1. This is the
//      concurrency-safety fix proper: Sanity rejects a `create()` against
//      an `_id` that already exists, so if two near-simultaneous duplicate
//      deliveries both reach this step for the *same* operationId, only
//      one transaction can ever win — the loser's create is rejected
//      atomically together with its increment, never one without the
//      other. A plain "check the marker, then separately increment, then
//      separately write the marker" would leave a window where both
//      requests pass the check before either writes anything; one atomic
//      transaction has no such window.
//   4. If the transaction's create was rejected because the operationId
//      already exists, another delivery (or this same one, retried)
//      already completed this exact operation a moment ago — return
//      `alreadyCompleted`, no increment applied. If instead the *patch*
//      was rejected because the document's revision changed since step 1
//      — a genuinely different booking (a different operationId) won a
//      race for the same session — loop back to step 1 with fresh data.
//
// Two people racing for the same last place therefore can never both
// succeed, and the same logical booking can never be counted twice no
// matter how many times it's attempted.
export async function incrementSessionPlacesBooked(
  operationId: string,
  docId: string,
  sessionKey: string,
  by: number,
  meta: { webhookId: string; orderId: number; orderName: string; lineItemId: string }
): Promise<BookingResult> {
  if (!isSanityWriteConfigured()) {
    throw new Error('incrementSessionPlacesBooked: Sanity write access is not configured')
  }
  const client = getSanityWriteClient()

  const existingMarker = await client.getDocument(operationId)
  if (existingMarker) return { outcome: 'alreadyCompleted' }

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
      await client.createIfNotExists({
        _id: operationId,
        _type: 'webhookOperation',
        operationId,
        operationType: 'experience-booking',
        outcome: 'insufficient-capacity',
        detail: `${by} place(s) requested, ${placesRemaining} remaining`,
        ...meta,
        completedAt: new Date().toISOString(),
      })
      return { outcome: 'insufficient_capacity', placesRequested: by, placesRemaining }
    }

    try {
      await client
        .transaction()
        .create({
          _id: operationId,
          _type: 'webhookOperation',
          operationId,
          operationType: 'experience-booking',
          outcome: 'completed',
          detail: `${by} place(s), session ${sessionKey}`,
          ...meta,
          completedAt: new Date().toISOString(),
        })
        .patch(docId, (p) => p.ifRevisionId(doc._rev).inc({ [`sessions[_key=="${sessionKey}"].placesBooked`]: by }))
        .commit()
      return { outcome: 'booked' }
    } catch (error) {
      if (isAlreadyExistsConflict(error)) return { outcome: 'alreadyCompleted' }
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
