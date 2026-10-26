import { GraphMailError, isGraphMailConfigured, sendGraphMail } from './graph-mail'
import { ADMIN_ADDRESS, escapeHtml } from './invite-emails'

// Heads-up emails to the business owner for things that otherwise sit
// unnoticed until someone happens to look in Sanity Studio — a review waiting
// for approval, an overbooked Experience. Sent through the same Microsoft 365
// mailbox as the invite emails (see graph-mail.ts). Server-only: never import
// from a client component.
//
// Never throws and never blocks the real action: a notification failing must
// not fail a customer's review or an order webhook, so it just logs and
// returns false. Not configured (e.g. local dev with no MS_GRAPH_* vars) is
// also just false.

const STYLE = "font-family:'Segoe UI',Arial,sans-serif;font-size:15px;line-height:1.55;"

function siteUrl(): string {
  return (process.env.NEXT_PUBLIC_SITE_URL || 'https://www.gertlushhoney.co.uk').replace(/\/$/, '')
}

export async function sendOwnerNotification(email: {
  to?: string
  subject: string
  html: string
  replyTo?: string
}): Promise<boolean> {
  if (!isGraphMailConfigured()) return false
  try {
    await sendGraphMail({ to: email.to ?? ADMIN_ADDRESS, ...email })
    return true
  } catch (error) {
    console.error(
      `Owner notification failed (${email.subject}):`,
      error instanceof GraphMailError ? error.message : error
    )
    return false
  }
}

export function notifyNewReview(review: {
  productName: string
  reviewerName: string
  rating: number
  body: string
}): Promise<boolean> {
  return sendOwnerNotification({
    subject: `New ${review.rating}/5 review for ${review.productName} — needs approving`,
    html: `<p style="${STYLE}"><b>${escapeHtml(review.reviewerName)}</b> left a <b>${review.rating}/5</b> review for <b>${escapeHtml(review.productName)}</b>:</p>
<blockquote style="${STYLE}margin:0 0 16px;padding:8px 16px;border-left:3px solid #D99614;">${escapeHtml(review.body).replace(/\n/g, '<br>')}</blockquote>
<p style="${STYLE}">It won't show on the site until you approve it: open <a href="${siteUrl()}/studio/structure/productReview">Studio → Product Review</a>, open the review and tick <b>Approved</b>, then publish.</p>`,
  })
}

export function notifyHamperSelectionProblem(details: {
  orderName: string
  productTitle: string
  variantTitle: string | null
  selectionText: string | null
  reason: string
}): Promise<boolean> {
  return sendOwnerNotification({
    subject: `Action needed: hamper order ${details.orderName} — stock not deducted`,
    html: `<p style="${STYLE}">Order <b>${escapeHtml(details.orderName)}</b> includes <b>${escapeHtml(details.productTitle)}</b>${details.variantTitle ? ` (${escapeHtml(details.variantTitle)})` : ''}, but its honey selection couldn't be trusted, so <b>no honey stock was deducted</b>.</p>
<p style="${STYLE}">Why: ${escapeHtml(details.reason)}.</p>
<p style="${STYLE}">What the customer's order said: <i>${details.selectionText ? escapeHtml(details.selectionText) : '(nothing)'}</i></p>
<p style="${STYLE}">Check the order in Shopify Admin, contact the customer if the choice isn't clear, then adjust the honey stock by hand.</p>`,
  })
}

export function notifyBookingConflict(details: {
  orderName: string
  productTitle: string
  sessionDate: string
  placesRequested: number
  placesRemaining: number
}): Promise<boolean> {
  return sendOwnerNotification({
    subject: `Action needed: overbooked experience, order ${details.orderName}`,
    html: `<p style="${STYLE}">Order <b>${escapeHtml(details.orderName)}</b> has paid for <b>${details.placesRequested}</b> place(s) on <b>${escapeHtml(details.productTitle)}</b> on <b>${escapeHtml(details.sessionDate)}</b>, but only <b>${details.placesRemaining}</b> were left (someone else booked first).</p>
<p style="${STYLE}">The customer has already paid, so this needs you: find the order in Shopify Admin, then either refund it or move them to another date, and let them know.</p>
<p style="${STYLE}">When it's sorted, tick <b>Resolved</b> on the record in <a href="${siteUrl()}/studio/structure/experienceBookingConflict">Studio → Experience Booking Conflict</a>.</p>`,
  })
}
