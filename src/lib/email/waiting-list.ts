'use server'

import { getAreaNameForCode } from '@/lib/postcode-areas'
import { getClientIp, isRateLimited } from '@/lib/rate-limit'
import { GraphMailError, isGraphMailConfigured, sendGraphMail } from './graph-mail'
import { escapeHtml } from './invite-emails'

export type WaitingListResult = { ok: true } | { ok: false; error: string }

const SALES_ADDRESS = 'sales@gertlushhoney.co.uk'

// Same two independent axes as every other public form (one IP rotating
// emails; one email retried from rotating IPs) — see src/lib/rate-limit.ts.
// Nothing is sent to the visitor, only to our own inbox, so these are the
// same as the newsletter's rather than the invite forms' tighter limits.
const WAITLIST_IP_WINDOW_MS = 60 * 60 * 1000
const WAITLIST_IP_MAX = 10
const WAITLIST_EMAIL_WINDOW_MS = 24 * 60 * 60 * 1000
const WAITLIST_EMAIL_MAX = 5

// Same strict pattern as the invite forms: the address goes into a real
// outgoing email's Reply-To, so anything with whitespace, angle brackets
// or quotes is refused outright.
const EMAIL_PATTERN = /^[^\s@<>"',;]+@[^\s@<>"',;]+\.[^\s@<>"',;]+$/
const EMAIL_MAX_LENGTH = 254

// Replaces the old "Join the waiting list" mailto: link on the postcode map
// (which did nothing for visitors without an email app set up on their
// device). Emails a short note to sales@ with the postcode and the
// visitor's address (Reply-To is the visitor, so replying contacts them).
// Nothing is sent to the visitor and nothing is stored beyond that email.
// Never throws — every failure comes back as a friendly ok:false.
//
// `areaCode` is checked against the real postcode area list server-side, so
// calling this action directly can't put arbitrary text in our inbox.
export async function joinPostcodeWaitingList(
  areaCode: string,
  email: string,
  honeypot = ''
): Promise<WaitingListResult> {
  const code = areaCode.trim().toUpperCase()
  const areaName = getAreaNameForCode(code)
  if (!areaName) {
    return { ok: false, error: "Couldn't find that postcode area." }
  }
  const trimmed = email.trim()
  if (trimmed.length > EMAIL_MAX_LENGTH || !EMAIL_PATTERN.test(trimmed)) {
    return { ok: false, error: 'Enter a valid email address.' }
  }
  if (honeypot.trim()) {
    return { ok: true }
  }
  if (!isGraphMailConfigured()) {
    return { ok: false, error: "This isn't available right now — please email us instead." }
  }
  if (
    await isRateLimited([
      {
        action: 'waitlist-ip',
        identifier: await getClientIp(),
        windowMs: WAITLIST_IP_WINDOW_MS,
        max: WAITLIST_IP_MAX,
      },
      {
        action: 'waitlist-email',
        identifier: trimmed.toLowerCase(),
        windowMs: WAITLIST_EMAIL_WINDOW_MS,
        max: WAITLIST_EMAIL_MAX,
      },
    ])
  ) {
    return { ok: false, error: 'Too many attempts — please try again later.' }
  }

  try {
    await sendGraphMail({
      to: SALES_ADDRESS,
      subject: `Postcode honey waiting list: ${code} (${areaName})`,
      replyTo: trimmed,
      html: `<p style="font-family:'Segoe UI',Arial,sans-serif;font-size:15px;">${escapeHtml(trimmed)} would like to hear when honey from <b>${escapeHtml(code)}</b> (${escapeHtml(areaName)}) is available.</p>
<p style="font-family:'Segoe UI',Arial,sans-serif;font-size:15px;">Reply to this email to contact them directly. They were not sent a confirmation email.</p>`,
    })
  } catch (error) {
    console.error(
      'Waiting list email failed:',
      error instanceof GraphMailError ? error.message : error
    )
    return { ok: false, error: "Couldn't add you to the list — please try again." }
  }

  return { ok: true }
}
