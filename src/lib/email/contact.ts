'use server'

import { getClientIp, isRateLimited } from '@/lib/rate-limit'
import { CONTACT_TOPICS } from './contact-topics'
import { GraphMailError, isGraphMailConfigured, sendGraphMail } from './graph-mail'
import { escapeHtml } from './invite-emails'

export type ContactResult = { ok: true } | { ok: false; error: string }

// Same two independent axes as every other public form (one IP rotating
// emails; one email retried from rotating IPs) — see src/lib/rate-limit.ts.
// Nothing is sent to the visitor, only to our own inbox.
const CONTACT_IP_WINDOW_MS = 60 * 60 * 1000
const CONTACT_IP_MAX = 5
const CONTACT_EMAIL_WINDOW_MS = 24 * 60 * 60 * 1000
const CONTACT_EMAIL_MAX = 5

const NAME_MAX_LENGTH = 100
const MESSAGE_MAX_LENGTH = 5000
const EMAIL_MAX_LENGTH = 254
// Same strict pattern as the invite forms: the address goes into a real
// outgoing email's Reply-To, so anything with whitespace, angle brackets or
// quotes is refused outright.
const EMAIL_PATTERN = /^[^\s@<>"',;]+@[^\s@<>"',;]+\.[^\s@<>"',;]+$/

const CONTACT_ADDRESS = ['hello', 'gertlushhoney.co.uk'].join('@')

// Replaces the old mailto: hand-off, which did nothing for visitors with no
// email app set up on their device. Sends the message to our inbox through
// Microsoft Graph with Reply-To set to the visitor, so replying contacts
// them. Nothing is stored and nothing is sent back to the visitor. Never
// throws — every failure comes back as a friendly ok:false.
//
// `honeypot` is the visually hidden field real visitors never fill in; a
// filled one reports success without sending anything.
export async function sendContactMessage(input: {
  name: string
  email: string
  topic: string
  message: string
  honeypot?: string
}): Promise<ContactResult> {
  const name = input.name.trim()
  const email = input.email.trim()
  const message = input.message.trim()

  if (!name || !message) {
    return { ok: false, error: 'Fill in your name and a message.' }
  }
  if (name.length > NAME_MAX_LENGTH) {
    return { ok: false, error: `Name is too long (${NAME_MAX_LENGTH} characters max).` }
  }
  if (message.length > MESSAGE_MAX_LENGTH) {
    return { ok: false, error: `Message is too long (${MESSAGE_MAX_LENGTH} characters max).` }
  }
  if (email.length > EMAIL_MAX_LENGTH || !EMAIL_PATTERN.test(email)) {
    return { ok: false, error: 'Enter a valid email address so we can reply.' }
  }
  const topic = CONTACT_TOPICS.find((t) => t === input.topic)
  if (!topic) {
    return { ok: false, error: 'Choose what your message is about.' }
  }
  if ((input.honeypot ?? '').trim()) {
    return { ok: true }
  }
  if (!isGraphMailConfigured()) {
    return { ok: false, error: "This isn't available right now — please try again later." }
  }
  if (
    await isRateLimited([
      {
        action: 'contact-ip',
        identifier: await getClientIp(),
        windowMs: CONTACT_IP_WINDOW_MS,
        max: CONTACT_IP_MAX,
      },
      {
        action: 'contact-email',
        identifier: email.toLowerCase(),
        windowMs: CONTACT_EMAIL_WINDOW_MS,
        max: CONTACT_EMAIL_MAX,
      },
    ])
  ) {
    return { ok: false, error: 'Too many attempts — please try again later.' }
  }

  const style = "font-family:'Segoe UI',Arial,sans-serif;font-size:15px;line-height:1.55;"
  try {
    await sendGraphMail({
      to: CONTACT_ADDRESS,
      subject: `${topic} — via gertlushhoney.co.uk`,
      replyTo: email,
      html: `<p style="${style}"><b>${escapeHtml(name)}</b> (${escapeHtml(email)}) wrote:</p>
<blockquote style="${style}margin:0 0 16px;padding:8px 16px;border-left:3px solid #D99614;">${escapeHtml(message).replace(/\n/g, '<br>')}</blockquote>
<p style="${style}">Reply to this email to answer them directly.</p>`,
    })
  } catch (error) {
    console.error('Contact message failed:', error instanceof GraphMailError ? error.message : error)
    return { ok: false, error: "Couldn't send your message — please try again." }
  }

  return { ok: true }
}
