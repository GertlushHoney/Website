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

// Atomically adds `by` to one session's placesBooked, identified by its
// array-item _key — never reads-then-writes the count itself, so two
// bookings landing at the same moment can't clobber each other.
export async function incrementSessionPlacesBooked(
  docId: string,
  sessionKey: string,
  by: number
): Promise<boolean> {
  if (!isSanityWriteConfigured()) return false
  await getSanityWriteClient()
    .patch(docId)
    .inc({ [`sessions[_key=="${sessionKey}"].placesBooked`]: by })
    .commit()
  return true
}
